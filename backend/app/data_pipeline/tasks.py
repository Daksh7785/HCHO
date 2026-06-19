import os
import asyncio
import logging
from datetime import datetime, date
from celery import Celery
from sqlalchemy import text

from app.config import settings
from app.data_pipeline.downloaders import (
    Sentinel5PDownloader,
    INSAT3DDownloader,
    FirmsFireDownloader,
    Era5MeteorologyDownloader,
    ImdaaMeteorologyDownloader,
    Merra2AerosolDownloader
)

logger = logging.getLogger(__name__)

# Initialize Celery app
# Default broker: Redis or RabbitMQ
CELERY_BROKER = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "atmos_watch_tasks",
    broker=CELERY_BROKER,
    backend=CELERY_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

async def _save_model_run_log(target_date: date, status: str, error_msg: str = None, notes: str = None):
    """Asynchronously logs execution metadata to the model_runs table in Postgres."""
    from app.database.connection import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(
                text("""
                    INSERT INTO model_runs (run_id, run_date, model_version, start_time, end_time, status, error_message, notes)
                    VALUES (gen_random_uuid(), :run_date, :model_version, :start_time, :end_time, :status, :error_msg, :notes);
                """),
                {
                    "run_date": target_date,
                    "model_version": settings.MODEL_VERSION,
                    "start_time": datetime.utcnow(),
                    "end_time": datetime.utcnow(),
                    "status": status,
                    "error_msg": error_msg,
                    "notes": notes
                }
            )
            await session.commit()
            logger.info("Successfully logged model run event to database.")
        except Exception as e:
            logger.error(f"Failed to log run metadata to database: {e}")

@celery_app.task(name="tasks.download_sentinel5p_hcho")
def download_sentinel5p_hcho_task(target_date_str: str):
    """Background task to fetch Sentinel-5P HCHO data columns."""
    logger.info(f"Triggered Sentinel-5P download task for {target_date_str}")
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    
    downloader = Sentinel5PDownloader()
    result = downloader.download_hcho(target_date)
    
    # Save log asynchronously using asyncio loop inside Celery worker
    asyncio.run(_save_model_run_log(
        target_date=target_date,
        status="Success" if result["status"] == "success" else "Fallback",
        notes=f"Sentinel-5P HCHO download: {result.get('source', 'unknown')} | status: {result['status']}"
    ))
    return result

@celery_app.task(name="tasks.download_active_fires")
def download_active_fires_task(target_date_str: str):
    """Background task to fetch active fires from NASA FIRMS API."""
    logger.info(f"Triggered NASA FIRMS active fires task for {target_date_str}")
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    
    downloader = FirmsFireDownloader()
    result = downloader.fetch_active_fires(target_date)
    
    asyncio.run(_save_model_run_log(
        target_date=target_date,
        status="Success" if result["status"] == "success" else "Fallback",
        notes=f"NASA FIRMS Active Fires count: {result.get('count', 0)} | status: {result['status']}"
    ))
    return result

@celery_app.task(name="tasks.download_era5_meteorology")
def download_era5_meteorology_task(target_date_str: str):
    """Background task to fetch ERA5 wind vector fields."""
    logger.info(f"Triggered ERA5 download task for {target_date_str}")
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    
    downloader = Era5MeteorologyDownloader()
    result = downloader.download_meteorology(target_date)
    
    asyncio.run(_save_model_run_log(
        target_date=target_date,
        status="Success" if result["status"] == "success" else "Fallback",
        notes=f"ERA5 Meteorology download status: {result['status']}"
    ))
    return result

@celery_app.task(name="tasks.run_daily_ingestion_pipeline")
def run_daily_ingestion_pipeline_task(target_date_str: str):
    """Orchestrates all downloaders sequentially for a given date."""
    logger.info(f"Executing daily atmospheric ingestion pipeline for {target_date_str}")
    
    # Trigger tasks synchronously inside orchestrator
    hcho_res = download_sentinel5p_hcho_task(target_date_str)
    fires_res = download_active_fires_task(target_date_str)
    met_res = download_era5_meteorology_task(target_date_str)
    
    return {
        "date": target_date_str,
        "sentinel5p_hcho": hcho_res["status"],
        "nasa_firms_fires": fires_res["status"],
        "era5_meteorology": met_res["status"]
    }
