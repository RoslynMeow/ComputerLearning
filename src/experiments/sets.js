// 集合论：成员关系与集合运算。

import { esc, shell } from "./shared.js";

function setText(items) {
  const list = [...items].sort((a, b) => a - b);
  return list.length ? `{${list.join(", ")}}` : "∅";
}

function sets(root, context, experiment) {
  const elements = [1, 2, 3, 4, 5];
  const members = new Set([1, 2, 3]);
  const render = () => {
    root.innerHTML = shell(experiment, `
      <div class="exp-question">点击数字，把它们加入或移出集合 A。</div>
      <div class="exp-choices">${elements.map((value) => `<button class="study-button ${members.has(value) ? "primary" : ""}" data-toggle="${value}">${value}</button>`).join("")}</div>
      <div class="exp-output">A = <b>${setText(members)}</b>　|A| = ${members.size}</div>
      <div class="exp-question">表达式 3 ∈ A 表示什么？</div>
      <div class="exp-choices">
        <button class="study-button" data-exp-choice="member">3 是 A 的元素</button>
        <button class="study-button" data-exp-choice="reverse">A 是 3 的元素</button>
        <button class="study-button" data-exp-choice="contain">3 包含 A</button>
      </div>
      <div class="exp-feedback" data-feedback></div>`);
    root.querySelectorAll("[data-toggle]").forEach((button) => button.addEventListener("click", () => {
      const value = Number(button.dataset.toggle);
      if (members.has(value)) members.delete(value); else members.add(value);
      render();
    }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const feedback = root.querySelector("[data-feedback]");
      feedback.textContent = button.dataset.expChoice === "member"
        ? "正确。∈ 的左边是元素，右边是集合。"
        : "注意方向：元素 ∈ 集合，而不是反过来。";
    }));
  };
  render();
}

function setOperations(root, context, experiment) {
  const A = new Set([1, 2, 3]);
  const B = new Set([3, 4]);
  let op = "union";
  const result = () => {
    if (op === "union") return new Set([...A, ...B]);
    if (op === "intersection") return new Set([...A].filter((x) => B.has(x)));
    return new Set([...A].filter((x) => !B.has(x)));
  };
  const render = () => {
    const current = result();
    root.innerHTML = shell(experiment, `
      <div class="exp-question">A = ${setText(A)}，B = ${setText(B)}。选择一种运算。</div>
      <div class="exp-choices">
        <button class="study-button ${op === "union" ? "primary" : ""}" data-op="union">A ∪ B</button>
        <button class="study-button ${op === "intersection" ? "primary" : ""}" data-op="intersection">A ∩ B</button>
        <button class="study-button ${op === "difference" ? "primary" : ""}" data-op="difference">A − B</button>
      </div>
      <div class="exp-output">结果 = <b>${setText(current)}</b>　|结果| = ${current.size}</div>
      <div class="exp-question">A ∪ B 一共有几个元素？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="3">3</button><button class="study-button" data-exp-choice="4">4</button><button class="study-button" data-exp-choice="5">5</button></div>
      <div class="exp-feedback" data-feedback></div>`);
    root.querySelectorAll("[data-op]").forEach((button) => button.addEventListener("click", () => { op = button.dataset.op; render(); }));
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const feedback = root.querySelector("[data-feedback]");
      feedback.textContent = button.dataset.expChoice === "4"
        ? "正确。A ∪ B = {1,2,3,4}，重复的 3 只算一次。"
        : "并集要把两个集合的元素合并，并去掉重复项。";
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "set-membership",
    title: "3 ∈ A 到底在说什么？",
    nodeId: "sets",
    domain: "sets",
    summary: "切换集合成员，辨认元素与集合的方向。",
    steps: 2,
    toolLinks: ["set-toolbox"],
    mount: sets
  },
  {
    id: "set-operations",
    title: "并集为什么少了一个元素？",
    nodeId: "set-operations",
    domain: "sets",
    summary: "切换并、交、差，观察重复元素只保留一次。",
    steps: 2,
    toolLinks: ["set-toolbox"],
    mount: setOperations
  }
];
