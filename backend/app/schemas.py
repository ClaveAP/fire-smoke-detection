from typing import List, Optional, Literal, Tuple
from pydantic import BaseModel, Field

DetectionClass = Literal["fire", "smoke"]
CameraStatus = Literal["safe", "warning", "critical"]
IncidentStatus = Literal["active", "investigating", "resolved"]


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


class CameraCreateSchema(BaseModel):
    id: str = Field(..., min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    name: str
    location: str = ""
    streamUrl: Optional[str] = Field(None, description="RTSP/HTTP URL, local video path, or webcam index (e.g. '0')")
    isWebcam: bool = False
    fps: int = 30
    resolution: Optional[str] = None


class IncidentRecordSchema(BaseModel):
    id: str
    timestamp: str
    cameraId: str
    cameraName: str
    zone: Optional[str] = None
    type: DetectionClass
    secondaryType: Optional[DetectionClass] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    smokeConfidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    temperatureC: Optional[float] = None
    smokeDensityDbm: Optional[float] = None
    status: IncidentStatus
    snapshotUrl: Optional[str] = None
    notes: Optional[str] = None
    detections: Optional[List[BoundingBoxSchema]] = None


class IncidentUpdateSchema(BaseModel):
    status: Optional[IncidentStatus] = None
    notes: Optional[str] = None


class DetectionResponse(BaseModel):
    boxes: List[BoundingBoxSchema]
    inferenceTimeMs: float
    timestamp: str
    engine: Optional[str] = None
    imageWidth: Optional[int] = None
    imageHeight: Optional[int] = None


class VideoFrameDetection(BaseModel):
    frameIndex: int
    timestampMs: float
    boxes: List[BoundingBoxSchema]


class VideoDetectionResponse(BaseModel):
    frames: List[VideoFrameDetection]
    summary: dict = Field(..., description="Peak confidence per class and the number of frames containing it")
    durationMs: float
    sourceFps: float
    inferenceTimeMs: float
    timestamp: str
    engine: Optional[str] = None


class StreamFramePacket(BaseModel):
    cameraId: str
    timestamp: str
    fps: float
    latencyMs: float
    status: CameraStatus
    detections: List[BoundingBoxSchema]
    incidentId: Optional[str] = None
