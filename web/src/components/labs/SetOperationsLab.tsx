import { useMemo, useState } from "react";
import type { Lab } from "../../labs/types";
import { LabResultView } from "../LabResultView";
import { NumberStepper } from "../NumberStepper";

type Operation = "union" | "inter" | "diff" | "symdiff";

const OPERATIONS: { value: Operation; label: string }[] = [
  { value: "union", label: "并 A ∪ B" },
  { value: "inter", label: "交 A ∩ B" },
  { value: "diff", label: "差 A − B" },
  { value: "symdiff", label: "对称差 A △ B" },
];

export function SetOperationsLab({ lab }: { lab: Lab }) {
  const [size, setSize] = useState(5);
  const [setA, setSetA] = useState<Set<number>>(() => new Set([0, 2]));
  const [setB, setSetB] = useState<Set<number>>(() => new Set([2, 3]));
  const [operation, setOperation] = useState<Operation>("union");

  const elements = Array.from({ length: size }, (_, index) => index);
  const maskA = useMemo(
    () => [...setA].reduce((sum, value) => sum | (1 << value), 0),
    [setA],
  );
  const maskB = useMemo(
    () => [...setB].reduce((sum, value) => sum | (1 << value), 0),
    [setB],
  );
  const result = useMemo(
    () => lab.run({ size, a: maskA, b: maskB, operation }),
    [lab, size, maskA, maskB, operation],
  );

  function changeSize(next: number) {
    setSize(next);
    setSetA((previous) => new Set([...previous].filter((value) => value < next)));
    setSetB((previous) => new Set([...previous].filter((value) => value < next)));
  }

  function toggle(
    setter: (updater: (previous: Set<number>) => Set<number>) => void,
    value: number,
  ) {
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function renderRow(
    label: string,
    values: Set<number>,
    setter: (updater: (previous: Set<number>) => Set<number>) => void,
  ) {
    return (
      <div className="lab-set-row">
        <span className="lab-set-label">{label}</span>
        {elements.map((value) => (
          <button
            key={value}
            type="button"
            className={values.has(value) ? "lab-element selected" : "lab-element"}
            onClick={() => toggle(setter, value)}
          >
            {value}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="lab-interactive">
      <div className="lab-play-row">
        <label>
          全集大小
          <NumberStepper value={size} min={4} max={8} onChange={changeSize} />
        </label>
        <div className="lab-operation-row">
          {OPERATIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={operation === item.value ? "lab-chip active" : "lab-chip"}
              onClick={() => setOperation(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="lab-help">点击 A 行或 B 行的数字，切换元素是否属于该集合。</p>

      <div className="lab-set-editor">
        {renderRow("A", setA, setSetA)}
        {renderRow("B", setB, setSetB)}
      </div>

      <LabResultView result={result} />
    </div>
  );
}
