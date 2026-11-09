#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.01.elements-sets",
  title: "元素与集合",
  title_en: "Elements and Sets",
  chapter: "01-elements-to-integers",
  order: 1,
  prerequisites: (),
  related: ("ds.01.02.set-operations", "ds.01.03.relations-functions"),
  sources: (
    (book: "rosen", edition: 8, chapter: "2", section: "2.1"),
    (book: "halmos", chapter: "1-2"),
  ),
  labs: ("lab.elements-sets",),
  exercises: ("ex.ds.01.01",),
)[
  === 问题动机
  写程序之前，我们先要能回答两个问题：我们讨论的对象是什么？这些对象怎样聚在一起？
  如果连“对象”和“整体”都说不清楚，后面的数组、链表、图都只是没有含义的符号。

  === 形式化定义
  集合是一些确定对象的整体。若 $x$ 是集合 $S$ 中的对象，记作 $x in S$，并称 $x$ 是 $S$ 的元素。

  - *相等*：$A = B$ 当且仅当 $forall x, x in A <-> x in B$。
  - *子集*：$A subset.eq B$ 当且仅当 $forall x, x in A -> x in B$。
  - *真子集*：$A subset B$ 表示 $A subset.eq B$ 且 $A != B$。
  - *空集*：不含任何元素的集合，记作 $emptyset$。
  - *幂集*：$P(S) = {A mid A subset.eq S}$，即 $S$ 的所有子集构成的集合。

  例如 $S = {1,2}$ 的幂集有四个元素：$emptyset$、${1}$、${2}$、${1,2}$；
  一般地，$|P(S)| = 2^(|S|)$。

  集合的两种常见写法：

  + 列举法：$S = {1, 3, 5}$；
  + 描述法：$S = {x in NN mid x "是奇数"}$。

  === 证明与推导
  *命题.* 空集是任意集合的子集。

  *证明.* 要证 $emptyset subset.eq A$，需要证 $forall x, x in emptyset -> x in A$。
  但 $x in emptyset$ 恒为假，所以蕴含式恒为真。因此 $emptyset subset.eq A$。$square$

  这个证明看起来“什么都没做”，但它说明了一个重要习惯：
  数学命题的真假由定义决定，不由例子数量决定。

  === 机制
  计算机里只能直接处理有限对象。对有限全集 $U = {0, 1, dots, n-1}$，
  一个子集 $A subset.eq U$ 可以用长度为 $n$ 的位向量表示：

  $ chi_A(i) = cases(1 & "若" i in A, 0 & "若" i in.not A) $

  例如 $U = {0,1,2,3,4}$，$A = {1,3}$ 对应位向量 $01010$。
  这就是后面“位运算表示集合”和“布尔数组”的源头。

]
