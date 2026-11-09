#let conf(title: "ComputerLearning", body) = {
  set document(title: title)
  set page(paper: "a4", margin: 2.5cm, numbering: "1")
  set text(
    font: (
      "Microsoft YaHei",
      "SimSun",
      "Noto Serif CJK SC",
      "Source Han Serif SC",
    ),
    size: 11pt,
    lang: "zh",
    region: "cn",
  )
  set par(justify: true, leading: 0.8em)
  set heading(numbering: "1.1")

  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    set text(size: 18pt, weight: "bold")
    it
  }

  show heading.where(level: 2): it => {
    set text(size: 14pt, weight: "bold")
    it
  }

  set math.equation(numbering: "(1)")
  body
}
