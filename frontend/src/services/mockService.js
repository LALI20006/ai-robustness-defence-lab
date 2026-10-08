/**
 * AI Robustness Defence Lab - Interactive Client Simulation Service
 * Provides seamless offline/static-hosting fallback for Vercel and demo environments
 * when a Python/Uvicorn backend is not directly bound to the frontend domain.
 */

const STORAGE_KEY_USERS = 'ai_lab_mock_users';
const STORAGE_KEY_DATASETS = 'ai_lab_mock_datasets';
const STORAGE_KEY_MODELS = 'ai_lab_mock_models';
const STORAGE_KEY_EXPERIMENTS = 'ai_lab_mock_experiments';

// Initial Seed Datasets
const defaultDatasets = [
  {
    id: 1,
    name: 'NSL-KDD Network Intrusion Benchmark',
    description: 'Standardized network intrusion flow dataset for evaluating IDS classifier evasion.',
    filename: 'nsl_kdd_sample.csv',
    row_count: 5000,
    column_count: 42,
    target_column: 'class',
    created_at: '2026-03-01T10:00:00Z',
    is_sample: true,
    columns: ['duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 'count', 'srv_count', 'same_srv_rate', 'diff_srv_rate', 'dst_host_count', 'dst_host_srv_count', 'class']
  },
  {
    id: 2,
    name: 'PE Header Static Malware Features',
    description: 'Extracted PE executable file header structural metrics for malware classification.',
    filename: 'pe_malware_sample.csv',
    row_count: 3800,
    column_count: 35,
    target_column: 'malicious',
    created_at: '2026-03-15T14:30:00Z',
    is_sample: true,
    columns: ['Machine', 'SizeOfOptionalHeader', 'Characteristics', 'MajorLinkerVersion', 'SizeOfCode', 'SizeOfInitializedData', 'AddressOfEntryPoint', 'BaseOfCode', 'ImageBase', 'SectionAlignment', 'malicious']
  }
];

// Initial Seed Models
const defaultModels = [
  {
    id: 1,
    dataset_id: 1,
    model_name: 'Random Forest (IDS)',
    algorithm: 'random_forest',
    hyperparameters: { n_estimators: 100, max_depth: 12 },
    clean_accuracy: 0.965,
    precision: 0.962,
    recall: 0.968,
    f1_score: 0.965,
    train_time_sec: 1.84,
    created_at: '2026-10-01T08:20:00Z'
  },
  {
    id: 2,
    dataset_id: 1,
    model_name: 'Decision Tree (IDS)',
    algorithm: 'decision_tree',
    hyperparameters: { max_depth: 8 },
    clean_accuracy: 0.941,
    precision: 0.938,
    recall: 0.944,
    f1_score: 0.941,
    train_time_sec: 0.42,
    created_at: '2026-10-02T09:15:00Z'
  },
  {
    id: 3,
    dataset_id: 2,
    model_name: 'MLP Neural Network (Malware)',
    algorithm: 'mlp',
    hyperparameters: { hidden_layer_sizes: [64, 32], max_iter: 200 },
    clean_accuracy: 0.952,
    precision: 0.956,
    recall: 0.948,
    f1_score: 0.952,
    train_time_sec: 3.12,
    created_at: '2026-10-03T11:45:00Z'
  }
];

// Helper to get stored list or initialize
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
    console.warn('Storage quota exceeded', e);
  }
}

export async function handleMockFallback(config) {
  const url = (config.url || '').replace(/^[a-z]+:\/\/[^/]+/i, ''); // Strip domain if any
  const method = (config.method || 'get').toLowerCase();
  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = {};
    }
  }

  console.info(`[Mock Service] Intercepted ${method.toUpperCase()} ${url} on static deployment`);

  // --- 1. AUTHENTICATION ---
  if (url.includes('/auth/register')) {
    const users = getStored(STORAGE_KEY_USERS, []);
    const { full_name, username, email, password } = body;
    
    // Check if user already exists
    const existing = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase() || u.email.toLowerCase() === (email || '').toLowerCase());
    if (existing) {
      // For smooth demo experience on live preview, update or return existing
      return {
        status: 201,
        data: {
          id: existing.id,
          full_name: existing.full_name || full_name,
          username: existing.username,
          email: existing.email,
          created_at: existing.created_at
        }
      };
    }

    const newUser = {
      id: Date.now(),
      full_name: full_name || 'Academic Researcher',
      username: username || 'researcher',
      email: email || 'researcher@lab.edu',
      password: password || 'Password123!',
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    setStored(STORAGE_KEY_USERS, users);

    return {
      status: 201,
      data: {
        id: newUser.id,
        full_name: newUser.full_name,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    };
  }

  if (url.includes('/auth/login')) {
    const users = getStored(STORAGE_KEY_USERS, []);
    const { username_or_email, password } = body;
    const cleanIdent = (username_or_email || '').trim().toLowerCase();

    let matchedUser = users.find(u => 
      u.username.toLowerCase() === cleanIdent || 
      u.email.toLowerCase() === cleanIdent
    );

    if (!matchedUser) {
      // Auto-provision demo account so visitors are never blocked
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

    const token = `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
      data: { message: 'Password reset link has been dispatched to your email address.' }
    };
  }

  // --- 2. DASHBOARD ---
  if (url.includes('/dashboard/summary')) {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);

    return {
      status: 200,
      data: {
        total_datasets: datasets.length,
        total_models: models.length,
        total_experiments: 6,
        best_clean_accuracy: 0.965,
        best_robust_accuracy: 0.923,
        model_robustness_overview: [
          { model_name: 'Random Forest (IDS)', clean_accuracy: 0.965, perturbed_accuracy: 0.542, defended_accuracy: 0.923 },
          { model_name: 'Decision Tree (IDS)', clean_accuracy: 0.941, perturbed_accuracy: 0.618, defended_accuracy: 0.884 },
          { model_name: 'MLP Neural Net', clean_accuracy: 0.952, perturbed_accuracy: 0.491, defended_accuracy: 0.895 },
          { model_name: 'Logistic Regression', clean_accuracy: 0.885, perturbed_accuracy: 0.420, defended_accuracy: 0.825 }
        ],
        recent_experiments: [
          {
            id: 101,
            model_name: 'Random Forest (IDS)',
            dataset_name: 'NSL-KDD Network Intrusion',
            perturbation_method: 'high_variance_noise',
            perturbation_strength: 0.15,
            clean_accuracy: 0.965,
            robust_accuracy: 0.542,
            accuracy_drop: 0.423,
            attack_success_rate: 0.438,
            defence_method: 'Adversarial Retraining',
            defended_robust_accuracy: 0.923,
            created_at: '2026-10-08 11:30'
          },
          {
            id: 102,
            model_name: 'MLP Neural Network',
            dataset_name: 'PE Static Malware Features',
            perturbation_method: 'boundary_clip_perturbation',
            perturbation_strength: 0.10,
            clean_accuracy: 0.952,
            robust_accuracy: 0.491,
            accuracy_drop: 0.461,
            attack_success_rate: 0.485,
            defence_method: 'Input Bound Validation Guard',
            defended_robust_accuracy: 0.895,
            created_at: '2026-10-08 10:15'
          }
        ]
      }
    };
  }

  // --- 3. DATASETS ---
  if (url.match(/\/datasets\/\d+\/preview/)) {
    return {
      status: 200,
      data: {
        columns: ['duration', 'protocol_type', 'service', 'src_bytes', 'dst_bytes', 'count', 'same_srv_rate', 'class'],
        rows: [
          { duration: 0, protocol_type: 'tcp', service: 'http', src_bytes: 181, dst_bytes: 5450, count: 8, same_srv_rate: 1.0, class: 'normal' },
          { duration: 0, protocol_type: 'tcp', service: 'http', src_bytes: 239, dst_bytes: 486, count: 8, same_srv_rate: 1.0, class: 'normal' },
          { duration: 0, protocol_type: 'tcp', service: 'private', src_bytes: 0, dst_bytes: 0, count: 123, same_srv_rate: 0.05, class: 'anomaly' },
          { duration: 2, protocol_type: 'tcp', service: 'ftp', src_bytes: 280, dst_bytes: 0, count: 1, same_srv_rate: 1.0, class: 'normal' },
          { duration: 0, protocol_type: 'icmp', service: 'eco_i', src_bytes: 18, dst_bytes: 0, count: 511, same_srv_rate: 1.0, class: 'anomaly' }
        ],
        total_rows: 5000
      }
    };
  }

  if (url.match(/\/datasets\/\d+\/statistics/)) {
    return {
      status: 200,
      data: {
        total_samples: 5000,
        numerical_features: 38,
        categorical_features: 4,
        missing_values_count: 0,
        class_balance: { 'normal': 2692, 'anomaly': 2308 }
      }
    };
  }

  if (url.includes('/datasets') && method === 'get') {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    return { status: 200, data: datasets };
  }

  if (url.includes('/datasets/load-sample')) {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    return { status: 200, data: datasets[0] };
  }

  if (url.includes('/datasets/upload')) {
    const datasets = getStored(STORAGE_KEY_DATASETS, defaultDatasets);
    const newDs = {
      id: Date.now(),
      name: 'Custom Research Dataset',
      description: 'User uploaded experimental dataset.',
      filename: 'uploaded_dataset.csv',
      row_count: 2400,
      column_count: 28,
      target_column: 'label',
      created_at: new Date().toISOString(),
      is_sample: false
    };
    datasets.unshift(newDs);
    setStored(STORAGE_KEY_DATASETS, datasets);
    return { status: 201, data: newDs };
  }

  // --- 4. PREPROCESSING ---
  if (url.includes('/preprocessing/run')) {
    return {
      status: 200,
      data: {
        id: Date.now(),
        dataset_id: body.dataset_id || 1,
        scaling_strategy: body.scaling_strategy || 'standard',
        encoding_strategy: body.encoding_strategy || 'one_hot',
        train_test_split_ratio: 0.8,
        train_samples: 4000,
        test_samples: 1000,
        features_count: 42,
        encoded_features_count: 118,
        status: 'completed',
        created_at: new Date().toISOString()
      }
    };
  }

  // --- 5. MODELS ---
  if (url.includes('/models') && method === 'get') {
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    return { status: 200, data: models };
  }

  if (url.includes('/models/train')) {
    const models = getStored(STORAGE_KEY_MODELS, defaultModels);
    const alg = body.algorithm || 'random_forest';
    const newModel = {
      id: Date.now(),
      dataset_id: body.dataset_id || 1,
      model_name: `${alg.toUpperCase().replace('_', ' ')} Classifier`,
      algorithm: alg,
      hyperparameters: body.hyperparameters || {},
      clean_accuracy: (0.93 + Math.random() * 0.04).toFixed(3) * 1,
      precision: (0.92 + Math.random() * 0.05).toFixed(3) * 1,
      recall: (0.93 + Math.random() * 0.04).toFixed(3) * 1,
      f1_score: (0.93 + Math.random() * 0.04).toFixed(3) * 1,
      train_time_sec: (1.2 + Math.random() * 2.5).toFixed(2) * 1,
      created_at: new Date().toISOString()
    };
    models.unshift(newModel);
    setStored(STORAGE_KEY_MODELS, models);
    return { status: 201, data: newModel };
  }

  // --- 6. ROBUSTNESS & ATTACKS ---
  if (url.includes('/robustness/run')) {
    const eps = body.epsilon || body.perturbation_strength || 0.15;
    const cleanAcc = 0.965;
    const robustAcc = Math.max(0.35, +(cleanAcc - (eps * 2.8)).toFixed(3));
    const asr = +(1 - (robustAcc / cleanAcc)).toFixed(3);

    return {
      status: 200,
      data: {
        id: Date.now(),
        experiment_id: Date.now(),
        model_id: body.model_id || 1,
        perturbation_method: body.perturbation_method || 'high_variance_perturbation',
        epsilon: eps,
        clean_accuracy: cleanAcc,
        perturbed_accuracy: robustAcc,
        accuracy_drop: +(cleanAcc - robustAcc).toFixed(3),
        attack_success_rate: asr,
        prediction_flip_rate: +(asr * 0.92).toFixed(3),
        mean_confidence_drop: +(eps * 1.4).toFixed(3),
        confusion_matrix_clean: [[520, 20], [15, 445]],
        confusion_matrix_perturbed: [[310, 230], [215, 245]],
        created_at: new Date().toISOString()
      }
    };
  }

  // --- 7. DEFENSIVE HARDENING ---
  if (url.includes('/defence/')) {
    return {
      status: 200,
      data: {
        id: Date.now(),
        method: url.split('/').pop(),
        status: 'evaluated',
        clean_accuracy: 0.965,
        attacked_accuracy: 0.542,
        defended_accuracy: 0.924,
        robustness_gain: 0.382,
        blocked_perturbations_ratio: 0.875,
        confusion_matrix_defended: [[495, 45], [31, 429]],
        summary: 'Defensive hardening successfully recovered 87.5% of evasion vulnerability.'
      }
    };
  }

  // --- 8. COMPARISON ---
  if (url.includes('/comparison/models')) {
    return {
      status: 200,
      data: [
        { model_name: 'Random Forest', algorithm: 'random_forest', clean_accuracy: 0.965, attacked_accuracy: 0.542, defended_accuracy: 0.924 },
        { model_name: 'Decision Tree', algorithm: 'decision_tree', clean_accuracy: 0.941, attacked_accuracy: 0.618, defended_accuracy: 0.884 },
        { model_name: 'MLP Neural Net', algorithm: 'mlp', clean_accuracy: 0.952, attacked_accuracy: 0.491, defended_accuracy: 0.895 },
        { model_name: 'Logistic Reg', algorithm: 'logistic_regression', clean_accuracy: 0.885, attacked_accuracy: 0.420, defended_accuracy: 0.825 }
      ]
    };
  }

  // --- 9. REPORTS ---
  if (url.includes('/reports')) {
    return {
      status: 200,
      data: [
        {
          id: 1,
          experiment_id: 101,
          title: 'Adversarial Robustness Evaluation: NSL-KDD Random Forest',
          format: 'pdf',
          file_size_kb: 420,
          created_at: '2026-10-08 11:30'
        },
        {
          id: 2,
          experiment_id: 102,
          title: 'Malware Classifier Perturbation Audit: MLP Evasion & Defense',
          format: 'pdf',
          file_size_kb: 388,
          created_at: '2026-10-08 10:15'
        }
      ]
    };
  }

  // --- 10. DEMO EXECUTION ---
  if (url.includes('/demo/run')) {
    return {
      status: 200,
      data: {
        success: true,
        workflow: 'Comprehensive Automated AI Security Benchmark',
        dataset: 'NSL-KDD Network Intrusion Benchmark',
        model: 'Random Forest (100 Estimators)',
        baseline_accuracy: 0.965,
        attack_type: 'High-Variance Feature Space Perturbation (eps=0.15)',
        attack_success_rate: 0.438,
        post_attack_accuracy: 0.542,
        defense_applied: 'Adversarial Retraining + Boundary Guards',
        defended_accuracy: 0.923,
        robustness_recovery: '+38.1%',
        duration_seconds: 2.4
      }
    };
  }

  // Fallback generic 200
  return { status: 200, data: { status: 'success' } };
}
