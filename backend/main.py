from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db.database import engine, Base
from app.api.routes import reports
from pathlib import Path

import logging
import torch
from contextlib import asynccontextmanager

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== CleanSight AI Backend Starting ===")
    
    # Check GPU
    device = "CUDA" if torch.cuda.is_available() else "CPU"
    logger.info(f"System Compute Device: {device}")
    if device == "CUDA":
        logger.info(f"GPU Found: {torch.cuda.get_device_name(0)}")
    else:
        logger.warning("No GPU found. Inference will run on CPU and may be slow.")

    # Pre-load AI model
    try:
        from app.ai.model_loader import ModelLoader
        ModelLoader.get_model()
        logger.info("YOLOv8 AI Model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load AI model on startup: {str(e)}")
        
    logger.info("Backend services ready and listening.")
    yield
    logger.info("Shutting down CleanSight AI Backend.")

app = FastAPI(title="CleanSight AI API", version="1.0.0", lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for mock image uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "CleanSight API is running"}
