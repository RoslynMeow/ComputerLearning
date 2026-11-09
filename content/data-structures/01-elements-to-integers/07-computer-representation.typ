#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.07.computer-representation",
  title: "计算机中的表示",
  title_en: "Representation in Computers",
  chapter: "01-elements-to-integers",
  order: 7,
  prerequisites: ("ds.01.05.counting-positional", "ds.01.06.integers-twos-complement"),
  related: ("ds.01.08.abstract-representation",),
  sources: (
    (book: "csapp", edition: 3, chapter: "2"),
    (book: "cod", edition: 5, chapter: "2"),
    (book: "rosen", edition: 8, chapter: "4"),
  ),
  labs: ("lab.computer-representation",),
  exercises: ("ex.ds.01.07",),
)[
  === 问题动机
  数学上的数可以无限大、无限精确；计算机只有有限个二进制位。
  有限表示会带来范围、精度、溢出和字节序问题。理解这些限制，才能理解后面所有数据结构的代价。

  === 形式化定义
  计算机内存可以看成一个很大的字节数组。一个字节是 $8$ 位，一个字通常由若干字节组成。

  - 无符号整数：$n$ 位表示 $0$ 到 $2^n - 1$。
  - 补码整数：$n$ 位表示 $-2^(n-1)$ 到 $2^(n-1) - 1$。
  - 定长表示：所有运算都在模 $2^n$ 下进行。

  同一个字节序列可以按不同方式解释：无符号数、补码数、字符、指令、地址。
  表示方式决定“这串位是什么意思”。

  === 证明与推导
  *命题.* $n$ 位无符号加法与补码加法在二进制层面是同一个操作。

  *证明.* 两者都是逐位相加并对 $2^n$ 取模。区别只在于如何解释最高位：
  无符号把最高位看成 $2^(n-1)$，补码把它看成 $-2^(n-1)$。
  因此同一套加法电路可以同时服务两种类型，溢出判断则依赖解释方式。$square$

  === 机制
  常见表示层次：

  - 位与字节：最小寻址单位是字节，字节序分小端与大端。
  - 定点数：约定小数点位置，用整数运算模拟小数。
  - 浮点数：符号、指数、尾数三部分，按 IEEE 754 规范编码。
  - 字符：ASCII 是 7 位编码；UTF-8 是变长编码，码点与字节序列不是一回事。

  例如十进制 $0.1$ 在二进制浮点中不能精确表示，
  所以 `0.1 + 0.2 != 0.3` 不是语言的 bug，而是有限表示的必然结果。

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
