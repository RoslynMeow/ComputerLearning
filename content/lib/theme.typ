#let conf(
  title: [ComputerLearning],
  subtitle: none,
  author: none,
  date: none,
  abstract: none,
  body,
) = {
  set document(title: title)
  set page(
    paper: "a4",
    margin: (top: 1.5cm, bottom: 1.5cm, left: 1cm, right: 1cm),
    numbering: "1",
    footer: context {
      if counter(page).get().first() > 1 {
        set text(size: 9pt)
        align(center, counter(page).display("1"))
      }
    },
  )
  set text(
    font: ("New Computer Modern", "SimSun"),
    size: 12pt,
    lang: "zh",
    region: "cn",
  )
  set par(
    justify: true,
    leading: 0.75em,
    spacing: 0.6em,
    first-line-indent: (amount: 2em, all: true),
  )
  set list(indent: 2em, body-indent: 0.5em)
  set enum(indent: 2em, body-indent: 0.5em)
  set math.equation(numbering: "(1)")
  set figure.caption(position: bottom)
  show figure.caption: set text(size: 10pt)
  show table: set text(size: 10pt)
  show raw: set text(size: 10pt)

  set heading(numbering: (..nums) => {
    let n = nums.pos()
    if n.len() == 1 {
      "第" + str(n.at(0)) + "章"
    } else {
      n.map(str).join(".")
    }
  })

  show heading.where(level: 1): it => {
    set text(
      size: 22pt,
      weight: "bold",
      font: ("New Computer Modern", "SimHei"),
    )
    it
  }

  show heading.where(level: 2): it => {
    v(0.8em)
    set text(
      size: 14pt,
      weight: "bold",
      font: ("New Computer Modern", "SimHei"),
    )
    it
    v(0.3em)
  }

  show heading.where(level: 3): it => {
    v(0.5em)
    set text(
      size: 12pt,
      weight: "bold",
      font: ("New Computer Modern", "SimHei"),
    )
    it
    v(0.2em)
  }

  // 封面
  page(header: none, footer: none, numbering: none)[
    #v(1fr)
    #align(center)[
      #text(
        size: 24pt,
        weight: "bold",
        font: ("New Computer Modern", "SimSun"),
      )[#title]
      #if subtitle != none [
        #v(0.8em)
        #text(size: 14pt)[#subtitle]
      ]
      #if author != none [
        #v(2.5em)
        #text(size: 14pt)[#author]
      ]
      #if date != none [
        #v(0.6em)
        #text(size: 14pt)[#date]
      ]
    ]
    #if abstract != none [
      #v(2.5em)
      #align(center)[#text(weight: "bold")[摘要]]
      #v(1em)
      #align(center)[#abstract]
    ]
    #v(1fr)
  ]
  pagebreak()

  // 目录
  outline(title: [目录], depth: 2)
  pagebreak()

  body
}

#let chapter(
  title: "",
  summary: none,
  body,
) = {
  pagebreak(weak: true)
  v(1fr)
  align(center)[
    #heading(level: 1)[#title]
    #if summary != none [
      #v(1em)
      #text(size: 12pt)[#summary]
    ]
  ]
  v(1fr)
  pagebreak()
  body
}
