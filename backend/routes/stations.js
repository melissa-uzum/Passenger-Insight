import { Router } from 'express';
import { pool } from '../app.js';
const router = Router();

router.get('/', async (_req, res) => {
const [rows] = await pool.query('SELECT id, code, name FROM station ORDER BY name');
res.json({ data: rows });
});

router.post('/', async (req, res) => {
const { code, name } = req.body || {};
if (!code || !name) return res.status(400).json({ error: 'code and name required' });
await pool.query('INSERT INTO station(code, name) VALUES(?, ?)', [code, name]);
res.status(201).json({ message: 'created' });
});

export default router;