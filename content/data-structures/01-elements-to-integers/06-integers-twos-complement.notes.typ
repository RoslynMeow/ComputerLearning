#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.06.integers-twos-complement",
  title: "整数：从自然数对到补码",
)[
  === 实验
  Web 实验 `lab.integers-twos-complement`：切换 $n = 4, 8, 16$，
  输入十进制整数，观察符号-数值、反码、补码三种表示；
  再做加法，单步显示进位与溢出。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Section 4.1.
  - Bryant & O'Hallaron, *Computer Systems: A Programmer's Perspective*, 3rd ed., Sections 2.2-2.3.
  - Patterson & Hennessy, *Computer Organization and Design*, 5th ed., Chapter 2.

  === 连接
  - 1.4 的自然数。
  - 1.5 的位置记数法。
  - 1.7 的位、字节与内存表示。
  - 后面的哈希、位图、溢出检查都会用到补码。

  === 易错点
  - 补码的“取反加一”是对固定位数取模，不是对无限整数取反。
  - $n$ 位补码的最小值是 $-2^(n-1)$，不是 $-2^(n-1)+1$。
  - 有符号溢出不是“最高位进位”，而是“进位与次高位进位不同”。

  === 练习
  动态练习 `ex.ds.01.06`：随机生成位宽与整数，要求写出补码；
  或给出两个补码数，判断加法结果与是否溢出。
]
