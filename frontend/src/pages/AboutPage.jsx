import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

export default function AboutPage() {
  const objectives = [
    'Develop AI-based intrusion and malware classification models on tabular feature spaces.',
    'Evaluate classifier performance on clean, unperturbed baseline cybersecurity datasets.',
    'Measure sensitivity and vulnerability to controlled adversarial feature-space perturbations.',
    'Quantify model robustness using standardized empirical metrics (ASR, Accuracy Drop, Flip Rate).',
    'Implement defensive methods such as input validation guards and adversarial training data augmentation.',
    'Compare model performance before and after defense to measure net robustness recovery.',
    'Provide visual analytics, confusion matrix comparisons, and reproducible academic experiment reports.',
  ];

  const futureScopes = [
    'Deep learning convolutional and transformer architectures for sequence-based payload opcode analysis.',
    'Explainable AI (XAI) with SHAP and LIME to pinpoint feature attribution shifts under perturbation.',
    'Constrained semantic-preserving perturbation manifolds for specialized file formats.',
    'Distributed large-scale evaluation pipelines with Celery and Redis.',
    'Continuous integration adversarial regression testing for production ML security operations (MLSecOps).',
    'Enterprise PostgreSQL and multi-tenant laboratory workspace collaboration.',
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <span>About the Robustness & Defence Framework</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Academic and educational AI cybersecurity laboratory designed to evaluate and harden machine-learning classifiers.
        </p>
      </div>

      {/* Main Framework Objectives */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Core Academic Objectives</span>
        </h2>

        <div className="space-y-3">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-slate-300 leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & Compliance Boundaries */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-4">
        <h2 className="text-sm font-semibold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-rose-900/60 pb-3">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Strict Defensive Safety Boundaries</span>
        </h2>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            This system is designed <strong>exclusively for defensive research, education, offline dataset evaluation, and model robustness benchmarking</strong>.
          </p>
          <p>
            The software strictly forbids and does NOT implement:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px] pl-2">
            <li>Malware execution, payload generation, or binary creation</li>
            <li>Real-world packet injection, network scanning, or port probing</li>
            <li>Exploit delivery, shellcode execution, or reverse shell automation</li>
            <li>Credential theft, persistence, or command-and-control (C2) communication</li>
            <li>Live evasion deployment against commercial production endpoints</li>
          </ul>
          <p className="text-slate-400">
            All perturbations modify offline numeric/categorical feature matrices only, mathematically validated to conform to observed valid bounds.
          </p>
        </div>
      </div>

      {/* Future Scope */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Future Research Directions & Scope</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {futureScopes.map((scope, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">Phase Extension #{i + 1}</div>
              <p className="leading-relaxed text-slate-400">{scope}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
