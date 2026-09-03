# ==============================================================================
# Unified Single-Link Full-Stack Dockerfile
# Serves React 19 Frontend + FastAPI Backend + ML Engine on ONE Single URL
# ==============================================================================

# --- Stage 1: Build React 19 Frontend SPA ---
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python Production ML Backend & Static File Server ---
FROM python:3.11-slim

WORKDIR /app

# Install system compilation packages for Scikit-Learn, PyArrow, and PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python ML dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code & bundled sample datasets
COPY backend/ backend/
COPY data/sample/ data/sample/
COPY .env.example .env.example

# Copy compiled frontend distribution from Stage 1
COPY --from=frontend-builder /frontend/dist frontend/dist

# Create runtime directories
RUN mkdir -p data/uploads data/processed models/saved_models reports logs

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

# Start unified Uvicorn server (Serves both React SPA and FastAPI endpoints)
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
