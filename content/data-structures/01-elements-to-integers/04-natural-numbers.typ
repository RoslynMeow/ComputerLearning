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

  更严格地说，Peano 公理包含五条：

  + $0 in NN$；
  + 若 $n in NN$，则 $S(n) in NN$；
  + 对所有 $n$，$S(n) != 0$；
  + $S$ 是单射：$S(n) = S(m) -> n = m$；
  + 归纳公理：若 $0 in A$ 且 $forall n, n in A -> S(n) in A$，则 $NN subset.eq A$。

  通常把 $1$ 定义为 $S(0)$，把 $2$ 定义为 $S(S(0))$，依此类推。

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

]
