#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.02.set-operations",
  title: "集合的运算与表示",
  title_en: "Set Operations and Representations",
  chapter: "01-elements-to-integers",
  order: 2,
  prerequisites: ("ds.01.01.elements-sets",),
  related: ("ds.01.03.relations-functions",),
  sources: (
    (book: "rosen", edition: 8, chapter: "2", section: "2.2"),
    (book: "halmos", chapter: "4-5"),
  ),
  labs: ("lab.set-operations",),
  exercises: ("ex.ds.01.02",),
)[
  === 问题动机
  有了集合，就要能组合集合。并、交、差、补是四种最基本的组合方式，
  它们和逻辑里的“或、且、非”一一对应，也直接对应计算机里的位运算。

  === 形式化定义
  设 $A, B$ 是全集 $U$ 的子集：

  - 并：$A union B = {x mid x in A or x in B}$；
  - 交：$A inter B = {x mid x in A and x in B}$；
  - 差：$A - B = {x mid x in A and x in.not B}$；
  - 补：$A^c = U - A$；
  - 对称差：$A triangle B = (A - B) union (B - A)$。

  === 证明与推导
  *德摩根律.* $(A union B)^c = A^c inter B^c$。

  *证明.* 对任意 $x$，
  $x in (A union B)^c <-> not (x in A or x in B) <-> x in.not A and x in.not B <-> x in A^c inter B^c$。
  因此两边包含相同的元素，集合相等。$square$

  这条规律说明：集合运算不是死记硬背的规则，它和命题逻辑是同一件事的两种写法。

  === 机制
  对有限全集，集合用位向量表示，集合运算就变成逐位布尔运算：

  - 并 $<->$ 按位或；
  - 交 $<->$ 按位与；
  - 补 $<->$ 按位取反；
  - 对称差 $<->$ 按位异或。

  例如 $A = 01010$，$B = 00110$，则 $A union B = 01110$，$A inter B = 00010$。

  === 实验
  Web 实验 `lab.set-operations`：选择两个集合，切换并/交/差/补/对称差，
  同时显示文氏图、位向量和真值表。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Section 2.2.
  - Halmos, *Naive Set Theory*, Chapters 4-5.

  === 连接
  - 1.1 的集合与子集。
  - 1.3 用笛卡尔积构造关系。
  - 后面的位图、布隆过滤器、数据库查询都会用到集合运算。

  === 易错点
  - 差运算不满足交换律：$A - B != B - A$。
  - 补运算必须先指定全集 $U$。
  - 对称差不是“并减去交”那么简单，但两者相等：$A triangle B = (A union B) - (A inter B)$。

  === 练习
  动态练习 `ex.ds.01.02`：给定随机集合与运算，求结果或判断恒等式是否成立；
  同一位向量题会同时要求集合答案和二进制答案。
]
