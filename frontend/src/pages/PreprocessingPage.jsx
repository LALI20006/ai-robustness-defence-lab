import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { datasetsAPI, preprocessingAPI } from '../services/api';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function PreprocessingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(
    searchParams.get('dataset_id') ? Number(searchParams.get('dataset_id')) : ''
  );

  // Form options
  const [missingStrategy, setMissingStrategy] = useState('mean');
  const [encodingMethod, setEncodingMethod] = useState('onehot');
  const [scalingMethod, setScalingMethod] = useState('standard');
  const [selectionMethod, setSelectionMethod] = useState('all');
  const [testSize, setTestSize] = useState(0.20);
  const [randomSeed, setRandomSeed] = useState(42);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await datasetsAPI.list();
        const list = Array.isArray(res.data) ? res.data : [];
        setDatasets(list);
        if (!selectedDatasetId && list.length > 0) {
          setSelectedDatasetId(list[0].id);
        }
      } catch {
        setError('Failed to fetch datasets list.');
      }
    };
    fetchDatasets();
  }, []);

  const handleRunPreprocessing = async (e) => {
    e.preventDefault();
    if (!selectedDatasetId) {
      setError('Please select a dataset first.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const res = await preprocessingAPI.run({
        dataset_id: Number(selectedDatasetId),
        missing_value_strategy: missingStrategy,
        encoding_method: encodingMethod,
        scaling_method: scalingMethod,
        feature_selection_method: selectionMethod,
        test_size: Number(testSize),
        random_seed: Number(randomSeed),
      });
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Preprocessing execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-cyan-400" />
            <span>Preprocessing & Feature Engineering Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fit scalers and encoders strictly on the training partition to eliminate data leakage.
          </p>
        </div>

        {summary && (
          <button
            onClick={() =>
              navigate(`/models?dataset_id=${summary.dataset_id}&preprocessing_id=${summary.id}`)
            }
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 self-start cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <span>Proceed to Model Training</span>
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

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <form onSubmit={handleRunPreprocessing} className="space-y-6">
            {/* 1. Dataset Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                1. Target Dataset
              </label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="" disabled>Select Ingested Dataset</option>
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.rows_count} rows, target: {d.target_column || 'Not configured'})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Cleaning & Missing Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Missing Values Imputation</label>
                <select
                  value={missingStrategy}
                  onChange={(e) => setMissingStrategy(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="mean">Mean (Numeric) / Mode (Categorical)</option>
                  <option value="median">Median (Numeric) / Mode (Categorical)</option>
                  <option value="drop">Drop Rows with Missing Values</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Categorical Encoding</label>
                <select
                  value={encodingMethod}
                  onChange={(e) => setEncodingMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="onehot">One-Hot Encoding (Recommended)</option>
                  <option value="label">Label Encoding</option>
                </select>
              </div>
            </div>

            {/* 3. Scaling & Feature Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Feature Scaling</label>
                <select
                  value={scalingMethod}
                  onChange={(e) => setScalingMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="standard">StandardScaler (Zero-mean, Unit-variance)</option>
                  <option value="minmax">MinMaxScaler ([0, 1] Bounded)</option>
                  <option value="robust">RobustScaler (Median & IQR Robust to Outliers)</option>
                  <option value="none">None (Raw Extracted Features)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Feature Selection</label>
                <select
                  value={selectionMethod}
                  onChange={(e) => setSelectionMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="all">All Features (Retain full dimensional space)</option>
                  <option value="variance">Variance Threshold (Remove low-variance)</option>
                  <option value="selectkbest">SelectKBest (ANOVA F-Value)</option>
                </select>
              </div>
            </div>

            {/* 4. Split Ratio & Random Seed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Train/Test Split Ratio</label>
                  <span className="text-xs font-mono text-cyan-400">
                    {Math.round((1 - testSize) * 100)}% Train / {Math.round(testSize * 100)}% Test
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.40"
                  step="0.05"
                  value={testSize}
                  onChange={(e) => setTestSize(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Reproducibility Seed</label>
                <input
                  type="number"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDatasetId}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Executing Pipeline...' : 'Run Preprocessing Pipeline'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Info & Best Practice Guide (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Leakage Prevention Guarantees</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <p>
                In academic machine learning, transformers such as <code className="text-cyan-300">StandardScaler</code> and <code className="text-cyan-300">OneHotEncoder</code> must be fitted exclusively on the training partition.
              </p>
              <p>
                Our pipeline strictly guarantees that test metrics and adversarial evaluation are zero-leakage and reproducible.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 font-mono">
            <div className="text-slate-300 font-semibold text-[11px] uppercase">Safety Note</div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Observed mathematical bounds [min, max] and data types are recorded during this stage to enforce validity constraints during adversarial perturbation.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Output */}
      {summary && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-6">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
              Preprocessing Completed Successfully
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Train Set Size</span>
              <div className="text-base font-bold text-white mt-1">{summary.train_rows} rows</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Test Set Size</span>
              <div className="text-base font-bold text-white mt-1">{summary.test_rows} rows</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Input Features</span>
              <div className="text-base font-bold text-white mt-1">{summary.original_features_count}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Encoded Features</span>
              <div className="text-base font-bold text-cyan-400 mt-1">{summary.processed_features_count}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Scaling</span>
              <div className="text-base font-bold text-white mt-1">{summary.scaling_method}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Classes</span>
              <div className="text-base font-bold text-emerald-400 mt-1">{summary.target_classes.length}</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() =>
                navigate(`/models?dataset_id=${summary.dataset_id}&preprocessing_id=${summary.id}`)
              }
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <span>Continue to Model Training Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
