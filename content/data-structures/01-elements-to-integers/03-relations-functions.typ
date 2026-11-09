#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.03.relations-functions",
  title: "关系、函数与结构",
  title_en: "Relations, Functions, and Structure",
  chapter: "01-elements-to-integers",
  order: 3,
  prerequisites: ("ds.01.01.elements-sets", "ds.01.02.set-operations"),
  related: ("ds.01.04.natural-numbers", "ds.01.08.abstract-representation"),
  sources: (
    (book: "rosen", edition: 8, chapter: "2", section: "2.1"),
    (book: "rosen", edition: 8, chapter: "9", section: "9.1-9.5"),
    (book: "clrs", edition: 4, chapter: "B"),
  ),
  labs: ("lab.relations-functions",),
  exercises: ("ex.ds.01.03",),
)[
  === 问题动机
  集合只说明“有哪些对象”，不说明“对象之间怎样相连”。
  两张城市表本身没有意义，真正有用的是“哪些城市之间有路”。
  关系与函数就是把这种“相连方式”写成数学对象的工具。

  === 形式化定义
  *有序对.* $(a,b)$ 的顺序重要：$(a,b) = (c,d)$ 当且仅当 $a = c$ 且 $b = d$。

  *笛卡尔积.* $A times B = {(a,b) | a in A, b in B}$。

  *二元关系.* $R subset.eq A times B$。若 $(a,b) in R$，记作 $a R b$。
  关系也有定义域、值域、逆关系与复合：

  $ "dom"(R) = {a | exists b, (a,b) in R}, quad "ran"(R) = {b | exists a, (a,b) in R} $

  逆关系把每个有序对反过来：$R^(-1) = {(b,a) | (a,b) in R}$。
  复合关系沿着中间元素接起来：$S compose R = {(a,c) | exists b, (a,b) in R and (b,c) in S}$。

  *等价关系.* 若 $R subset.eq A times A$ 满足

  + 自反：$forall a in A, a R a$；
  + 对称：$a R b -> b R a$；
  + 传递：$a R b and b R c -> a R c$，

  则称 $R$ 是等价关系。$a$ 的等价类记作 $[a] = {x | x R a}$。

  *偏序.* 若 $R$ 自反、反对称、传递，则称 $R$ 是偏序关系。
  反对称指：$a R b$ 且 $b R a$ 时必有 $a = b$。

  *函数.* $f: A -> B$ 是一种特殊关系：每个 $a in A$ 恰好对应一个 $b in B$。
  若 $f(a) = f(a') -> a = a'$，称 $f$ 是单射；
  若 $forall b in B, exists a in A, f(a) = b$，称 $f$ 是满射；
  既单射又满射称为双射。函数也可以复合：$(g compose f)(a) = g(f(a))$，
  其中 $f: A -> B$、$g: B -> C$。

  *同构.* 若双射 $f: A -> B$ 还保持结构（例如运算或关系），则称 $A$ 与 $B$ 同构。
  “同构”是后面“同一对象的不同表示”的数学基础。

  === 证明与推导
  *命题.* 若 $R$ 是 $A$ 上的等价关系，则 $R$ 把 $A$ 划分成若干互不相交的等价类。

  *证明.* 对任意 $a in A$，自反性给出 $a R a$，所以 $a in [a]$，每个元素至少属于一个等价类。
  若 $x in [a] inter [b]$，则 $x R a$ 且 $x R b$。由对称性得 $a R x$，
  再由传递性得 $a R b$，于是 $[a] = [b]$。因此不同等价类要么相同，要么不相交。$square$

  这个结论会在并查集、哈希冲突分组和图的连通分量里反复出现。

  === 机制
  有限关系可以直接写成关系矩阵：行是 $A$ 的元素，列是 $B$ 的元素，
  $M_(i j) = 1$ 当且仅当 $(a_i, b_j) in R$。

  例如 $A = {1,2,3}$，$B = {a,b}$，$R = {(1,a), (2,a), (3,b)}$ 对应矩阵

  $ M_R = mat(1, 0; 1, 0; 0, 1) $

  关系矩阵适合稠密关系；稀疏关系更适合邻接表。函数则可以用表、公式或程序实现。
  这就是后面图结构、哈希表和函数式抽象的雏形。

]
