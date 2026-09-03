import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
import backend.app.models # Register all models

# Production logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_robustness_lab")

# Create database tables
Base.metadata.create_all(bind=engine)
logger.info("Database schemas initialized successfully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Defensive research and educational laboratory evaluating machine-learning malware and intrusion classifiers against controlled feature perturbations.",
    version="1.0.0"
)

# CORS configuration
allowed_origins = settings.get_allowed_origins()
logger.info(f"Configuring CORS with allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe error handling to protect stack traces in production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please check server logs."}
    )

# Include Routers
from backend.app.routes.auth import router as auth_router
from backend.app.routes.datasets import router as datasets_router
from backend.app.routes.preprocessing import router as preprocessing_router
from backend.app.routes.models import router as models_router
from backend.app.routes.robustness import router as robustness_router
from backend.app.routes.defence import router as defence_router
from backend.app.routes.comparison import router as comparison_router
from backend.app.routes.reports import router as reports_router
from backend.app.routes.dashboard import router as dashboard_router
from backend.app.routes.demo import router as demo_router

app.include_router(auth_router)
app.include_router(datasets_router)
app.include_router(preprocessing_router)
app.include_router(models_router)
app.include_router(robustness_router)
app.include_router(defence_router)
app.include_router(comparison_router)
app.include_router(reports_router)
app.include_router(dashboard_router)
app.include_router(demo_router)

@app.get("/")
def read_root():
    return {
        "framework": settings.PROJECT_NAME,
        "short_name": settings.SHORT_NAME,
        "status": "online",
        "scope": "Defensive machine-learning cybersecurity evaluation only",
        "health": "/health",
        "docs": "/docs"
    }

# Standard deployment health check endpoint
@app.get("/health")
def health():
    """Unauthenticated health check for deployment orchestration (Render, Kubernetes, etc.)"""
    return {"status": "ok"}

@app.get("/api/health")
def api_health():
    """API-namespaced health check"""
    return {"status": "healthy"}
