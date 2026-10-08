import base64

import cv2
import numpy as np

from .conftest import encode, synthetic_fire


def test_health_reports_engine(client):
    body = client.get("/api/v1/health").json()
    assert body["status"] == "ok"
    assert body["engine"] == "heuristic-opencv"


def test_detect_image_fire(client):
    res = client.post("/api/v1/detect/image", files={"file": ("cam.jpg", encode(synthetic_fire()), "image/jpeg")})
    assert res.status_code == 200
    body = res.json()
    assert any(b["label"] == "fire" for b in body["boxes"])
    assert body["imageWidth"] == 640 and body["imageHeight"] == 480
    assert body["inferenceTimeMs"] >= 0


def test_detect_image_clean_scene_returns_no_boxes(client):
    blank = encode(np.full((240, 320, 3), 40, np.uint8), ".png")
    res = client.post("/api/v1/detect/image", files={"file": ("fire_named.png", blank, "image/png")})
    assert res.status_code == 200 and res.json()["boxes"] == []


def test_detect_image_rejects_garbage(client):
    res = client.post("/api/v1/detect/image", files={"file": ("x.jpg", b"not an image", "image/jpeg")})
    assert res.status_code == 415


def test_detect_video(client, tmp_path):
    path = tmp_path / "clip.avi"
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"MJPG"), 10, (640, 480))
    for i in range(20):
        writer.write(synthetic_fire() if i >= 10 else np.full((480, 640, 3), 25, np.uint8))
    writer.release()

    res = client.post("/api/v1/detect/video", files={"file": ("clip.avi", path.read_bytes(), "video/x-msvideo")})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["frames"] and body["sourceFps"] == 10
    assert body["summary"]["fire"]["firstSeenMs"] >= 1000  # fire only appears in the second half


def test_incident_crud(client):
    incident = {
        "id": "inc-test-1",
        "timestamp": "2026-10-08T10:00:00Z",
        "cameraId": "WEBCAM-01",
        "cameraName": "Laptop Cam",
        "zone": "Pemindaian Kamera Langsung",
        "type": "fire",
        "confidence": 0.91,
        "temperatureC": 377,
        "status": "active",
        "detections": [{"id": "b1", "label": "fire", "confidence": 0.91, "bbox": [0.1, 0.1, 0.2, 0.2]}],
    }
    assert client.post("/api/v1/incidents", json=incident).status_code == 201
    listed = client.get("/api/v1/incidents").json()
    assert listed[0]["id"] == "inc-test-1" and listed[0]["zone"] == "Pemindaian Kamera Langsung"

    patched = client.patch("/api/v1/incidents/inc-test-1", json={"status": "resolved"}).json()
    assert patched["status"] == "resolved" and patched["notes"] is None
    assert client.get("/api/v1/incidents", params={"status": "active"}).json() == []
    assert client.get("/api/v1/incidents/stats").json()["byStatus"] == {"resolved": 1}

    assert client.delete("/api/v1/incidents/inc-test-1").status_code == 204
    assert client.get("/api/v1/incidents/inc-test-1").status_code == 404


def test_camera_registry(client):
    ids = [c["id"] for c in client.get("/api/v1/cameras").json()]
    assert ids == ["cam-1", "cam-2", "cam-3", "cam-4"]
    created = client.post("/api/v1/cameras", json={"id": "dock-7", "name": "Loading Dock", "streamUrl": "rtsp://x/1"})
    assert created.status_code == 201 and created.json()["status"] == "safe"
    assert client.delete("/api/v1/cameras/dock-7").status_code == 204


def test_websocket_client_push_logs_incident(client):
    frame = encode(synthetic_fire())
    with client.websocket_connect("/api/v1/ws/cctv/WEBCAM-01") as ws:
        ws.send_text('{"type": "ping"}')
        assert ws.receive_json()["type"] == "pong"

        ws.send_bytes(frame)
        first = ws.receive_json()
        assert first["status"] == "critical" and first["incidentId"] is None

        data_url = "data:image/jpeg;base64," + base64.b64encode(frame).decode()
        ws.send_json({"type": "frame", "image": data_url})
        second = ws.receive_json()
        assert second["incidentId"]  # confirmed on the 2nd consecutive frame

        # Camera status is visible to REST clients while the stream is live
        cam = next(c for c in client.get("/api/v1/cameras").json() if c["id"] == "WEBCAM-01")
        assert cam["status"] == "critical" and cam["isWebcam"]

        ws.send_bytes(frame)
        assert ws.receive_json()["incidentId"] is None  # cooldown prevents duplicates

        ws.send_bytes(b"garbage")
        assert ws.receive_json()["type"] == "error"

    incidents = client.get("/api/v1/incidents").json()
    assert len(incidents) == 1
    assert incidents[0]["type"] == "fire" and incidents[0]["snapshotUrl"].startswith("data:image/jpeg")


def test_websocket_server_pull_from_video_file(client, tmp_path):
    path = tmp_path / "cctv.avi"
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"MJPG"), 10, (640, 480))
    for _ in range(10):
        writer.write(synthetic_fire())
    writer.release()
    client.post("/api/v1/cameras", json={"id": "file-cam", "name": "Recorded", "streamUrl": str(path)})

    with client.websocket_connect("/api/v1/ws/cctv/file-cam") as ws:
        packets = [ws.receive_json() for _ in range(3)]
    assert all(p["cameraId"] == "file-cam" for p in packets)
    assert any(d["label"] == "fire" for d in packets[0]["detections"])
