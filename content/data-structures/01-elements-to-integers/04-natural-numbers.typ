#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.04.natural-numbers",
  title: "自然数：0、1 与后继",
  title_en: "Natural Numbers: 0, 1, and Successor",
  chapter: "01-elements-to-integers",
  order: 4,
  prerequisites: ("ds.01.03.relations-functions",),
  related: ("ds.01.05.counting-positional", "ds.02.04.recursion-induction"),
  sources: (
    (book: "rosen", edition: 8, chapter: "5", section: "5.1-5.3"),
    (book: "halmos", chapter: "11"),
    (book: "enderton", chapter: "4"),
  ),
  labs: ("lab.natural-numbers",),
  exercises: ("ex.ds.01.04",),
)[
  === 问题动机
  数字不是天上掉下来的。我们要先回答：$0$ 是什么？$1$ 是什么？
  “下一个数”是什么意思？只有把这些问题说清楚，后面讲进制、补码和复杂度才有根。

  === 形式化定义
  自然数可以由 Peano 公理刻画。直观上，它由三件事生成：

  + $0$ 是自然数；
  + 每个自然数 $n$ 都有一个后继 $S(n)$；
  + 从 $0$ 出发，反复取后继，就能得到所有自然数。

  更严格地说，$S$ 是单射，且 $S(n) != 0$；再加法归纳公理：
  若 $0 in A$ 且 $forall n, n in A -> S(n) in A$，则所有自然数都在 $A$ 中。

  === 证明与推导
  自然数可以具体地“做成”集合（von Neumann 构造）：

  $ 0 = emptyset, quad 1 = {0} = {emptyset}, quad 2 = {0,1} = {emptyset, {emptyset}}, quad dots $

  一般地，$n + 1 = n union {n}$。于是“数”本身也是集合，“小于”就是属于关系：
  $m < n$ 当且仅当 $m in n$。

  加法可以递归定义：

  $ 0 + m = m, quad S(n) + m = S(n + m) $

  于是
  $ 1 + 1 = S(0) + S(0) = S(0 + S(0)) = S(S(0)) = 2 $

  这就是“从 $0$ 到 $1$ 再到整数”的第一步：$1$ 不是凭空出现的，它是 $0$ 的后继。

  === 机制
  计算机不会真的用集合表示自然数，而是用固定长度的位串表示。
  但位串的加法仍然遵循同一套递归规则：后继、进位、再后继。
  数学定义保证“为什么这样加是对的”，计算机表示决定“怎样加得快”。

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
