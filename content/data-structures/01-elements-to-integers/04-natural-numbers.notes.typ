#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.04.natural-numbers",
  title: "自然数：0、1 与后继",
)[
  === 实验
  Web 实验 `lab.natural-numbers`：从 $0$ 开始，逐步展开 von Neumann 集合，
  观察 $0,1,2,3$ 的集合形式；再单步执行递归加法，看到每一步的后继。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Sections 5.1-5.3.
  - Halmos, *Naive Set Theory*, Chapter 11.
  - Enderton, *Elements of Set Theory*, Chapter 4.

  === 连接
  - 1.5 把自然数写成位置记数法。
  - 1.6 用自然数对构造整数。
  - 2.4 把这里的归纳推广到结构归纳。

  === 易错点
  - 把“后继”当成“加一”：后继是更原始的概念，加法是用后继定义的。
  - 忘记基例：没有 $0$ 的归纳不是归纳。
  - 把 von Neumann 构造当成唯一构造：它只是一种标准实现。

  === 练习
  动态练习 `ex.ds.01.04`：给定 $n$，生成它的集合表示；给定递归加法表达式，逐步求值；
  判断一个归纳证明缺了哪一步。
]
