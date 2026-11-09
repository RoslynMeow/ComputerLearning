#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.02.02.proof",
  title: "证明",
)[
  === 实验
  Web 实验 `lab.proof-steps`：给出一个证明骨架，打乱步骤顺序，让你排序；
  或故意插入一个错误步骤，让你找出是哪一步、为什么错。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Sections 1.5-1.8.
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Section 2.1.

  === 连接
  - 2.1 的逻辑：证明是逻辑推导的具体写法。
  - 2.3 的不变量：循环正确性证明就是“初始化 + 保持 + 终止”。
  - 2.4 的结构归纳：把归纳从自然数推广到树和序列。
  - 后面每个算法的正确性证明都会复用这些模板。

  === 易错点
  - 循环论证：用结论本身去证明结论。
  - 归纳假设用错：假设的是 $P(k)$，却去证 $P(k+1)$ 时用了 $P(k+1)$。
  - 漏掉基例：没有基例，归纳链没有起点。
  - 证明了逆命题：想证 $p -> q$，却证了 $q -> p$。

  === 练习
  动态练习 `ex.ds.02.02`：补全证明步骤、判断步骤顺序、找出错误步骤；
  每次生成不同的数论或不等式命题。
]
