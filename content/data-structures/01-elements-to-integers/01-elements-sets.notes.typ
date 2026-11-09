#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.01.elements-sets",
  title: "元素与集合",
)[
  === 实验
  Web 实验 `lab.elements-sets`：给定一个有限全集，勾选元素，实时显示集合、位向量和幂集。
  改变全集大小时，观察幂集元素个数如何从 $2^n$ 增长。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Section 2.1.
  - Halmos, *Naive Set Theory*, Chapters 1-2.

  === 连接
  - 1.2 在集合上定义并、交、差、补。
  - 1.3 用有序对和笛卡尔积定义关系与函数。
  - 1.8 把“集合 + 关系”抽象成数据类型。

  === 易错点
  - $emptyset$ 与 ${emptyset}$ 不是同一个集合：前者没有元素，后者有一个元素。
  - $in$ 与 $subset.eq$ 不是一回事：前者连接元素与集合，后者连接集合与集合。
  - 集合元素无序、互异：${1,2}$ 与 ${2,1}$ 相同，${1,1,2}$ 仍是 ${1,2}$。

  === 练习
  动态练习 `ex.ds.01.01`：判断属于/子集关系、由位向量还原集合、生成幂集。
  每次进入都会生成新的全集与集合，避免背答案。
]
