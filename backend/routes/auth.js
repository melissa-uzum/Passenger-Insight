import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const DEMO = { email: 'admin@example.com', password: 'admin123' };

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email !== DEMO.email || password !== DEMO.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: email, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

export default router;
