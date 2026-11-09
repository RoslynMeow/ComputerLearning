import { useMemo, useState } from "react";
import { mulberry32 } from "../exercises/rng";
import type { Exercise } from "../exercises/types";

function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

type Props = {
  exercise: Exercise;
};

export function ExercisePlayer({ exercise }: Props) {
  const [seed, setSeed] = useState(() => randomSeed());
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const instance = useMemo(
    () => exercise.generate(mulberry32(seed)),
    [exercise, seed],
  );

  function nextExercise() {
    setSeed(randomSeed());
    setInput("");
    setSubmitted(false);
    setCorrect(false);
    setShowSteps(false);
  }

  function submit() {
    const ok = exercise.check(input, instance);
    setCorrect(ok);
    setSubmitted(true);
    if (ok) setShowSteps(true);
  }

  const inputMode = instance.kind === "number" ? "numeric" : "text";

  return (
    <section className="player">
      <header className="player-header">
        <div>
          <h2>{exercise.title}</h2>
        </div>
        <span className="seed">种子 {seed}</span>
      </header>

      <p className="prompt">{instance.prompt}</p>

      {instance.choices && (
        <div className="choices">
          {instance.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className={input === choice ? "choice active" : "choice"}
              onClick={() => setInput(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      <div className="answer-row">
        <input
          value={input}
          inputMode={inputMode}
          placeholder={instance.placeholder ?? "在这里输入答案"}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />
        <button type="button" className="primary" onClick={submit}>
          提交
        </button>
        <button type="button" onClick={nextExercise}>
          换一题
        </button>
      </div>

      {submitted && (
        <p className={correct ? "feedback correct" : "feedback wrong"}>
          {correct ? "正确。" : "还不对，再试一次，或者先看步骤。"}
        </p>
      )}

      {submitted && !showSteps && (
        <button type="button" className="link" onClick={() => setShowSteps(true)}>
          查看步骤
        </button>
      )}

      {showSteps && (
        <div className="steps">
          <h3>解题步骤</h3>
          <ol>
            {instance.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="canonical">标准答案：{instance.answer}</p>
        </div>
      )}
    </section>
  );
}
