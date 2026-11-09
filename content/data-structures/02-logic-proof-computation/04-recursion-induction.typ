#import "../../lib/ku.typ": ku

#ku(
  id: "ds.02.04.recursion-induction",
  title: "递归与归纳结构",
  title_en: "Recursion and Inductive Structure",
  chapter: "02-logic-proof-computation",
  order: 4,
  prerequisites: ("ds.02.02.proof",),
  related: ("ds.02.05.computation", "ds.02.06.cost"),
  sources: (
    (book: "rosen", edition: 8, chapter: "5", section: "5.3"),
    (book: "clrs", edition: 4, chapter: "3", section: "3.1-3.2"),
  ),
  labs: ("lab.recursion-tree",),
  exercises: ("ex.ds.02.04",),
)[
  === 问题动机
  自然数可以用“0 与后继”描述，树可以用“叶子与节点”描述。
  这些对象都有相同的结构：由基例出发，反复用构造规则生成。
  递归定义描述它们，结构归纳证明它们的性质。

  === 形式化定义
  *递归定义* 由两部分组成：

  + 基例：最小的对象；
  + 递归步：如何由已有对象构造新对象。

  例如二叉树可以定义为

  $ T ::= "Leaf" mid "Node"(T, T) $

  这里 `Leaf` 是基例，`Node` 把两棵子树组合成一棵新树。

  *结构归纳*：要证明所有由递归定义生成的对象都满足 $P$，只需证明：

  + 每个基例满足 $P$；
  + 若子对象满足 $P$，则由它们构造出的新对象也满足 $P$。

  这和自然数归纳是同一个思想，只是“后继”换成了“构造规则”。

  === 证明与推导
  *命题.* 在满二叉树中，叶子数 $L$ 等于内部节点数 $I$ 加一：$L = I + 1$。

  *证明.* 对树的结构做归纳。

  - 基例：树只有一个 `Leaf`。此时 $L = 1$，$I = 0$，$L = I + 1$ 成立。
  - 归纳步：树是 `Node(T_1, T_2)`。由归纳假设，
    $L(T_1) = I(T_1) + 1$，$L(T_2) = I(T_2) + 1$。
    整棵树的叶子数是 $L(T_1) + L(T_2)$，内部节点数是 $I(T_1) + I(T_2) + 1$。
    于是
    $ L = (I(T_1)+1) + (I(T_2)+1) = I(T_1) + I(T_2) + 2 = I + 1 $

  由结构归纳，命题对所有满二叉树成立。$square$

  === 机制
  递归程序把“大问题”分解成“同类的子问题”。以树的高度为例：

  ```python
  def height(t):
      if t is Leaf:
          return 0
      return 1 + max(height(t.left), height(t.right))
  ```

  递归树把调用展开成一棵树。树的深度对应调用栈深度，节点数对应调用次数。
  后面分析递归算法代价时，我们就是在这棵树上做计数。

]
