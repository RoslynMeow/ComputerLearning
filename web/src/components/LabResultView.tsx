import type { LabResult } from "../labs/types";

export function LabResultView({ result }: { result: LabResult }) {
  return (
    <>
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
    </>
  );
}
