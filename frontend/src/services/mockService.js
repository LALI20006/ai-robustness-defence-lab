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

// In-memory fallback cache when localStorage is restricted or in incognito mode
const memoryCache = new Map();

function getStored(key, defaultVal) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val) return JSON.parse(val);
    }
  } catch {}
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }
  return defaultVal;
}

function setStored(key, val) {
  memoryCache.set(key, val);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    // Seamless fallback to memoryCache when quota or storage is restricted
  }
}

// Response helper matching Axios response structure
function createResponse(status, data, config) {
  return {
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' },
    config: config || {},
    data
  };
}

export async function handleMockFallback(config) {
  const rawUrl = config.url || '';
  // 1. Strip protocol & host if absolute URL
  const pathWithoutOrigin = rawUrl.replace(/^[a-z]+:\/\/[^/]+/i, '');
  // 2. Separate query string
  const [pathnameWithApi, queryString = ''] = pathWithoutOrigin.split('?');
  // 3. Strip leading /api
  const pathname = pathnameWithApi.replace(/^\/api/, '');
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
  if (pathname === '/auth/register') {
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

    return createResponse(201, {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    }, config);
  }

  if (pathname === '/auth/login') {
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
    return createResponse(200, {
      access_token: token,
      token_type: 'bearer',
      user: {
        id: matchedUser.id,
        full_name: matchedUser.full_name,
        username: matchedUser.username,
        email: matchedUser.email
      }
    }, config);
  }

  if (pathname === '/auth/me') {
    const saved = localStorage.getItem('user');
    let u = null;
    try { u = saved ? JSON.parse(saved) : null; } catch {}
    return createResponse(200, u || {
      id: 1,
      full_name: 'Dr. Cyber Researcher',
      username: 'cyber_expert',
      email: 'researcher@lab.edu'
    }, config);
  }

  if (pathname === '/auth/reset-password') {
    return createResponse(200, {
      message: 'Password reset link sent to your registered address.'
    }, config);
  }

  // --- 2. DASHBOARD ---
  if (pathname === '/dashboard/summary') {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);

    return createResponse(200, {
      total_datasets: datasets.length,
      total_models: models.length,
      total_experiments: exps.length,
      best_clean_accuracy: 0.965,
      best_robust_accuracy: 0.923,
      model_robustness_overview: [
        { model_name: 'Random Forest (IDS)', clean_accuracy: 96.5, robust_accuracy: 54.2, defended_accuracy: 92.3 },
        { model_name: 'Gradient Boosting', clean_accuracy: 95.8, robust_accuracy: 51.0, defended_accuracy: 91.5 },
        { model_name: 'MLP Neural Net', clean_accuracy: 95.2, robust_accuracy: 49.1, defended_accuracy: 89.5 },
        { model_name: 'Decision Tree (IDS)', clean_accuracy: 94.1, robust_accuracy: 61.8, defended_accuracy: 88.4 },
        { model_name: 'Logistic Regression', clean_accuracy: 88.5, robust_accuracy: 42.0, defended_accuracy: 82.5 }
      ],
      recent_experiments: exps
    }, config);
  }

  // --- 3. DATASETS ---
  if (pathname.match(/^\/datasets\/(\d+)\/preview$/)) {
    const id = Number(pathname.match(/^\/datasets\/(\d+)\/preview$/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const ds = datasets.find(d => d.id === id) || datasets[0] || defaultDatasets[0];

    const cols = Array.isArray(ds?.columns) && ds.columns.length > 0
      ? ds.columns
      : (ds?.data && ds.data[0] ? Object.keys(ds.data[0]) : defaultDatasets[0].columns);

    const colTypes = { ...(ds?.column_types || defaultDatasets[0].column_types) };
    cols.forEach(c => {
      if (!colTypes[c]) colTypes[c] = 'numeric';
    });

    const rows = Array.isArray(ds?.data) && ds.data.length > 0 ? ds.data : defaultDatasets[0].data;

    return createResponse(200, {
      columns: cols,
      column_types: colTypes,
      data: rows,
      total_rows: ds?.rows_count || rows.length || 5000,
      target_column: ds?.target_column || 'class'
    }, config);
  }

  if (pathname.match(/^\/datasets\/(\d+)\/statistics$/)) {
    const id = Number(pathname.match(/^\/datasets\/(\d+)\/statistics$/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const ds = datasets.find(d => d.id === id) || datasets[0] || defaultDatasets[0];

    return createResponse(200, {
      total_samples: ds?.rows_count || 5000,
      numerical_features: Math.max(1, (ds?.columns_count || 12) - 2),
      categorical_features: 2,
      missing_values_count: 0,
      class_distribution: ds?.class_distribution || { normal: 2692, anomaly: 2308 },
      target_column: ds?.target_column || 'class'
    }, config);
  }

  if (pathname.match(/^\/datasets\/(\d+)\/target$/)) {
    const id = Number(pathname.match(/^\/datasets\/(\d+)\/target$/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const ds = datasets.find(d => d.id === id);
    if (ds && body.target_column) {
      ds.target_column = body.target_column;
      setStored(STORAGE_KEY_DATASETS, datasets);
    }
    return createResponse(200, { success: true, target_column: body.target_column }, config);
  }

  if (pathname.match(/^\/datasets\/(\d+)$/) && method === 'delete') {
    const id = Number(pathname.match(/^\/datasets\/(\d+)$/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets).filter(d => d.id !== id);
    setStored(STORAGE_KEY_DATASETS, datasets);
    return createResponse(200, { success: true }, config);
  }

  if (pathname.match(/^\/datasets\/(\d+)$/) && method === 'get') {
    const id = Number(pathname.match(/^\/datasets\/(\d+)$/)[1]);
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const ds = datasets.find(d => d.id === id) || datasets[0];
    return createResponse(200, ds, config);
  }

  if (pathname === '/datasets/load-sample') {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const isMalware = queryString.includes('malware') || rawUrl.includes('malware') || body.sample_type === 'malware';
    const sample = isMalware ? defaultDatasets[1] : defaultDatasets[0];
    const exists = datasets.some(d => d.id === sample.id);
    if (!exists) {
      datasets.unshift(sample);
      setStored(STORAGE_KEY_DATASETS, datasets);
    }
    return createResponse(200, sample, config);
  }

  if (pathname === '/datasets/upload') {
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
    return createResponse(201, newDs, config);
  }

  if (pathname === '/datasets' && method === 'get') {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    return createResponse(200, datasets, config);
  }

  // --- 4. PREPROCESSING ---
  if (pathname === '/preprocessing/run') {
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
    return createResponse(200, prepResult, config);
  }

  if (pathname.match(/^\/preprocessing\/\d+$/)) {
    return createResponse(200, {
      id: 1,
      dataset_id: 1,
      status: 'completed',
      scaling_method: 'standard',
      encoding_method: 'onehot',
      train_rows: 4000,
      test_rows: 1000,
      original_features_count: 12,
      processed_features_count: 34,
      target_classes: ['normal', 'anomaly']
    }, config);
  }

  // --- 5. MODELS ---
  if (pathname.match(/^\/models\/(\d+)$/) && method === 'delete') {
    const id = Number(pathname.match(/^\/models\/(\d+)$/)[1]);
    const models = getStored(STORAGE_KEY_MODELS, defaultModels).filter(m => m.id !== id);
    setStored(STORAGE_KEY_MODELS, models);
    return createResponse(200, { success: true }, config);
  }

  if (pathname.match(/^\/models\/(\d+)$/) && method === 'get') {
    const id = Number(pathname.match(/^\/models\/(\d+)$/)[1]);
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    const model = models.find(m => m.id === id) || models[0];
    return createResponse(200, model, config);
  }

  if (pathname === '/models/train') {
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
    return createResponse(201, newModel, config);
  }

  if (pathname === '/models' && method === 'get') {
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    return createResponse(200, models, config);
  }

  // --- 6. ROBUSTNESS & ATTACKS ---
  if (pathname === '/robustness/run') {
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
        { feature: 'src_bytes', feature_name: 'src_bytes', impact: 0.24, impact_drop: 0.24 },
        { feature: 'dst_bytes', feature_name: 'dst_bytes', impact: 0.19, impact_drop: 0.19 },
        { feature: 'same_srv_rate', feature_name: 'same_srv_rate', impact: 0.15, impact_drop: 0.15 },
        { feature: 'count', feature_name: 'count', impact: 0.12, impact_drop: 0.12 },
        { feature: 'diff_srv_rate', feature_name: 'diff_srv_rate', impact: 0.09, impact_drop: 0.09 },
        { feature: 'duration', feature_name: 'duration', impact: 0.06, impact_drop: 0.06 }
      ],
      confusion_matrix_clean: [[481, 19], [16, 484]],
      confusion_matrix_perturbed: [[280, 220], [210, 290]],
      classes: ['normal', 'anomaly'],
      target_classes: ['normal', 'anomaly'],
      sample_results: [
        { sample_index: 1, true_label: 'normal', clean_prediction: 'normal', perturbed_prediction: 'normal', clean_confidence: 0.98, perturbed_confidence: 0.94, prediction_changed: false },
        { sample_index: 2, true_label: 'anomaly', clean_prediction: 'anomaly', perturbed_prediction: 'normal', clean_confidence: 0.96, perturbed_confidence: 0.62, prediction_changed: true },
        { sample_index: 3, true_label: 'anomaly', clean_prediction: 'anomaly', perturbed_prediction: 'anomaly', clean_confidence: 0.99, perturbed_confidence: 0.88, prediction_changed: false },
        { sample_index: 4, true_label: 'normal', clean_prediction: 'normal', perturbed_prediction: 'normal', clean_confidence: 0.95, perturbed_confidence: 0.91, prediction_changed: false },
        { sample_index: 5, true_label: 'anomaly', clean_prediction: 'anomaly', perturbed_prediction: 'normal', clean_confidence: 0.92, perturbed_confidence: 0.58, prediction_changed: true }
      ],
      created_at: new Date().toISOString()
    };

    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);
    exps.unshift(exp);
    setStored(STORAGE_KEY_EXPERIMENTS, exps);

    return createResponse(200, exp, config);
  }

  if (pathname.match(/^\/robustness\/experiments\/(\d+)$/) && method === 'delete') {
    const id = Number(pathname.match(/^\/robustness\/experiments\/(\d+)$/)[1]);
    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments).filter(e => e.id !== id && e.experiment_id !== id);
    setStored(STORAGE_KEY_EXPERIMENTS, exps);
    return createResponse(200, { success: true }, config);
  }

  if (pathname.match(/^\/robustness\/experiments\/(\d+)$/) && method === 'get') {
    const id = Number(pathname.match(/^\/robustness\/experiments\/(\d+)$/)[1]);
    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);
    const exp = exps.find(e => e.id === id || e.experiment_id === id) || exps[0];
    return createResponse(200, exp, config);
  }

  // --- 7. DEFENSIVE HARDENING ---
  if (pathname === '/defence/input-validation') {
    return createResponse(200, {
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
    }, config);
  }

  if (pathname === '/defence/adversarial-training') {
    return createResponse(200, {
      id: Date.now(),
      method: 'adversarial_training',
      original_robust_accuracy: 0.542,
      defended_robust_accuracy: 0.923,
      robustness_gain: 0.381,
      clean_accuracy_cost: 0.012,
      defended_confusion_matrix: [[465, 35], [29, 471]],
      target_classes: ['normal', 'anomaly']
    }, config);
  }

  if (pathname === '/defence/ensemble') {
    return createResponse(200, {
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
    }, config);
  }

  // --- 8. COMPARISON ---
  if (pathname === '/comparison/models') {
    return createResponse(200, {
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
    }, config);
  }

  if (pathname === '/comparison/experiments') {
    const exps = getStored(STORAGE_KEY_EXPERIMENTS, defaultExperiments);
    return createResponse(200, {
      experiments: exps
    }, config);
  }

  // --- 9. REPORTS ---
  if (pathname.match(/^\/reports\/generate(\/\d+)?$/)) {
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
    return createResponse(201, newRep, config);
  }

  if (pathname === '/reports' && method === 'get') {
    const reports = getStored(STORAGE_KEY_REPORTS, defaultReports);
    return createResponse(200, reports, config);
  }

  // --- 10. DEMO EXECUTION ---
  if (pathname === '/demo/run') {
    return createResponse(200, {
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
    }, config);
  }

  // Safe fallback: plural endpoints always return an empty array to prevent e.map is not a function
  if (method === 'get' && (pathname.endsWith('s') || pathname.includes('list'))) {
    return createResponse(200, [], config);
  }

  return createResponse(200, { status: 'success' }, config);
}
