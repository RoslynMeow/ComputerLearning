import { useMemo, useState } from "react";
import type { Lab, LabParams } from "../labs/types";
import { NumberStepper } from "./NumberStepper";

type Props = {
  lab: Lab;
};

function initialParams(lab: Lab): LabParams {
  return Object.fromEntries(
    lab.parameters.map((parameter) => [parameter.name, parameter.default]),
  );
}

export function ExperimentPlayer({ lab }: Props) {
  const [params, setParams] = useState<LabParams>(() => initialParams(lab));
  const result = useMemo(() => lab.run(params), [lab, params]);

  function setParam(name: string, value: string | number) {
    setParams((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="lab-player">
      <header className="player-header">
        <div>
          <h2>{lab.title}</h2>
        </div>
        <button type="button" onClick={() => setParams(initialParams(lab))}>
          重置参数
        </button>
      </header>

      <p className="lab-description">{lab.description}</p>

      <div className="lab-params">
        {lab.parameters.map((parameter) => {
          if (parameter.kind === "select") {
            return (
              <label key={parameter.name} className="lab-param">
                <span>{parameter.label}</span>
                <select
                  value={String(params[parameter.name])}
                  onChange={(event) => {
                    const option = parameter.options.find(
                      (item) => String(item.value) === event.target.value,
                    );
                    setParam(parameter.name, option?.value ?? event.target.value);
                  }}
                >
                  {parameter.options.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <div key={parameter.name} className="lab-param">
              <span>{parameter.label}</span>
              <NumberStepper
                value={Number(params[parameter.name])}
                min={parameter.min}
                max={parameter.max}
                step={parameter.step ?? 1}
                onChange={(value) => setParam(parameter.name, value)}
              />
            </div>
          );
        })}
      </div>

      <p className="lab-summary">{result.summary}</p>

      {result.metrics && result.metrics.length > 0 && (
        <div className="lab-metrics">
          {result.metrics.map((metric) => (
            <div key={metric.label} className="lab-metric">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      )}

      {result.trace && result.trace.length > 0 && (
        <div className="lab-trace">
          <h3>过程</h3>
          <table>
            <thead>
              <tr>
                <th>步骤</th>
                <th>状态</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              {result.trace.map((row, index) => (
                <tr key={`${String(row.step)}-${index}`}>
                  <td>{row.step}</td>
                  <td>{row.state}</td>
                  <td>{row.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.steps && result.steps.length > 0 && (
        <div className="lab-steps">
          <h3>要点</h3>
          <ul>
            {result.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
