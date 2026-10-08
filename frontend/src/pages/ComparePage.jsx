import React, { useState, useEffect } from 'react';
import { comparisonAPI } from '../services/api';
import {
  Scale,
  Award,
  ShieldCheck,
  Zap,
  TrendingUp,
  BarChart2,
  Clock
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

export default function ComparePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await comparisonAPI.getModelsComparison();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load models comparison', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-400 animate-pulse">Aggregating comparison telemetry...</div>;
  }

  const models = Array.isArray(data?.models) ? data.models : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-cyan-400" />
          <span>Cross-Model Benchmark Comparison</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Side-by-side resilience analysis across classifiers, architectures, clean performance, and defended recovery.
        </p>
      </div>

      {/* Champion Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase font-semibold">
            <Award className="w-4 h-4" />
            <span>Best Clean Classifier</span>
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {data?.best_clean_model || 'None Evaluated'}
          </div>
          <p className="text-[11px] text-slate-400">Optimal baseline generalization on unperturbed test data.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-1">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono uppercase font-semibold">
            <Zap className="w-4 h-4" />
            <span>Best Inherent Robustness</span>
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {data?.best_robust_model || 'None Evaluated'}
          </div>
          <p className="text-[11px] text-slate-400">Minimal performance degradation under zero-defense perturbation.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono uppercase font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Best Defended Model</span>
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {data?.best_defended_model || 'None Evaluated'}
          </div>
          <p className="text-[11px] text-slate-400">Peak resilience achieved following defensive hardening.</p>
        </div>
      </div>

      {/* Comparison Chart */}
      {models.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Clean vs Robust vs Defended Accuracy Comparison</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={models.map((m) => ({
                  name: m.model_name.length > 18 ? m.model_name.substring(0, 18) + '...' : m.model_name,
                  Clean: (m.clean_accuracy * 100).toFixed(1),
                  Robust: m.robust_accuracy ? (m.robust_accuracy * 100).toFixed(1) : null,
                  Defended: m.defended_robust_accuracy ? (m.defended_robust_accuracy * 100).toFixed(1) : null,
                }))}
                margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Clean" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Robust" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Defended" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comprehensive Benchmark Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3">
          Resilience Evaluation Benchmark Matrix
        </h2>

        <div className="overflow-x-auto">
          {models.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2">Model Name</th>
                  <th className="pb-2">Algorithm</th>
                  <th className="pb-2">Clean Acc</th>
                  <th className="pb-2">Robust Acc</th>
                  <th className="pb-2">Acc Drop</th>
                  <th className="pb-2">F1 Score</th>
                  <th className="pb-2">ROC-AUC</th>
                  <th className="pb-2">ASR</th>
                  <th className="pb-2">Defended Acc</th>
                  <th className="pb-2">Train Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {models.map((m) => (
                  <tr key={m.model_id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-bold text-white">{m.model_name}</td>
                    <td className="py-2.5 text-slate-400">{m.algorithm}</td>
                    <td className="py-2.5 text-cyan-400 font-semibold">{(m.clean_accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-rose-400 font-semibold">
                      {m.robust_accuracy !== null ? `${(m.robust_accuracy * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 text-rose-400">
                      {m.accuracy_drop !== null ? `-${(m.accuracy_drop * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 text-slate-300">{(m.f1_score * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-slate-300">
                      {m.roc_auc !== null ? `${(m.roc_auc * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 text-amber-400">
                      {m.attack_success_rate !== null ? `${m.attack_success_rate.toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">
                      {m.defended_robust_accuracy !== null ? `${(m.defended_robust_accuracy * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 text-slate-400">{m.training_duration}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No models available for comparison.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
