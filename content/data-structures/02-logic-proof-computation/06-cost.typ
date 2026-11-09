#import "../../lib/ku.typ": ku

#ku(
  id: "ds.02.06.cost",
  title: "代价的数学",
  title_en: "The Mathematics of Cost",
  chapter: "02-logic-proof-computation",
  order: 6,
  prerequisites: ("ds.02.04.recursion-induction",),
  related: ("ds.01.08.abstract-representation",),
  sources: (
    (book: "clrs", edition: 4, chapter: "3", section: "3.1-3.3"),
    (book: "rosen", edition: 8, chapter: "3", section: "3.1-3.2"),
  ),
  labs: ("lab.growth-curves",),
  exercises: ("ex.ds.02.06",),
)[
  === 问题动机
  同一个算法在不同机器、不同输入上运行时间不同，直接比较秒数没有意义。
  我们真正关心的是：输入规模变大时，代价按什么速度增长。

  === 形式化定义
  设 $f(n)$ 是算法在规模 $n$ 下的代价。

  - 上界：$f(n) = O(g(n))$ 当且仅当存在 $c > 0$ 与 $n_0$，使得
    $forall n >= n_0, 0 <= f(n) <= c dot g(n)$。
  - 下界：$f(n) = Omega(g(n))$ 当且仅当存在 $c > 0$ 与 $n_0$，使得
    $forall n >= n_0, 0 <= c dot g(n) <= f(n)$。
  - 紧界：$f(n) = Theta(g(n))$ 当且仅当 $f(n) = O(g(n))$ 且 $f(n) = Omega(g(n))$。

  直观上，$O$ 说“不会比这个更慢”，$Omega$ 说“不会比这个更快”，
  $Theta$ 说“增长速度就是它”。

  === 证明与推导
  *命题.* $3 n^2 + 5 n + 2 = Theta(n^2)$。

  *证明.* 当 $n >= 1$ 时，
  $3 n^2 + 5 n + 2 <= 3 n^2 + 5 n^2 + 2 n^2 = 10 n^2$，
  所以取 $c_2 = 10$ 得上界。
  又 $3 n^2 + 5 n + 2 >= 3 n^2$，取 $c_1 = 3$ 得下界。
  因此存在 $c_1 = 3$、$c_2 = 10$、$n_0 = 1$，满足定义，故为 $Theta(n^2)$。$square$

  *命题.* 递推 $T(n) = 2 T(n/2) + n$ 的解是 $Theta(n log n)$。

  *证明思路（递归树）.* 第 $i$ 层有 $2^i$ 个节点，每个节点代价为 $n / 2^i$，
  所以每层总代价都是 $n$。树高为 $log_2 n$，共有 $log_2 n + 1$ 层，
  总代价为 $n (log_2 n + 1) = Theta(n log n)$。$square$

  === 机制
  从代码得到代价，通常分三步：

  + 选一个基本操作（比较、赋值、数组访问）；
  + 数它在最坏情况下执行多少次；
  + 把结果写成 $n$ 的函数，必要时解递推式。

  常见增长阶从慢到快：

  $ O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) $

  主定理给出递推 $T(n) = a T(n/b) + f(n)$ 的常用结论：
  比较 $f(n)$ 与 $n^(log_b a)$，就能判断哪一项主导。

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
