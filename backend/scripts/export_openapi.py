"""Regenerate backend/openapi.yaml from the FastAPI app (plus the WebSocket channel FastAPI omits).

Usage (from backend/):  python -m scripts.export_openapi
"""
from pathlib import Path

import yaml

from app.main import app
from app.schemas import StreamFramePacket

WS_PATH = {
    "get": {
        "tags": ["stream"],
        "summary": "Live WebSocket detection channel",
        "description": (
            "Server pull: if the camera has a streamUrl the server reads frames and pushes a "
            "StreamFramePacket per analyzed frame. Client push: otherwise send binary JPEG/PNG/WebP "
            "frames or JSON {\"type\": \"frame\", \"image\": \"data:image/jpeg;base64,...\"} and receive "
            "one StreamFramePacket per frame. {\"type\": \"ping\"} is answered with {\"type\": \"pong\"}."
        ),
        "parameters": [{"name": "camera_id", "in": "path", "required": True, "schema": {"type": "string"}}],
        "responses": {
            "101": {
                "description": "Switching Protocols to WebSocket",
                "content": {"application/json": {"schema": {"$ref": "#/components/schemas/StreamFramePacket"}}},
            }
        },
    }
}


def main() -> None:
    spec = app.openapi()
    spec["servers"] = [{"url": "http://localhost:8000", "description": "Local development server"}]
    spec["paths"]["/api/v1/ws/cctv/{camera_id}"] = WS_PATH
    packet = StreamFramePacket.model_json_schema(ref_template="#/components/schemas/{model}")
    schemas = spec["components"]["schemas"]
    schemas.update(packet.pop("$defs", {}))
    schemas["StreamFramePacket"] = packet
    out = Path(__file__).resolve().parents[1] / "openapi.yaml"
    out.write_text(yaml.safe_dump(spec, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
