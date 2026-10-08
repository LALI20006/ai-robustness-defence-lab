import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { modelsAPI, robustnessAPI } from '../services/api';
import ConfusionMatrix from '../components/common/ConfusionMatrix';
import MetricCard from '../components/common/MetricCard';
import {
  Zap,
  ShieldCheck,
  Play,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Table
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const testMethods = [
  { id: 'bounded_perturbation', name: 'Bounded Feature Perturbation (Epsilon)', desc: 'Constrains shift strictly within epsilon of observed min-max range.' },
  { id: 'random_noise', name: 'Random Uniform Noise', desc: 'Adds uniform noise to continuous numeric features scaled to feature range.' },
  { id: 'gaussian_noise', name: 'Gaussian Noise', desc: 'Injects zero-mean normal noise scaled to feature standard deviation.' },
  { id: 'feature_masking', name: 'Feature Masking', desc: 'Randomly masks k features per sample with column median or mean.' },
  { id: 'feature_dropout', name: 'Feature Dropout Sensitivity', desc: 'Individually neutralizes features to rank vulnerability impact.' },
];

export default function RobustnessLabPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(
    searchParams.get('model_id') ? Number(searchParams.get('model_id')) : ''
  );
  const [perturbationMethod, setPerturbationMethod] = useState('bounded_perturbation');
  const [perturbationStrength, setPerturbationStrength] = useState(0.05);
  const [maskCount, setMaskCount] = useState(3);
  const [maskReplacement, setMaskReplacement] = useState('median');

  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        const res = await modelsAPI.list();
        const list = Array.isArray(res.data) ? res.data : [];
        setModels(list);
        if (!selectedModelId && list.length > 0) {
          setSelectedModelId(list[0].id);
        }
      } catch {
        setError('Failed to fetch models list.');
      }
    };
    loadModels();
  }, []);

  // If experiment_id is passed in query, load it
  useEffect(() => {
    const expId = searchParams.get('experiment_id');
    if (expId) {
      robustnessAPI.getExperiment(expId)
        .then((res) => {
          setResults(res.data);
          setSelectedModelId(res.data.model_id);
          setPerturbationMethod(res.data.perturbation_method);
          setPerturbationStrength(res.data.perturbation_strength);
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleRunRobustness = async (e) => {
    e.preventDefault();
    if (!selectedModelId) {
      setError('Please select a trained model to evaluate.');
      return;
    }

    setEvaluating(true);
    setError('');
    setResults(null);

    try {
      const res = await robustnessAPI.run({
        model_id: Number(selectedModelId),
        perturbation_method: perturbationMethod,
        perturbation_strength: Number(perturbationStrength),
        mask_count: Number(maskCount),
        mask_replacement: maskReplacement,
        random_seed: 42,
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Robustness test execution failed.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>Adversarial Robustness Lab</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Subject trained cybersecurity models to mathematically constrained feature perturbations and measure accuracy drop.
          </p>
        </div>

        {results && (
          <button
            onClick={() => navigate(`/defence?model_id=${results.model_id}&experiment_id=${results.experiment_id}`)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 self-start cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <span>Proceed to Defence Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Configuration Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleRunRobustness} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                1. Select Target Model
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="" disabled>Select Trained Model</option>
                {(Array.isArray(models) ? models : []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.model_name} (Clean Acc: {(m.clean_accuracy * 100).toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                2. Perturbation Method
              </label>
              <select
                value={perturbationMethod}
                onChange={(e) => setPerturbationMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                {testMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls based on method */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    Perturbation Magnitude (ε / noise factor)
                  </label>
                  <span className="text-xs font-bold font-mono text-amber-400">
                    {(perturbationStrength * 100).toFixed(0)}% (ε = {perturbationStrength})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.20"
                  step="0.01"
                  value={perturbationStrength}
                  onChange={(e) => setPerturbationStrength(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1% (Subtle)</span>
                  <span>5% (Standard)</span>
                  <span>10% (Aggressive)</span>
                  <span>20% (Severe)</span>
                </div>
              </div>

              {perturbationMethod === 'feature_masking' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Features to Mask</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={maskCount}
                      onChange={(e) => setMaskCount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Mask Replacement</label>
                    <select
                      value={maskReplacement}
                      onChange={(e) => setMaskReplacement(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    >
                      <option value="median">Column Median</option>
                      <option value="mean">Column Mean</option>
                      <option value="zero">Zero</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={evaluating || !selectedModelId}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{evaluating ? 'Simulating Feature Perturbations & Auditing...' : 'Execute Robustness Evaluation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Results Dashboard */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              title="Clean Accuracy"
              value={`${(results.clean_accuracy * 100).toFixed(1)}%`}
              subtitle="Baseline test"
              color="cyan"
            />
            <MetricCard
              title="Robust Accuracy"
              value={`${(results.robust_accuracy * 100).toFixed(1)}%`}
              subtitle="Under perturbation"
              color="rose"
            />
            <MetricCard
              title="Accuracy Drop"
              value={`-${(results.accuracy_drop * 100).toFixed(1)}%`}
              subtitle="Absolute decline"
              color="rose"
            />
            <MetricCard
              title="Attack Success (ASR)"
              value={`${results.attack_success_rate.toFixed(1)}%`}
              subtitle="Clean correct flipped"
              color="amber"
            />
            <MetricCard
              title="Prediction Flip Rate"
              value={`${results.prediction_flip_rate.toFixed(1)}%`}
              subtitle="Total label flips"
              color="amber"
            />
            <MetricCard
              title="Confidence Drop"
              value={`${(results.confidence_drop * 100).toFixed(1)}%`}
              subtitle="Mean confidence loss"
              color="purple"
            />
          </div>

          {/* Charts Row: Strength Sweep & Feature Sensitivity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strength Sweep Line Chart */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Accuracy vs Perturbation Strength Curve
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">1% → 15% sweep</span>
              </div>

              {results.strength_sweep && results.strength_sweep.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.strength_sweep} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="strength_pct" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 1]} stroke="#64748B" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px' }}
                        formatter={(val) => `${(val * 100).toFixed(1)}%`}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="robust_accuracy" name="Robust Acc" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-slate-500">
                  Strength sweep available.
                </div>
              )}
            </div>

            {/* Feature Sensitivity Ranking */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Top Vulnerable Features (Sensitivity Impact)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Ranked by accuracy drop</span>
              </div>

              {results.feature_sensitivity && results.feature_sensitivity.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={results.feature_sensitivity.slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis type="number" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="feature_name" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px' }}
                        formatter={(val) => [`${(val * 100).toFixed(2)}% drop`, 'Vulnerability']}
                      />
                      <Bar dataKey="impact_drop" name="Impact Drop" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-slate-500">
                  Sensitivity ranking computed.
                </div>
              )}
            </div>
          </div>

          {/* Confusion Matrices: Before vs After Perturbation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfusionMatrix
              matrix={results.confusion_matrix_clean}
              classes={results.classes || results.target_classes || ['normal', 'anomaly']}
              title="Baseline Confusion Matrix (Clean)"
            />
            <ConfusionMatrix
              matrix={results.confusion_matrix_perturbed}
              classes={results.classes || results.target_classes || ['normal', 'anomaly']}
              title={`Perturbed Confusion Matrix (${results.perturbation_method.replace('_', ' ')} ${(results.perturbation_strength * 100).toFixed(0)}%)`}
            />
          </div>

          {/* Sample Predictions Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>Sample-Level Evasion Inspector (First 50 Test Samples)</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Red highlights indicate prediction flip after perturbation
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">True Label</th>
                    <th className="p-2.5">Clean Prediction</th>
                    <th className="p-2.5">Perturbed Prediction</th>
                    <th className="p-2.5">Clean Conf</th>
                    <th className="p-2.5">Perturbed Conf</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {results.sample_results?.map((s) => (
                    <tr
                      key={s.sample_index}
                      className={
                        s.prediction_changed
                          ? 'bg-rose-950/20 hover:bg-rose-950/30'
                          : 'hover:bg-slate-900/40'
                      }
                    >
                      <td className="p-2.5 text-slate-500">{s.sample_index}</td>
                      <td className="p-2.5 font-semibold text-white">{s.true_label}</td>
                      <td className="p-2.5 text-cyan-400">{s.clean_prediction}</td>
                      <td className={`p-2.5 font-bold ${s.prediction_changed ? 'text-rose-400' : 'text-slate-300'}`}>
                        {s.perturbed_prediction}
                      </td>
                      <td className="p-2.5 text-slate-400">
                        {s.clean_confidence !== null ? `${(s.clean_confidence * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="p-2.5 text-slate-400">
                        {s.perturbed_confidence !== null ? `${(s.perturbed_confidence * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="p-2.5">
                        {s.prediction_changed ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                            FLIPPED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                            STABLE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
