import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { datasetsAPI } from '../services/api';
import {
  Database,
  Upload,
  Sparkles,
  Trash2,
  Eye,
  SlidersHorizontal,
  Table,
  CheckCircle2,
  AlertCircle,
  BarChart,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState('');

  const navigate = useNavigate();

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await datasetsAPI.list();
      const list = Array.isArray(res.data) ? res.data : [];
      setDatasets(list);
      if (list.length > 0 && !selectedDatasetId) {
        selectDataset(list[0].id);
      }
    } catch (err) {
      setError('Failed to load datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const selectDataset = async (id) => {
    setSelectedDatasetId(id);
    setError('');
    try {
      const [prevRes, statsRes] = await Promise.all([
        datasetsAPI.getPreview(id),
        datasetsAPI.getStats(id),
      ]);
      setPreview(prevRes.data && typeof prevRes.data === 'object' && Array.isArray(prevRes.data.columns) ? prevRes.data : null);
      setStats(statsRes.data && typeof statsRes.data === 'object' ? statsRes.data : null);
      setTargetColumn(statsRes.data?.target_column || prevRes.data?.target_column || '');
    } catch (err) {
      setError('Failed to load preview or statistics for selected dataset.');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    if (customName) formData.append('dataset_name', customName);

    try {
      const res = await datasetsAPI.upload(formData);
      setFile(null);
      setCustomName('');
      await fetchDatasets();
      selectDataset(res.data.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async (sampleType) => {
    setError('');
    setUploading(true);
    try {
      const res = await datasetsAPI.loadSample(sampleType);
      await fetchDatasets();
      selectDataset(res.data.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load sample dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleTargetChange = async (col) => {
    setTargetColumn(col);
    try {
      await datasetsAPI.selectTarget(selectedDatasetId, col);
      selectDataset(selectedDatasetId);
    } catch (err) {
      setError('Failed to update target column.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dataset? Associated preprocessing and models will be deleted.')) return;
    try {
      await datasetsAPI.delete(id);
      setSelectedDatasetId(null);
      setPreview(null);
      setStats(null);
      await fetchDatasets();
    } catch (err) {
      setError('Failed to delete dataset.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-cyan-400" />
            <span>Dataset Ingestion & Inspection</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload offline cybersecurity feature tables (CSV) or load bundled intrusion detection & malware datasets.
          </p>
        </div>

        {selectedDatasetId && (
          <button
            onClick={() => navigate(`/preprocessing?dataset_id=${selectedDatasetId}`)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 self-start cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <span>Proceed to Preprocessing</span>
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

      {/* Top Grid: Upload & Sample Loaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Structured Tabular CSV</span>
          </h2>

          <form onSubmit={handleFileUpload} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Dataset Name (e.g. CIC-IDS2017 Flow Data)"
                className="px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="file"
                accept=".csv,.tsv"
                required
                onChange={(e) => setFile(e.target.files[0])}
                className="px-3 py-1.5 text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Safe offline tabular formats only. Max upload size: 50MB.
              </span>
              <button
                type="submit"
                disabled={uploading || !file}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
              >
                {uploading ? 'Processing File...' : 'Upload & Parse'}
              </button>
            </div>
          </form>
        </div>

        {/* Built-in Samples (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Bundled Sample Datasets</span>
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Instant access to pre-formatted cybersecurity benchmark datasets for testing without external downloads.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleLoadSample('network')}
              disabled={uploading}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left text-xs font-mono text-cyan-400 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Load NSL-KDD Intrusion (1.5k rows)</span>
              <span className="text-[10px] text-slate-500">Network Flow</span>
            </button>
            <button
              onClick={() => handleLoadSample('malware')}
              disabled={uploading}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left text-xs font-mono text-emerald-400 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Load PE Malware Features (1.5k rows)</span>
              <span className="text-[10px] text-slate-500">Static Features</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono uppercase text-slate-400">Available Ingested Datasets</h3>
          <span className="text-xs font-mono text-slate-500">{(Array.isArray(datasets) ? datasets : []).length} Total</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {(Array.isArray(datasets) ? datasets : []).map((d) => (
            <div
              key={d.id}
              onClick={() => selectDataset(d.id)}
              className={`px-4 py-2.5 rounded-xl border text-xs cursor-pointer flex items-center space-x-3 transition-all flex-shrink-0 ${
                selectedDatasetId === d.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-[10px] font-mono text-slate-500">
                  {d.rows_count} rows • {d.columns_count} cols
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(d.id);
                }}
                className="p-1 hover:text-rose-400 rounded transition-colors"
                title="Delete Dataset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Dataset Inspection */}
      {preview && (
        <div className="space-y-6">
          {/* Target Selector & Quick Stats */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Target Column for Classification:</span>
                <div className="flex items-center space-x-2">
                  <select
                    value={targetColumn}
                    onChange={(e) => handleTargetChange(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono font-semibold focus:outline-none"
                  >
                    {(Array.isArray(preview.columns) ? preview.columns : []).map((c) => (
                      <option key={c} value={c}>
                        {c} {preview.column_types && preview.column_types[c] ? `(${preview.column_types[c]})` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400">
                    Detected Classes: {stats?.class_distribution ? Object.keys(stats.class_distribution).join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Class distribution badges */}
            {stats?.class_distribution && (
              <div className="flex items-center space-x-2">
                {Object.entries(stats.class_distribution).map(([cls, count]) => (
                  <div key={cls} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400">{cls}: </span>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Table Preview */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>First 15 Rows Inspection</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">Showing 15 of {preview.total_rows || (preview.data ? preview.data.length : 0)} rows</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-slate-300">
                  <tr>
                    <th className="p-2.5 text-slate-500">#</th>
                    {(Array.isArray(preview.columns) ? preview.columns : []).map((col) => (
                      <th
                        key={col}
                        className={`p-2.5 font-semibold ${
                          col === targetColumn ? 'text-cyan-400 bg-cyan-950/30' : ''
                        }`}
                      >
                        {col}
                        <span className="block text-[9px] text-slate-500 font-normal">
                          {preview.column_types && preview.column_types[col] ? preview.column_types[col] : 'feature'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {(Array.isArray(preview.data) ? preview.data : []).map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-900/40">
                      <td className="p-2.5 text-slate-500">{rowIdx + 1}</td>
                      {(Array.isArray(preview.columns) ? preview.columns : []).map((col) => (
                        <td
                          key={col}
                          className={`p-2.5 whitespace-nowrap ${
                            col === targetColumn ? 'font-bold text-cyan-300 bg-cyan-950/10' : ''
                          }`}
                        >
                          {row && row[col] !== undefined && row[col] !== null ? String(row[col]) : <span className="text-slate-500">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column Statistics Breakdown */}
          {stats && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
                <BarChart className="w-4 h-4 text-emerald-400" />
                <span>Feature Distribution & Statistics</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-2">Feature Name</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Missing</th>
                      <th className="pb-2">Unique</th>
                      <th className="pb-2">Min</th>
                      <th className="pb-2">Max</th>
                      <th className="pb-2">Mean</th>
                      <th className="pb-2">Std</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.columns_stats.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-900/40">
                        <td className="py-2 text-slate-200 font-semibold">{c.name}</td>
                        <td className="py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              c.dtype === 'numeric'
                                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                                : 'bg-purple-950/60 text-purple-400 border border-purple-800/60'
                            }`}
                          >
                            {c.dtype}
                          </span>
                        </td>
                        <td className="py-2 text-slate-400">
                          {c.missing_count} ({c.missing_pct}%)
                        </td>
                        <td className="py-2 text-slate-400">{c.unique_count}</td>
                        <td className="py-2 text-slate-300">{c.min !== null ? c.min : '-'}</td>
                        <td className="py-2 text-slate-300">{c.max !== null ? c.max : '-'}</td>
                        <td className="py-2 text-slate-300">{c.mean !== null ? c.mean : '-'}</td>
                        <td className="py-2 text-slate-300">{c.std !== null ? c.std : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
