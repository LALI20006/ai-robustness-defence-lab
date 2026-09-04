import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
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

# Standard deployment health check endpoint
@app.get("/health")
def health():
    """Unauthenticated health check for deployment orchestration (Render, Kubernetes, etc.)"""
    return {"status": "ok"}

@app.get("/api/health")
def api_health():
    """API-namespaced health check"""
    return {"status": "healthy"}

# Determine frontend distribution path for unified single-link serving
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
frontend_dist = os.path.join(PROJECT_ROOT, "frontend", "dist")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/favicon.svg")
    def favicon():
        fav_path = os.path.join(frontend_dist, "favicon.svg")
        if os.path.exists(fav_path):
            return FileResponse(fav_path)
        return JSONResponse(status_code=404, content={"detail": "Not found"})

    @app.get("/icons.svg")
    def icons():
        icons_path = os.path.join(frontend_dist, "icons.svg")
        if os.path.exists(icons_path):
            return FileResponse(icons_path)
        return JSONResponse(status_code=404, content={"detail": "Not found"})

    @app.get("/")
    def read_root(request: Request):
        accept = request.headers.get("accept", "")
        # If client explicitly asks for JSON, or is not asking for HTML, return JSON metadata
        if "text/html" not in accept:
            return {
                "framework": settings.PROJECT_NAME,
                "short_name": settings.SHORT_NAME,
                "status": "online",
                "scope": "Defensive machine-learning cybersecurity evaluation only",
                "health": "/health",
                "docs": "/docs"
            }
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {
            "framework": settings.PROJECT_NAME,
            "short_name": settings.SHORT_NAME,
            "status": "online",
            "scope": "Defensive machine-learning cybersecurity evaluation only",
            "health": "/health",
            "docs": "/docs"
        }

    # SPA catch-all fallback for client-side routing (/dashboard, /models, /robustness, etc.)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Frontend bundle not found"})
else:
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
