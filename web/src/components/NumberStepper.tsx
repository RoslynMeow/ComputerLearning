import { useEffect, useState } from "react";

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

export function NumberStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
}: Props) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function clampValue(next: number): number {
    const snapped = step > 1 ? Math.round(next / step) * step : next;
    return Math.min(max, Math.max(min, snapped));
  }

  function commit(nextText: string) {
    const parsed = Number(nextText);
    if (!Number.isFinite(parsed)) {
      setText(String(value));
      return;
    }
    const next = clampValue(parsed);
    onChange(next);
    setText(String(next));
  }

  function change(delta: number) {
    const next = clampValue(value + delta);
    onChange(next);
    setText(String(next));
  }

  return (
    <div className="stepper">
      <button
        type="button"
        onClick={() => change(-step)}
        disabled={value <= min}
        aria-label="减少"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={text}
        onChange={(event) => {
          const nextText = event.target.value;
          setText(nextText);
          const parsed = Number(nextText);
          if (
            Number.isFinite(parsed) &&
            parsed >= min &&
            parsed <= max
          ) {
            onChange(clampValue(parsed));
          }
        }}
        onBlur={() => commit(text)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit(text);
        }}
      />
      <button
        type="button"
        onClick={() => change(step)}
        disabled={value >= max}
        aria-label="增加"
      >
        +
      </button>
    </div>
  );
}
