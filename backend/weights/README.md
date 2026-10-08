# Model weights

Place a trained Ultralytics YOLO checkpoint here as `best.pt` and install
`requirements-yolo.txt`. On startup the backend switches from the built-in
OpenCV heuristic engine to YOLO automatically (check `GET /api/v1/health` → `engine`).

Class names containing `fire`/`flame` map to `fire`, names containing `smoke` map to `smoke`;
other classes are ignored. Override the path with `FSD_WEIGHTS=/path/to/model.pt`.
