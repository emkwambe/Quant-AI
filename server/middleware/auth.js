import db from '../db/index.js';

// Simple session-based auth using cookies
// In production, use proper JWT or session store

export function requireTeacher(req, res, next) {
  const teacherId = req.cookies.teacherId;

  if (!teacherId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const teacher = db.prepare(
    'SELECT id, email, name, school_name FROM teachers WHERE id = ?'
  ).get(teacherId);

  if (!teacher) {
    res.clearCookie('teacherId');
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.teacher = teacher;
  next();
}

export function requireStudent(req, res, next) {
  const studentId = req.cookies.studentId;

  if (!studentId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const student = db.prepare(`
    SELECT s.id, s.display_name, s.classroom_id, c.name as classroom_name
    FROM students s
    JOIN classrooms c ON s.classroom_id = c.id
    WHERE s.id = ?
  `).get(studentId);

  if (!student) {
    res.clearCookie('studentId');
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.student = student;
  next();
}
