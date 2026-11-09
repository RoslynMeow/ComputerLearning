# AGENTS.md

## Toolchain

- Typst 0.15.1
- Node.js 20+
- npm workspaces: the web app lives in `web/`

If `typst` is not on `PATH`, set `TYPST_BIN` to the executable path.

## Commands

```bash
npm install          # install root + web dependencies
npm run dev          # Vite dev server for dynamic exercises
npm run validate     # validate KU metadata, sources, graph, notes files
npm run pdf          # compile content/<subject>/main.typ -> pdf/out/<subject>.pdf
npm test             # Vitest
npm run typecheck    # TypeScript
npm run build        # production build of the web app
```

## Project automation

- `.github/workflows/project-date.yml` sets `Start date` / `Date` from lifecycle:
  - Issue opened → `Start date` = issue created date
  - Issue closed → `Date` = issue closed date
  - PR opened → `Start date` = PR created date
  - PR merged/closed → `Date` = merge/close date
  - Linked issue (`Closes #N`) is updated alongside the PR
- Requires the `PROJECT_TOKEN` repository secret (classic PAT, `repo` + `project`).
- Manual backfill:
  `gh workflow run project-date.yml --ref dev -f content_type=issue -f number=<N>`
  or `-f content_type=pull_request`.

## Content conventions

- KU ID: `<subject>.<chapter>.<order>.<slug>`.
- Main KU file: `content/<subject>/<chapter>/<NN>-<slug>.typ`.
- Notes file: `content/<subject>/<chapter>/<NN>-<slug>.notes.typ`.
- Chapter appendix: `content/<subject>/<chapter>/appendix.typ` includes all notes files.
- Main text keeps exactly these sections:
  `问题动机`, `形式化定义`, `证明与推导`, `机制`.
- Notes keeps exactly these sections:
  `实验`, `来源`, `连接`, `易错点`, `练习`.
- Every KU needs at least one source, one lab ID, and one exercise ID.
- Source `book` IDs must exist in `content/bibliography.yml`.
- Prerequisites must exist and the graph must be acyclic.
- Do not commit copyrighted book PDFs. Cite books; link to legal sources only.

## Dynamic exercises

- Generators live in `web/src/exercises/<subject>/`.
- Exercise ID: `ex.<subject>.<chapter>.<order>`, bound to a KU ID.
- Use the seeded RNG in `web/src/exercises/rng.ts`; the same seed must reproduce the same instance.
- `generate(rng)` returns `{ kind, prompt, answer, steps }`.
- `check(input, instance)` normalizes and grades the answer.
- Do not put static answer keys in the PDF; link to the web exercise instead.

## Dynamic labs

- Labs live in `web/src/labs/<subject>/`.
- Lab ID matches the KU metadata `labs` entry, e.g. `lab.elements-sets`.
- `run(params)` returns `{ summary, metrics, trace, steps }`.
- Labs are deterministic and parameter-driven; `ExperimentPlayer` renders the controls.
- Add a test in `web/src/labs/__tests__/` for every new lab.
- The PDF page links to the first lab for the active KU.

## Knowledge graph

- `npm run validate` writes:
  - `content/generated/graph.json` (nodes + prerequisite/related edges)
  - `content/generated/bibliography.json`
  - `content/generated/coverage.json`
- `scripts/sync-data-assets.mjs` copies them to `web/public/data/`.
- Web route: `#/graph` or `#/graph/<kuId>`.
- The graph page highlights prerequisite edges by default; related edges are optional.
- Book reverse lookup: select a book to highlight all KUs that cite it.


