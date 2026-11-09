#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.08.abstract-representation",
  title: "抽象与表示",
  title_en: "Abstraction and Representation",
  chapter: "01-elements-to-integers",
  order: 8,
  prerequisites: ("ds.01.03.relations-functions", "ds.01.07.computer-representation"),
  related: ("ds.02.03.state-invariant",),
  sources: (
    (book: "clrs", edition: 4, chapter: "1"),
    (book: "sedgewick", edition: 4, chapter: "1", section: "1.3"),
    (book: "csapp", edition: 3, chapter: "3"),
  ),
  labs: ("lab.adt-representation",),
  exercises: ("ex.ds.01.08",),
)[
  === 问题动机
  同一个“表”可以用数组实现，也可以用链表实现。对外看，它们都支持插入、删除、查找；
  对内看，它们的代价完全不同。抽象与表示要回答的正是：
  哪些东西应该暴露给使用者，哪些东西应该藏在实现里？

  === 形式化定义
  *抽象数据类型（ADT）* 是一个三元组 $(V, O, C)$：

  + $V$：值的集合；
  + $O$：操作的集合；
  + $C$：每个操作的前置条件与后置条件。

  *表示* 是用具体的数据结构实现 $V$，并给出每个操作的算法。
  *表示不变式* 是一个关于表示状态的谓词 $I$，它必须在每个公开操作前后都成立。

  接口与实现的关系可以写成：

  $ "实现" = ("表示", "操作算法", I) quad "满足" quad "接口" = (V, O, C) $

  若两个表示之间存在双射，并且保持所有操作的结果，则称它们在同构意义下表示同一个 ADT。

  例如栈 ADT 的接口是 `push(x)`、`pop()`、`top()`、`isEmpty()`；
  `push` 的后置条件是新元素位于栈顶，`pop` 的前置条件是栈非空。

  === 证明与推导
  以数组栈为例。表示是数组 $a$ 与栈顶指针 $t$，表示不变式是

  $ I: quad 0 <= t <= n quad and quad a[0..t) "保存栈中元素" $

  *命题.* 若 $I$ 在 `push(x)` 前成立，且 $t < n$，则 `push` 后 $I$ 仍成立。

  *证明.* `push` 把 $a[t]$ 设为 $x$，再把 $t$ 加一。操作前 $t < n$，所以 $a[t]$ 合法；
  操作后 $t + 1 <= n$，且 $a[0..t+1)$ 正好是旧元素加上 $x$。因此 $I$ 保持。$square$

  这个证明模板会在第 2 章“状态与不变量”里反复使用。

  === 机制
  数组的地址公式是“表示”的最基本例子。若每个元素占 $L$ 个字节，
  首地址为 $"base"$，则第 $i$ 个元素的地址是

  $ "LOC"(a_i) = "base" + i dot L $

  这个公式让随机访问成为 $O(1)$。链表没有这个公式，访问第 $i$ 个元素必须从头走，
  代价是 $O(i)$；但链表在已知位置插入/删除时不需要搬移元素。

  #table(
    columns: 4,
    align: center,
    [操作], [数组], [链表], [说明],
    [随机访问], [$O(1)$], [$O(n)$], [地址公式 vs 逐跳],
    [头部插入], [$O(n)$], [$O(1)$], [搬移 vs 改指针],
    [查找], [$O(n)$], [$O(n)$], [都需要扫描],
  )

  所以“选择表示”不是审美问题，而是把哪些操作变快、哪些操作变慢的权衡。
  动态数组的 `push` 最坏是 $O(n)$（扩容时搬移），但按倍数扩容时摊还代价是 $O(1)$。

]
