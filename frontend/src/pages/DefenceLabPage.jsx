import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { modelsAPI, defenceAPI } from '../services/api';
import ConfusionMatrix from '../components/common/ConfusionMatrix';
import MetricCard from '../components/common/MetricCard';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText
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

export default function DefenceLabPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(
    searchParams.get('model_id') ? Number(searchParams.get('model_id')) : ''
  );

  const [activeDefence, setActiveDefence] = useState('adversarial_training');

  // Defense 1: Input Validation state
  const [outlierMethod, setOutlierMethod] = useState('iqr');
  const [validationResult, setValidationResult] = useState(null);

  // Defense 2: Adversarial Training state
  const [augRatio, setAugRatio] = useState(0.25);
  const [pertStrength, setPertStrength] = useState(0.05);
  const [advTrainResult, setAdvTrainResult] = useState(null);

  // Defense 3: Ensemble state
  const [selectedEnsembleIds, setSelectedEnsembleIds] = useState([]);
  const [votingType, setVotingType] = useState('soft');
  const [ensembleResult, setEnsembleResult] = useState(null);

  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        const res = await modelsAPI.list();
        setModels(res.data);
        if (!selectedModelId && res.data.length > 0) {
          setSelectedModelId(res.data[0].id);
        }
        if (res.data.length >= 2) {
          setSelectedEnsembleIds([res.data[0].id, res.data[1].id]);
        }
      } catch {
        setError('Failed to fetch models.');
      }
    };
    loadModels();
  }, []);

  const handleInputValidation = async () => {
    setExecuting(true);
    setError('');
    try {
      const res = await defenceAPI.runInputValidation({
        model_id: Number(selectedModelId),
        outlier_method: outlierMethod,
        strict_bounds: true,
        reject_nans: true,
      });
      setValidationResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Input validation failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleAdversarialTraining = async () => {
    setExecuting(true);
    setError('');
    try {
      const res = await defenceAPI.runAdversarialTraining({
        model_id: Number(selectedModelId),
        augmentation_ratio: Number(augRatio),
        perturbation_method: 'bounded_perturbation',
        perturbation_strength: Number(pertStrength),
        random_seed: 42,
      });
      setAdvTrainResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Adversarial training failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleEnsemble = async () => {
    setExecuting(true);
    setError('');
    try {
      const res = await defenceAPI.runEnsemble({
        model_ids: selectedEnsembleIds.map(Number),
        voting: votingType,
        ensemble_name: 'Voting Ensemble Classifier',
      });
      setEnsembleResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ensemble training failed.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Cybersecurity Defence Lab</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Apply defensive hardening mechanisms to improve model resilience and recover from adversarial accuracy drops.
          </p>
        </div>

        {advTrainResult && (
          <button
            onClick={() => navigate(`/reports?experiment_id=${advTrainResult.experiment_id}`)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 self-start cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <span>Export Evaluation Report</span>
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Defence Technique Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveDefence('adversarial_training')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeDefence === 'adversarial_training'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Adversarial Training (Augmentation)
        </button>
        <button
          onClick={() => setActiveDefence('input_validation')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeDefence === 'input_validation'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Input Validation Guard
        </button>
        <button
          onClick={() => setActiveDefence('ensemble')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeDefence === 'ensemble'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Multi-Model Voting Ensemble
        </button>
      </div>

      {/* Target Model Selector */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Model to Defend
          </label>
          <div className="flex items-center space-x-3">
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.model_name} (Clean: {(m.clean_accuracy * 100).toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DEFENCE 1: ADVERSARIAL TRAINING */}
      {activeDefence === 'adversarial_training' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Adversarial Training Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Augment the original training set with mathematically constrained feature perturbations to build an invariant decision boundary.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Training Set Augmentation Ratio</label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {(augRatio * 100).toFixed(0)}% Augmented
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={augRatio}
                  onChange={(e) => setAugRatio(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10% (Light)</span>
                  <span>25% (Standard)</span>
                  <span>50% (Heavy Augmentation)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Perturbation Epsilon (ε)</label>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {(pertStrength * 100).toFixed(0)}% (ε = {pertStrength})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.15"
                  step="0.01"
                  value={pertStrength}
                  onChange={(e) => setPertStrength(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2%</span>
                  <span>5% (Recommended)</span>
                  <span>15%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAdversarialTraining}
              disabled={executing || !selectedModelId}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{executing ? 'Augmenting Training Set & Retraining Model...' : 'Apply Adversarial Training Defence'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

          {/* Adversarial Training Results */}
          {advTrainResult && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard
                  title="Original Robust Acc"
                  value={`${(advTrainResult.original_robust_accuracy * 100).toFixed(1)}%`}
                  subtitle="Before defence"
                  color="rose"
                />
                <MetricCard
                  title="Defended Robust Acc"
                  value={`${(advTrainResult.defended_robust_accuracy * 100).toFixed(1)}%`}
                  subtitle="After defence"
                  color="emerald"
                  trend={{
                    positive: advTrainResult.robustness_improvement > 0,
                    text: `+${(advTrainResult.robustness_improvement * 100).toFixed(1)}% Gain`,
                  }}
                />
                <MetricCard
                  title="Attack Reduction"
                  value={`-${advTrainResult.attack_reduction.toFixed(1)}%`}
                  subtitle="Vulnerability prevented"
                  color="cyan"
                />
                <MetricCard
                  title="Defended Clean Acc"
                  value={`${(advTrainResult.defended_clean_accuracy * 100).toFixed(1)}%`}
                  subtitle="Preserved baseline"
                  color="purple"
                />
              </div>

              {/* Before vs After Comparison Bar Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Before vs After Defence Comparison
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    +{(advTrainResult.robustness_improvement * 100).toFixed(1)}% ROBUSTNESS RECOVERY
                  </span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Clean Accuracy',
                          Before: (advTrainResult.original_clean_accuracy * 100).toFixed(1),
                          After: (advTrainResult.defended_clean_accuracy * 100).toFixed(1),
                        },
                        {
                          name: 'Robust Accuracy (Under Perturbation)',
                          Before: (advTrainResult.original_robust_accuracy * 100).toFixed(1),
                          After: (advTrainResult.defended_robust_accuracy * 100).toFixed(1),
                        },
                        {
                          name: 'Attack Success Rate (ASR)',
                          Before: advTrainResult.original_attack_success_rate.toFixed(1),
                          After: advTrainResult.defended_attack_success_rate.toFixed(1),
                        },
                      ]}
                      margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11 }} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="Before" name="Before Defence" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="After" name="After Defence (Hardened)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Confusion Matrices: Before vs After Defence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfusionMatrix
                  matrix={advTrainResult.confusion_matrix_before}
                  classes={advTrainResult.classes}
                  title="Confusion Matrix Under Attack (Before Defence)"
                />
                <ConfusionMatrix
                  matrix={advTrainResult.confusion_matrix_after}
                  classes={advTrainResult.classes}
                  title="Confusion Matrix Under Attack (After Adversarial Training)"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEFENCE 2: INPUT VALIDATION GUARD */}
      {activeDefence === 'input_validation' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Input Validation & Outlier Pre-Filter Guard
              </h2>
              <p className="text-xs text-slate-400">
                Inspects incoming feature vectors against mathematical bounds, non-negativity rules, NaN/Inf detectors, and extreme IQR / Z-score deviations before inference.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Outlier Detection Algorithm</label>
                <select
                  value={outlierMethod}
                  onChange={(e) => setOutlierMethod(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                >
                  <option value="iqr">Interquartile Range (IQR) Rule</option>
                  <option value="zscore">Z-Score Statistical Deviation (&gt; 4.0σ)</option>
                </select>
              </div>

              <button
                onClick={handleInputValidation}
                disabled={executing || !selectedModelId}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {executing ? 'Auditing Inputs...' : 'Run Input Validation Guard'}
              </button>
            </div>
          </div>

          {validationResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Tested Samples"
                  value={validationResult.total_samples}
                  subtitle="Input feature vectors"
                  color="cyan"
                />
                <MetricCard
                  title="Valid (Passed)"
                  value={validationResult.valid_count}
                  subtitle={`${validationResult.validation_rate}% of batch`}
                  color="emerald"
                />
                <MetricCard
                  title="Warnings Flagged"
                  value={validationResult.warning_count}
                  subtitle="Mild distribution shift"
                  color="amber"
                />
                <MetricCard
                  title="Rejected (Dropped)"
                  value={validationResult.rejected_count}
                  subtitle={`${validationResult.rejection_rate}% malicious / malformed`}
                  color="rose"
                />
              </div>

              {/* Sample validation audit log */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3">
                  Validation Log Audit Stream
                </h3>

                <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
                  {validationResult.details.map((d, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border flex items-start justify-between ${
                        d.status === 'VALID'
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                          : d.status === 'WARNING'
                          ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                          : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold">Sample #{d.sample_index}: </span>
                        <span>{d.reasons.join(' | ')}</span>
                      </div>
                      <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-900 ml-2">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEFENCE 3: VOTING ENSEMBLE */}
      {activeDefence === 'ensemble' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Multi-Model Ensemble Defense
              </h2>
              <p className="text-xs text-slate-400">
                Aggregate predictions across diverse classifiers (e.g. Random Forest + SVM + Logistic Regression) via soft probability voting to counteract targeted feature evasion.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Select Models to Combine (Min 2)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {models.map((m) => {
                    const isSelected = selectedEnsembleIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedEnsembleIds((prev) =>
                            isSelected ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="font-mono">{m.model_name}</span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {isSelected ? '✓ SELECTED' : '+ ADD'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Voting Scheme:</span>
                  <select
                    value={votingType}
                    onChange={(e) => setVotingType(e.target.value)}
                    className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  >
                    <option value="soft">Soft Voting (Probability Average)</option>
                    <option value="hard">Hard Voting (Majority Class)</option>
                  </select>
                </div>

                <button
                  onClick={handleEnsemble}
                  disabled={executing || selectedEnsembleIds.length < 2}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  {executing ? 'Building Ensemble...' : 'Synthesize Ensemble Defense'}
                </button>
              </div>
            </div>
          </div>

          {ensembleResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                title="Ensemble Clean Acc"
                value={`${(ensembleResult.clean_accuracy * 100).toFixed(1)}%`}
                subtitle="Combined baseline"
                color="cyan"
              />
              <MetricCard
                title="Ensemble Robust Acc"
                value={`${(ensembleResult.robust_accuracy * 100).toFixed(1)}%`}
                subtitle="Under 5% perturbation"
                color="emerald"
                trend={{
                  positive: true,
                  text: `+${(ensembleResult.robustness_improvement * 100).toFixed(1)}% Over single`,
                }}
              />
              <MetricCard
                title="Attack Success Rate"
                value={`${ensembleResult.attack_success_rate.toFixed(1)}%`}
                subtitle="Vulnerability"
                color="rose"
              />
              <MetricCard
                title="Attack Reduction"
                value={`-${ensembleResult.attack_reduction.toFixed(1)}%`}
                subtitle="Evasion suppressed"
                color="purple"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
