#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.07.cost",
  title: "代价的数学",
  title_en: "The Mathematics of Cost",
  chapter: "01-computation-and-world",
  order: 7,
  prerequisites: ("ds.01.05.recursion-induction",),
  related: ("ds.01.08.abstract-representation",),
  sources: (
    (book: "clrs", edition: 4, chapter: "3", section: "3.1-3.3"),
    (book: "rosen", edition: 8, chapter: "3", section: "3.1-3.2"),
  ),
  labs: ("lab.growth-curves",),
)[
  === 待写
  本知识点将在 Issue #8 中完成。写作时必须覆盖：

  - 问题动机：为什么不能只看运行时间？
  - 形式化定义：$O$、$Omega$、$Theta$、递推式、求和。
  - 证明 / 推导：主定理初步与递推展开。
  - 机制：从代码得到代价函数。
  - 实验设计：增长曲线对比、递推展开。
  - 来源：CLRS 第 3 章、Rosen 第 3 章。
  - 连接：1.5 的递归、1.8 的表示选择。
  - 易错点：忽略常数与低阶项、把最坏情况当平均情况。
]
