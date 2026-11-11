import { pick, randInt } from "../rng";
import type { Exercise } from "../types";

const RELATION_CHOICES = [
  "等价关系",
  "偏序关系",
  "既是等价关系又是偏序关系",
  "都不是",
] as const;

const FUNCTION_CHOICES = [
  "单射但不是满射",
  "满射但不是单射",
  "双射",
  "既不是单射也不是满射",
] as const;

function formatPairs(pairs: readonly [number, number][]): string {
  if (pairs.length === 0) return "∅";
  return `{${pairs.map(([left, right]) => `(${left}, ${right})`).join(", ")}}`;
}

function relationExercise(rng: () => number) {
  const size = 3;
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rng() < 0.5),
  );
  const pairs: [number, number][] = [];
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (matrix[row][column]) pairs.push([row + 1, column + 1]);
    }
  }

  const reflexive = Array.from({ length: size }, (_, index) => matrix[index][index]).every(
    Boolean,
  );
  const symmetric = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => matrix[row][column] === matrix[column][row]),
  )
    .flat()
    .every(Boolean);
  const transitive = Array.from({ length: size }, (_, first) =>
    Array.from({ length: size }, (_, second) =>
      Array.from({ length: size }, (_, third) =>
        !matrix[first][second] || !matrix[second][third] || matrix[first][third],
      ),
    ),
  )
    .flat(2)
    .every(Boolean);
  const antisymmetric = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) =>
      row === column || !matrix[row][column] || !matrix[column][row],
    ),
  )
    .flat()
    .every(Boolean);

  const equivalence = reflexive && symmetric && transitive;
  const partialOrder = reflexive && antisymmetric && transitive;
  const answer =
    equivalence && partialOrder
      ? RELATION_CHOICES[2]
      : equivalence
        ? RELATION_CHOICES[0]
        : partialOrder
          ? RELATION_CHOICES[1]
          : RELATION_CHOICES[3];

  const yes = (value: boolean) => (value ? "成立" : "不成立");
  return {
    kind: "choice" as const,
    prompt: `A = {1, 2, 3}，关系 R = ${formatPairs(pairs)}。\nR 属于哪一类？`,
    answer,
    choices: [...RELATION_CHOICES],
    steps: [
      `自反性：对角线上的 (1,1)、(2,2)、(3,3) 是否都在 R 中？${yes(reflexive)}。`,
      `对称性：每个 (a,b) 是否都有对应的 (b,a)？${yes(symmetric)}。`,
      `传递性：若 (a,b) 和 (b,c) 都在 R 中，(a,c) 是否也在 R 中？${yes(transitive)}。`,
      `反对称性：若 (a,b) 和 (b,a) 都在 R 中，是否只能有 a = b？${yes(antisymmetric)}。`,
      equivalence
        ? "自反、对称、传递都成立，所以它是等价关系。"
        : partialOrder
          ? "自反、反对称、传递都成立，所以它是偏序关系。"
          : "至少有一条性质不成立，所以它既不是等价关系，也不是偏序关系。",
      equivalence && partialOrder
        ? "它同时满足两组性质，因此选“既是等价关系又是偏序关系”。"
        : "",
    ].filter(Boolean),
  };
}

function functionExercise(rng: () => number) {
  const [domainSize, codomainSize] = pick(rng, [
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ] as const);
  const images = Array.from({ length: domainSize }, () =>
    randInt(rng, 1, codomainSize),
  );
  const pairs: [number, number][] = images.map((image, index) => [index + 1, image]);
  const uniqueImages = [...new Set(images)].sort((left, right) => left - right);
  const injective = uniqueImages.length === domainSize;
  const surjective = uniqueImages.length === codomainSize;
  const answer =
    injective && surjective
      ? FUNCTION_CHOICES[2]
      : injective
        ? FUNCTION_CHOICES[0]
        : surjective
          ? FUNCTION_CHOICES[1]
          : FUNCTION_CHOICES[3];

  return {
    kind: "choice" as const,
    prompt: `A = {1, ..., ${domainSize}}，B = {1, ..., ${codomainSize}}，函数 f = ${formatPairs(pairs)}。\nf 属于哪一类？`,
    answer,
    choices: [...FUNCTION_CHOICES],
    steps: [
      `定义域 A 有 ${domainSize} 个元素，每个元素都恰好对应一个输出，所以 f 是函数。`,
      `实际出现的输出是 {${uniqueImages.join(", ")}}，共 ${uniqueImages.length} 个。`,
      injective
        ? "没有两个不同输入得到同一个输出，所以是单射。"
        : "存在两个不同输入得到同一个输出，所以不是单射。",
      surjective
        ? "B 中每个元素都被命中，所以是满射。"
        : "B 中有元素没有被命中，所以不是满射。",
      injective && surjective
        ? "既单射又满射，所以是双射。"
        : `因此选“${answer}”。`,
    ],
  };
}

export const relationsFunctions: Exercise = {
  id: "ex.ds.01.03",
  ku: "ds.01.03.relations-functions",
  title: "关系与函数",
  generate(rng) {
    return pick(rng, ["relation", "function"] as const) === "relation"
      ? relationExercise(rng)
      : functionExercise(rng);
  },
  check(input, instance) {
    return input.trim() === instance.answer;
  },
};
