// 教材内的小实验：每个实验只服务一个知识点，1–3 步，旁边给相关工具入口。
// 各知识域的实现在 ./experiments/ 下按文件分开，这个文件只负责汇总。

import { EXPERIMENTS as GRAPH } from "./experiments/graph.js";
import { EXPERIMENTS as NUMBERS } from "./experiments/numbers.js";
import { EXPERIMENTS as SETS } from "./experiments/sets.js";
import { EXPERIMENTS as LOGIC } from "./experiments/logic.js";
import { EXPERIMENTS as PROBABILITY } from "./experiments/probability.js";
import { EXPERIMENTS as ALGEBRA } from "./experiments/algebra.js";
import { EXPERIMENTS as MATH_EXTRA } from "./experiments/math-extra.js";
import { EXPERIMENTS as REPR } from "./experiments/repr.js";
import { EXPERIMENTS as HARDWARE } from "./experiments/hardware.js";
import { EXPERIMENTS as OS } from "./experiments/os.js";
import { EXPERIMENTS as NETWORK } from "./experiments/network.js";
import { EXPERIMENTS as APPLIED } from "./experiments/applied.js";
import { EXPERIMENTS as PROG } from "./experiments/prog.js";
import { markExperimentDone, isExperimentDone, experimentDoneCount } from "./experiments/progress.js";

export { isExperimentDone, experimentDoneCount };

export const EXPERIMENTS = [
  ...GRAPH,
  ...NUMBERS,
  ...SETS,
  ...LOGIC,
  ...PROBABILITY,
  ...ALGEBRA,
  ...MATH_EXTRA,
  ...REPR,
  ...HARDWARE,
  ...OS,
  ...NETWORK,
  ...APPLIED,
  ...PROG
];

export const EXPERIMENT_BY_ID = Object.fromEntries(EXPERIMENTS.map((experiment) => [experiment.id, experiment]));

export const NODE_EXPERIMENT = Object.fromEntries(EXPERIMENTS.map((experiment) => [experiment.nodeId, experiment.id]));

export function mountExperiment(experimentId, root, context = {}) {
  const experiment = EXPERIMENT_BY_ID[experimentId];
  if (!experiment) return false;
  root.innerHTML = "";
  experiment.mount(root, context, experiment);
  root.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-exp-tool]");
    if (button) {
      context.openTool?.(button.dataset.expTool);
      return;
    }
    const check = () => {
      const feedback = root.querySelector("[data-feedback]");
      if (!feedback || !feedback.textContent.trim().startsWith("正确")) return;
      if (root.querySelector("[data-next-step]")) return;
      const step = root.querySelector("[data-step]");
      if (step && !step.disabled) return;
      markExperimentDone(experiment.id);
      root.querySelector(".experiment-done")?.removeAttribute("hidden");
    };
    setTimeout(check, 0);
  });
  root.addEventListener("experiment-complete", () => {
    markExperimentDone(experiment.id);
    root.querySelector(".experiment-done")?.removeAttribute("hidden");
  });
  return true;
}
