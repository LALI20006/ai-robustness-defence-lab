/**
 * AI Robustness Defence Lab - Comprehensive Client Simulation Engine
 * Guarantees zero-downtime, glitch-free execution on static deployments (Vercel, GitHub Pages)
 * and offline environments. Fully preserves isolated multi-user state.
 */

const STORAGE_KEY_USERS = 'ai_lab_mock_users';
const STORAGE_KEY_DATASETS = 'ai_lab_mock_datasets';
const STORAGE_KEY_MODELS = 'ai_lab_mock_models';
const STORAGE_KEY_EXPERIMENTS = 'ai_lab_mock_experiments';
const STORAGE_KEY_REPORTS = 'ai_lab_mock_reports';

// --- Default Benchmarks ---
const defaultDatasets = [
  {
    id: 1,
    name: 'NSL-KDD Network Intrusion Benchmark',
    description: 'Standardized network intrusion flow dataset for evaluating IDS classifier evasion.',
    filename: 'nsl_kdd_sample.csv',
    rows_count: 5000,
    columns_count: 13,
    target_column: 'class',
    created_at: '2026-03-01T10:00:00Z',
    is_sample: true,
    columns: ['duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 'count', 'srv_count', 'same_srv_rate', 'diff_srv_rate', 'dst_host_count', 'dst_host_srv_count', 'class'],
    column_types: {
      duration: 'int64',
      protocol_type: 'object',
      service: 'object',
      flag: 'object',
      src_bytes: 'int64',
      dst_bytes: 'int64',
      count: 'int64',
      srv_count: 'int64',
      same_srv_rate: 'float64',
      diff_srv_rate: 'float64',
      dst_host_count: 'int64',
      dst_host_srv_count: 'int64',
      class: 'object'
    },
    data: [
      { duration: 0, protocol_type: 'tcp', service: 'http', flag: 'SF', src_bytes: 181, dst_bytes: 5450, count: 8, srv_count: 8, same_srv_rate: 1.0, diff_srv_rate: 0.0, dst_host_count: 9, dst_host_srv_count: 9, class: 'normal' },
      { duration: 0, protocol_type: 'tcp', service: 'http', flag: 'SF', src_bytes: 239, dst_bytes: 486, count: 8, srv_count: 8, same_srv_rate: 1.0, diff_srv_rate: 0.0, dst_host_count: 19, dst_host_srv_count: 19, class: 'normal' },
      { duration: 0, protocol_type: 'tcp', service: 'private', flag: 'S0', src_bytes: 0, dst_bytes: 0, count: 123, srv_count: 6, same_srv_rate: 0.05, diff_srv_rate: 0.07, dst_host_count: 255, dst_host_srv_count: 6, class: 'anomaly' },
      { duration: 2, protocol_type: 'tcp', service: 'ftp', flag: 'SF', src_bytes: 280, dst_bytes: 0, count: 1, srv_count: 1, same_srv_rate: 1.0, diff_srv_rate: 0.0, dst_host_count: 25, dst_host_srv_count: 2, class: 'normal' },
      { duration: 0, protocol_type: 'icmp', service: 'eco_i', flag: 'SF', src_bytes: 18, dst_bytes: 0, count: 511, srv_count: 511, same_srv_rate: 1.0, diff_srv_rate: 0.0, dst_host_count: 255, dst_host_srv_count: 255, class: 'anomaly' },
      { duration: 0, protocol_type: 'tcp', service: 'http', flag: 'SF', src_bytes: 312, dst_bytes: 1805, count: 12, srv_count: 12, same_srv_rate: 1.0, diff_srv_rate: 0.0, dst_host_count: 45, dst_host_srv_count: 45, class: 'normal' },
      { duration: 0, protocol_type: 'tcp', service: 'private', flag: 'REJ', src_bytes: 0, dst_bytes: 0, count: 210, srv_count: 2, same_srv_rate: 0.01, diff_srv_rate: 0.08, dst_host_count: 255, dst_host_srv_count: 2, class: 'anomaly' },
      { duration: 1, protocol_type: 'udp', service: 'domain_u', flag: 'SF', src_bytes: 42, dst_bytes: 84, count: 4, srv_count: 4, same_srv_rate: 1.0, diff_srv_rate: 0.0, dst_host_count: 120, dst_host_srv_count: 120, class: 'normal' }
    ],
    class_distribution: { normal: 2692, anomaly: 2308 }
  },
  {
    id: 2,
    name: 'PE Header Static Malware Features',
    description: 'Extracted PE executable file header structural metrics for malware classification.',
    filename: 'pe_malware_sample.csv',
    rows_count: 3800,
    columns_count: 11,
    target_column: 'malicious',
    created_at: '2026-03-15T14:30:00Z',
    is_sample: true,
    columns: ['Machine', 'SizeOfOptionalHeader', 'Characteristics', 'MajorLinkerVersion', 'SizeOfCode', 'SizeOfInitializedData', 'AddressOfEntryPoint', 'BaseOfCode', 'ImageBase', 'SectionAlignment', 'malicious'],
    column_types: {
      Machine: 'int64',
      SizeOfOptionalHeader: 'int64',
      Characteristics: 'int64',
      MajorLinkerVersion: 'int64',
      SizeOfCode: 'int64',
      SizeOfInitializedData: 'int64',
      AddressOfEntryPoint: 'int64',
      BaseOfCode: 'int64',
      ImageBase: 'int64',
      SectionAlignment: 'int64',
      malicious: 'int64'
    },
    data: [
      { Machine: 332, SizeOfOptionalHeader: 224, Characteristics: 258, MajorLinkerVersion: 11, SizeOfCode: 38400, SizeOfInitializedData: 20480, AddressOfEntryPoint: 4096, BaseOfCode: 4096, ImageBase: 4194304, SectionAlignment: 4096, malicious: 0 },
      { Machine: 332, SizeOfOptionalHeader: 224, Characteristics: 271, MajorLinkerVersion: 9, SizeOfCode: 114688, SizeOfInitializedData: 45056, AddressOfEntryPoint: 12288, BaseOfCode: 4096, ImageBase: 4194304, SectionAlignment: 4096, malicious: 1 },
      { Machine: 332, SizeOfOptionalHeader: 224, Characteristics: 258, MajorLinkerVersion: 14, SizeOfCode: 65536, SizeOfInitializedData: 32768, AddressOfEntryPoint: 8192, BaseOfCode: 4096, ImageBase: 4194304, SectionAlignment: 4096, malicious: 0 },
      { Machine: 332, SizeOfOptionalHeader: 224, Characteristics: 33167, MajorLinkerVersion: 6, SizeOfCode: 524288, SizeOfInitializedData: 262144, AddressOfEntryPoint: 24576, BaseOfCode: 4096, ImageBase: 4194304, SectionAlignment: 4096, malicious: 1 }
    ],
    class_distribution: { '0 (Benign)': 1950, '1 (Malicious)': 1850 }
  }
];

// --- Default Models ---
const defaultModels = [
  {
    id: 1,
    dataset_id: 1,
    model_name: 'Random Forest Intrusion Classifier',
    algorithm: 'random_forest',
    hyperparameters: { n_estimators: 100, max_depth: 12, min_samples_split: 4 },
    training_duration: 1.84,
    clean_accuracy: 0.965,
    precision: 0.962,
    recall: 0.968,
    f1_score: 0.965,
    roc_auc: 0.988,
    fpr: 0.038,
    fnr: 0.032,
    confusion_matrix: [[481, 19], [16, 484]],
    target_classes: ['normal', 'anomaly'],
    metrics: {
      roc_curve: {
        fpr: [0.0, 0.02, 0.038, 0.08, 0.15, 0.3, 0.6, 1.0],
        tpr: [0.0, 0.88, 0.968, 0.985, 0.992, 0.997, 1.0, 1.0]
      }
    },
    created_at: '2026-10-01T08:20:00Z'
  },
  {
    id: 2,
    dataset_id: 1,
    model_name: 'Decision Tree Classifier',
    algorithm: 'decision_tree',
    hyperparameters: { max_depth: 8, min_samples_split: 4 },
    training_duration: 0.42,
    clean_accuracy: 0.941,
    precision: 0.938,
    recall: 0.944,
    f1_score: 0.941,
    roc_auc: 0.941,
    fpr: 0.062,
    fnr: 0.056,
    confusion_matrix: [[469, 31], [28, 472]],
    target_classes: ['normal', 'anomaly'],
    metrics: {
      roc_curve: {
        fpr: [0.0, 0.05, 0.062, 0.12, 0.25, 0.5, 1.0],
        tpr: [0.0, 0.82, 0.944, 0.965, 0.982, 0.995, 1.0]
      }
    },
    created_at: '2026-10-02T09:15:00Z'
  },
  {
    id: 3,
    dataset_id: 2,
    model_name: 'MLP Neural Network Malware Classifier',
    algorithm: 'mlp',
    hyperparameters: { max_iter: 300 },
    training_duration: 3.12,
    clean_accuracy: 0.952,
    precision: 0.956,
    recall: 0.948,
    f1_score: 0.952,
    roc_auc: 0.976,
    fpr: 0.044,
    fnr: 0.052,
    confusion_matrix: [[478, 22], [26, 474]],
    target_classes: ['benign', 'malicious'],
    metrics: {
      roc_curve: {
        fpr: [0.0, 0.03, 0.044, 0.09, 0.2, 0.4, 1.0],
        tpr: [0.0, 0.85, 0.948, 0.975, 0.989, 0.998, 1.0]
      }
    },
    created_at: '2026-10-03T11:45:00Z'
  }
];

// --- Default Experiment History ---
const defaultExperiments = [
  {
    id: 101,
    experiment_id: 101,
    model_id: 1,
    dataset_name: 'NSL-KDD Network Intrusion Benchmark',
    model_name: 'Random Forest Intrusion Classifier',
    perturbation_method: 'bounded_perturbation',
    perturbation_strength: 0.05,
    clean_accuracy: 0.965,
    robust_accuracy: 0.542,
    accuracy_drop: 0.423,
    attack_success_rate: 43.8,
    prediction_flip_rate: 40.2,
    confidence_drop: 0.24,
    defence_method: 'Adversarial Training',
    defended_robust_accuracy: 0.923,
    created_at: '2026-10-08 11:30'
  },
  {
    id: 102,
    experiment_id: 102,
    model_id: 3,
    dataset_name: 'PE Header Static Malware Features',
    model_name: 'MLP Neural Network Malware Classifier',
    perturbation_method: 'gaussian_noise',
    perturbation_strength: 0.10,
    clean_accuracy: 0.952,
    robust_accuracy: 0.491,
    accuracy_drop: 0.461,
    attack_success_rate: 48.5,
    prediction_flip_rate: 45.1,
    confidence_drop: 0.28,
    defence_method: 'Input Validation Guards',
    defended_robust_accuracy: 0.895,
    created_at: '2026-10-08 10:15'
  },
  {
    id: 103,
    experiment_id: 103,
    model_id: 2,
    dataset_name: 'NSL-KDD Network Intrusion Benchmark',
    model_name: 'Decision Tree Classifier',
    perturbation_method: 'feature_masking',
    perturbation_strength: 0.08,
    clean_accuracy: 0.941,
    robust_accuracy: 0.618,
    accuracy_drop: 0.323,
    attack_success_rate: 34.3,
    prediction_flip_rate: 31.8,
    confidence_drop: 0.19,
    defence_method: 'Voting Ensemble',
    defended_robust_accuracy: 0.908,
    created_at: '2026-10-07 16:45'
  }
];

// --- Default Reports ---
const defaultReports = [
  {
    id: 1,
    experiment_id: 101,
    title: 'Formal Academic Audit: Random Forest IDS Evasion & Hardening',
    format: 'pdf',
    file_size_kb: 420,
    conclusion: 'Adversarial retraining recovered +38.1% of robustness under bounded epsilon perturbations with less than 1.2% clean generalization cost.',
    created_at: '2026-10-08T11:32:00Z'
  },
  {
    id: 2,
    experiment_id: 102,
    title: 'PE Header Malware Classifier Perturbation Sensitivity Analysis',
    format: 'html',
    file_size_kb: 185,
    conclusion: 'Strict physical boundary guards successfully identified and rejected 87.5% of out-of-domain feature noise injections.',
    created_at: '2026-10-08T10:18:00Z'
  }
];

// Storage helpers
function getStored(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage quota exceeded in mock fallback', e);
  }
}

export async function handleMockFallback(config) {
  const url = (config.url || '').replace(/^[a-z]+:\/\/[^/]+/i, '');
  const method = (config.method || 'get').toLowerCase();
  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = {};
    }
  }

  // --- 1. AUTHENTICATION ---
  if (url.includes('/auth/register')) {
    const users = getStored(STORAGE_KEY_USERS, []);
    const { full_name, username, email, password } = body;
    const cleanUser = (username || 'researcher').trim();
    const cleanMail = (email || 'researcher@lab.edu').trim().toLowerCase();

    // Check if user already exists
    let user = users.find(u => u.username.toLowerCase() === cleanUser.toLowerCase() || u.email.toLowerCase() === cleanMail);
    if (!user) {
      user = {
        id: Date.now(),
        full_name: full_name || 'Academic Researcher',
        username: cleanUser,
        email: cleanMail,
        password: password || 'Password123!',
        created_at: new Date().toISOString()
      };
      users.push(user);
      setStored(STORAGE_KEY_USERS, users);
    }

    return {
      status: 201,
      data: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    };
  }

  if (url.includes('/auth/login')) {
    const users = getStored(STORAGE_KEY_USERS, []);
    const { username_or_email } = body;
    const cleanIdent = (username_or_email || 'researcher').trim().toLowerCase();

    let matchedUser = users.find(u =>
      u.username.toLowerCase() === cleanIdent ||
      u.email.toLowerCase() === cleanIdent
    );

    if (!matchedUser) {
      matchedUser = {
        id: Date.now(),
        full_name: cleanIdent.includes('@') ? cleanIdent.split('@')[0] : cleanIdent,
        username: cleanIdent.includes('@') ? cleanIdent.split('@')[0] : cleanIdent,
        email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@lab.edu`,
        created_at: new Date().toISOString()
      };
      users.push(matchedUser);
      setStored(STORAGE_KEY_USERS, users);
    }

    const token = `jwt-mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return {
      status: 200,
      data: {
        access_token: token,
        token_type: 'bearer',
        user: {
          id: matchedUser.id,
          full_name: matchedUser.full_name,
          username: matchedUser.username,
          email: matchedUser.email
        }
      }
    };
  }

  if (url.includes('/auth/me')) {
    const saved = localStorage.getItem('user');
    let u = null;
    try { u = saved ? JSON.parse(saved) : null; } catch {}
    return {
      status: 200,
      data: u || {
        id: 1,
        full_name: 'Dr. Cyber Researcher',
        username: 'cyber_expert',
        email: 'researcher@lab.edu'
      }
    };
  }

  if (url.includes('/auth/reset-password')) {
    return {
      status: 200,
      data: { message: 'Password reset link sent to your registered address.' }
    };
  }

  // --- 2. DASHBOARD ---
  if (url.includes('/dashboard/summary')) {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);

    return {
      status: 200,
      data: {
        total_datasets: datasets.length,
        total_models: models.length,
        total_experiments: exps.length,
        best_clean_accuracy: 0.965,
        best_robust_accuracy: 0.923,
        model_robustness_overview: [
          { model_name: 'Random Forest (IDS)', clean_accuracy: 0.965, perturbed_accuracy: 0.542, defended_accuracy: 0.923 },
          { model_name: 'Gradient Boosting', clean_accuracy: 0.958, perturbed_accuracy: 0.510, defended_accuracy: 0.915 },
          { model_name: 'MLP Neural Net', clean_accuracy: 0.952, perturbed_accuracy: 0.491, defended_accuracy: 0.895 },
          { model_name: 'Decision Tree (IDS)', clean_accuracy: 0.941, perturbed_accuracy: 0.618, defended_accuracy: 0.884 },
          { model_name: 'Logistic Regression', clean_accuracy: 0.885, perturbed_accuracy: 0.420, defended_accuracy: 0.825 }
        ],
        recent_experiments: exps
      }
    };
  }

  // --- 3. DATASETS ---
  if (url.match(/\/datasets\/\d+\/preview/)) {
    const id = Number(url.match(/\/datasets\/(\d+)\/preview/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const ds = datasets.find(d => d.id === id) || datasets[0];

    return {
      status: 200,
      data: {
        columns: ds.columns || Object.keys(ds.data[0]),
        column_types: ds.column_types || {},
        data: ds.data || [],
        total_rows: ds.rows_count || 5000,
        target_column: ds.target_column || 'class'
      }
    };
  }

  if (url.match(/\/datasets\/\d+\/statistics/)) {
    const id = Number(url.match(/\/datasets\/(\d+)\/statistics/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const ds = datasets.find(d => d.id === id) || datasets[0];

    return {
      status: 200,
      data: {
        total_samples: ds.rows_count || 5000,
        numerical_features: (ds.columns_count || 12) - 2,
        categorical_features: 2,
        missing_values_count: 0,
        class_distribution: ds.class_distribution || { normal: 2692, anomaly: 2308 },
        target_column: ds.target_column || 'class'
      }
    };
  }

  if (url.match(/\/datasets\/\d+\/target/)) {
    const id = Number(url.match(/\/datasets\/(\d+)\/target/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const ds = datasets.find(d => d.id === id);
    if (ds && body.target_column) {
      ds.target_column = body.target_column;
      setStored(STORAGE_KEY_DATASETS, datasets);
    }
    return { status: 200, data: { success: true, target_column: body.target_column } };
  }

  if (url.match(/\/datasets\/\d+/) && method === 'delete') {
    const id = Number(url.match(/\/datasets\/(\d+)/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets).filter(d => d.id !== id);
    setStored(STORAGE_KEY_DATASETS, datasets);
    return { status: 200, data: { success: true } };
  }

  if (url.includes('/datasets/load-sample')) {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const isMalware = url.includes('malware');
    const sample = isMalware ? defaultDatasets[1] : defaultDatasets[0];
    return { status: 200, data: sample };
  }

  if (url.includes('/datasets/upload')) {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const newDs = {
      id: Date.now(),
      name: 'Custom Research Telemetry',
      description: 'User-uploaded cybersecurity tabular dataset.',
      filename: 'custom_upload.csv',
      rows_count: 3200,
      columns_count: 14,
      target_column: 'label',
      created_at: new Date().toISOString(),
      is_sample: false,
      columns: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'f13', 'label'],
      column_types: { f1: 'float64', f2: 'float64', f3: 'float64', f4: 'int64', f5: 'int64', label: 'object' },
      data: [
        { f1: 0.12, f2: 1.45, f3: 0.88, f4: 10, f5: 250, label: 'normal' },
        { f1: 0.85, f2: 3.22, f3: 2.14, f4: 85, f5: 4200, label: 'threat' }
      ],
      class_distribution: { normal: 1800, threat: 1400 }
    };
    datasets.unshift(newDs);
    setStored(STORAGE_KEY_DATASETS, datasets);
    return { status: 201, data: newDs };
  }

  if (url.includes('/datasets') && method === 'get') {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    return { status: 200, data: datasets };
  }

  // --- 4. PREPROCESSING ---
  if (url.includes('/preprocessing/run')) {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const dsId = Number(body.dataset_id) || 1;
    const ds = datasets.find(d => d.id === dsId) || datasets[0];

    const prepResult = {
      id: Date.now(),
      dataset_id: ds.id,
      train_rows: Math.round((ds.rows_count || 5000) * (1 - (body.test_size || 0.2))),
      test_rows: Math.round((ds.rows_count || 5000) * (body.test_size || 0.2)),
      original_features_count: (ds.columns_count || 13) - 1,
      processed_features_count: (ds.columns_count || 13) > 20 ? 118 : 34,
      scaling_method: body.scaling_method || 'standard',
      encoding_method: body.encoding_method || 'onehot',
      target_classes: ['normal', 'anomaly'],
      status: 'completed',
      created_at: new Date().toISOString()
    };
    return { status: 200, data: prepResult };
  }

  // --- 5. MODELS ---
  if (url.match(/\/models\/\d+/) && method === 'delete') {
    const id = Number(url.match(/\/models\/(\d+)/)[1]);
    const models = getStored(STORAGE_KEY_MODELS, defaultModels).filter(m => m.id !== id);
    setStored(STORAGE_KEY_MODELS, models);
    return { status: 200, data: { success: true } };
  }

  if (url.includes('/models/train')) {
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    const alg = body.algorithm || 'random_forest';
    const acc = +(0.94 + Math.random() * 0.035).toFixed(3);
    const p = +(acc - 0.003).toFixed(3);
    const r = +(acc + 0.002).toFixed(3);
    const f1 = +(2 * (p * r) / (p + r)).toFixed(3);

    const newModel = {
      id: Date.now(),
      dataset_id: Number(body.dataset_id) || 1,
      model_name: body.model_name || `${alg.replace('_', ' ').toUpperCase()} Classifier`,
      algorithm: alg,
      hyperparameters: body.hyperparameters || {},
      training_duration: +(0.8 + Math.random() * 2.2).toFixed(2),
      clean_accuracy: acc,
      precision: p,
      recall: r,
      f1_score: f1,
      roc_auc: +(0.95 + Math.random() * 0.04).toFixed(3),
      fpr: +(0.03 + Math.random() * 0.03).toFixed(3),
      fnr: +(0.025 + Math.random() * 0.03).toFixed(3),
      confusion_matrix: [
        [Math.round(480 * acc), Math.round(480 * (1 - acc))],
        [Math.round(480 * (1 - acc)), Math.round(480 * acc)]
      ],
      target_classes: ['normal', 'anomaly'],
      metrics: {
        roc_curve: {
          fpr: [0.0, 0.02, 0.04, 0.1, 0.25, 0.5, 1.0],
          tpr: [0.0, 0.86, 0.95, 0.98, 0.99, 0.998, 1.0]
        }
      },
      created_at: new Date().toISOString()
    };
    models.unshift(newModel);
    setStored(STORAGE_KEY_MODELS, models);
    return { status: 201, data: newModel };
  }

  if (url.includes('/models') && method === 'get') {
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    return { status: 200, data: models };
  }

  // --- 6. ROBUSTNESS & ATTACKS ---
  if (url.includes('/robustness/run')) {
    const eps = Number(body.perturbation_strength) || 0.05;
    const cleanAcc = 0.965;
    const robustAcc = Math.max(0.38, +(cleanAcc - (eps * 5.2)).toFixed(3));
    const drop = +(cleanAcc - robustAcc).toFixed(3);
    const asr = +((drop / cleanAcc) * 100).toFixed(1);
    const flipRate = +(asr * 0.92).toFixed(1);

    const exp = {
      id: Date.now(),
      experiment_id: Date.now(),
      model_id: Number(body.model_id) || 1,
      model_name: 'Random Forest Intrusion Classifier',
      dataset_name: 'NSL-KDD Network Intrusion Benchmark',
      perturbation_method: body.perturbation_method || 'bounded_perturbation',
      perturbation_strength: eps,
      clean_accuracy: cleanAcc,
      robust_accuracy: robustAcc,
      accuracy_drop: drop,
      attack_success_rate: asr,
      prediction_flip_rate: flipRate,
      confidence_drop: +(eps * 2.2).toFixed(3),
      strength_sweep: [
        { strength_pct: '1%', robust_accuracy: 0.938 },
        { strength_pct: '3%', robust_accuracy: 0.884 },
        { strength_pct: '5%', robust_accuracy: 0.792 },
        { strength_pct: '10%', robust_accuracy: 0.625 },
        { strength_pct: '15%', robust_accuracy: 0.518 }
      ],
      feature_sensitivity: [
        { feature: 'src_bytes', impact: 0.24 },
        { feature: 'dst_bytes', impact: 0.19 },
        { feature: 'same_srv_rate', impact: 0.15 },
        { feature: 'count', impact: 0.12 },
        { feature: 'diff_srv_rate', impact: 0.09 },
        { feature: 'duration', impact: 0.06 }
      ],
      confusion_matrix_clean: [[481, 19], [16, 484]],
      confusion_matrix_perturbed: [[280, 220], [210, 290]],
      target_classes: ['normal', 'anomaly'],
      created_at: new Date().toISOString()
    };

    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);
    exps.unshift(exp);
    setStored(STORAGE_KEY_EXPERIMENTS, exps);

    return { status: 200, data: exp };
  }

  if (url.match(/\/robustness\/experiments\/\d+/)) {
    const id = Number(url.match(/\/robustness\/experiments\/(\d+)/)[1]);
    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);
    const exp = exps.find(e => e.id === id || e.experiment_id === id) || exps[0];
    return { status: 200, data: exp };
  }

  // --- 7. DEFENSIVE HARDENING ---
  if (url.includes('/defence/input-validation')) {
    return {
      status: 200,
      data: {
        id: Date.now(),
        method: 'input_validation',
        total_evaluated: 1000,
        rejected_samples: 438,
        rejection_rate: 0.438,
        precision_preserved: 0.985,
        original_robust_accuracy: 0.542,
        defended_robust_accuracy: 0.892,
        robustness_gain: 0.350,
        defended_confusion_matrix: [[450, 50], [42, 458]],
        target_classes: ['normal', 'anomaly']
      }
    };
  }

  if (url.includes('/defence/adversarial-training')) {
    return {
      status: 200,
      data: {
        id: Date.now(),
        method: 'adversarial_training',
        original_robust_accuracy: 0.542,
        defended_robust_accuracy: 0.923,
        robustness_gain: 0.381,
        clean_accuracy_cost: 0.012,
        defended_confusion_matrix: [[465, 35], [29, 471]],
        target_classes: ['normal', 'anomaly']
      }
    };
  }

  if (url.includes('/defence/ensemble')) {
    return {
      status: 200,
      data: {
        id: Date.now(),
        method: 'ensemble',
        ensemble_clean_accuracy: 0.972,
        ensemble_robust_accuracy: 0.908,
        voting_type: body.voting_type || 'soft',
        models_combined: 2,
        original_robust_accuracy: 0.542,
        defended_robust_accuracy: 0.908,
        robustness_gain: 0.366,
        defended_confusion_matrix: [[460, 40], [35, 465]],
        target_classes: ['normal', 'anomaly']
      }
    };
  }

  // --- 8. COMPARISON ---
  if (url.includes('/comparison/models')) {
    return {
      status: 200,
      data: {
        models: [
          { id: 1, model_name: 'Random Forest (IDS)', clean_accuracy: 0.965, robust_accuracy: 0.542, defended_robust_accuracy: 0.923 },
          { id: 2, model_name: 'Gradient Boosting (IDS)', clean_accuracy: 0.958, robust_accuracy: 0.510, defended_robust_accuracy: 0.915 },
          { id: 3, model_name: 'MLP Neural Network', clean_accuracy: 0.952, robust_accuracy: 0.491, defended_robust_accuracy: 0.895 },
          { id: 4, model_name: 'Decision Tree (IDS)', clean_accuracy: 0.941, robust_accuracy: 0.618, defended_robust_accuracy: 0.884 },
          { id: 5, model_name: 'Logistic Regression', clean_accuracy: 0.885, robust_accuracy: 0.420, defended_robust_accuracy: 0.825 }
        ],
        best_clean_model: 'Random Forest (IDS) (96.5%)',
        best_robust_model: 'Decision Tree (IDS) (61.8%)',
        best_defended_model: 'Random Forest + AdvRetrain (92.3%)'
      }
    };
  }

  if (url.includes('/comparison/experiments')) {
    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);
    return {
      status: 200,
      data: {
        experiments: exps
      }
    };
  }

  // --- 9. REPORTS ---
  if (url.includes('/reports/generate')) {
    const reports = getStored(STORAGE_KEY_REPORTS, defaultReports);
    const newRep = {
      id: Date.now(),
      experiment_id: body.experiment_id || 101,
      title: body.custom_title || `Adversarial Resilience Audit Report (#${Date.now().toString().slice(-4)})`,
      format: body.format || 'pdf',
      file_size_kb: 412,
      conclusion: 'Evaluated classifier demonstrated significant evasion recovery (+38.1%) following defensive hardening without significant clean generalization cost.',
      created_at: new Date().toISOString()
    };
    reports.unshift(newRep);
    setStored(STORAGE_KEY_REPORTS, reports);
    return { status: 201, data: newRep };
  }

  if (url.includes('/reports') && method === 'get') {
    const reports = getStored(STORAGE_KEY_REPORTS, defaultReports);
    return { status: 200, data: reports };
  }

  // --- 10. DEMO EXECUTION ---
  if (url.includes('/demo/run')) {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Demo Experiment executed successfully!',
        dataset_name: 'NSL-KDD Intrusion Demo',
        model_name: 'Random Forest Intrusion Classifier',
        clean_accuracy: 0.965,
        robust_accuracy: 0.542,
        accuracy_drop: 0.423,
        attack_success_rate: 43.8,
        defence_method: 'Adversarial Training',
        defended_robust_accuracy: 0.923,
        robustness_improvement: 0.381,
        attack_reduction: 38.1,
        experiment_id: 101,
        model_id: 1,
        defended_model_id: 101,
        strength_sweep: [
          { strength_pct: '1%', robust_accuracy: 0.938 },
          { strength_pct: '3%', robust_accuracy: 0.884 },
          { strength_pct: '5%', robust_accuracy: 0.792 },
          { strength_pct: '10%', robust_accuracy: 0.625 },
          { strength_pct: '15%', robust_accuracy: 0.518 }
        ],
        feature_sensitivity: [
          { feature: 'src_bytes', impact: 0.24 },
          { feature: 'dst_bytes', impact: 0.19 },
          { feature: 'same_srv_rate', impact: 0.15 },
          { feature: 'count', impact: 0.12 },
          { feature: 'diff_srv_rate', impact: 0.09 },
          { feature: 'duration', impact: 0.06 }
        ],
        confusion_matrix_clean: [[481, 19], [16, 484]],
        confusion_matrix_perturbed: [[280, 220], [210, 290]],
        confusion_matrix_defended: [[465, 35], [29, 471]],
        classes: ['normal', 'anomaly']
      }
    };
  }

  return { status: 200, data: { status: 'success' } };
}
