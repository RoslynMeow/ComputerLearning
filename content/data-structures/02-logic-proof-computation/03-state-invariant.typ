#import "../../lib/ku.typ": ku

#ku(
  id: "ds.02.03.state-invariant",
  title: "状态与不变量",
  title_en: "State and Invariant",
  chapter: "02-logic-proof-computation",
  order: 3,
  prerequisites: ("ds.01.08.abstract-representation", "ds.02.02.proof"),
  related: ("ds.02.04.recursion-induction",),
  sources: (
    (book: "clrs", edition: 4, chapter: "2", section: "2.1"),
    (book: "rosen", edition: 8, chapter: "5", section: "5.5"),
  ),
  labs: ("lab.loop-invariant",),
  exercises: ("ex.ds.02.03",),
)[
  === 问题动机
  循环执行很多次，为什么我们知道它在结束时是对的？
  因为循环的每一次迭代都在维持某个“始终为真”的性质。
  这个性质就是循环不变量。

  === 形式化定义
  设程序状态是变量取值的一个快照。状态转移由语句决定。
  *循环不变量* 是一个谓词 $I$，它满足：

  + *初始化*：进入循环前 $I$ 成立；
  + *保持*：若 $I$ 成立且循环条件为真，执行一次循环体后 $I$ 仍成立；
  + *终止*：循环结束时，$I$ 与循环条件为假一起推出所需结论。

  表示不变式是循环不变量的静态版本：它在每个公开操作前后都成立。

  === 证明与推导
  考虑数组求和：

  ```python
  s = 0
  i = 0
  while i < n:
      s += a[i]
      i += 1
  ```

  取不变量

  $ I: quad s = sum_(j=0)^(i-1) a[j] quad and quad 0 <= i <= n $

  *初始化.* 进入循环前 $s = 0$、$i = 0$，空和为 $0$，所以 $I$ 成立。

  *保持.* 假设 $I$ 成立且 $i < n$。执行 `s += a[i]` 后，
  $s$ 变成 $sum_(j=0)^(i) a[j]$；再执行 `i += 1`，于是
  $s = sum_(j=0)^(i-1) a[j]$ 仍然成立，且 $i <= n$ 仍成立。

  *终止.* 循环结束时 $i >= n$，结合 $i <= n$ 得 $i = n$。
  由 $I$ 得 $s = sum_(j=0)^(n-1) a[j]$，这正是所需的求和结果。$square$

  === 机制
  不变量不是写完代码后随便补的一句话，而是设计循环时的“状态契约”。
  调试时可以把 $I$ 写成断言，放在循环入口和每次迭代末尾：

  ```python
  while i < n:
      assert s == sum(a[:i]) and 0 <= i <= n
      s += a[i]
      i += 1
  ```

  一旦断言失败，第一次失败的位置就是错误发生的位置。

]
