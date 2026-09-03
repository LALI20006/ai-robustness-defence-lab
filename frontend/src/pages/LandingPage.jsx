import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  ShieldCheck,
  Cpu,
  BarChart3,
  FileText,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const capabilities = [
    {
      icon: Zap,
      title: 'Controlled Perturbation Lab',
      desc: 'Evaluate tabular model stability with safe Gaussian noise, epsilon-bounded shifts, feature masking, and sensitivity dropout.',
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Layered Defense Lab',
      desc: 'Implement adversarial training augmentation, input range validation guards, robust scaling, and ensemble voting classifiers.',
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    },
    {
      icon: Cpu,
      title: '7+ Classifier Architectures',
      desc: 'Compare Random Forest, Gradient Boosting, SVM, Logistic Regression, Decision Trees, KNN, and Multi-Layer Perceptrons.',
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    },
    {
      icon: BarChart3,
      title: 'Standardized Metrics',
      desc: 'Track Clean Accuracy, Robust Accuracy, Accuracy Drop, Attack Success Rate (ASR), Flip Rate, and Confidence Degradation.',
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    },
    {
      icon: FileText,
      title: 'Reproducible Academic Reports',
      desc: 'Instantly compile and export comprehensive PDF & HTML evaluation reports with auto-generated empirical conclusions.',
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    },
    {
      icon: Lock,
      title: '100% Defensive & Safe',
      desc: 'Confined strictly to offline tabular feature representations. Never creates malware, payloads, or active exploit packets.',
      color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    },
  ];

  const workflowSteps = [
    { num: '01', title: 'Dataset Ingestion', desc: 'Upload custom cybersecurity CSVs or load pre-bundled NSL-KDD and PE Malware feature tables.' },
    { num: '02', title: 'Stratified Preprocessing', desc: 'Handle missing values, encode categoricals, apply scalers, and partition data without leakage.' },
    { num: '03', title: 'Model Training', desc: 'Train classifiers with configurable hyperparameters and record baseline clean performance.' },
    { num: '04', title: 'Robustness Evaluation', desc: 'Subject inputs to mathematically constrained perturbations and measure vulnerability drop.' },
    { num: '05', title: 'Defensive Hardening', desc: 'Apply input validation guards or adversarial retraining to counteract perturbation sensitivity.' },
    { num: '06', title: 'Comparative Reporting', desc: 'Analyze before-and-after metrics, compare multi-model resilience, and export PDF reports.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      {/* Header / Nav */}
      <header className="border-b border-slate-800 bg-[#0B0F17]/80 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              AI Robustness <span className="text-cyan-400">Defence Lab</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mt-1 font-mono">
              Academic Research Platform
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:opacity-90 transition-all shadow-md shadow-cyan-500/20"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-16 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Academic Cybersecurity AI Robustness Evaluation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Evaluate, Challenge, and Defend AI-Based{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Cybersecurity Classifiers
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          An interactive laboratory built to benchmark malware and network intrusion detection models under clean,
          adversarially perturbed, and defensively hardened states. Quantify sensitivity, prevent evasion, and export
          peer-reviewed experiment logs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Get Started with Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center cursor-pointer"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Hero Preview Card */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">lab-terminal:~/robustness-eval</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">STATUS: EVALUATION_ONLINE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">1. Clean Baseline</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">95.40%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Random Forest Classifier</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">2. 5% Bounded Perturbation</div>
                <div className="text-xl font-bold text-rose-400 mt-1">79.80% (-15.6%)</div>
                <div className="text-[10px] text-rose-400 mt-0.5">Attack Success Rate: 20.1%</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">3. Defended (Adv Training)</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">88.70% (+8.9%)</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Robustness Gain Recovered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="px-6 lg:px-12 py-16 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Comprehensive Robustness Architecture</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Engineered specifically for cybersecurity machine learning researchers to test resilience before operational deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="glass-panel-interactive p-6 rounded-xl space-y-3">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="px-6 lg:px-12 py-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Systematic Laboratory Workflow</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Follow an end-to-end scientific methodology from raw tabular dataset to defensibly audited machine learning models.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((s, i) => (
              <div key={i} className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2 relative">
                <span className="text-3xl font-extrabold text-slate-800 font-mono absolute top-3 right-4 select-none">
                  {s.num}
                </span>
                <h4 className="font-semibold text-sm text-cyan-400">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed pr-6">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Objectives & Safety Notice */}
      <section className="px-6 lg:px-12 py-16 max-w-6xl mx-auto space-y-8">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>ACADEMIC & RESEARCH COMPLIANCE STATEMENT</span>
          </div>

          <h3 className="text-xl font-bold text-white">Framework Objectives & Safety Boundaries</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-400 uppercase text-[11px] font-mono">Core Research Objectives</h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Train AI-based intrusion and malware classification models on standardized feature tables.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Quantify classifier sensitivity to controlled bounded feature-space perturbations.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Implement and evaluate proactive defenses: input validation guards and adversarial training.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Generate reproducible scientific PDF reports with empirical evaluation findings.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-rose-400 uppercase text-[11px] font-mono">Strict Safety Constraints</h4>
              <p className="text-slate-400 leading-relaxed">
                The framework operates exclusively on offline numeric/categorical feature datasets. It contains NO functionality for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Malware execution or binary generation</li>
                <li>Live packet injection or network scanning</li>
                <li>Payload obfuscation, packing, or reverse shells</li>
                <li>Credential theft or live intrusion deployment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#070A10] px-6 py-8 text-center text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-300">
          Adversarial Robustness Evaluation & Defence Framework for AI-Based Malware and Intrusion Classifiers
        </div>
        <p className="text-[11px] text-slate-400">
          Built for academic research, education, and offline defensive evaluation. Evaluate. Challenge. Defend.
        </p>
      </footer>
    </div>
  );
}
