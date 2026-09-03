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

Modern AI security classifiers often achieve high accuracy on clean validation data but suffer acute performance degradation when exposed to subtle distribution shifts or bounded feature-space perturbations. This platform provides an offline, scientifically grounded environment where practitioners and students can:

1. Ingest, inspect, and preprocess structured cybersecurity tabular datasets.
2. Train baseline classifiers (Random Forest, Gradient Boosting, SVM, Logistic Regression, Decision Tree, KNN, MLP).
3. Evaluate baseline clean metrics (Accuracy, Precision, Recall, F1, ROC-AUC, FPR, FNR, Confusion Matrix).
4. Conduct controlled, mathematically constrained adversarial robustness evaluations.
5. Apply defensive hardening techniques (Input Validation Guards, Adversarial Training Augmentation, Voting Ensembles).
6. Perform empirical cross-model comparisons and generate downloadable PDF & HTML academic reports.

---

## 2. Safety Boundaries & Ethics Statement

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

## 3. Deployment Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               Vercel Frontend                │
                    │         (React 19 + Vite SPA + Tailwind)     │
                    │        https://your-app.vercel.app           │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTPS + JWT Bearer
                                           │ (VITE_API_BASE_URL)
                    ┌──────────────────────▼───────────────────────┐
                    │                Render Backend                │
                    │           (FastAPI + Uvicorn + ML)           │
                    │     https://your-backend.onrender.com        │
                    └───────────────┬──────────────┬───────────────┘
                                    │              │
                    ┌───────────────▼──────┐ ┌─────▼───────────────┐
                    │ PostgreSQL Database  │ │ Bundled Datasets    │
                    │ (Render/Neon/SQLite) │ │ (data/sample/)      │
                    └──────────────────────┘ └─────────────────────┘
```

---

## 4. Production Deployment Guide

### A. Deploy Backend to Render

1. **Push your repository to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ai-robustness-defence-lab.git
   git branch -M main
   git push -u origin main
   ```

2. **Create a Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New + > Web Service**.
   - Connect your GitHub repository.
   - Configure the following settings:
     - **Name:** `ai-robustness-defence-backend`
     - **Runtime:** `Python 3`
     - **Build Command:** `pip install --upgrade pip && pip install -r backend/requirements.txt`
     - **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
     - **Health Check Path:** `/health`
   
3. **Set Backend Environment Variables in Render**:
   | Variable | Value | Description |
   |---|---|---|
   | `ENVIRONMENT` | `production` | Enables production mode |
   | `DATABASE_URL` | `sqlite:///./app.db` or PostgreSQL URL | Database connection string |
   | `JWT_SECRET_KEY` | *(Click "Generate" or enter secure random string)* | Token signing secret |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24-hour token validity |
   | `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` | Allowed CORS origin |
   | `MAX_UPLOAD_MB` | `50` | Maximum file upload size |

4. **Verify Backend Deployment**:
   - Visit `https://your-backend.onrender.com/health` (should return `{"status": "ok"}`).
   - Visit `https://your-backend.onrender.com/docs` to view the interactive OpenAPI documentation.

---

### B. Deploy Frontend to Vercel

1. **Import Project to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
   - Select your GitHub repository.
   - Set **Root Directory** to `frontend`.
   - Vercel will automatically detect **Vite** as the framework.

2. **Set Frontend Environment Variables in Vercel**:
   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |

3. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend and deploy to `https://your-app.vercel.app`.
   - The included `frontend/vercel.json` ensures that deep routing (`/dashboard`, `/models`, etc.) rewrites to `/index.html` without 404 errors.

4. **Update Backend CORS in Render**:
   - Once your Vercel URL is known (e.g. `https://ai-robustness-lab.vercel.app`), go back to your Render backend dashboard > Environment and update:
     `FRONTEND_URL=https://ai-robustness-lab.vercel.app`

---

## 5. Local Development Setup

### Prerequisites
* Python 3.11, 3.12, 3.13, or 3.14
* Node.js v18+ and npm v9+

### Backend Setup
```bash
# 1. Activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate       # Windows
# source venv/bin/activate    # Linux/macOS

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Initialize sample datasets (NSL-KDD & PE Malware)
python backend/scripts/generate_sample_data.py

# 4. Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
Backend API will run at `http://127.0.0.1:8000`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will run at `http://localhost:5173`.

---

## 6. One-Click Academic Demo Workflow

For college project reviews or thesis demonstrations, use the built-in **Run Demo Experiment** button:

1. Open the web interface (`http://localhost:5173` or your deployed Vercel URL).
2. Sign in with the demo account:
   * **Username:** `researcher`
   * **Password:** `DemoPassword123!`
   *(Or click "Fill Demo Credentials" on the login screen).*
3. Click the glowing **"Run Demo Experiment"** button in the top navigation bar.
4. The system automatically executes:
   * Loading the bundled NSL-KDD intrusion detection dataset.
   * Applying zero-leakage stratified preprocessing (80/20 train/test split, standard scaling, one-hot encoding).
   * Training a Random Forest baseline classifier.
   * Measuring clean test performance (~95.4% accuracy).
   * Executing a 5% bounded feature perturbation test.
   * Computing Attack Success Rate (ASR) and accuracy drop (drop to ~78.8%).
   * Synthesizing an augmented training set and retraining the hardened model.
   * Measuring defended robust accuracy (recovery to ~88.7%).
   * Storing the experiment in SQLite and redirecting to visual analytics.
5. Navigate to **Reports** and click **Download** to inspect the auto-generated ReportLab PDF evaluation report.

---

## 7. Automated Testing Suite

Run the full pytest suite:
```bash
venv\Scripts\pytest backend/tests -v
```
Verified test coverage:
* `test_root_and_health`: Validates root endpoint and `/health` unauthenticated probe.
* `test_auth_flow`: Verifies user registration, bcrypt hashing, and JWT token issuance.
* `test_demo_pipeline_e2e`: Executes complete end-to-end ML training, perturbation, and defense pipeline.
* `test_dashboard_summary`: Validates database telemetry aggregation.
* `test_report_generation`: Confirms publication-grade ReportLab PDF compilation on disk.

---

## 8. Troubleshooting & FAQ

| Problem | Cause | Solution |
|---|---|---|
| **CORS error in browser** | `FRONTEND_URL` on Render does not match Vercel URL | Set `FRONTEND_URL` in Render environment to match your exact Vercel domain (without trailing slash). |
| **404 on page refresh** | SPA routing not configured on static host | Ensure `frontend/vercel.json` with rewrites to `/index.html` is present in the repository root. |
| **Backend 502 / Spin-down** | Render free tier enters sleep mode after 15 min | First request takes ~30-50s to spin up. Subsequent requests respond in milliseconds. |
| **Database connection error** | PostgreSQL URL prefix format | SQLAlchemy requires `postgresql://`, but Render default provides `postgres://`. The application automatically converts this in `backend/app/config.py`. |
| **Parquet upload fails** | Missing parser library | `pyarrow>=15.0.0` is included in `backend/requirements.txt` to support Parquet, TSV, and CSV. |
| **Local disk wipe on cloud restart** | Ephemeral container storage | Bundled benchmark datasets are committed in `data/sample/` so core features and demo mode remain permanent. For multi-tenant persistent storage, configure AWS S3 or Supabase Storage. |
