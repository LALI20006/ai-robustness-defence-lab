import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert "Defensive" in res.json()["scope"]

    h = client.get("/api/health")
    assert h.status_code == 200
    assert h.json()["status"] == "healthy"

    deploy_health = client.get("/health")
    assert deploy_health.status_code == 200
    assert deploy_health.json()["status"] == "ok"

def test_auth_flow():
    # Register
    reg_data = {
        "full_name": "Dr. Cyber Scientist",
        "username": "cyberexpert",
        "email": "cyberexpert@testlab.edu",
        "password": "SecurePassword2026!",
        "confirm_password": "SecurePassword2026!"
    }
    r = client.post("/api/auth/register", json=reg_data)
    # 201 or 400 if already exists
    assert r.status_code in [201, 400]

    # Login
    login_data = {
        "username_or_email": "cyberexpert",
        "password": "SecurePassword2026!"
    }
    l = client.post("/api/auth/login", json=login_data)
    assert l.status_code == 200
    tokens = l.json()
    assert "access_token" in tokens
    token = tokens["access_token"]

    # Profile
    headers = {"Authorization": f"Bearer {token}"}
    p = client.get("/api/auth/me", headers=headers)
    assert p.status_code == 200
    assert p.json()["username"] == "cyberexpert"

def test_demo_pipeline_e2e():
    # Execute full demo pipeline
    d = client.post("/api/demo/run")
    assert d.status_code == 200
    res = d.json()
    assert res["success"] is True
    assert "clean_accuracy" in res
    assert "robust_accuracy" in res
    assert "defended_robust_accuracy" in res
    assert res["clean_accuracy"] > 0.70
    assert res["defended_robust_accuracy"] > 0.60
    assert res["accuracy_drop"] >= 0.0

def test_dashboard_summary():
    # Login to get token
    login_data = {
        "username_or_email": "cyberexpert",
        "password": "SecurePassword2026!"
    }
    l = client.post("/api/auth/login", json=login_data)
    token = l.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dash = client.get("/api/dashboard/summary", headers=headers)
    assert dash.status_code == 200
    data = dash.json()
    assert "total_datasets" in data
    assert "total_models" in data
    assert "total_experiments" in data

def test_report_generation():
    login_data = {
        "username_or_email": "cyberexpert",
        "password": "SecurePassword2026!"
    }
    l = client.post("/api/auth/login", json=login_data)
    token = l.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Run demo first to have an experiment
    client.post("/api/demo/run", headers=headers)

    dash = client.get("/api/dashboard/summary", headers=headers).json()
    assert dash["latest_experiment"] is not None
    exp_id = dash["latest_experiment"]["id"]

    # Generate PDF report
    rep_req = {
        "experiment_id": exp_id,
        "format": "pdf",
        "custom_title": "Automated Robustness Test Report"
    }
    gen_res = client.post(f"/api/reports/generate/{exp_id}", json=rep_req, headers=headers)
    assert gen_res.status_code == 201
    rep_info = gen_res.json()
    assert rep_info["format"] == "pdf"
    assert os.path.exists(rep_info["report_path"])
