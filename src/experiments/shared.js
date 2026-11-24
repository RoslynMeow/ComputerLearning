// 教材内小实验共用的外壳与两种最常用交互：
// - mountChoiceSteps：预测 / 判断 / 选择，逐步骤揭示
// - mountStepper：先逐步执行算法或过程，再回答一个问题
// 需要特殊图形时，实验文件可以直接用 shell + 自己的事件绑定。

import { TOOL_BY_ID } from "../tools.js";
import { isExperimentDone } from "./progress.js";

export const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[ch]));

export function shell(experiment, body) {
  const tools = (experiment.toolLinks ?? []).map((toolId) => {
    const tool = TOOL_BY_ID[toolId];
    return `<button class="study-button" data-exp-tool="${esc(toolId)}">打开${esc(tool?.title ?? "工具")}</button>`;
  }).join("");
  return `<div class="experiment-shell">
    <div class="experiment-head">
      <div class="experiment-meta"><span class="experiment-badge">实验</span>${isExperimentDone(experiment.id) ? '<span class="experiment-done">已完成</span>' : '<span class="experiment-done" hidden>已完成</span>'}</div>
      <b>${esc(experiment.title)}</b><p>${esc(experiment.summary)}</p>
    </div>
    ${body}
    ${tools ? `<div class="experiment-footer"><span>想自己改条件、看意外结果？</span>${tools}</div>` : ""}
  </div>`;
}

export function table(head, rows, caption = "") {
  return `<figure class="lesson-fig"><table class="lesson-table exp-table">${caption ? `<caption>${esc(caption)}</caption>` : ""}
    <thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></figure>`;
}

export function choiceButtons(options) {
  return `<div class="exp-choices">${options.map((option) => `<button class="study-button" data-exp-choice="${esc(option.value)}">${esc(option.label ?? option.value)}</button>`).join("")}</div>`;
}

export function chips(items) {
  return `<div class="exp-chips">${items.map((item) => `<span class="exp-chip">${esc(item)}</span>`).join("")}</div>`;
}

export function visual(inner, label = "实验图示") {
  return `<div class="exp-visual" role="img" aria-label="${esc(label)}">${inner}</div>`;
}

function valueOf(value, fallback = "") {
  return typeof value === "function" ? value() : (value ?? fallback);
}

export function mountChoiceSteps(root, experiment, config) {
  const steps = config.steps ?? [];
  let index = 0;
  let answered = false;
  let feedback = "";

  const render = () => {
    const step = steps[index];
    const last = index === steps.length - 1;
    root.innerHTML = shell(experiment, `
      ${config.intro && index === 0 ? `<div class="exp-note">${config.intro}</div>` : ""}
      ${chips([`第 ${index + 1} / ${steps.length} 步`])}
      ${step.visual ? valueOf(step.visual) : ""}
      <div class="exp-question">${step.prompt}</div>
      ${choiceButtons(step.options)}
      <div class="exp-feedback" data-feedback>${feedback}</div>
      ${answered ? `<div class="exp-note">${valueOf(step.reveal)}</div>` : ""}
      ${answered && !last ? '<div class="lab-controls"><button class="study-button primary" data-next-step>下一步</button></div>' : ""}
      ${answered && last && config.outro ? `<div class="exp-note">${config.outro}</div>` : ""}
    `);
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const correct = String(button.dataset.expChoice) === String(step.correct);
      answered = correct;
      feedback = correct ? (step.correctText ?? "正确。") : (step.wrongText ?? "再试一次。");
      render();
    }));
    root.querySelector("[data-next-step]")?.addEventListener("click", () => {
      index += 1;
      answered = false;
      feedback = "";
      render();
    });
  };
  render();
}

export function mountStepper(root, experiment, config) {
  const frames = config.frames ?? [];
  let index = 0;
  let feedback = "";

  const render = () => {
    const atEnd = index >= frames.length - 1;
    root.innerHTML = shell(experiment, `
      ${config.intro ?? ""}
      ${chips([`第 ${index + 1} / ${frames.length} 步`])}
      ${config.frameHTML(frames[index], index)}
      <div class="lab-controls">
        <button class="study-button" data-step ${atEnd ? "disabled" : ""}>${atEnd ? "已到最后一步" : (config.nextLabel ?? "下一步")}</button>
        ${index > 0 ? '<button class="study-button" data-reset>重来</button>' : ""}
      </div>
      ${atEnd && config.question ? `
        <div class="exp-question">${config.question}</div>
        ${choiceButtons(config.options ?? [])}
        <div class="exp-feedback" data-feedback>${feedback}</div>
        ${config.footerNote ? `<div class="exp-note">${config.footerNote}</div>` : ""}` : ""}
    `);
    root.querySelector("[data-step]")?.addEventListener("click", () => {
      index = Math.min(frames.length - 1, index + 1);
      feedback = "";
      render();
    });
    root.querySelector("[data-reset]")?.addEventListener("click", () => {
      index = 0;
      feedback = "";
      render();
    });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const correct = String(button.dataset.expChoice) === String(config.correct);
      feedback = correct ? (config.correctText ?? "正确。") : (config.wrongText ?? "再试一次。");
      render();
    }));
  };
  render();
}
