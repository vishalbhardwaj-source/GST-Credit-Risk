# GST Credit-at-Risk Forecaster - Unified Developer Automation
# Requires 'just' (Install: `winget install Casey.Just` or `cargo install just`)

# Default recipe: print help and available targets
default:
    @just --list

# Start both FastAPI backend (:8000) and Vite React frontend (:5173) concurrently
dev:
    npm run dev

# Start only the Python FastAPI backend on port 8000
dev-backend:
    uvicorn backend.main:app --reload --port 8000

# Start only the Vite React frontend
dev-frontend:
    npm --prefix vite-app run dev

# Run all test suites (Frontend Vitest + Backend Pytest)
test:
    npm --prefix vite-app test
    python -m pytest tests/

# Run frontend Vitest tests only
test-frontend:
    npm --prefix vite-app test

# Run backend Pytest tests only
test-backend:
    python -m pytest tests/

# Build Vite frontend for production
build:
    npm --prefix vite-app run build

# Train and calibrate the offline LightGBM resolution forecaster model
train-model:
    python -m backend.train_forecaster

# Install all workspace dependencies (root, frontend, and Python backend)
install:
    npm install
    npm --prefix vite-app install
    pip install -r requirements.txt
