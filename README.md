# CSLearning

知识图谱教材网站（纯静态，无需后端）。2D/3D 视图共用 `data/catalog.json` 中的知识点与关系。

## 本地开发（Vite，热更新）

```powershell
npm install      # 首次运行一次
npm run dev      # 默认 http://localhost:5180
```

`npm run dev` 使用 Vite 开发服务器，修改 `index.html`、`data/catalog.json` 或 `src/` 后页面自动刷新。

端口说明：本项目固定使用 5180。此前占用 4173 的是另一个项目（`CorrelationAnalyze` 的 vite preview），与本项目同时运行会导致打开错误站点，已停止；如仍需要那个项目，请给它换一个端口。

其他脚本：

```powershell
npm run build     # 输出到 dist/
npm run preview   # 预览构建结果，http://localhost:5181
```

不要直接用 `file://` 打开 `index.html`：页面通过 HTTP 读取 JSON，且使用 ES 模块。

## 3D 图谱控制

- 左键拖动旋转视角，右键拖动平移，滚轮缩放
- 点击画布后 W/A/S/D 移动，Q/E 升降
- 悬停查看知识点，点击打开学习卡片
- 视图状态（模式、缩放、平移、相机、选中节点）保存在浏览器 `localStorage`，不跨设备同步
- 3D 仅在较宽屏幕提供；窄屏使用纵向 2D 图谱

## 内容维护

- 教材正文规范：`docs/LESSON_SPEC.md`
- 新增知识点：`docs/ADD_KNOWLEDGE.md`，使用 `scripts/add-knowledge.mjs`
- 分片合并：把片段放入 `content/fragments/`，运行 `node scripts/merge-fragments.mjs`

## 部署（GitHub Pages）

站点发布地址：<https://roslynmeow.github.io/ComputerLearning/>

部署由 `.github/workflows/deploy-pages.yml` 负责，**只在推送到 `main` 时触发**；推送到 `dev` 不会部署。

流程：`main` 更新 → `npm ci` → `npm run build`（输出 `dist/`，并复制 `data/`、`drafts/`）→ 发布到 Pages。

构建使用相对路径（`vite.config.js` 中 `base: "./"`），因此可以部署在 `/ComputerLearning/` 这类子路径下。

## 分支

`main` 为发布分支，`dev` 为开发分支；功能完成后由维护者决定是否合并到 `main`。
