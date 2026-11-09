#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.08.abstract-representation",
  title: "抽象与表示",
)[
  === 实验
  Web 实验 `lab.adt-representation`：同一个序列 ADT，切换数组/链表表示，
  执行同一组插入、删除、访问操作，实时比较操作次数与地址变化。

  === 来源
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Chapter 1.
  - Sedgewick & Wayne, *Algorithms*, 4th ed., Section 1.3.
  - Bryant & O'Hallaron, *Computer Systems: A Programmer's Perspective*, 3rd ed., Chapter 3.

  === 连接
  - 1.3 的集合与关系：ADT 的值集与操作就是关系。
  - 1.7 的计算机表示：地址、字节、字。
  - 2.3 的状态与不变量：表示不变式是循环不变量的前身。
  - 第 3 章的线性结构：数组、链表、栈、队列都是本节的具体化。

  === 易错点
  - 把接口当实现：接口说“能做什么”，实现说“怎么做、代价多少”。
  - 忘记表示不变式：数组栈的 $0 <= t <= n$ 一旦破坏，后续操作全部失效。
  - 认为存在“最好”的表示：只有针对某组操作的“更合适”的表示。

  === 练习
  动态练习 `ex.ds.01.08`：给定 ADT 与操作序列，选择更合适的表示并说明理由；
  计算数组元素地址；找出破坏表示不变式的操作。
]
