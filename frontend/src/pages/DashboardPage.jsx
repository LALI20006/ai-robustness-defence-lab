import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import MetricCard from '../components/common/MetricCard';
import {
  Database,
  Cpu,
  Zap,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Play,
  Clock,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await dashboardAPI.getSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const chartData = Array.isArray(summary?.model_robustness_overview) ? summary.model_robustness_overview : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Cybersecurity Robustness Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time monitoring of model vulnerability, distribution perturbations, and defensive recovery.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/datasets"
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            + Ingest Dataset
          </Link>
          <Link
            to="/models"
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition-colors shadow-sm shadow-cyan-500/20"
          >
            Train New Model
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Datasets"
          value={summary?.total_datasets || 0}
          subtitle="Tabular cybersecurity datasets"
          icon={Database}
          color="cyan"
        />
        <MetricCard
          title="Trained Models"
          value={summary?.total_models || 0}
          subtitle="LR, RF, SVM, GB, MLP, etc."
          icon={Cpu}
          color="purple"
        />
        <MetricCard
          title="Experiments"
          value={summary?.total_experiments || 0}
          subtitle="Perturbation audits executed"
          icon={Zap}
          color="amber"
        />
        <MetricCard
          title="Best Clean Acc"
          value={`${((summary?.best_clean_accuracy || 0) * 100).toFixed(1)}%`}
          subtitle="Baseline unperturbed"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Best Robust Acc"
          value={`${((summary?.best_robust_accuracy || 0) * 100).toFixed(1)}%`}
          subtitle="Post-perturbation / defended"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Model Robustness Bar Chart Comparison */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Model Resilience Benchmark (Clean vs Perturbed vs Defended)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical comparison of classifier accuracy under clean test data, feature noise, and defended models.
            </p>
          </div>
          <Link to="/compare" className="text-xs text-cyan-400 hover:underline font-mono">
            Full Comparison Matrix →
          </Link>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="model_name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#F1F5F9', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="clean_accuracy" name="Clean Accuracy" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="robust_accuracy" name="Robust (Perturbed)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="defended_accuracy" name="Defended Model" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <p>No model experiments recorded yet.</p>
            <p className="text-slate-400">Click "Run Demo Experiment" in the navbar to populate benchmark data.</p>
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Experiments & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Experiments Table (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Recent Robustness Experiments
            </h2>
            <Link to="/experiments" className="text-xs text-cyan-400 hover:underline">
              View All History →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {summary?.recent_experiments?.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2">Model</th>
                    <th className="pb-2">Perturbation</th>
                    <th className="pb-2">Clean Acc</th>
                    <th className="pb-2">Robust Acc</th>
                    <th className="pb-2">ASR</th>
                    <th className="pb-2">Defence</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(Array.isArray(summary?.recent_experiments) ? summary.recent_experiments : []).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-200">{exp.model_name}</td>
                      <td className="py-2.5 text-slate-400">
                        {exp.perturbation_method.replace('_', ' ')} ({(exp.perturbation_strength * 100).toFixed(0)}%)
                      </td>
                      <td className="py-2.5 text-cyan-400">{(exp.clean_accuracy * 100).toFixed(1)}%</td>
                      <td className="py-2.5 text-rose-400 font-bold">{(exp.robust_accuracy * 100).toFixed(1)}%</td>
                      <td className="py-2.5 text-rose-400">{exp.attack_success_rate.toFixed(1)}%</td>
                      <td className="py-2.5">
                        {exp.defence_method && exp.defence_method !== 'none' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px]">
                            {exp.defence_method.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">None</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/robustness?experiment_id=${exp.id}`}
                          className="text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-0.5"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent experiments. Train a model and run a robustness test to see results.
              </div>
            )}
          </div>
        </div>

        {/* Activity & System Status (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3">
              Lab Telemetry & Activity
            </h2>

            <div className="space-y-3">
              {summary?.recent_activity?.length > 0 ? (
                summary.recent_activity.map((act, i) => (
                  <div key={i} className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 animate-pulse" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{act.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{act.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center">No recent telemetry logs.</div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>One-Click Academic Demo</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demonstrate the full pipeline (NSL-KDD Ingestion → Random Forest → 5% Bounded Perturbation → Adversarial Training) in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
