"""SQLite-backed persistent incident log (stdlib only, thread-safe)."""
import sqlite3
import threading
from pathlib import Path
from typing import List, Optional

from ..schemas import IncidentRecordSchema, IncidentUpdateSchema


class IncidentStore:
    def __init__(self, db_path: Path):
        if str(db_path) != ":memory:":
            db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._lock = threading.Lock()
        with self._lock, self._conn:
            self._conn.execute(
                """
                CREATE TABLE IF NOT EXISTS incidents (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    camera_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    payload TEXT NOT NULL
                )
                """
            )
            self._conn.execute("CREATE INDEX IF NOT EXISTS idx_incidents_ts ON incidents(timestamp DESC)")

    def add(self, incident: IncidentRecordSchema) -> IncidentRecordSchema:
        with self._lock, self._conn:
            self._conn.execute(
                "INSERT OR REPLACE INTO incidents (id, timestamp, camera_id, type, status, payload) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    incident.id,
                    incident.timestamp,
                    incident.cameraId,
                    incident.type,
                    incident.status,
                    incident.model_dump_json(),
                ),
            )
        return incident

    def list(
        self,
        status: Optional[str] = None,
        type_: Optional[str] = None,
        camera_id: Optional[str] = None,
        limit: int = 200,
        offset: int = 0,
    ) -> List[IncidentRecordSchema]:
        clauses, params = [], []
        for column, value in (("status", status), ("type", type_), ("camera_id", camera_id)):
            if value:
                clauses.append(f"{column} = ?")
                params.append(value)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with self._lock:
            rows = self._conn.execute(
                f"SELECT payload FROM incidents {where} ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (*params, limit, offset),
            ).fetchall()
        return [IncidentRecordSchema.model_validate_json(r[0]) for r in rows]

    def get(self, incident_id: str) -> Optional[IncidentRecordSchema]:
        with self._lock:
            row = self._conn.execute("SELECT payload FROM incidents WHERE id = ?", (incident_id,)).fetchone()
        return IncidentRecordSchema.model_validate_json(row[0]) if row else None

    def update(self, incident_id: str, patch: IncidentUpdateSchema) -> Optional[IncidentRecordSchema]:
        current = self.get(incident_id)
        if current is None:
            return None
        updated = current.model_copy(update=patch.model_dump(exclude_unset=True))
        return self.add(updated)

    def delete(self, incident_id: str) -> bool:
        with self._lock, self._conn:
            cur = self._conn.execute("DELETE FROM incidents WHERE id = ?", (incident_id,))
        return cur.rowcount > 0

    def stats(self) -> dict:
        with self._lock:
            rows = self._conn.execute("SELECT type, status, COUNT(*) FROM incidents GROUP BY type, status").fetchall()
        out = {"total": 0, "byType": {}, "byStatus": {}}
        for type_, status, count in rows:
            out["total"] += count
            out["byType"][type_] = out["byType"].get(type_, 0) + count
            out["byStatus"][status] = out["byStatus"].get(status, 0) + count
        return out

    def close(self) -> None:
        self._conn.close()

