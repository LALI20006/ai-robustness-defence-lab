import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { comparisonAPI, robustnessAPI, reportsAPI } from '../services/api';
import {
  History,
  Search,
  Filter,
  Trash2,
  FileText,
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react';

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [filteredExps, setFilteredExps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerturbation, setSelectedPerturbation] = useState('all');
  const [selectedDefence, setSelectedDefence] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const res = await comparisonAPI.getExperimentsComparison();
      setExperiments(res.data.experiments);
      setFilteredExps(res.data.experiments);
    } catch {
      setError('Failed to fetch experiment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  useEffect(() => {
    let list = [...experiments];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.model_name.toLowerCase().includes(q) ||
          e.dataset_name.toLowerCase().includes(q) ||
          e.perturbation_method.toLowerCase().includes(q)
      );
    }
    if (selectedPerturbation !== 'all') {
      list = list.filter((e) => e.perturbation_method === selectedPerturbation);
    }
    if (selectedDefence !== 'all') {
      list = list.filter((e) => (selectedDefence === 'none' ? !e.defence_method || e.defence_method === 'none' : e.defence_method === selectedDefence));
    }
    setFilteredExps(list);
  }, [searchTerm, selectedPerturbation, selectedDefence, experiments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experiment record?')) return;
    try {
      await robustnessAPI.deleteExperiment(id);
      fetchExperiments();
    } catch {
      setError('Failed to delete experiment.');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredExps, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `experiments_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-amber-400" />
            <span>Robustness Experiment Audit History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete historical audit trail of perturbation evaluations, sensitivity metrics, and defense logs.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 self-start cursor-pointer transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export History (JSON)</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search model, dataset, or perturbation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Perturbation:</span>
            <select
              value={selectedPerturbation}
              onChange={(e) => setSelectedPerturbation(e.target.value)}
              className="px-2 py-1 text-xs rounded bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="bounded_perturbation">Bounded Perturbation</option>
              <option value="random_noise">Random Noise</option>
              <option value="gaussian_noise">Gaussian Noise</option>
              <option value="feature_masking">Feature Masking</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Defence:</span>
            <select
              value={selectedDefence}
              onChange={(e) => setSelectedDefence(e.target.value)}
              className="px-2 py-1 text-xs rounded bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
            >
              <option value="all">All</option>
              <option value="adversarial_training">Adversarial Training</option>
              <option value="input_validation">Input Validation</option>
              <option value="none">No Defence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Experiments Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          {filteredExps.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2">Exp ID</th>
                  <th className="pb-2">Model</th>
                  <th className="pb-2">Dataset</th>
                  <th className="pb-2">Perturbation</th>
                  <th className="pb-2">Clean Acc</th>
                  <th className="pb-2">Robust Acc</th>
                  <th className="pb-2">Acc Drop</th>
                  <th className="pb-2">ASR</th>
                  <th className="pb-2">Defence</th>
                  <th className="pb-2">Defended Acc</th>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredExps.map((exp) => (
                  <tr key={exp.experiment_id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 text-slate-500">#{exp.experiment_id}</td>
                    <td className="py-2.5 font-bold text-white">{exp.model_name}</td>
                    <td className="py-2.5 text-slate-400">{exp.dataset_name}</td>
                    <td className="py-2.5 text-amber-400">
                      {exp.perturbation_method.replace('_', ' ')} ({(exp.perturbation_strength * 100).toFixed(0)}%)
                    </td>
                    <td className="py-2.5 text-cyan-400">{(exp.clean_accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-rose-400 font-bold">{(exp.robust_accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-rose-400">-{(exp.accuracy_drop * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-amber-400">{exp.attack_success_rate.toFixed(1)}%</td>
                    <td className="py-2.5">
                      {exp.defence_method && exp.defence_method !== 'none' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px]">
                          {exp.defence_method.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">None</span>
                      )}
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">
                      {exp.defended_robust_accuracy !== null ? `${(exp.defended_robust_accuracy * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 text-slate-500">{exp.created_at}</td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/robustness?experiment_id=${exp.experiment_id}`)}
                        className="p-1 hover:text-cyan-400 rounded transition-colors inline-block"
                        title="Inspect Evaluation"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/reports?experiment_id=${exp.experiment_id}`)}
                        className="p-1 hover:text-emerald-400 rounded transition-colors inline-block"
                        title="Generate Report"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.experiment_id)}
                        className="p-1 hover:text-rose-400 rounded transition-colors inline-block"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-xs text-slate-500">
              No matching experiments found in history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
