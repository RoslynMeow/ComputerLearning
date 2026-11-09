import { useState } from "react";
import { ExercisePlayer } from "./components/ExercisePlayer";
import { exercises } from "./exercises/registry";

export default function App() {
  const [activeId, setActiveId] = useState(exercises[0].id);
  const active = exercises.find((exercise) => exercise.id === activeId) ?? exercises[0];

  return (
    <main className="app">
      <header className="site-header">
        <p className="eyebrow">ComputerLearning</p>
        <h1>动态练习</h1>
        <p>
          每个知识点由生成器出题：同一道题不会重复出现，提交后可以查看每一步的依据。
        </p>
      </header>

      <nav className="exercise-list" aria-label="练习列表">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            className={exercise.id === active.id ? "active" : ""}
            onClick={() => setActiveId(exercise.id)}
          >
            <span>{exercise.ku}</span>
            <strong>{exercise.title}</strong>
          </button>
        ))}
      </nav>

      <ExercisePlayer key={active.id} exercise={active} />
    </main>
  );
}
