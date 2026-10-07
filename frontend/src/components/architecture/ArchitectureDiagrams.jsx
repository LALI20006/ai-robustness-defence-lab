import React, { useState } from 'react';
import {
  Layers,
  GitBranch,
  Cpu,
  Database,
  Server,
  Monitor,
  HardDrive,
  Shield,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  ArrowDown,
  FileText,
  Activity,
  CheckCircle2,
  Sliders,
  Binary,
  Workflow
} from 'lucide-react';

export default function ArchitectureDiagrams() {
  const [activeTab, setActiveTab] = useState('architecture'); // 'architecture' | 'project-flow' | 'ml-pipeline'

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Workflow className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Framework Blueprint & Architectural Specifications
          </h2>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('project-flow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'project-flow'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Overall Project Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('ml-pipeline')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'ml-pipeline'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ML Pipeline (8 Stages)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: System Architecture Diagram */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400">
            High-level architectural decoupling between the client SPA, backend REST orchestration, core AI/ML robustness framework, and persistent storage tiers.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* User Client */}
            <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 bg-slate-900/40">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-white text-xs">User</div>
                <div className="text-[11px] text-slate-400">(Web Browser)</div>
              </div>
              <div className="w-full pt-3 border-t border-slate-800/80 flex flex-col items-center text-[10px] text-slate-400 font-mono space-y-1">
                <span className="text-cyan-400">HTTP / REST API &rarr;</span>
                <span className="text-emerald-400">&larr; JSON Response</span>
              </div>
            </div>

            {/* Frontend Web App */}
            <div className="lg:col-span-3 glass-panel p-4 rounded-xl border border-blue-500/30 bg-blue-950/10 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Monitor className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Frontend</div>
                    <div className="text-[10px] text-blue-400 font-mono">React 19 SPA + Vite</div>
                  </div>
                </div>
              </div>
              <ul className="space-y-1.5 text-[11px]">
                {[
                  'Dashboard Visual Analytics',
                  'Dataset Management & Ingestion',
                  'Model Training Controls',
                  'Adversarial Testing Lab',
                  'Defence Mechanisms Suite',
                  'Results & Empirical Visualization',
                  'Academic Report Generation',
                ].map((item, idx) => (
                  <li key={idx} className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Backend API Server */}
            <div className="lg:col-span-3 glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Backend</div>
                    <div className="text-[10px] text-emerald-400 font-mono">FastAPI API Server</div>
                  </div>
                </div>
              </div>
              <ul className="space-y-1.5 text-[11px]">
                {[
                  'API Endpoints (RESTful Routes)',
                  'Request Handler & Validation',
                  'Business Logic Orchestration',
                  'Model Lifecycle Management',
                  'Experiment Management',
                  'Result Processing & Telemetry',
                  'Report Generation (PDF & HTML)',
                ].map((item, idx) => (
                  <li key={idx} className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI/ML Engine & Storage */}
            <div className="lg:col-span-4 space-y-4">
              {/* AI/ML Engine */}
              <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-3">
                <div className="flex items-center space-x-2 border-b border-amber-500/20 pb-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">AI/ML Engine</div>
                    <div className="text-[10px] text-amber-400 font-mono">Cybersecurity Robustness Framework</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-semibold text-amber-300 flex items-center gap-1">
                      <Sliders className="w-3 h-3" /> Data Processing
                    </div>
                    <div className="text-slate-400 text-[9px] leading-tight">Cleaning, Scaling, One-Hot Encoding, 80/20 Split</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Binary className="w-3 h-3" /> Model Training
                    </div>
                    <div className="text-slate-400 text-[9px] leading-tight">RF, DT, LR, XGBoost, MLP Neural Net</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-semibold text-rose-300 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Adversarial Module
                    </div>
                    <div className="text-slate-400 text-[9px] leading-tight">FGSM, PGD, Feature Jitter, ASR Calculation</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-semibold text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Defence Module
                    </div>
                    <div className="text-slate-400 text-[9px] leading-tight">Adversarial Augmentation, Input Guards, Ensembles</div>
                  </div>
                </div>
              </div>

              {/* Datasets & Storage */}
              <div className="grid grid-cols-2 gap-2">
                <div className="glass-panel p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/10 space-y-1.5">
                  <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Datasets
                  </div>
                  <ul className="text-[10px] text-slate-400 space-y-0.5">
                    <li>&bull; Malware (EMBER)</li>
                    <li>&bull; Intrusion (CICIDS / NSL)</li>
                    <li>&bull; Custom Uploads</li>
                  </ul>
                </div>

                <div className="glass-panel p-3 rounded-xl border border-purple-500/30 bg-purple-950/10 space-y-1.5">
                  <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" /> Storage Tier
                  </div>
                  <ul className="text-[10px] text-slate-400 space-y-0.5">
                    <li>&bull; SQLite / PostgreSQL</li>
                    <li>&bull; Joblib Serialized Models</li>
                    <li>&bull; PDF Reports Disk Cache</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Overall Project Flow Diagram */}
      {activeTab === 'project-flow' && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400">
            End-to-end user journey across the experimental lifecycle: from dataset ingestion to defended model validation and academic PDF report compilation.
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              {/* Start */}
              <div className="w-full md:w-auto px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-center">
                Start
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              <ArrowDown className="md:hidden w-4 h-4 text-slate-600" />

              {/* Step 1 */}
              <div className="w-full md:w-auto p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-center font-medium">
                1. Select / Upload Dataset
                <div className="text-[10px] text-slate-400 font-normal">NSL-KDD, EMBER, or CSV</div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              <ArrowDown className="md:hidden w-4 h-4 text-slate-600" />

              {/* Step 2 */}
              <div className="w-full md:w-auto p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-center font-medium">
                2. Preprocess Dataset
                <div className="text-[10px] text-slate-400 font-normal">Standard Scaling & Encoding</div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              <ArrowDown className="md:hidden w-4 h-4 text-slate-600" />

              {/* Step 3 */}
              <div className="w-full md:w-auto p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-center font-medium">
                3. Train Baseline Model
                <div className="text-[10px] text-slate-400 font-normal">Clean Test Evaluation</div>
              </div>
            </div>

            <div className="my-4 border-t border-slate-800"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              {/* Step 4 */}
              <div className="w-full md:w-auto p-3 rounded-xl bg-rose-950/20 border border-rose-800/60 text-rose-300 text-center font-medium">
                4. Adversarial Attack
                <div className="text-[10px] text-slate-400 font-normal">Bounded Feature Perturbation</div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              <ArrowDown className="md:hidden w-4 h-4 text-slate-600" />

              {/* Step 5 */}
              <div className="w-full md:w-auto p-3 rounded-xl bg-rose-950/20 border border-rose-800/60 text-rose-300 text-center font-medium">
                5. Evaluate Under Attack
                <div className="text-[10px] text-slate-400 font-normal">Measure ASR & Accuracy Drop</div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              <ArrowDown className="md:hidden w-4 h-4 text-slate-600" />

              {/* Step 6 */}
              <div className="w-full md:w-auto p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/60 text-cyan-300 text-center font-medium">
                6. Apply Defence
                <div className="text-[10px] text-slate-400 font-normal">Adversarial Augmentation</div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              <ArrowDown className="md:hidden w-4 h-4 text-slate-600" />

              {/* Step 7 & End */}
              <div className="w-full md:w-auto p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/60 text-emerald-300 text-center font-medium">
                7. Defended Evaluation & PDF Report
                <div className="text-[10px] text-slate-400 font-normal">Robust Accuracy Recovery</div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              <ArrowDown className="md:hidden w-4 h-4 text-slate-600" />

              <div className="w-full md:w-auto px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold text-center">
                End
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ML Pipeline Flow (8 Stages) */}
      {activeTab === 'ml-pipeline' && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400">
            Step-by-step scientific execution stages within the machine learning cybersecurity framework.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: '1',
                title: 'Dataset Input',
                color: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400',
                bullets: [
                  'EMBER (Malware PE)',
                  'CIC-IDS2017 / NSL-KDD (IDS)',
                  'Custom Tabular CSV/Parquet Upload',
                ],
              },
              {
                num: '2',
                title: 'Data Preprocessing',
                color: 'border-cyan-500/30 bg-cyan-950/10 text-cyan-400',
                bullets: [
                  'Handle Missing Values & Imputation',
                  'Encode Categorical Features (One-Hot)',
                  'Normalize / Standard Scale Features',
                  'Stratified 80/20 Train-Test Split',
                ],
              },
              {
                num: '3',
                title: 'Model Training',
                color: 'border-blue-500/30 bg-blue-950/10 text-blue-400',
                bullets: [
                  'Random Forest Classifier',
                  'Decision Tree Classifier',
                  'Logistic Regression & SVM',
                  'MLP Multi-Layer Perceptron',
                ],
              },
              {
                num: '4',
                title: 'Baseline Evaluation',
                color: 'border-purple-500/30 bg-purple-950/10 text-purple-400',
                bullets: [
                  'Clean Test Accuracy',
                  'Precision, Recall, F1 Score',
                  'ROC-AUC Score & Confusion Matrix',
                  'False Positive & Negative Rates',
                ],
              },
              {
                num: '5',
                title: 'Adversarial Attack',
                color: 'border-rose-500/30 bg-rose-950/10 text-rose-400',
                bullets: [
                  'FGSM (Fast Gradient Sign Method)',
                  'PGD (Projected Gradient Descent)',
                  'Feature Jitter & Evasion Perturbation',
                  'Mathematically Bounded Epsilon (ε)',
                ],
              },
              {
                num: '6',
                title: 'Evaluation Under Attack',
                color: 'border-amber-500/30 bg-amber-950/10 text-amber-400',
                bullets: [
                  'Perturbed Test Accuracy',
                  'Attack Success Rate (ASR)',
                  'Accuracy Degradation Drop (%)',
                  'Perturbation Confusion Matrix',
                ],
              },
              {
                num: '7',
                title: 'Defence Mechanism',
                color: 'border-teal-500/30 bg-teal-950/10 text-teal-400',
                bullets: [
                  'Adversarial Retraining Augmentation',
                  'Input Validation Sanity Guards',
                  'Feature Squeezing & Quantization',
                  'Hard Voting Classifier Ensembles',
                ],
              },
              {
                num: '8',
                title: 'Defended Evaluation',
                color: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400',
                bullets: [
                  'Defended Robust Accuracy',
                  'Robustness Recovery Index (%)',
                  'Side-by-Side Empirical Comparison',
                  'Compiled Academic PDF Report',
                ],
              },
            ].map((stage) => (
              <div
                key={stage.num}
                className={`glass-panel p-4 rounded-xl border ${stage.color} space-y-2.5 transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">
                    Stage {stage.num}
                  </span>
                  <Activity className="w-3.5 h-3.5 opacity-60" />
                </div>
                <h3 className="font-bold text-xs text-white tracking-wide">{stage.title}</h3>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {stage.bullets.map((b, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-400 leading-tight">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
