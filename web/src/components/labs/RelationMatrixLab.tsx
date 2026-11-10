import { Fragment, useMemo, useState } from "react";
import type { Lab } from "../../labs/types";
import { LabResultView } from "../LabResultView";

const SIZE = 3;

function createDiagonalMatrix(): boolean[][] {
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, column) => row === column),
  );
}

export function RelationMatrixLab({ lab }: { lab: Lab }) {
  const [matrix, setMatrix] = useState<boolean[][]>(createDiagonalMatrix);

  const mask = useMemo(
    () =>
      matrix.flat().reduce(
        (sum, on, index) => (on ? sum | (1 << index) : sum),
        0,
      ),
    [matrix],
  );
  const result = useMemo(() => lab.run({ mask }), [lab, mask]);

  function toggle(row: number, column: number) {
    setMatrix((previous) =>
      previous.map((values, rowIndex) =>
        rowIndex === row
          ? values.map((on, columnIndex) => (columnIndex === column ? !on : on))
          : values,
      ),
    );
  }

  return (
    <div className="lab-interactive">
      <p className="lab-help">点击 3×3 格子添加或删除有序对 (行, 列)。</p>

      <div className="lab-relation-grid">
        <span />
        {Array.from({ length: SIZE }, (_, column) => (
          <span key={column} className="lab-relation-col">
            {column}
          </span>
        ))}
        {matrix.map((row, rowIndex) => (
          <Fragment key={rowIndex}>
            <span className="lab-relation-row">{rowIndex}</span>
            {row.map((on, columnIndex) => (
              <button
                key={columnIndex}
                type="button"
                className={on ? "lab-cell on" : "lab-cell"}
                onClick={() => toggle(rowIndex, columnIndex)}
                aria-label={`(${rowIndex}, ${columnIndex})`}
              >
                {on ? "1" : "0"}
              </button>
            ))}
          </Fragment>
        ))}
      </div>

      <LabResultView result={result} />
    </div>
  );
}
