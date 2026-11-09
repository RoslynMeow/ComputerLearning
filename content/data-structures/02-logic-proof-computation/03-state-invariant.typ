#import "../../lib/ku.typ": ku

#ku(
  id: "ds.02.03.state-invariant",
  title: "状态与不变量",
  title_en: "State and Invariant",
  chapter: "02-logic-proof-computation",
  order: 3,
  prerequisites: ("ds.01.08.abstract-representation", "ds.02.02.proof"),
  related: ("ds.02.04.recursion-induction",),
  sources: (
    (book: "clrs", edition: 4, chapter: "2", section: "2.1"),
    (book: "rosen", edition: 8, chapter: "5", section: "5.5"),
  ),
  labs: ("lab.loop-invariant",),
  exercises: ("ex.ds.02.03",),
)[
  === 待写
  本知识点将在 Issue #16 中完成。写作时必须覆盖：

  - 问题动机：循环为什么会在某一刻正确？
  - 形式化定义：状态、状态转移、循环不变量。
  - 证明 / 推导：初始化、保持、终止三段式。
  - 机制：单步执行并检查不变量。
  - 实验设计：让用户改循环体，观察不变量在哪一步被破坏。
  - 来源：CLRS 2.1、Rosen 5.5。
  - 连接：1.8 的抽象、2.2 的证明、3.x 的数组算法。
  - 易错点：不变量太弱、终止条件与不变量不匹配。
]
