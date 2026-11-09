#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.07.computer-representation",
  title: "计算机中的表示",
)[
  === 实验
  Web 实验 `lab.computer-representation`：输入一个数，切换无符号/补码/浮点/字符视图，
  观察同一串字节在不同解释下的值；切换大小端，观察字节顺序。

  === 来源
  - Bryant & O'Hallaron, *Computer Systems: A Programmer's Perspective*, 3rd ed., Chapter 2.
  - Patterson & Hennessy, *Computer Organization and Design*, 5th ed., Chapter 2.
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Chapter 4.

  === 连接
  - 1.5 的位置记数法。
  - 1.6 的补码。
  - 1.8 的表示不变式。
  - 后面的数组、指针、哈希、序列化都建立在这层表示上。

  === 易错点
  - 把“字节序”与“位序”混为一谈。
  - 认为浮点数是实数的精确表示。
  - 认为字符就是字节：UTF-8 中一个字符可能占多个字节。

  === 练习
  动态练习 `ex.ds.01.07`：给出字节序列，要求按不同视图解释；
  或给出浮点数，要求拆出符号、指数、尾数；每次生成新的位模式。
]
