// server/routes/skill-sessions.js
import { Router } from 'express';
import db from '../db/adapter.js';
import { updateProgress, calculatePoints, getLevelInfo } from '../utils/mastery.js';
import { generateSkillQuestions } from '../questions/skill-generator.js';

const router = Router();

// POST /api/skill-sessions/start
router.post('/start', (req, res) => {
  try {
    const { studentId, skillId, questionCount = 10, difficulty = 2 } = req.body;
    const skill = db.queryOne('SELECT * FROM skills WHERE id = ?', [skillId]);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });

    const result = db.execute('INSERT INTO skill_sessions (student_id, skill_id, question_count, difficulty) VALUES (?, ?, ?, ?)', [studentId, skillId, questionCount, difficulty]);
    const sessionId = result.lastInsertRowid;
    const questions = generateSkillQuestions(skill.slug, questionCount, difficulty, sessionId);

    res.json({
      sessionId,
      skill: { id: skill.id, name: skill.name },
      questions: questions.map((q, i) => ({ number: i + 1, ...q, correctAnswer: undefined }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// POST /api/skill-sessions/answer
router.post('/answer', (req, res) => {
  try {
    const { sessionId, questionNumber, answer, responseTimeMs, studentId } = req.body;
    const session = db.queryOne('SELECT ss.*, s.slug as skill_slug FROM skill_sessions ss JOIN skills s ON ss.skill_id = s.id WHERE ss.id = ? AND ss.status = ?', [sessionId, 'active']);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const questions = generateSkillQuestions(session.skill_slug, session.question_count, session.difficulty, sessionId);
    const question = questions[questionNumber - 1];
    if (!question) return res.status(400).json({ error: 'Invalid question' });

    const isCorrect = String(answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    const progress = db.queryOne('SELECT * FROM student_skill_progress WHERE student_id = ? AND skill_id = ?', [studentId, session.skill_id]) || { current_streak: 0 };
    const points = calculatePoints(isCorrect, responseTimeMs, session.difficulty, progress.current_streak);

    db.execute('INSERT INTO skill_responses (session_id, skill_id, question_number, question_text, student_answer, correct_answer, is_correct, points_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [sessionId, session.skill_id, questionNumber, question.question, String(answer), String(question.correctAnswer), isCorrect ? 1 : 0, points]);
    db.execute('UPDATE skill_sessions SET score = score + ?, correct_count = correct_count + ? WHERE id = ?', [points, isCorrect ? 1 : 0, sessionId]);

    let currentProgress = db.queryOne('SELECT * FROM student_skill_progress WHERE student_id = ? AND skill_id = ?', [studentId, session.skill_id]);
    if (!currentProgress) {
      db.execute('INSERT INTO student_skill_progress (student_id, skill_id) VALUES (?, ?)', [studentId, session.skill_id]);
      currentProgress = { total_attempts: 0, correct_answers: 0, current_streak: 0, best_streak: 0, current_level: 0 };
    }
    const updates = updateProgress(currentProgress, isCorrect, responseTimeMs);
    db.execute('UPDATE student_skill_progress SET total_attempts = ?, correct_answers = ?, current_streak = ?, best_streak = ?, current_level = ? WHERE student_id = ? AND skill_id = ?', [updates.total_attempts, updates.correct_answers, updates.current_streak, updates.best_streak, updates.current_level, studentId, session.skill_id]);

    const answeredCount = db.queryOne('SELECT COUNT(*) as count FROM skill_responses WHERE session_id = ?', [sessionId]).count;
    const isComplete = answeredCount >= session.question_count;
    if (isComplete) {
      db.execute('UPDATE skill_sessions SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?', ['completed', sessionId]);
    }

    res.json({ isCorrect, correctAnswer: question.correctAnswer, pointsEarned: points, currentStreak: updates.current_streak, currentLevel: updates.current_level, levelInfo: getLevelInfo(updates.current_level), isComplete });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// GET /api/skill-sessions/:sessionId/results
router.get('/:sessionId/results', (req, res) => {
  try {
    const session = db.queryOne('SELECT ss.*, s.name as skill_name FROM skill_sessions ss JOIN skills s ON ss.skill_id = s.id WHERE ss.id = ?', [req.params.sessionId]);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const responses = db.query('SELECT * FROM skill_responses WHERE session_id = ? ORDER BY question_number', [session.id]);
    res.json({ session, responses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;
