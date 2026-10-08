from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status

from ..schemas import CameraCreateSchema, CameraFeedSchema
from ..services.detection_service import DetectionService
from .deps import get_service

router = APIRouter(prefix="/cameras", tags=["cameras"])


@router.get("", response_model=List[CameraFeedSchema])
async def list_cameras(service: DetectionService = Depends(get_service)):
    """Returns registered camera feeds with their latest live detections and status"""
    return service.cameras.list()


@router.get("/{camera_id}", response_model=CameraFeedSchema)
async def get_camera(camera_id: str, service: DetectionService = Depends(get_service)):
    camera = service.cameras.get(camera_id)
    if camera is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Camera not found")
    return camera


@router.post("", response_model=CameraFeedSchema, status_code=status.HTTP_201_CREATED)
async def register_camera(payload: CameraCreateSchema, service: DetectionService = Depends(get_service)):
    """Register or update a camera. Give it a ``streamUrl`` to let the server pull and analyze frames."""
    return service.cameras.upsert(payload)


@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera(camera_id: str, service: DetectionService = Depends(get_service)):
    if not service.cameras.remove(camera_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Camera not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
