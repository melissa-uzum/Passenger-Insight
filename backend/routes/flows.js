import { Router } from "express";
import { pool } from "../app.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    if (req.requireAuth) {
      await new Promise((resolve, reject) =>
        req.requireAuth(req, res, (err) => (err ? reject(err) : resolve()))
      );
    }

    const { station_id, count_in, count_out, source = "sensor", timestamp } = req.body || {};
    if (!station_id || count_in == null || count_out == null) {
      return res.status(400).json({ message: "station_id, count_in, count_out are required" });
    }
    const ts = timestamp ? new Date(timestamp) : new Date();

    await pool.execute(
      "INSERT INTO flow (station_id, count_in, count_out, source, timestamp) VALUES (?, ?, ?, ?, ?)",
      [Number(station_id), Number(count_in), Number(count_out), String(source), ts]
    );

    const [rows] = await pool.query(`
      SELECT s.name, SUM(f.count_in) AS in_total, SUM(f.count_out) AS out_total
      FROM flow f JOIN station s ON s.id = f.station_id
      WHERE f.timestamp >= NOW() - INTERVAL 24 HOUR
      GROUP BY s.id
      ORDER BY s.name
    `);
    req.app.get("sseBroadcast")?.("flows:update", { data: rows });

    res.json({ status: "ok" });
  } catch (e) {
    const msg = String(e?.message || e);
    if (/Unknown column 'source'|ER_BAD_FIELD_ERROR/.test(msg)) {
      return res.status(500).json({
        message:
          "Column `flow.source` missing. Run migration: ALTER TABLE flow ADD COLUMN source ENUM('sensor','manual','import') NOT NULL DEFAULT 'sensor' AFTER count_out;",
      });
    }
    res.status(500).json({ message: msg });
  }
});

router.get("/latest", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.name,
             SUM(CASE WHEN f.timestamp >= NOW() - INTERVAL 1 DAY THEN f.count_in ELSE 0 END) AS in_total,
             SUM(CASE WHEN f.timestamp >= NOW() - INTERVAL 1 DAY THEN f.count_out ELSE 0 END) AS out_total
      FROM station s
      LEFT JOIN flow f ON f.station_id = s.id
      GROUP BY s.id, s.name
      ORDER BY s.name
    `);
    res.json({ data: rows });
  } catch (e) {
    res.status(500).json({ message: String(e.message || e) });
  }
});

router.get("/history", async (req, res) => {
  try {
    const hours = Math.min(parseInt(req.query.hours || "24", 10), 168);
    const stationId = req.query.station_id ? parseInt(req.query.station_id, 10) : null;

    const params = [hours];
    const where = ["f.timestamp >= NOW() - INTERVAL ? HOUR"];
    if (stationId) { where.push("f.station_id = ?"); params.push(stationId); }

    const [rows] = await pool.query(`
      SELECT
        f.station_id,
        s.name,
        DATE_FORMAT(f.timestamp, '%Y-%m-%d %H:00:00') AS bucket,
        SUM(f.count_in)  AS in_sum,
        SUM(f.count_out) AS out_sum
      FROM flow f
      JOIN station s ON s.id = f.station_id
      WHERE ${where.join(" AND ")}
      GROUP BY f.station_id, bucket
      ORDER BY bucket ASC, f.station_id ASC
    `, params);

    res.json({ data: rows });
  } catch (e) {
    res.status(500).json({ message: String(e.message || e) });
  }
});

router.get("/anomalies", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id AS station_id, s.name,
             f.count_in, f.count_out, f.timestamp
      FROM flow f
      JOIN station s ON s.id = f.station_id
      WHERE f.timestamp >= NOW() - INTERVAL 1 DAY
      ORDER BY s.id, f.timestamp
    `);

    const byId = new Map();
    for (const r of rows) {
      const arr = byId.get(r.station_id) || [];
      arr.push({ name: r.name, value: Number(r.count_in) + Number(r.count_out), timestamp: r.timestamp });
      byId.set(r.station_id, arr);
    }

    const anomalies = [];
    for (const [stationId, arr] of byId.entries()) {
      if (arr.length === 0) continue;
      const vals = arr.map(a => a.value).sort((a, b) => a - b);
      const p95 = vals[Math.floor((vals.length - 1) * 0.95)];
      for (const a of arr) {
        if (a.value > p95) anomalies.push({ station_id: stationId, name: a.name, total: a.value, threshold_p95: p95, timestamp: a.timestamp });
      }
    }

    res.json({ data: anomalies });
  } catch (e) {
    res.status(500).json({ message: String(e.message || e) });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 200);
    const [rows] = await pool.query(`
      SELECT f.id, s.name AS station, f.count_in, f.count_out, f.source, f.timestamp
      FROM flow f
      JOIN station s ON s.id = f.station_id
      ORDER BY f.id DESC
      LIMIT ?`, [limit]);
    res.json({ data: rows });
  } catch (e) {
    res.status(500).json({ message: String(e.message || e) });
  }
});

export default router;
