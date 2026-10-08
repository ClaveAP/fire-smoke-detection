import time

from fastapi import APIRouter, Depends

from ..services.detection_service import DetectionService
from .deps import get_service

router = APIRouter(tags=["system"])
STARTED_AT = time.time()
VERSION = "1.1.0"


@router.get("/health")
async def health_check(service: DetectionService = Depends(get_service)):
    """Health check probe used by frontend detectionAdapter"""
    return {
        "status": "ok",
        "service": "fire-smoke-vision-service",
        "version": VERSION,
        "engine": service.detector.name,
        "confidenceThreshold": service.settings.confidence_threshold,
        "uptimeSeconds": round(time.time() - STARTED_AT, 1),
    }
