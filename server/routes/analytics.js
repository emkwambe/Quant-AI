import { Router } from 'express';
import db from '../db/index.js';
import { requireTeacher } from '../middleware/auth.js';

const router = Router();

// Get student performance history (30-day trends)
router.get('/student/:studentId', requireTeacher, (req, res) => {
  const { studentId } = req.params;

  // Verify student belongs to teacher's classroom
  const student = db.prepare(`
    SELECT s.*, c.teacher_id FROM students s
    JOIN classrooms c ON s.classroom_id = c.id
    WHERE s.id = ? AND c.teacher_id = ?
  `).get(studentId, req.teacher.id);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Get daily performance for last 30 days
  const dailyStats = db.prepare(`
    SELECT
      DATE(r.answered_at) as date,
      COUNT(*) as total_questions,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as correct,
      AVG(r.response_time_ms) as avg_time_ms,
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as accuracy
    FROM responses r
    JOIN heats h ON r.heat_id = h.id
    WHERE r.student_id = ?
      AND r.answered_at >= datetime('now', '-30 days')
    GROUP BY DATE(r.answered_at)
    ORDER BY date DESC
  `).all(studentId);

  // Get performance by skill
  const skillBreakdown = db.prepare(`
    SELECT
      r.question_template,
      COUNT(*) as attempts,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as accuracy,
      AVG(r.response_time_ms) as avg_time_ms
    FROM responses r
    WHERE r.student_id = ?
      AND r.answered_at >= datetime('now', '-30 days')
    GROUP BY r.question_template
    ORDER BY attempts DESC
  `).all(studentId);

  // Get overall stats
  const overall = db.prepare(`
    SELECT
      COUNT(*) as total_questions,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as total_correct,
      COUNT(DISTINCT h.id) as heats_participated,
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as overall_accuracy,
      AVG(r.response_time_ms) as overall_avg_time
    FROM responses r
    JOIN heats h ON r.heat_id = h.id
    WHERE r.student_id = ?
      AND r.answered_at >= datetime('now', '-30 days')
  `).get(studentId);

  // Get recent heats with rankings
  const recentHeats = db.prepare(`
    SELECT
      h.id as heat_id,
      h.started_at,
      h.difficulty_level,
      COUNT(r.id) as questions_answered,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as correct,
      (
        SELECT COUNT(*) + 1 FROM (
          SELECT r2.student_id,
            SUM(CASE WHEN r2.is_correct THEN 1 ELSE 0 END) as score
          FROM responses r2
          WHERE r2.heat_id = h.id
          GROUP BY r2.student_id
          HAVING score > SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END)
        )
      ) as rank
    FROM responses r
    JOIN heats h ON r.heat_id = h.id
    WHERE r.student_id = ?
    GROUP BY h.id
    ORDER BY h.started_at DESC
    LIMIT 10
  `).all(studentId);

  res.json({
    student: {
      id: student.id,
      displayName: student.display_name,
      classroomId: student.classroom_id
    },
    overall: {
      totalQuestions: overall.total_questions || 0,
      totalCorrect: overall.total_correct || 0,
      heatsParticipated: overall.heats_participated || 0,
      accuracy: overall.overall_accuracy || 0,
      avgTimeMs: Math.round(overall.overall_avg_time || 0)
    },
    dailyStats,
    skillBreakdown: skillBreakdown.map(s => ({
      template: s.question_template,
      attempts: s.attempts,
      correct: s.correct,
      accuracy: s.accuracy,
      avgTimeMs: Math.round(s.avg_time_ms)
    })),
    recentHeats
  });
});

// Get classroom analytics
router.get('/classroom/:classroomId', requireTeacher, (req, res) => {
  const { classroomId } = req.params;

  // Verify classroom belongs to teacher
  const classroom = db.prepare(`
    SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?
  `).get(classroomId, req.teacher.id);

  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  // Class-wide daily stats
  const dailyStats = db.prepare(`
    SELECT
      DATE(r.answered_at) as date,
      COUNT(DISTINCT r.student_id) as active_students,
      COUNT(*) as total_questions,
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as accuracy
    FROM responses r
    JOIN heats h ON r.heat_id = h.id
    WHERE h.classroom_id = ?
      AND r.answered_at >= datetime('now', '-30 days')
    GROUP BY DATE(r.answered_at)
    ORDER BY date DESC
  `).all(classroomId);

  // Student leaderboard (30-day)
  const leaderboard = db.prepare(`
    SELECT
      s.id as student_id,
      s.display_name,
      COUNT(r.id) as total_questions,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as accuracy,
      AVG(r.response_time_ms) as avg_time_ms
    FROM students s
    LEFT JOIN responses r ON s.id = r.student_id
      AND r.answered_at >= datetime('now', '-30 days')
    WHERE s.classroom_id = ?
    GROUP BY s.id
    ORDER BY correct DESC, accuracy DESC
  `).all(classroomId);

  // Skills needing attention (lowest accuracy)
  const strugglingSkills = db.prepare(`
    SELECT
      r.question_template,
      COUNT(*) as attempts,
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as accuracy
    FROM responses r
    JOIN heats h ON r.heat_id = h.id
    WHERE h.classroom_id = ?
      AND r.answered_at >= datetime('now', '-30 days')
    GROUP BY r.question_template
    HAVING attempts >= 10
    ORDER BY accuracy ASC
    LIMIT 5
  `).all(classroomId);

  // Recent heats summary
  const recentHeats = db.prepare(`
    SELECT
      h.id,
      h.started_at,
      h.difficulty_level,
      h.status,
      COUNT(DISTINCT r.student_id) as participants,
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as accuracy
    FROM heats h
    LEFT JOIN responses r ON h.id = r.heat_id
    WHERE h.classroom_id = ?
    GROUP BY h.id
    ORDER BY h.started_at DESC
    LIMIT 10
  `).all(classroomId);

  res.json({
    classroom: {
      id: classroom.id,
      name: classroom.name,
      gradeLevel: classroom.grade_level
    },
    dailyStats,
    leaderboard: leaderboard.map((s, i) => ({
      rank: i + 1,
      studentId: s.student_id,
      displayName: s.display_name,
      totalQuestions: s.total_questions || 0,
      correct: s.correct || 0,
      accuracy: s.accuracy || 0,
      avgTimeMs: Math.round(s.avg_time_ms || 0)
    })),
    strugglingSkills,
    recentHeats
  });
});

// Export classroom data to CSV format
router.get('/classroom/:classroomId/export', requireTeacher, (req, res) => {
  const { classroomId } = req.params;

  // Verify classroom and check Pro tier
  const classroom = db.prepare(`
    SELECT c.*, t.tier FROM classrooms c
    JOIN teachers t ON c.teacher_id = t.id
    WHERE c.id = ? AND c.teacher_id = ?
  `).get(classroomId, req.teacher.id);

  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  if (classroom.tier === 'free') {
    return res.status(403).json({ error: 'Pro subscription required for export' });
  }

  // Get all student data
  const data = db.prepare(`
    SELECT
      s.display_name as "Student Name",
      COUNT(r.id) as "Total Questions",
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as "Correct Answers",
      ROUND(AVG(CASE WHEN r.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) as "Accuracy %",
      ROUND(AVG(r.response_time_ms) / 1000, 2) as "Avg Response (sec)",
      COUNT(DISTINCT h.id) as "Heats Participated"
    FROM students s
    LEFT JOIN responses r ON s.id = r.student_id
    LEFT JOIN heats h ON r.heat_id = h.id
    WHERE s.classroom_id = ?
    GROUP BY s.id
    ORDER BY s.display_name
  `).all(classroomId);

  // Convert to CSV
  if (data.length === 0) {
    return res.json({ csv: 'No data available' });
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => row[h]).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  res.json({ csv });
});

export default router;
