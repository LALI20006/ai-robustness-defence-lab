import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/5',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/5',
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.text}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
