import { Router } from 'express';
import { pool } from '../app.js';

const router = Router();

async function tryQueryWithRetry(retries = 5, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      return { ok: true };
    } catch (e) {
      if (i === retries - 1) return { ok: false, err: e };
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

router.get('/', async (_req, res) => {
  const r = await tryQueryWithRetry();
  if (r.ok) return res.json({ status: 'ok' });
  res.status(500).json({ status: 'error', message: r.err.message });
});

export default router;
