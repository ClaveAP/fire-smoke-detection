from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from ..schemas import DetectionClass, IncidentRecordSchema, IncidentStatus, IncidentUpdateSchema
from ..services.detection_service import DetectionService
from .deps import get_service

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("", response_model=List[IncidentRecordSchema])
async def list_incidents(
    status_: Optional[IncidentStatus] = Query(None, alias="status"),
    type_: Optional[DetectionClass] = Query(None, alias="type"),
    camera_id: Optional[str] = Query(None, alias="cameraId"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    service: DetectionService = Depends(get_service),
):
    """Returns persisted incident records (newest first) for audit logs"""
    return service.incidents.list(status_, type_, camera_id, limit, offset)


@router.get("/stats")
async def incident_stats(service: DetectionService = Depends(get_service)):
    return service.incidents.stats()


@router.get("/{incident_id}", response_model=IncidentRecordSchema)
async def get_incident(incident_id: str, service: DetectionService = Depends(get_service)):
    incident = service.incidents.get(incident_id)
    if incident is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Incident not found")
    return incident


@router.post("", response_model=IncidentRecordSchema, status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentRecordSchema, service: DetectionService = Depends(get_service)):
    """Record an incident reported by a client (e.g. browser webcam scan or Media Inspector)"""
    return service.incidents.add(payload)


@router.patch("/{incident_id}", response_model=IncidentRecordSchema)
async def update_incident(
    incident_id: str, payload: IncidentUpdateSchema, service: DetectionService = Depends(get_service)
):
    """Change an incident's status (active → investigating → resolved) or notes"""
    incident = service.incidents.update(incident_id, payload)
    if incident is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Incident not found")
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(incident_id: str, service: DetectionService = Depends(get_service)):
    if not service.incidents.delete(incident_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Incident not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
