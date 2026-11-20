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
    settings = service.settings
    return {
        "status": "ok",
        "service": "fire-smoke-vision-service",
        "version": VERSION,
        "engine": service.detector.name,
        # Why the heuristic engine is active instead of the trained YOLO weights ("" when YOLO runs).
        "engineNote": getattr(service.detector, "fallback_reason", ""),
        "weightsPath": str(settings.weights_path),
        "weightsAvailable": settings.weights_path.is_file(),
        "confidenceThreshold": settings.confidence_threshold,
        "uptimeSeconds": round(time.time() - STARTED_AT, 1),
    }
