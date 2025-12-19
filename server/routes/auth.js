import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/index.js';
import { requireTeacher } from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 10;

// Teacher signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, schoolName, countryCode } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM teachers WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db.prepare(`
      INSERT INTO teachers (email, password_hash, name, school_name, country_code)
      VALUES (?, ?, ?, ?, ?)
    `).run(email.toLowerCase(), passwordHash, name, schoolName || null, countryCode || 'US');

    // Set cookie for session
    res.cookie('teacherId', result.lastInsertRowid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      id: result.lastInsertRowid,
      email: email.toLowerCase(),
      name,
      schoolName,
      countryCode: countryCode || 'US'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Teacher login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const teacher = db.prepare(
      'SELECT * FROM teachers WHERE email = ?'
    ).get(email.toLowerCase());

    if (!teacher) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, teacher.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.cookie('teacherId', teacher.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      schoolName: teacher.school_name,
      countryCode: teacher.country_code
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current teacher
router.get('/me', requireTeacher, (req, res) => {
  res.json(req.teacher);
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('teacherId');
  res.clearCookie('studentId');
  res.json({ success: true });
});

export default router;
