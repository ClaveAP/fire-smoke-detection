from fastapi import HTTPException, Request, UploadFile, status

from ..services.detection_service import DetectionService


def get_service(request: Request) -> DetectionService:
    return request.app.state.service


async def read_upload(file: UploadFile, max_mb: int) -> bytes:
    """Read an upload, rejecting payloads larger than ``max_mb`` without buffering them fully."""
    limit = max_mb * 1024 * 1024
    data = await file.read(limit + 1)
    if len(data) > limit:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"File exceeds {max_mb} MB limit")
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Uploaded file is empty")
    return data
