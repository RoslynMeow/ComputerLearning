import { useMemo, useState } from "react";
import type { Lab, LabParams } from "../labs/types";
import { LabResultView } from "./LabResultView";
import { NumberStepper } from "./NumberStepper";
import { RelationMatrixLab } from "./labs/RelationMatrixLab";
import { SetBuilderLab } from "./labs/SetBuilderLab";
import { SetOperationsLab } from "./labs/SetOperationsLab";

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
  const [resetNonce, setResetNonce] = useState(0);
  const result = useMemo(() => lab.run(params), [lab, params]);

  function setParam(name: string, value: string | number) {
    setParams((current) => ({ ...current, [name]: value }));
  }

  function reset() {
    if (lab.custom) {
      setResetNonce((value) => value + 1);
    } else {
      setParams(initialParams(lab));
    }
  }

  return (
    <section className="lab-player">
      <header className="player-header">
        <div>
          <h2>{lab.title}</h2>
        </div>
        <button type="button" onClick={reset}>
          {lab.custom ? "重置实验" : "重置参数"}
        </button>
      </header>

      <p className="lab-description">{lab.description}</p>

      {lab.custom === "set-builder" && (
        <SetBuilderLab key={`${lab.id}-${resetNonce}`} lab={lab} />
      )}

      {lab.custom === "set-operations" && (
        <SetOperationsLab key={`${lab.id}-${resetNonce}`} lab={lab} />
      )}

      {lab.custom === "relation-matrix" && (
        <RelationMatrixLab key={`${lab.id}-${resetNonce}`} lab={lab} />
      )}

      {!lab.custom && (
        <>
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
                        setParam(
                          parameter.name,
                          option?.value ?? event.target.value,
                        );
                      }}
                    >
                      {parameter.options.map((option) => (
                        <option
                          key={String(option.value)}
                          value={String(option.value)}
                        >
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

          <LabResultView result={result} />
        </>
      )}
    </section>
  );
}
