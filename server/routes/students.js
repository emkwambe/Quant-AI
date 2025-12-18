import { Router } from 'express';
import db from '../db/index.js';
import { requireStudent } from '../middleware/auth.js';

const router = Router();

// Student joins classroom with code
router.post('/join', (req, res) => {
  try {
    const { joinCode, displayName } = req.body;

    if (!joinCode || !displayName) {
      return res.status(400).json({ error: 'Join code and name required' });
    }

    if (displayName.length > 20) {
      return res.status(400).json({ error: 'Name must be 20 characters or less' });
    }

    // Find classroom
    const classroom = db.prepare(`
      SELECT c.id, c.name, c.grade_level, t.name as teacher_name
      FROM classrooms c
      JOIN teachers t ON c.teacher_id = t.id
      WHERE c.join_code = ?
    `).get(joinCode.toUpperCase());

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found. Check your code!' });
    }

    // Check if name already taken in classroom
    const existing = db.prepare(`
      SELECT id FROM students
      WHERE classroom_id = ? AND LOWER(display_name) = LOWER(?)
    `).get(classroom.id, displayName);

    if (existing) {
      // Return existing student
      res.cookie('studentId', existing.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return res.json({
        id: existing.id,
        displayName,
        classroom: {
          id: classroom.id,
          name: classroom.name,
          teacherName: classroom.teacher_name
        }
      });
    }

    // Create new student
    const result = db.prepare(`
      INSERT INTO students (classroom_id, display_name)
      VALUES (?, ?)
    `).run(classroom.id, displayName.trim());

    res.cookie('studentId', result.lastInsertRowid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      id: result.lastInsertRowid,
      displayName: displayName.trim(),
      classroom: {
        id: classroom.id,
        name: classroom.name,
        teacherName: classroom.teacher_name
      }
    });
  } catch (error) {
    console.error('Student join error:', error);
    res.status(500).json({ error: 'Failed to join classroom' });
  }
});

// Get current student info
router.get('/me', requireStudent, (req, res) => {
  res.json(req.student);
});

// Leave classroom (clear session)
router.post('/leave', (req, res) => {
  res.clearCookie('studentId');
  res.json({ success: true });
});

export default router;
