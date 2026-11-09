#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.08.abstract-representation",
  title: "抽象与表示",
  title_en: "Abstraction and Representation",
  chapter: "01-computation-and-world",
  order: 8,
  prerequisites: ("ds.01.04.state-invariant", "ds.01.07.cost"),
  related: ("ds.02.01.array",),
  sources: (
    (book: "clrs", edition: 4, chapter: "1"),
    (book: "sedgewick", edition: 4, chapter: "1", section: "1.3"),
  ),
  labs: ("lab.adt-representation",),
)[
  === 待写
  本知识点将在 Issue #8 中完成。写作时必须覆盖：

  - 问题动机：同一个抽象数据类型为什么需要不同表示？
  - 形式化定义：ADT、接口、前置 / 后置条件、编码、同构。
  - 证明 / 推导：表示不变式与接口契约。
  - 机制：同一 ADT 的数组表示与链表表示。
  - 实验设计：切换表示，观察操作代价如何变化。
  - 来源：CLRS 第 1 章、Sedgewick 第 1.3 节。
  - 连接：1.4 的不变量、1.7 的代价、2.x 的线性结构。
  - 易错点：把接口与实现混为一谈、忽略表示不变式。
]
