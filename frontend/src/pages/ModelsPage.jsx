import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { modelsAPI, datasetsAPI, preprocessingAPI } from '../services/api';
import ConfusionMatrix from '../components/common/ConfusionMatrix';
import MetricCard from '../components/common/MetricCard';
import {
  Cpu,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Layers,
  BarChart2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const algorithms = [
  { id: 'random_forest', name: 'Random Forest', desc: 'Ensemble bagging of decision trees, high stability.', defaultParams: { n_estimators: 100, max_depth: 12, min_samples_split: 4 } },
  { id: 'gradient_boosting', name: 'Gradient Boosting', desc: 'Iterative residual error minimization.', defaultParams: { n_estimators: 100, learning_rate: 0.1, max_depth: 4 } },
  { id: 'logistic_regression', name: 'Logistic Regression', desc: 'Linear decision boundary with L2 regularization.', defaultParams: { C: 1.0, max_iter: 1000 } },
  { id: 'svm', name: 'Support Vector Machine', desc: 'Max-margin hyperplane with RBF kernel.', defaultParams: { C: 1.0, kernel: 'rbf' } },
  { id: 'decision_tree', name: 'Decision Tree', desc: 'Orthogonal hierarchical partitioning.', defaultParams: { max_depth: 8, min_samples_split: 4 } },
  { id: 'knn', name: 'K-Nearest Neighbors', desc: 'Instance-based metric distance classification.', defaultParams: { n_neighbors: 5, weights: 'uniform' } },
  { id: 'mlp', name: 'MLP Neural Network', desc: 'Multi-layer perceptron with backpropagation.', defaultParams: { max_iter: 300 } },
];

export default function ModelsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(
    searchParams.get('dataset_id') ? Number(searchParams.get('dataset_id')) : ''
  );
  const [selectedPrepId, setSelectedPrepId] = useState(
    searchParams.get('preprocessing_id') ? Number(searchParams.get('preprocessing_id')) : ''
  );

  const [selectedAlgo, setSelectedAlgo] = useState('random_forest');
  const [modelName, setModelName] = useState('Random Forest Intrusion Classifier');
  const [params, setParams] = useState(algorithms[0].defaultParams);

  const [training, setTraining] = useState(false);
  const [trainedResult, setTrainedResult] = useState(null);
  const [error, setError] = useState('');
  const [existingModels, setExistingModels] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [dsRes, mRes] = await Promise.all([
          datasetsAPI.list(),
          modelsAPI.list(),
        ]);
        const dsList = Array.isArray(dsRes.data) ? dsRes.data : [];
        const mList = Array.isArray(mRes.data) ? mRes.data : [];
        setDatasets(dsList);
        setExistingModels(mList);

        if (!selectedDatasetId && dsList.length > 0) {
          setSelectedDatasetId(dsList[0].id);
        }
      } catch {
        setError('Failed to fetch datasets or models.');
      }
    };
    loadInitialData();
  }, []);

  const handleAlgoSelect = (algo) => {
    setSelectedAlgo(algo.id);
    setModelName(`${algo.name} Classifier`);
    setParams(algo.defaultParams);
  };

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleTrain = async (e) => {
    e.preventDefault();
    setError('');
    setTraining(true);
    setTrainedResult(null);

    // Fallback preprocessing_id if not supplied
    let prepId = selectedPrepId;
    if (!prepId) {
      // Find latest preprocessing for this dataset
      try {
        const dataset = await datasetsAPI.get(selectedDatasetId);
        // If no prepId, run a default preprocessing automatically
        const prepRes = await preprocessingAPI.run({
          dataset_id: selectedDatasetId,
          missing_value_strategy: 'mean',
          encoding_method: 'onehot',
          scaling_method: 'standard',
          feature_selection_method: 'all',
          test_size: 0.20,
          random_seed: 42,
        });
        prepId = prepRes.data.id;
        setSelectedPrepId(prepId);
      } catch (err) {
        setError('Please configure and run Preprocessing first before training.');
        setTraining(false);
        return;
      }
    }

    try {
      const res = await modelsAPI.train({
        dataset_id: Number(selectedDatasetId),
        preprocessing_id: Number(prepId),
        model_name: modelName,
        algorithm: selectedAlgo,
        parameters: params,
      });
      setTrainedResult(res.data);
      // Refresh existing models
      const mRes = await modelsAPI.list();
      setExistingModels(Array.isArray(mRes.data) ? mRes.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Training failed.');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Model Training & Clean Evaluation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Train baseline classifiers on clean feature data and compute ROC-AUC, FPR, FNR, and confusion matrices.
          </p>
        </div>

        {trainedResult && (
          <button
            onClick={() => navigate(`/robustness?model_id=${trainedResult.id}`)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 self-start cursor-pointer shadow-md shadow-rose-500/20"
          >
            <span>Proceed to Robustness Lab</span>
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

      {/* Algorithm Selection Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
          Select Classifier Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {algorithms.map((algo) => (
            <div
              key={algo.id}
              onClick={() => handleAlgoSelect(algo)}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                selectedAlgo === algo.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="font-semibold text-sm text-slate-100">{algo.name}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{algo.desc}</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold mt-3">
                {selectedAlgo === algo.id ? '● ACTIVE SELECT' : 'Select'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Training Configuration Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleTrain} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Dataset for Training</label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="" disabled>Select Ingested Dataset</option>
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.rows_count} rows, target: {d.target_column || 'label'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Model Name / Alias</label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Dynamic Hyperparameters */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase font-mono tracking-wider">
              {algorithms.find((a) => a.id === selectedAlgo)?.name} Hyperparameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {selectedAlgo === 'random_forest' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">n_estimators</label>
                    <input
                      type="number"
                      value={params.n_estimators || 100}
                      onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">max_depth</label>
                    <input
                      type="number"
                      value={params.max_depth || 12}
                      onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">min_samples_split</label>
                    <input
                      type="number"
                      value={params.min_samples_split || 4}
                      onChange={(e) => handleParamChange('min_samples_split', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {selectedAlgo === 'logistic_regression' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Regularization C</label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.C || 1.0}
                      onChange={(e) => handleParamChange('C', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">max_iter</label>
                    <input
                      type="number"
                      value={params.max_iter || 1000}
                      onChange={(e) => handleParamChange('max_iter', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {selectedAlgo === 'svm' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">C Parameter</label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.C || 1.0}
                      onChange={(e) => handleParamChange('C', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Kernel</label>
                    <select
                      value={params.kernel || 'rbf'}
                      onChange={(e) => handleParamChange('kernel', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    >
                      <option value="rbf">RBF</option>
                      <option value="linear">Linear</option>
                      <option value="poly">Polynomial</option>
                    </select>
                  </div>
                </>
              )}

              {selectedAlgo === 'gradient_boosting' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">n_estimators</label>
                    <input
                      type="number"
                      value={params.n_estimators || 100}
                      onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">learning_rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={params.learning_rate || 0.1}
                      onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">max_depth</label>
                    <input
                      type="number"
                      value={params.max_depth || 3}
                      onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {selectedAlgo === 'knn' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">n_neighbors (k)</label>
                  <input
                    type="number"
                    value={params.n_neighbors || 5}
                    onChange={(e) => handleParamChange('n_neighbors', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              )}

              {selectedAlgo === 'decision_tree' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">max_depth</label>
                    <input
                      type="number"
                      value={params.max_depth || 8}
                      onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">min_samples_split</label>
                    <input
                      type="number"
                      value={params.min_samples_split || 4}
                      onChange={(e) => handleParamChange('min_samples_split', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {selectedAlgo === 'mlp' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">max_iter</label>
                  <input
                    type="number"
                    value={params.max_iter || 300}
                    onChange={(e) => handleParamChange('max_iter', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={training || !selectedDatasetId}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{training ? 'Training Classifier on Train Set...' : 'Train Model & Measure Clean Performance'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Clean Evaluation Results Dashboard */}
      {trainedResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
                Clean Performance Evaluation ({trainedResult.model_name})
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Duration: {trainedResult.training_duration}s
            </span>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Accuracy</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {(trainedResult.clean_accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Precision</span>
              <div className="text-xl font-bold text-white mt-1">
                {(trainedResult.precision * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Recall</span>
              <div className="text-xl font-bold text-white mt-1">
                {(trainedResult.recall * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">F1-Score</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {(trainedResult.f1_score * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">ROC-AUC</span>
              <div className="text-xl font-bold text-purple-400 mt-1">
                {trainedResult.roc_auc !== null ? `${(trainedResult.roc_auc * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">False Positive</span>
              <div className="text-xl font-bold text-slate-300 mt-1">
                {trainedResult.fpr !== null ? `${(trainedResult.fpr * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">False Negative</span>
              <div className="text-xl font-bold text-slate-300 mt-1">
                {trainedResult.fnr !== null ? `${(trainedResult.fnr * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Confusion Matrix & ROC Curve */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfusionMatrix
              matrix={trainedResult.confusion_matrix}
              classes={trainedResult.target_classes}
              title="Clean Test Confusion Matrix"
            />

            {/* ROC Curve Chart */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  ROC Curve (Receiver Operating Characteristic)
                </h4>
                <span className="text-[10px] font-mono text-cyan-400">
                  AUC: {trainedResult.roc_auc ? trainedResult.roc_auc.toFixed(3) : 'N/A'}
                </span>
              </div>

              {trainedResult.metrics?.roc_curve ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trainedResult.metrics.roc_curve.fpr.map((fpr, i) => ({
                        fpr,
                        tpr: trainedResult.metrics.roc_curve.tpr[i],
                      }))}
                      margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="fpr" stroke="#64748B" unit="" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" unit="" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px' }}
                      />
                      <Line type="monotone" dataKey="tpr" stroke="#06B6D4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-slate-500">
                  ROC curve available for models with calibrated probabilities.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => navigate(`/robustness?model_id=${trainedResult.id}`)}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 cursor-pointer shadow-md shadow-rose-500/20"
            >
              <span>Audit in Robustness Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
