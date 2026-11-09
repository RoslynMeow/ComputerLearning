#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.02.03.state-invariant",
  title: "状态与不变量",
)[
  === 实验
  Web 实验 `lab.loop-invariant`：单步执行循环，实时显示 $i$、$s$ 与不变量真假；
  你可以修改循环体或循环条件，观察不变量在哪一步被破坏。

  === 来源
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Section 2.1.
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Section 5.5.

  === 连接
  - 1.8 的表示不变式。
  - 2.2 的证明方法：初始化、保持、终止就是归纳法的三步。
  - 2.4 的结构归纳：从循环推广到递归结构。
  - 第 3 章的数组算法、二分查找、插入排序都会用到。

  === 易错点
  - 不变量太弱：只能推出部分结论，无法完成终止证明。
  - 不变量太强：初始化就不成立，或者保持不了。
  - 忘记终止条件：只证明“循环中成立”，没证明“结束后得到答案”。
  - 把断言放在错误位置：应在循环入口和迭代末尾检查。

  === 练习
  动态练习 `ex.ds.02.03`：给定循环代码，选择正确的不变量；
  单步执行并指出第一次违反不变量的位置；补全初始化/保持/终止证明。
]
