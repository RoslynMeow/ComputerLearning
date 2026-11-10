import { useMemo, useState } from "react";
import type { Lab } from "../../labs/types";
import { LabResultView } from "../LabResultView";
import { NumberStepper } from "../NumberStepper";

export function SetBuilderLab({ lab }: { lab: Lab }) {
  const [size, setSize] = useState(6);
  const [selected, setSelected] = useState<Set<number>>(() => new Set([1, 3]));

  const elements = Array.from({ length: size }, (_, index) => index);
  const mask = useMemo(
    () => [...selected].reduce((sum, value) => sum | (1 << value), 0),
    [selected],
  );
  const result = useMemo(() => lab.run({ size, mask }), [lab, size, mask]);

  function changeSize(next: number) {
    setSize(next);
    setSelected((previous) => new Set([...previous].filter((value) => value < next)));
  }

  function toggle(value: number) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <div className="lab-interactive">
      <div className="lab-play-row">
        <label>
          全集大小
          <NumberStepper value={size} min={4} max={10} onChange={changeSize} />
        </label>
        <span className="lab-help">点击数字，把它加入或移出集合 A。</span>
      </div>

      <div className="lab-elements">
        {elements.map((value) => (
          <button
            key={value}
            type="button"
            className={selected.has(value) ? "lab-element selected" : "lab-element"}
            onClick={() => toggle(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="lab-bits">
        {elements.map((value) => (
          <span
            key={value}
            className={selected.has(value) ? "lab-bit on" : "lab-bit off"}
          >
            {selected.has(value) ? "1" : "0"}
          </span>
        ))}
      </div>
      <p className="lab-bit-caption">位向量（第 0 位在左）</p>

      <LabResultView result={result} />
    </div>
  );
}
