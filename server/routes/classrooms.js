import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/index.js';
import { requireTeacher } from '../middleware/auth.js';

const router = Router();

// Generate a 6-character join code
function generateJoinCode() {
  return nanoid(6).toUpperCase();
}

// Get all classrooms for teacher
router.get('/', requireTeacher, (req, res) => {
  const classrooms = db.prepare(`
    SELECT c.*, COUNT(s.id) as student_count
    FROM classrooms c
    LEFT JOIN students s ON c.id = s.classroom_id
    WHERE c.teacher_id = ?
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all(req.teacher.id);

  res.json(classrooms);
});

// Create a new classroom
router.post('/', requireTeacher, (req, res) => {
  try {
    const { name, gradeLevel } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Classroom name required' });
    }

    // Generate unique join code
    let joinCode;
    let attempts = 0;
    do {
      joinCode = generateJoinCode();
      const existing = db.prepare(
        'SELECT id FROM classrooms WHERE join_code = ?'
      ).get(joinCode);
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const result = db.prepare(`
      INSERT INTO classrooms (teacher_id, name, join_code, grade_level)
      VALUES (?, ?, ?, ?)
    `).run(req.teacher.id, name, joinCode, gradeLevel || 4);

    res.json({
      id: result.lastInsertRowid,
      name,
      joinCode,
      gradeLevel: gradeLevel || 4,
      studentCount: 0
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

// Get single classroom with students
router.get('/:id', requireTeacher, (req, res) => {
  const classroom = db.prepare(`
    SELECT * FROM classrooms
    WHERE id = ? AND teacher_id = ?
  `).get(req.params.id, req.teacher.id);

  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  const students = db.prepare(`
    SELECT id, display_name, created_at
    FROM students
    WHERE classroom_id = ?
    ORDER BY display_name
  `).all(classroom.id);

  res.json({ ...classroom, students });
});

// Get classroom by join code (public - for students joining)
router.get('/join/:code', (req, res) => {
  const classroom = db.prepare(`
    SELECT c.id, c.name, c.grade_level, t.name as teacher_name
    FROM classrooms c
    JOIN teachers t ON c.teacher_id = t.id
    WHERE c.join_code = ?
  `).get(req.params.code.toUpperCase());

  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  res.json(classroom);
});

// Delete classroom
router.delete('/:id', requireTeacher, (req, res) => {
  const result = db.prepare(`
    DELETE FROM classrooms
    WHERE id = ? AND teacher_id = ?
  `).run(req.params.id, req.teacher.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  res.json({ success: true });
});

export default router;
