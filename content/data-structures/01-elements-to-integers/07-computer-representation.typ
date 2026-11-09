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

]
