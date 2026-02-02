import { Router } from 'express';
import { createRequire } from 'module';
import db from '../db/index.js';
import { requireTeacher, requireStudent } from '../middleware/auth.js';

// Use createRequire to import CommonJS module
const require = createRequire(import.meta.url);
const { generateQuestions } = require('../questions/generator.js');

const router = Router();

// Get heats for a classroom (teacher)
router.get('/classroom/:classroomId', requireTeacher, (req, res) => {
  const classroom = db.prepare(`
    SELECT id FROM classrooms
    WHERE id = ? AND teacher_id = ?
  `).get(req.params.classroomId, req.teacher.id);

  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  const heats = db.prepare(`
    SELECT h.*,
           COUNT(DISTINCT r.student_id) as participants,
           AVG(CASE WHEN r.is_correct THEN 1 ELSE 0 END) * 100 as avg_accuracy
    FROM heats h
    LEFT JOIN responses r ON h.id = r.heat_id
    WHERE h.classroom_id = ?
    GROUP BY h.id
    ORDER BY h.created_at DESC
    LIMIT 20
  `).all(req.params.classroomId);

  res.json(heats);
});

// Create new heat (teacher starts competition)
router.post('/start', requireTeacher, (req, res) => {
  try {
    const { classroomId, difficultyLevel } = req.body;

    const classroom = db.prepare(`
      SELECT id, grade_level FROM classrooms
      WHERE id = ? AND teacher_id = ?
    `).get(classroomId, req.teacher.id);

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    db.prepare(`
      UPDATE heats
      SET status = 'ended', ended_at = datetime('now')
      WHERE classroom_id = ? AND status = 'active'
    `).run(classroomId);

    const difficulty = difficultyLevel || 2;
    const result = db.prepare(`
      INSERT INTO heats (classroom_id, difficulty_level, status, started_at)
      VALUES (?, ?, 'active', datetime('now'))
    `).run(classroomId, difficulty);

    const heatId = result.lastInsertRowid;
    const gradeBands = { 1: 'K-2', 2: 'K-2', 3: '3-5', 4: '3-5', 5: '3-5', 6: '6-8', 7: '6-8', 8: '6-8' };
    const gradeLevel = gradeBands[classroom.grade_level] || '3-5';

    const questions = generateQuestions(difficulty, 20, heatId, gradeLevel);

    res.json({
      id: heatId,
      classroomId,
      difficultyLevel: difficulty,
      gradeLevel,
      status: 'active',
      questions: questions.map((q, i) => ({
        index: i,
        display: q.display,
      })),
      startedAt: new Date().toISOString(),
      durationSeconds: 120
    });
  } catch (error) {
    console.error('Start heat error:', error);
    res.status(500).json({ error: 'Failed to start heat' });
  }
});

// Get active heat for student
router.get('/active', requireStudent, (req, res) => {
  const heat = db.prepare(`
    SELECT h.* FROM heats h
    JOIN classrooms c ON h.classroom_id = c.id
    WHERE c.id = ? AND h.status = 'active'
    ORDER BY h.started_at DESC
    LIMIT 1
  `).get(req.student.classroom_id);

  if (!heat) {
    return res.json({ active: false });
  }

  const classroom = db.prepare('SELECT grade_level FROM classrooms WHERE id = ?')
    .get(req.student.classroom_id);
  const gradeBands = { 1: 'K-2', 2: 'K-2', 3: '3-5', 4: '3-5', 5: '3-5', 6: '6-8', 7: '6-8', 8: '6-8' };
  const gradeLevel = gradeBands[classroom?.grade_level] || '3-5';

  const questions = generateQuestions(heat.difficulty_level, 20, heat.id, gradeLevel);

  const responses = db.prepare(`
    SELECT question_index, is_correct, response_time_ms
    FROM responses
    WHERE heat_id = ? AND student_id = ?
  `).all(heat.id, req.student.id);

  const answeredIndices = new Set(responses.map(r => r.question_index));

  res.json({
    active: true,
    heat: {
      id: heat.id,
      difficultyLevel: heat.difficulty_level,
      startedAt: heat.started_at,
      durationSeconds: heat.duration_seconds
    },
    questions: questions.map((q, i) => ({
      index: i,
      display: q.display,
      answered: answeredIndices.has(i)
    })),
    progress: {
      answered: responses.length,
      correct: responses.filter(r => r.is_correct).length
    }
  });
});

// Submit answer (student)
router.post('/answer', requireStudent, (req, res) => {
  try {
    const { heatId, questionIndex, answer, responseTimeMs } = req.body;

    const heat = db.prepare(`
      SELECT h.* FROM heats h
      WHERE h.id = ? AND h.classroom_id = ? AND h.status = 'active'
    `).get(heatId, req.student.classroom_id);

    if (!heat) {
      return res.status(400).json({ error: 'Heat not active' });
    }

    const existing = db.prepare(`
      SELECT id FROM responses
      WHERE heat_id = ? AND student_id = ? AND question_index = ?
    `).get(heatId, req.student.id, questionIndex);

    if (existing) {
      return res.status(400).json({ error: 'Already answered' });
    }

    const classroom = db.prepare('SELECT grade_level FROM classrooms WHERE id = ?')
      .get(req.student.classroom_id);
    const gradeBands = { 1: 'K-2', 2: 'K-2', 3: '3-5', 4: '3-5', 5: '3-5', 6: '6-8', 7: '6-8', 8: '6-8' };
    const gradeLevel = gradeBands[classroom?.grade_level] || '3-5';

    const questions = generateQuestions(heat.difficulty_level, 20, heatId, gradeLevel);
    const question = questions[questionIndex];

    if (!question) {
      return res.status(400).json({ error: 'Invalid question' });
    }

    const isCorrect = parseInt(answer) === question.answer;

    db.prepare(`
      INSERT INTO responses
      (heat_id, student_id, question_index, question_template, question_display,
       correct_answer, student_answer, is_correct, response_time_ms, answered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      heatId,
      req.student.id,
      questionIndex,
      question.template,
      question.display,
      question.answer,
      answer,
      isCorrect ? 1 : 0,
      responseTimeMs || 0
    );

    const progress = db.prepare(`
      SELECT
        COUNT(*) as answered,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
      FROM responses
      WHERE heat_id = ? AND student_id = ?
    `).get(heatId, req.student.id);

    res.json({
      correct: isCorrect,
      correctAnswer: question.answer,
      progress: {
        answered: progress.answered,
        correct: progress.correct
      }
    });
  } catch (error) {
    console.error('Answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// End heat (teacher)
router.post('/:id/end', requireTeacher, (req, res) => {
  const heat = db.prepare(`
    SELECT h.* FROM heats h
    JOIN classrooms c ON h.classroom_id = c.id
    WHERE h.id = ? AND c.teacher_id = ?
  `).get(req.params.id, req.teacher.id);

  if (!heat) {
    return res.status(404).json({ error: 'Heat not found' });
  }

  db.prepare(`
    UPDATE heats SET status = 'ended', ended_at = datetime('now')
    WHERE id = ?
  `).run(heat.id);

  res.json({ success: true });
});

// Get heat results
router.get('/:id/results', (req, res) => {
  const heat = db.prepare('SELECT * FROM heats WHERE id = ?').get(req.params.id);

  if (!heat) {
    return res.status(404).json({ error: 'Heat not found' });
  }

  const results = db.prepare(`
    SELECT
      s.id as student_id,
      s.display_name,
      t.country_code,
      COUNT(r.id) as total_answered,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as correct_count,
      AVG(r.response_time_ms) as avg_time_ms,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) * 100 +
        (10000 - COALESCE(AVG(r.response_time_ms), 10000)) / 100 as score
    FROM students s
    JOIN classrooms c ON s.classroom_id = c.id
    JOIN teachers t ON c.teacher_id = t.id
    LEFT JOIN responses r ON s.id = r.student_id AND r.heat_id = ?
    WHERE s.classroom_id = ?
    GROUP BY s.id
    ORDER BY score DESC
  `).all(heat.id, heat.classroom_id);

  const stats = db.prepare(`
    SELECT
      COUNT(DISTINCT student_id) as participants,
      AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100 as class_accuracy,
      AVG(response_time_ms) as class_avg_time
    FROM responses
    WHERE heat_id = ?
  `).get(heat.id);

  res.json({
    heat: {
      id: heat.id,
      difficultyLevel: heat.difficulty_level,
      startedAt: heat.started_at,
      endedAt: heat.ended_at,
      status: heat.status
    },
    leaderboard: results.map((r, i) => ({
      rank: i + 1,
      studentId: r.student_id,
      displayName: r.display_name,
      countryCode: r.country_code || 'US',
      correct: r.correct_count || 0,
      total: r.total_answered || 0,
      avgTimeMs: Math.round(r.avg_time_ms || 0),
      score: Math.round(r.score || 0)
    })),
    stats: {
      participants: stats.participants || 0,
      classAccuracy: Math.round(stats.class_accuracy || 0),
      classAvgTime: Math.round(stats.class_avg_time || 0)
    }
  });
});

export default router;
