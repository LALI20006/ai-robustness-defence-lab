import React from 'react';

export default function ConfusionMatrix({ matrix, classes, title = 'Confusion Matrix' }) {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
    return (
      <div className="glass-panel p-4 rounded-xl text-center text-xs text-slate-500">
        No matrix data available
      </div>
    );
  }

  const safeClasses = Array.isArray(classes) && classes.length > 0
    ? classes
    : (Array.isArray(matrix[0]) ? matrix[0].map((_, i) => `Class ${i}`) : ['Class 0', 'Class 1']);

  // Calculate max cell for color saturation
  const maxVal = Math.max(...matrix.flat(), 1);

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">{title}</h4>
        <span className="text-[10px] text-slate-500">Predicted (cols) vs Actual (rows)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-[10px] font-mono text-slate-400">Actual \ Pred</th>
              {safeClasses.map((cls, i) => (
                <th key={i} className="p-2 text-[11px] font-semibold text-cyan-400 font-mono">
                  {cls}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="p-2 text-[11px] font-semibold text-slate-300 font-mono text-right pr-3">
                  {safeClasses[rowIdx] || `C${rowIdx}`}
                </td>
                {row.map((val, colIdx) => {
                  const isDiagonal = rowIdx === colIdx;
                  const ratio = val / maxVal;
                  const bgColor = isDiagonal
                    ? `rgba(16, 185, 129, ${Math.max(0.12, ratio * 0.7)})`
                    : `rgba(244, 63, 94, ${Math.max(0.08, ratio * 0.6)})`;

                  return (
                    <td
                      key={colIdx}
                      style={{ backgroundColor: bgColor }}
                      className="p-3 border border-slate-800/80 font-mono text-xs font-bold text-slate-100 transition-colors"
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
