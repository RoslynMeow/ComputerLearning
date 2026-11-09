#import "../../lib/ku.typ": ku

#ku(
  id: "ds.02.04.recursion-induction",
  title: "递归与归纳结构",
  title_en: "Recursion and Inductive Structure",
  chapter: "02-logic-proof-computation",
  order: 4,
  prerequisites: ("ds.02.02.proof",),
  related: ("ds.02.05.computation", "ds.02.06.cost"),
  sources: (
    (book: "rosen", edition: 8, chapter: "5", section: "5.3"),
    (book: "clrs", edition: 4, chapter: "3", section: "3.1-3.2"),
  ),
  labs: ("lab.recursion-tree",),
  exercises: ("ex.ds.02.04",),
)[
  === 待写
  本知识点将在 Issue #16 中完成。写作时必须覆盖：

  - 问题动机：为什么递归定义可以描述无限对象？
  - 形式化定义：递归定义、结构归纳、序列与树的归纳结构。
  - 证明 / 推导：结构归纳与普通归纳的对应。
  - 机制：递归展开与递归树。
  - 实验设计：展开递归树，对比递归与迭代。
  - 来源：Rosen 5.3、CLRS 3.1-3.2。
  - 连接：1.4 的自然数、2.2 的证明、2.5 的计算。
  - 易错点：缺少基例、递归方向反了、重复子问题。
]
