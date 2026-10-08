import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings
from .detection.engine import build_detector
from .routers import cameras, detection, incidents, stream, system
from .services.camera_registry import CameraRegistry
from .services.detection_service import DetectionService
from .services.incident_store import IncidentStore

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

API_PREFIX = "/api/v1"


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        store = IncidentStore(settings.database_path)
        app.state.service = DetectionService(
            detector=build_detector(settings),
            settings=settings,
            cameras=CameraRegistry(settings.cameras_file),
            incidents=store,
        )
        yield
        store.close()

    app = FastAPI(
        title="Fire & Smoke Detection Vision Microservice",
        version=system.VERSION,
        description="Real-time Computer Vision Inference API for Fire & Smoke Command Center",
        lifespan=lifespan,
    )

    # Credentials cannot be combined with a wildcard origin, so only enable them for explicit origins.
    wildcard = settings.cors_origins == ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=not wildcard,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for module in (system, cameras, incidents, detection, stream):
        app.include_router(module.router, prefix=API_PREFIX)
    return app


app = create_app()
