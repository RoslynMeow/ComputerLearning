#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.02.06.cost",
  title: "代价的数学",
)[
  === 实验
  Web 实验 `lab.growth-curves`：选择不同增长函数，拖动 $n$ 观察曲线；
  输入一个递推式，展开递归树并显示每层代价。

  === 来源
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Sections 3.1-3.3.
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Sections 3.1-3.2.

  === 连接
  - 1.8 的表示选择：数组与链表的代价差异。
  - 2.4 的递归：递归树直接给出递推式。
  - 第 3 章之后所有算法分析都使用这套语言。
  - 后续还会遇到摊还分析与平均情况分析。

  === 易错点
  - 把 $O$ 当成“大约等于”：$O$ 只给上界，不保证紧。
  - 忽略常数时忘记说明 $n$ 足够大。
  - 把最坏情况当平均情况，或反过来。
  - 递推式漏掉基例，导致解不唯一。

  === 练习
  动态练习 `ex.ds.02.06`：给定代码或递推式，判断增长阶；
  比较两个函数的渐近大小；补全 $O/Omega/Theta$ 证明中的常数。
]
