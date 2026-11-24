// 概率统计：频率与理论概率、均值与中位数。

import { shell, table, visual } from "./shared.js";

function probability(root, context, experiment) {
  const counts = Array(6).fill(0);
  let rolls = 0;
  let feedback = "";
  const render = () => {
    const max = Math.max(1, ...counts);
    root.innerHTML = shell(experiment, `
      <div class="exp-question">掷一枚均匀的六面骰子，观察各点数出现的次数。</div>
      <div class="exp-bars">${counts.map((count, index) => `<div class="exp-bar" style="height:${28 + count / max * 90}px"><span>${index + 1}</span></div>`).join("")}</div>
      <div class="lab-controls"><button class="study-button primary" data-roll>掷 12 次</button><button class="study-button" data-reset>重置</button><span class="exp-state">共掷 ${rolls} 次</span></div>
      <div class="exp-question">理论上，掷出偶数的概率是多少？</div>
      <div class="exp-choices">
        <button class="study-button" data-exp-choice="half">1 / 2</button>
        <button class="study-button" data-exp-choice="third">1 / 3</button>
        <button class="study-button" data-exp-choice="sixth">1 / 6</button>
      </div>
      <div class="exp-feedback" data-feedback>${feedback}</div>`);
    root.querySelector("[data-roll]").addEventListener("click", () => {
      for (let i = 0; i < 12; i += 1) {
        counts[Math.floor(Math.random() * 6)] += 1;
        rolls += 1;
      }
      feedback = "已经掷了 12 次。多掷几轮，看看频率是否靠近 1/2。";
      render();
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      counts.fill(0);
      rolls = 0;
      feedback = "";
      render();
    });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      feedback = button.dataset.expChoice === "half"
        ? "正确。偶数有 2、4、6 三种，概率是 3/6 = 1/2。"
        : "数一数：1 到 6 里偶数有几个？";
      render();
    }));
  };
  render();
}

function statistics(root, context, experiment) {
  let outlier = false;
  const render = () => {
    const data = outlier ? [2, 4, 4, 10, 100] : [2, 4, 4, 10];
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const median = sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    root.innerHTML = shell(experiment, `
      <div class="exp-question">数据集：${data.join("、")}</div>
      <div class="lab-controls"><button class="study-button ${outlier ? "primary" : ""}" data-toggle>${outlier ? "移除离群值 100" : "加入离群值 100"}</button></div>
      ${visual(table(["指标", "值"], [["平均数", mean.toFixed(1)], ["中位数", median.toFixed(1)]]), "平均数与中位数")}
      <div class="exp-question">加入 100 后，哪个指标变化更大？</div>
      <div class="exp-choices"><button class="study-button" data-exp-choice="mean">平均数</button><button class="study-button" data-exp-choice="median">中位数</button></div>
      <div class="exp-feedback" data-feedback></div>`);
    root.querySelector("[data-toggle]").addEventListener("click", () => { outlier = !outlier; render(); });
    root.querySelectorAll("[data-exp-choice]").forEach((button) => button.addEventListener("click", () => {
      const feedback = root.querySelector("[data-feedback]");
      feedback.textContent = button.dataset.expChoice === "mean"
        ? "正确。平均数被 100 拉高，中位数只移动一位。"
        : "切换一下离群值，观察两个数字谁更稳定。";
    }));
  };
  render();
}

export const EXPERIMENTS = [
  {
    id: "probability-dice",
    title: "掷 12 次就能看出概率吗？",
    nodeId: "probability",
    domain: "probability",
    summary: "掷骰子累积频数，再对照理论概率 1/2。",
    steps: 2,
    toolLinks: [],
    mount: probability
  },
  {
    id: "statistics-outlier",
    title: "平均数为什么怕离群值？",
    nodeId: "statistics",
    domain: "probability",
    summary: "加入 100，观察平均数与中位数谁更稳定。",
    steps: 2,
    toolLinks: [],
    mount: statistics
  }
];
