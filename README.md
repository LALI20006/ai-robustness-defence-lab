# Adversarial Robustness Evaluation & Defence Framework for AI-Based Malware and Intrusion Classifiers

**Short Name:** AI Robustness Defence Lab  
**Tagline:** *Evaluate. Challenge. Defend.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic%20Research-blue.svg)](#)

---

## 1. Project Overview

The **Adversarial Robustness Evaluation & Defence Framework** is an interactive, academic-grade cybersecurity laboratory designed to evaluate, challenge, and defensively harden machine-learning classifiers applied to malware detection and network intrusion detection (IDS).

Modern AI security classifiers often achieve high accuracy on clean validation data but can suffer acute performance degradation when exposed to subtle distribution shifts or bounded feature-space perturbations. This platform provides an offline, scientifically grounded environment where practitioners and students can:

1. Ingest, inspect, and preprocess structured cybersecurity tabular datasets.
2. Train baseline classifiers (Random Forest, Gradient Boosting, SVM, Logistic Regression, Decision Tree, KNN, MLP).
3. Evaluate baseline clean metrics (Accuracy, Precision, Recall, F1, ROC-AUC, FPR, FNR, Confusion Matrix).
4. Conduct controlled, mathematically constrained adversarial robustness evaluations.
5. Apply defensive hardening techniques (Input Validation Guards, Adversarial Training Augmentation, Voting Ensembles).
6. Perform empirical cross-model comparisons and generate downloadable PDF & HTML academic reports.

---

## 2. Important Safety Boundaries & Ethics Statement

> [!IMPORTANT]
> **Strict Defensive Scope:** This platform is engineered solely for defensive cybersecurity research, academic education, and offline model benchmarking.
> 
> The application strictly **DOES NOT** contain or support:
> * Malware execution, packing, or malicious binary generation.
> * Real-world network scanning, packet injection, or exploitation.
> * Reverse shells, payload generation, or persistence mechanisms.
> * Credential theft or command-and-control (C2) operations.
> * Live evasion deployment against operational security controls.
> 
> All perturbation evaluations occur strictly within offline numerical/categorical tabular feature vectors.

---

## 3. Key Architecture & Features

```
project-root/
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── config.py         # Pydantic Settings & Environment
│   │   ├── database.py       # SQLAlchemy ORM engine & sessions
│   │   ├── main.py           # FastAPI application entrypoint & routers
│   │   ├── models/           # SQLAlchemy DB Models (User, Dataset, Model, Exp, Report)
│   │   ├── schemas/          # Pydantic Data Validation Schemas
│   │   ├── routes/           # REST API endpoints (Auth, Datasets, ML, Robustness, Defences)
│   │   ├── security/         # Direct bcrypt hashing & JWT tokens
│   │   ├── ml/
│   │   │   ├── preprocessing/ # Leak-free preprocessor with bound tracking
│   │   │   ├── training/     # Model Factory for 7+ classifiers
│   │   │   ├── evaluation/   # Standardized metrics & ROC curves
│   │   │   ├── robustness/   # Controlled perturbations & sensitivity ranking
│   │   │   └── defenses/     # Adversarial training, input validation, ensembles
│   │   └── services/         # ReportLab PDF generator & Demo pipeline
│   ├── scripts/              # Sample dataset generators
│   └── tests/                # Automated pytest test suite
│
├── frontend/                 # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Metric cards, Confusion Matrix, Navbar, Sidebar
│   │   ├── context/          # JWT Auth Context & persistence
│   │   ├── pages/            # 13 dedicated lab pages
│   │   └── services/         # Axios REST API client
│   └── vite.config.js        # Vite + Tailwind + Proxy configuration
│
├── data/
│   ├── sample/               # Bundled NSL-KDD & PE Malware tabular samples
│   ├── uploads/              # Ingested user CSV files
│   └── processed/            # Preprocessed arrays and pipelines
├── models/saved_models/      # Serialized joblib model artifacts
├── reports/                  # Generated PDF and HTML reports
└── logs/                     # System logs
```

---

## 4. Supported Classifiers & Techniques

### Supported Model Architectures
* **Random Forest Classifier** (`random_forest`): High stability bagging ensemble.
* **Gradient Boosting** (`gradient_boosting`): Residual minimization ensemble.
* **Support Vector Machine** (`svm`): Maximum-margin hyperplane with calibrated probability scores.
* **Logistic Regression** (`logistic_regression`): Linear decision boundary with L2 regularization.
* **Decision Tree** (`decision_tree`): Orthogonal hierarchical partitioning.
* **K-Nearest Neighbors** (`knn`): Distance-based metric classification.
* **Multi-Layer Perceptron** (`mlp`): Neural network with backpropagation.

### Controlled Perturbation Methods
* **Epsilon-Bounded Perturbation:** Continuous shift scaled by observed feature range $\pm\epsilon \cdot \text{range}(x)$, strictly clipped to $[x_{min}, x_{max}]$.
* **Random Noise:** Uniform random feature perturbation within configurable bounds.
* **Gaussian Noise:** Controlled normal perturbation scaled to individual feature standard deviation.
* **Feature Masking:** Randomly replaces $k$ features per sample with column median, mean, or valid zero.
* **Feature Dropout Sensitivity:** Systematically neutralizes features one-by-one to rank vulnerability impact.

### Defensive Hardening Techniques
* **Adversarial Training:** Data augmentation injecting bounded feature perturbations into the training set ($X_{train} \cup X_{adv}$) followed by model retraining.
* **Input Validation Guard:** Range checking, NaN/Inf detection, non-negativity enforcement, and statistical outlier filtering (IQR & Z-score $> 4\sigma$) categorizing inputs into `VALID`, `WARNING`, or `REJECTED`.
* **Voting Ensemble:** Aggregates predictions across multiple classifiers (soft probability or hard majority voting) to reduce variance.

---

## 5. Getting Started & Installation

### Prerequisites
* Python 3.11, 3.12, 3.13, or 3.14
* Node.js v18+ and npm v9+

### Step 1: Clone or Navigate to Directory
```bash
cd "c:\Users\mrhar\Desktop\PCL PROJECT"
```

### Step 2: Set Up Backend Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### Step 3: Initialize Environment & Sample Datasets
```bash
# Generate bundled sample cybersecurity datasets (NSL-KDD & PE Malware)
python backend/scripts/generate_sample_data.py
```

### Step 4: Set Up Frontend
```bash
cd frontend
npm install
cd ..
```

---

## 6. Running the Application

### Option A: Run Backend Server
In your activated terminal:
```bash
venv\Scripts\python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000`. Interactive Swagger API docs are accessible at `http://127.0.0.1:8000/docs`.

### Option B: Run Frontend Development Server
In a second terminal:
```bash
cd frontend
npm run dev
```
Frontend application will be accessible at `http://localhost:5173`.

---

## 7. The One-Click Academic Demo Workflow

For college project reviews or thesis demonstrations, use the built-in **Run Demo Experiment** button:

1. Open the application at `http://localhost:5173`.
2. Sign in with the demo account:
   * **Username:** `researcher`
   * **Password:** `DemoPassword123!`
   *(Or click "Fill Demo Credentials" on the login screen).*
3. Click the glowing **"Run Demo Experiment"** button in the top navigation bar.
4. The system automatically executes:
   * Loading the bundled NSL-KDD intrusion detection dataset.
   * Applying zero-leakage stratified preprocessing (80/20 train/test split, standard scaling, one-hot encoding).
   * Training a Random Forest baseline classifier.
   * Measuring clean test performance (e.g. ~95.4% accuracy).
   * Executing a 5% bounded feature perturbation test.
   * Computing Attack Success Rate (ASR) and accuracy drop (e.g. drop to ~78.8%).
   * Synthesizing an augmented training set and retraining the hardened model.
   * Measuring defended robust accuracy (e.g. recovery to ~88.7%).
   * Storing the experiment in SQLite and redirecting to visual analytics.
5. Navigate to **Reports** and click **Download** to inspect the auto-generated ReportLab PDF evaluation report.

---

## 8. Automated Testing

Run the comprehensive pytest suite:
```bash
venv\Scripts\pytest backend/tests -v
```
All tests verify:
* API health and root endpoint compliance.
* User registration, password hashing, and JWT token authorization.
* Full end-to-end ML training, perturbation, and defense pipeline.
* Database session persistence and dashboard telemetry.
* ReportLab PDF report compilation on disk.

---

## 9. Future Scope & Extensibility

* **Deep Learning Classifiers:** Integration with PyTorch tabular transformers and deep belief networks.
* **Explainable AI (XAI):** Integration with SHAP and LIME for feature attribution explanation.
* **Continuous Integration (MLSecOps):** Automated robustness regression testing before deployment.
* **PostgreSQL Production Deployment:** Switch database URI in `.env` to PostgreSQL with connection pooling.
