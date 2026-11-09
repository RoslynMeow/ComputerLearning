#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.05.counting-positional",
  title: "计数与位置记数法",
)[
  === 实验
  Web 实验 `lab.counting-positional`：输入一个十进制数，选择基数，
  单步执行“除基取余”，同时显示位权展开和进位链。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Sections 4.1-4.2.
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Chapter 1.

  === 连接
  - 1.4 的自然数与后继。
  - 1.6 用固定位数表示整数。
  - 1.7 位、字节、字与内存布局。

  === 易错点
  - 基数 $b$ 的数码集是 $0$ 到 $b-1$，不是 $1$ 到 $b$。
  - 前导零不改变值，但会改变“定长表示”的长度。
  - 小数进制转换可能无限循环，例如 $0.1$ 在二进制中不是有限小数。

  === 练习
  动态练习 `ex.ds.01.05`：随机生成整数与基数，要求写出转换步骤；
  或给出两个二进制数，要求逐列相加并标出进位。
]
