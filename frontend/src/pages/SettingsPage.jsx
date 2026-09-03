import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [splitRatio, setSplitRatio] = useState(() => localStorage.getItem('pref_split') || '0.20');
  const [randomSeed, setRandomSeed] = useState(() => localStorage.getItem('pref_seed') || '42');
  const [defaultScaler, setDefaultScaler] = useState(() => localStorage.getItem('pref_scaler') || 'standard');
  const [defaultModel, setDefaultModel] = useState(() => localStorage.getItem('pref_model') || 'random_forest');
  const [reportFormat, setReportFormat] = useState(() => localStorage.getItem('pref_format') || 'pdf');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('pref_split', splitRatio);
    localStorage.setItem('pref_seed', randomSeed);
    localStorage.setItem('pref_scaler', defaultScaler);
    localStorage.setItem('pref_model', defaultModel);
    localStorage.setItem('pref_format', reportFormat);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Laboratory Preferences & Defaults</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default hyperparameters, evaluation splits, and document formats.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Preferences saved successfully to local workspace.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Default Train/Test Split</label>
            <select
              value={splitRatio}
              onChange={(e) => setSplitRatio(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="0.20">80% Train / 20% Test (Standard)</option>
              <option value="0.25">75% Train / 25% Test</option>
              <option value="0.30">70% Train / 30% Test</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Default Reproducibility Seed</label>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Default Feature Scaler</label>
            <select
              value={defaultScaler}
              onChange={(e) => setDefaultScaler(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="standard">StandardScaler (Zero Mean, Unit Variance)</option>
              <option value="minmax">MinMaxScaler ([0, 1])</option>
              <option value="robust">RobustScaler (Median & IQR)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Preferred Baseline Model</label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="random_forest">Random Forest Classifier</option>
              <option value="gradient_boosting">Gradient Boosting</option>
              <option value="logistic_regression">Logistic Regression</option>
              <option value="svm">Support Vector Machine</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Default Report Format</label>
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="pdf">Formal PDF Document (ReportLab)</option>
              <option value="html">Printable HTML Web Document</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Interface Theme</label>
            <input
              type="text"
              disabled
              value="Cyber Defense Dark (Default)"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 cursor-pointer shadow-md shadow-cyan-500/20"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
}
