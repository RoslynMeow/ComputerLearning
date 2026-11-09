#import "../lib/web-theme.typ": web-conf

#show: web-conf

= 从元素到整数

#html.elem("section", attrs: (id: "ds.01.01.elements-sets", class: "ku"))[
  #include "01-elements-to-integers/01-elements-sets.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/01-elements-sets.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.01.02.set-operations", class: "ku"))[
  #include "01-elements-to-integers/02-set-operations.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/02-set-operations.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.01.03.relations-functions", class: "ku"))[
  #include "01-elements-to-integers/03-relations-functions.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/03-relations-functions.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.01.04.natural-numbers", class: "ku"))[
  #include "01-elements-to-integers/04-natural-numbers.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/04-natural-numbers.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.01.05.counting-positional", class: "ku"))[
  #include "01-elements-to-integers/05-counting-positional.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/05-counting-positional.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.01.06.integers-twos-complement", class: "ku"))[
  #include "01-elements-to-integers/06-integers-twos-complement.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/06-integers-twos-complement.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.01.07.computer-representation", class: "ku"))[
  #include "01-elements-to-integers/07-computer-representation.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/07-computer-representation.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.01.08.abstract-representation", class: "ku"))[
  #include "01-elements-to-integers/08-abstract-representation.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "01-elements-to-integers/08-abstract-representation.notes.typ"
  ]
]

= 逻辑、证明与计算

#html.elem("section", attrs: (id: "ds.02.01.logic", class: "ku"))[
  #include "02-logic-proof-computation/01-logic.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "02-logic-proof-computation/01-logic.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.02.02.proof", class: "ku"))[
  #include "02-logic-proof-computation/02-proof.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "02-logic-proof-computation/02-proof.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.02.03.state-invariant", class: "ku"))[
  #include "02-logic-proof-computation/03-state-invariant.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "02-logic-proof-computation/03-state-invariant.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.02.04.recursion-induction", class: "ku"))[
  #include "02-logic-proof-computation/04-recursion-induction.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "02-logic-proof-computation/04-recursion-induction.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.02.05.computation", class: "ku"))[
  #include "02-logic-proof-computation/05-computation.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "02-logic-proof-computation/05-computation.notes.typ"
  ]
]

#html.elem("section", attrs: (id: "ds.02.06.cost", class: "ku"))[
  #include "02-logic-proof-computation/06-cost.typ"
  #html.elem("div", attrs: (class: "ku-notes"))[
    #include "02-logic-proof-computation/06-cost.notes.typ"
  ]
]
