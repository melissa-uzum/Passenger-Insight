import { Router } from 'express';
import { pool } from '../app.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [stations] = await pool.query(
      'SELECT id, name FROM station ORDER BY id'
    );

    const useDemo =
      process.env.DEMO_INCIDENTS === '1' ||
      process.env.VITE_USE_DEMO_INCIDENTS === '1';

    if (useDemo) {
      const desired = {
        'Arlanda Terminal 1': 'ok',
        'Arlanda Terminal 5': 'warning',
        'Kungsholmen Security Transit': 'critical',
        'Stockholm C': 'ok',
      };

      const now = new Date();
      const demoResults = stations.map(s => {
        const status = desired[s.name] || 'ok';
        return {
          station_id: s.id,
          name: s.name,
          status,
          reasons:
            status === 'critical' ? ['stale'] :
            status === 'warning'  ? ['spike'] : [],
          latest_timestamp:
            status === 'critical' ? null : now
        };
      });

      const rank = { critical: 2, warning: 1, ok: 0 };
      demoResults.sort((a, b) =>
        rank[b.status] - rank[a.status] || a.name.localeCompare(b.name)
      );

      return res.json({ data: demoResults, demo: true });
    }

    const [rows] = await pool.query(`
      SELECT station_id, count_in, count_out, timestamp
      FROM flow
      WHERE timestamp >= NOW() - INTERVAL 1 DAY
      ORDER BY station_id, timestamp
    `);

    const byStation = new Map();
    for (const r of rows) {
      const arr = byStation.get(r.station_id) || [];
      arr.push({
        value: Number(r.count_in) + Number(r.count_out),
        ts: r.timestamp
      });
      byStation.set(r.station_id, arr);
    }

    function quantile(sortedNums, q) {
      if (!sortedNums.length) return null;
      const pos = (sortedNums.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sortedNums[base + 1] !== undefined) {
        return sortedNums[base] + rest * (sortedNums[base + 1] - sortedNums[base]);
      }
      return sortedNums[base];
    }

    const results = [];

    for (const s of stations) {
      const arr = byStation.get(s.id) || [];
      const latest = arr[arr.length - 1] || null;

      let status = 'ok';
      const reasons = [];
      let latest_timestamp = null;

      if (!latest || (new Date(latest.ts) < new Date(Date.now() - 30 * 60 * 1000))) {
        status = 'critical';
        reasons.push('stale');
      } else {
        latest_timestamp = latest.ts;

        if (arr.length >= 8) {
          const values = arr.map(a => a.value).sort((a, b) => a - b);
          const p95 = quantile(values, 0.95);
          const p05 = quantile(values, 0.05);
          const v = latest.value;

          if (p95 != null && v > p95) {
            if (status !== 'critical') status = 'warning';
            reasons.push('spike');
          }
          if (p05 != null && v < p05) {
            if (status !== 'critical') status = 'warning';
            reasons.push('drop');
          }
        }
      }

      results.push({
        station_id: s.id,
        name: s.name,
        status,
        reasons,
        latest_timestamp
      });
    }

    const rank = { critical: 2, warning: 1, ok: 0 };
    results.sort((a, b) => rank[b.status] - rank[a.status] || a.name.localeCompare(b.name));

    res.json({ data: results, demo: false });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
