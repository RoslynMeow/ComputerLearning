#import "../../lib/ku.typ": ku

#ku(
  id: "ds.02.05.computation",
  title: "什么叫计算",
  title_en: "What Is Computation?",
  chapter: "02-logic-proof-computation",
  order: 5,
  prerequisites: ("ds.02.04.recursion-induction",),
  related: ("ds.02.06.cost",),
  sources: (
    (book: "sipser", edition: 3, chapter: "3", section: "3.1-3.3"),
    (book: "clrs", edition: 4, chapter: "1"),
  ),
  labs: ("lab.turing-machine",),
  exercises: ("ex.ds.02.05",),
)[
  === 待写
  本知识点将在 Issue #16 中完成。写作时必须覆盖：

  - 问题动机：所有“计算”是不是同一种东西？
  - 形式化定义：算法、图灵机、λ 演算、寄存器机初步。
  - 证明 / 推导：为什么这些模型等价。
  - 机制：用最小机器执行一条指令。
  - 实验设计：轻量图灵机 / 寄存器机模拟。
  - 来源：Sipser 第 3 章、CLRS 第 1 章。
  - 连接：2.4 的递归、2.6 的代价。
  - 易错点：把“可实现”与“可计算”混为一谈。
]
