#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.02.05.computation",
  title: "什么叫计算",
)[
  === 实验
  Web 实验 `lab.turing-machine`：运行一个最小图灵机，观察纸带、读写头与状态变化；
  再切换寄存器机模型，比较两种模型如何完成同一个任务。

  === 来源
  - Sipser, *Introduction to the Theory of Computation*, 3rd ed., Sections 3.1-3.3.
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Chapter 1.

  === 连接
  - 2.4 的递归：递归函数是计算的一种形式。
  - 2.6 的代价：可计算不等于可行，复杂度研究“要花多少代价”。
  - 1.5 的表示：纸带符号与二进制表示。
  - 后面的算法分析默认问题本身是可计算的。

  === 易错点
  - 把“可计算”与“高效”混为一谈：停机问题不可判定，但很多可判定问题也可能指数级。
  - 认为图灵机只是历史模型：它是定义“可计算性”的数学工具。
  - 把“某个模型做不到”当成“所有模型都做不到”：需要等价性证明。

  === 练习
  动态练习 `ex.ds.02.05`：跟踪图灵机的前若干步；
  判断给定语言是否可判定；识别停机问题证明中的矛盾点。
]
