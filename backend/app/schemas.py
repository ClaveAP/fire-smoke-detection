from typing import List, Optional, Literal, Tuple
from pydantic import BaseModel, Field

DetectionClass = Literal["fire", "smoke"]
CameraStatus = Literal["safe", "warning", "critical"]

class BoundingBoxSchema(BaseModel):
    id: str = Field(..., description="Unique bounding box identifier")
    label: DetectionClass = Field(..., description="Detected hazard class (fire or smoke)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Inference confidence probability between 0.0 and 1.0")
    bbox: Tuple[float, float, float, float] = Field(
        ...,
        description="Normalized coordinates [norm_x, norm_y, norm_w, norm_h] between 0.0 and 1.0"
    )

class CameraFeedSchema(BaseModel):
    id: str
    name: str
    location: str
    streamUrl: Optional[str] = None
    isWebcam: bool = False
    status: CameraStatus = "safe"
    detections: List[BoundingBoxSchema] = []
    fps: int = 30
    resolution: Optional[str] = "1920x1080"
    latencyMs: Optional[int] = 15

class IncidentRecordSchema(BaseModel):
    id: str
    timestamp: str
    cameraId: str
    cameraName: str
    type: DetectionClass
    confidence: float
    status: Literal["active", "investigating", "resolved"]
    snapshotUrl: Optional[str] = None
    notes: Optional[str] = None

class DetectionResponse(BaseModel):
    boxes: List[BoundingBoxSchema]
    inferenceTimeMs: float
    timestamp: str
