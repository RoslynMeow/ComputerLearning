#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.03.proof",
  title: "证明",
  title_en: "Proof",
  chapter: "01-computation-and-world",
  order: 3,
  prerequisites: ("ds.01.02.logic",),
  related: ("ds.01.04.state-invariant", "ds.01.05.recursion-induction"),
  sources: (
    (book: "rosen", edition: 8, chapter: "1", section: "1.5-1.8"),
    (book: "clrs", edition: 4, chapter: "2", section: "2.1"),
  ),
  labs: ("lab.proof-steps",),
)[
  === 待写
  本知识点将在 Issue #7 中完成。写作时必须覆盖：

  - 问题动机：为什么“看起来对”不等于正确？
  - 形式化定义：直接证明、反证、构造、数学归纳。
  - 证明 / 推导：归纳法的基例与归纳步。
  - 机制：把证明步骤拆成可检查的链条。
  - 实验设计：展开归纳步骤，显示哪一步不成立。
  - 来源：Rosen 第 1 章、CLRS 第 2.1 节。
  - 连接：1.2 的逻辑、1.4 的不变量、1.5 的结构归纳。
  - 易错点：循环论证、归纳假设用错、边界情况遗漏。
]
