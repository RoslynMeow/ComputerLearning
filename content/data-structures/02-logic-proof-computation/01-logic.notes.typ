#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.02.01.logic",
  title: "用逻辑说话",
)[
  === 实验
  Web 实验 `lab.logic-spec`：在有限论域上构造谓词与量词公式，
  实时显示真值；你可以扮演“证明者”和“反例寻找者”，
  看看 $forall$ 与 $exists$ 的顺序如何改变真假。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Sections 1.1-1.4.

  === 连接
  - 1.3 的关系与函数：谓词可以看成关系。
  - 2.2 的证明：证明就是把逻辑推导写清楚。
  - 2.3 的不变量：不变量就是一个必须始终为真的谓词。
  - 后面的算法规格、类型系统、数据库查询都建立在这套语言上。

  === 易错点
  - 蕴含方向反了：$p -> q$ 不等于 $q -> p$。
  - 空真：当前提为假时，$p -> q$ 自动为真。
  - 量词顺序：$forall exists$ 与 $exists forall$ 完全不同。
  - 否定量词忘记翻转：$not forall$ 变成 $exists not$，不是 $forall not$。

  === 练习
  动态练习 `ex.ds.02.01`：在随机有限论域上判断量词公式真假；
  给出公式的否定；找出使公式为假的反例。
]
