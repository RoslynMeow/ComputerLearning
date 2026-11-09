#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.02.04.recursion-induction",
  title: "递归与归纳结构",
)[
  === 实验
  Web 实验 `lab.recursion-tree`：输入一棵树或一个递归函数，
  展开递归调用树，单步显示调用栈；对比递归与迭代的访问顺序。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Section 5.3.
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Sections 3.1-3.2.

  === 连接
  - 1.4 的自然数归纳：结构归纳的基例版本。
  - 2.2 的证明方法：结构归纳是数学归纳的推广。
  - 2.5 的计算模型：递归是计算的基本形式之一。
  - 2.6 的代价：递归树直接给出递推式。
  - 第 4 章的树结构会反复使用这些定义。

  === 易错点
  - 缺少基例：递归没有终止条件。
  - 递归方向反了：把问题分解成更大的子问题。
  - 把“递归”当成“归纳”：递归是定义/计算，归纳是证明。
  - 忽略重复子问题：同一个子问题被多次计算，可能导致指数级代价。

  === 练习
  动态练习 `ex.ds.02.04`：给定递归定义，展开前几层；
  判断结构归纳证明缺了哪一步；计算递归树的节点数与深度。
]
