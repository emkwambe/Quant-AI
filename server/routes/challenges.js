import { Router } from 'express';
import db from '../db/index.js';
import { requireTeacher } from '../middleware/auth.js';
import { generateQuestions } from '../questions/generator.js';

const router = Router();

// Check if teacher has Pro (required for challenges)
function requirePro(req, res, next) {
  const teacher = db.prepare('SELECT tier FROM teachers WHERE id = ?')
    .get(req.teacher.id);

  if (teacher.tier !== 'pro') {
    return res.status(403).json({
      error: 'Pro subscription required for Class vs Class mode'
    });
  }
  next();
}

// Search for opponent classrooms (same school or by code)
router.get('/search', requireTeacher, requirePro, (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.json({ classrooms: [] });
  }

  // Search by join code or school name (not own classrooms)
  const classrooms = db.prepare(`
    SELECT
      c.id, c.name, c.grade_level, c.join_code,
      t.name as teacher_name, t.school_name
    FROM classrooms c
    JOIN teachers t ON c.teacher_id = t.id
    WHERE c.teacher_id != ?
      AND (
        UPPER(c.join_code) = UPPER(?)
        OR LOWER(t.school_name) LIKE LOWER(?)
      )
    LIMIT 10
  `).all(req.teacher.id, query, `%${query}%`);

  res.json({
    classrooms: classrooms.map(c => ({
      id: c.id,
      name: c.name,
      gradeLevel: c.grade_level,
      joinCode: c.join_code,
      teacherName: c.teacher_name,
      schoolName: c.school_name
    }))
  });
});

// Get pending challenges for my classrooms
router.get('/pending', requireTeacher, (req, res) => {
  // Challenges where I'm the opponent and haven't accepted yet
  const incoming = db.prepare(`
    SELECT
      ch.id, ch.difficulty_level, ch.status, ch.created_at,
      c1.id as challenger_id, c1.name as challenger_name,
      t1.name as challenger_teacher,
      c2.id as my_classroom_id, c2.name as my_classroom_name
    FROM challenges ch
    JOIN classrooms c1 ON ch.challenger_classroom_id = c1.id
    JOIN teachers t1 ON c1.teacher_id = t1.id
    JOIN classrooms c2 ON ch.opponent_classroom_id = c2.id
    WHERE c2.teacher_id = ? AND ch.status = 'pending'
    ORDER BY ch.created_at DESC
  `).all(req.teacher.id);

  // Challenges I sent that are pending
  const outgoing = db.prepare(`
    SELECT
      ch.id, ch.difficulty_level, ch.status, ch.created_at,
      c1.id as my_classroom_id, c1.name as my_classroom_name,
      c2.id as opponent_id, c2.name as opponent_name,
      t2.name as opponent_teacher
    FROM challenges ch
    JOIN classrooms c1 ON ch.challenger_classroom_id = c1.id
    JOIN classrooms c2 ON ch.opponent_classroom_id = c2.id
    JOIN teachers t2 ON c2.teacher_id = t2.id
    WHERE c1.teacher_id = ? AND ch.status = 'pending'
    ORDER BY ch.created_at DESC
  `).all(req.teacher.id);

  res.json({ incoming, outgoing });
});

// Create a challenge
router.post('/create', requireTeacher, requirePro, (req, res) => {
  const { myClassroomId, opponentClassroomId, difficultyLevel } = req.body;

  // Verify my classroom
  const myClassroom = db.prepare(`
    SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?
  `).get(myClassroomId, req.teacher.id);

  if (!myClassroom) {
    return res.status(404).json({ error: 'Your classroom not found' });
  }

  // Verify opponent exists
  const opponent = db.prepare('SELECT * FROM classrooms WHERE id = ?')
    .get(opponentClassroomId);

  if (!opponent) {
    return res.status(404).json({ error: 'Opponent classroom not found' });
  }

  if (opponent.teacher_id === req.teacher.id) {
    return res.status(400).json({ error: 'Cannot challenge your own classroom' });
  }

  // Create challenge
  const result = db.prepare(`
    INSERT INTO challenges (challenger_classroom_id, opponent_classroom_id, difficulty_level)
    VALUES (?, ?, ?)
  `).run(myClassroomId, opponentClassroomId, difficultyLevel || 2);

  res.json({
    id: result.lastInsertRowid,
    status: 'pending',
    message: 'Challenge sent! Waiting for opponent to accept.'
  });
});

// Accept a challenge
router.post('/:id/accept', requireTeacher, (req, res) => {
  const challenge = db.prepare(`
    SELECT ch.*, c.teacher_id as opponent_teacher_id
    FROM challenges ch
    JOIN classrooms c ON ch.opponent_classroom_id = c.id
    WHERE ch.id = ? AND ch.status = 'pending'
  `).get(req.params.id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  if (challenge.opponent_teacher_id !== req.teacher.id) {
    return res.status(403).json({ error: 'Not your challenge to accept' });
  }

  // Update to accepted
  db.prepare(`
    UPDATE challenges SET status = 'accepted' WHERE id = ?
  `).run(challenge.id);

  res.json({
    id: challenge.id,
    status: 'accepted',
    message: 'Challenge accepted! Both classes can now start their heats.'
  });
});

// Decline a challenge
router.post('/:id/decline', requireTeacher, (req, res) => {
  const challenge = db.prepare(`
    SELECT ch.*, c.teacher_id as opponent_teacher_id
    FROM challenges ch
    JOIN classrooms c ON ch.opponent_classroom_id = c.id
    WHERE ch.id = ? AND ch.status = 'pending'
  `).get(req.params.id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  if (challenge.opponent_teacher_id !== req.teacher.id) {
    return res.status(403).json({ error: 'Not your challenge to decline' });
  }

  db.prepare('DELETE FROM challenges WHERE id = ?').run(challenge.id);

  res.json({ success: true });
});

// Start my side of the challenge (creates a heat linked to challenge)
router.post('/:id/start', requireTeacher, (req, res) => {
  const { classroomId } = req.body;

  const challenge = db.prepare(`
    SELECT * FROM challenges WHERE id = ? AND status = 'accepted'
  `).get(req.params.id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found or not accepted' });
  }

  // Verify classroom is part of this challenge and belongs to teacher
  const isChallenger = challenge.challenger_classroom_id === classroomId;
  const isOpponent = challenge.opponent_classroom_id === classroomId;

  if (!isChallenger && !isOpponent) {
    return res.status(400).json({ error: 'Classroom not part of this challenge' });
  }

  const classroom = db.prepare(`
    SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?
  `).get(classroomId, req.teacher.id);

  if (!classroom) {
    return res.status(403).json({ error: 'Not your classroom' });
  }

  // Check if already started
  const existing = db.prepare(`
    SELECT * FROM challenge_heats
    WHERE challenge_id = ? AND classroom_id = ?
  `).get(challenge.id, classroomId);

  if (existing) {
    return res.status(400).json({ error: 'Already started your heat for this challenge' });
  }

  // Create heat
  const heatResult = db.prepare(`
    INSERT INTO heats (classroom_id, difficulty_level, status, started_at)
    VALUES (?, ?, 'active', datetime('now'))
  `).run(classroomId, challenge.difficulty_level);

  const heatId = heatResult.lastInsertRowid;

  // Link to challenge
  db.prepare(`
    INSERT INTO challenge_heats (challenge_id, heat_id, classroom_id)
    VALUES (?, ?, ?)
  `).run(challenge.id, heatId, classroomId);

  // Update challenge status to active if not already
  if (challenge.status === 'accepted') {
    db.prepare(`
      UPDATE challenges SET status = 'active', started_at = datetime('now')
      WHERE id = ?
    `).run(challenge.id);
  }

  // Generate questions
  const questions = generateQuestions(challenge.difficulty_level, 20, heatId);

  res.json({
    heatId,
    challengeId: challenge.id,
    questions: questions.map((q, i) => ({
      index: i,
      display: q.display
    })),
    durationSeconds: 120
  });
});

// Get challenge results
router.get('/:id/results', requireTeacher, (req, res) => {
  const challenge = db.prepare(`
    SELECT * FROM challenges WHERE id = ?
  `).get(req.params.id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  // Get both sides' heats
  const challengeHeats = db.prepare(`
    SELECT
      ch.classroom_id,
      ch.heat_id,
      c.name as classroom_name,
      t.name as teacher_name,
      (
        SELECT COUNT(*) FROM responses r
        WHERE r.heat_id = ch.heat_id AND r.is_correct = 1
      ) as total_correct,
      (
        SELECT COUNT(*) FROM responses r WHERE r.heat_id = ch.heat_id
      ) as total_answered,
      (
        SELECT COUNT(DISTINCT student_id) FROM responses r
        WHERE r.heat_id = ch.heat_id
      ) as participants
    FROM challenge_heats ch
    JOIN classrooms c ON ch.classroom_id = c.id
    JOIN teachers t ON c.teacher_id = t.id
    WHERE ch.challenge_id = ?
  `).all(challenge.id);

  // Determine winner if both completed
  let winner = null;
  if (challengeHeats.length === 2) {
    const [team1, team2] = challengeHeats;
    if (team1.total_correct > team2.total_correct) {
      winner = team1.classroom_id;
    } else if (team2.total_correct > team1.total_correct) {
      winner = team2.classroom_id;
    }
    // Tie = no winner
  }

  res.json({
    challenge: {
      id: challenge.id,
      status: challenge.status,
      difficultyLevel: challenge.difficulty_level,
      startedAt: challenge.started_at,
      endedAt: challenge.ended_at,
      winnerId: winner
    },
    teams: challengeHeats.map(h => ({
      classroomId: h.classroom_id,
      classroomName: h.classroom_name,
      teacherName: h.teacher_name,
      totalCorrect: h.total_correct || 0,
      totalAnswered: h.total_answered || 0,
      participants: h.participants || 0,
      isWinner: winner === h.classroom_id
    }))
  });
});

// Get active/recent challenges for my classrooms
router.get('/my', requireTeacher, (req, res) => {
  const challenges = db.prepare(`
    SELECT
      ch.*,
      c1.name as challenger_name,
      c2.name as opponent_name,
      t1.name as challenger_teacher,
      t2.name as opponent_teacher,
      CASE
        WHEN c1.teacher_id = ? THEN 'challenger'
        ELSE 'opponent'
      END as my_role
    FROM challenges ch
    JOIN classrooms c1 ON ch.challenger_classroom_id = c1.id
    JOIN classrooms c2 ON ch.opponent_classroom_id = c2.id
    JOIN teachers t1 ON c1.teacher_id = t1.id
    JOIN teachers t2 ON c2.teacher_id = t2.id
    WHERE c1.teacher_id = ? OR c2.teacher_id = ?
    ORDER BY ch.created_at DESC
    LIMIT 20
  `).all(req.teacher.id, req.teacher.id, req.teacher.id);

  res.json({ challenges });
});

export default router;
