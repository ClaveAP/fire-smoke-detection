import time
import uuid
from datetime import datetime
from typing import List
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CameraFeedSchema,
    IncidentRecordSchema,
    DetectionResponse,
    BoundingBoxSchema,
)

app = FastAPI(
    title="Fire & Smoke Detection Vision Microservice",
    version="1.0.0",
    description="Real-time Computer Vision Inference API for Fire & Smoke Command Center",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_CAMERAS: List[CameraFeedSchema] = [
    CameraFeedSchema(
        id="cam-1",
        name="Lab Komputer & Robotika",
        location="Gedung A - Lt. 2",
        status="critical",
        fps=30,
        resolution="1920x1080",
        latencyMs=14,
        detections=[
            BoundingBoxSchema(
                id="box-101",
                label="fire",
                confidence=0.94,
                bbox=(0.38, 0.42, 0.22, 0.35),
            ),
            BoundingBoxSchema(
                id="box-102",
                label="smoke",
                confidence=0.88,
                bbox=(0.32, 0.22, 0.38, 0.28),
            ),
        ],
    ),
    CameraFeedSchema(
        id="cam-2",
        name="Server Room & Rack Bay",
        location="Gedung B - Basement 1",
        status="safe",
        fps=30,
        resolution="1920x1080",
        latencyMs=11,
    ),
    CameraFeedSchema(
        id="cam-3",
        name="Gudang Logistik & Material",
        location="Sektor Barat - Pintu 3",
        status="warning",
        fps=25,
        resolution="1280x720",
        latencyMs=18,
        detections=[
            BoundingBoxSchema(
                id="box-301",
                label="smoke",
                confidence=0.82,
                bbox=(0.52, 0.18, 0.34, 0.42),
            )
        ],
    ),
    CameraFeedSchema(
        id="cam-4",
        name="Perimeter Parkir Timur",
        location="Area Terbuka - Pos 1",
        status="safe",
        fps=30,
        resolution="1920x1080",
        latencyMs=9,
    ),
]

MOCK_INCIDENTS: List[IncidentRecordSchema] = [
    IncidentRecordSchema(
        id="inc-001",
        timestamp=datetime.utcnow().isoformat(),
        cameraId="cam-1",
        cameraName="Lab Komputer & Robotika",
        type="fire",
        confidence=0.94,
        status="active",
        notes="Thermal anomaly and optical flame signature detected near workbench 4",
    ),
    IncidentRecordSchema(
        id="inc-002",
        timestamp=datetime.utcnow().isoformat(),
        cameraId="cam-3",
        cameraName="Gudang Logistik & Material",
        type="smoke",
        confidence=0.82,
        status="investigating",
        notes="Persistent gray plume accumulation above packaging stacks",
    ),
]

@app.get("/api/v1/health")
async def health_check():
    """Health check probe used by frontend detectionAdapter"""
    return {"status": "ok", "service": "fire-smoke-vision-service", "version": "1.0.0"}

@app.get("/api/v1/cameras", response_model=List[CameraFeedSchema])
async def get_cameras():
    """Returns active camera feeds and current detections"""
    return MOCK_CAMERAS

@app.get("/api/v1/incidents", response_model=List[IncidentRecordSchema])
async def get_incidents():
    """Returns persistent incident records for audit logs"""
    return MOCK_INCIDENTS

@app.post("/api/v1/detect/image", response_model=DetectionResponse)
async def detect_image(file: UploadFile = File(...)):
    """
    Image inference endpoint:
    Processes multipart image and returns bounding box coordinates.
    Plug your YOLOv8 model inference call here:
    e.g. results = model.predict(image_bytes)
    """
    start_time = time.perf_counter()
    # Read file bytes
    _ = await file.read()

    # Simulate inference processing
    inference_time_ms = round((time.perf_counter() - start_time) * 1000 + 14.5, 2)

    filename_lower = file.filename.lower() if file.filename else ""
    if "clean" in filename_lower or "safe" in filename_lower:
        return DetectionResponse(
            boxes=[],
            inferenceTimeMs=inference_time_ms,
            timestamp=datetime.utcnow().isoformat(),
        )

    # Standard detected response
    boxes = [
        BoundingBoxSchema(
            id=f"box-{uuid.uuid4().hex[:6]}",
            label="fire",
            confidence=0.93,
            bbox=(0.35, 0.40, 0.25, 0.38),
        ),
        BoundingBoxSchema(
            id=f"box-{uuid.uuid4().hex[:6]}",
            label="smoke",
            confidence=0.86,
            bbox=(0.28, 0.18, 0.42, 0.32),
        ),
    ]

    return DetectionResponse(
        boxes=boxes,
        inferenceTimeMs=inference_time_ms,
        timestamp=datetime.utcnow().isoformat(),
    )

@app.websocket("/api/v1/ws/cctv/{camera_id}")
async def websocket_cctv_stream(websocket: WebSocket, camera_id: str):
    """
    WebSocket live stream metadata socket:
    Emits continuous real-time bounding box detection frames to frontend clients.
    """
    await websocket.accept()
    try:
        while True:
            # Emits frame telemetry packet every 100ms
            await websocket.send_json({
                "cameraId": camera_id,
                "timestamp": datetime.utcnow().isoformat(),
                "fps": 30,
                "latencyMs": 12,
                "detections": [
                    {
                        "id": "box-live-1",
                        "label": "fire",
                        "confidence": 0.92,
                        "bbox": [0.4, 0.45, 0.2, 0.3],
                    }
                ],
            })
            time.sleep(0.1)
    except WebSocketDisconnect:
        pass
