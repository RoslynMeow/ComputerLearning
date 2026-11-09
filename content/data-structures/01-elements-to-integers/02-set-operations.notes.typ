#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.02.set-operations",
  title: "集合的运算与表示",
)[
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
