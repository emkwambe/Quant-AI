import { Router } from 'express';
import db from '../db/index.js';
import { requireTeacher, requireStudent } from '../middleware/auth.js';
import {
  generateRoundRobin,
  generateRoundSchedule,
  calculateTournamentDuration,
  determineWinner,
  calculatePoints,
  rankStandings,
  shuffleArray
} from '../tournaments/generator.js';

const router = Router();

// ============================================
// TEACHER ENDPOINTS
// ============================================

// Get all tournaments for teacher's classrooms
router.get('/', requireTeacher, (req, res) => {
  const tournaments = db.prepare(`
    SELECT t.*, c.name as classroom_name, c.grade_level,
           (SELECT COUNT(*) FROM students WHERE classroom_id = t.classroom_id) as student_count,
           (SELECT COUNT(*) FROM tournament_rounds WHERE tournament_id = t.id) as round_count,
           (SELECT COUNT(*) FROM tournament_rounds WHERE tournament_id = t.id AND status = 'completed') as completed_rounds
    FROM tournaments t
    JOIN classrooms c ON t.classroom_id = c.id
    WHERE c.teacher_id = ?
    ORDER BY t.created_at DESC
  `).all(req.teacher.id);

  res.json(tournaments);
});

// Get single tournament with full details
router.get('/:id', requireTeacher, (req, res) => {
  const tournament = db.prepare(`
    SELECT t.*, c.name as classroom_name, c.grade_level
    FROM tournaments t
    JOIN classrooms c ON t.classroom_id = c.id
    WHERE t.id = ? AND c.teacher_id = ?
  `).get(req.params.id, req.teacher.id);

  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  // Get rounds
  const rounds = db.prepare(`
    SELECT * FROM tournament_rounds
    WHERE tournament_id = ?
    ORDER BY round_number
  `).all(tournament.id);

  // Get standings
  const standings = db.prepare(`
    SELECT ts.*, s.display_name
    FROM tournament_standings ts
    JOIN students s ON ts.student_id = s.id
    WHERE ts.tournament_id = ?
    ORDER BY ts.rank ASC, ts.total_points DESC
  `).all(tournament.id);

  // Get recent activity
  const events = db.prepare(`
    SELECT * FROM tournament_events
    WHERE tournament_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(tournament.id);

  res.json({ ...tournament, rounds, standings, events });
});

// Create new tournament
router.post('/', requireTeacher, (req, res) => {
  const { classroomId, name, season, difficultyLevel, roundsPerWeek, questionsPerMatch, startDate } = req.body;

  // Verify classroom ownership
  const classroom = db.prepare(`
    SELECT c.*, COUNT(s.id) as student_count
    FROM classrooms c
    LEFT JOIN students s ON s.classroom_id = c.id
    WHERE c.id = ? AND c.teacher_id = ?
    GROUP BY c.id
  `).get(classroomId, req.teacher.id);

  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  if (classroom.student_count < 2) {
    return res.status(400).json({ error: 'Need at least 2 students to create a tournament' });
  }

  // Check for active tournament in this classroom
  const activeTournament = db.prepare(`
    SELECT id FROM tournaments
    WHERE classroom_id = ? AND status IN ('draft', 'active')
  `).get(classroomId);

  if (activeTournament) {
    return res.status(400).json({ error: 'Classroom already has an active tournament' });
  }

  // Calculate duration
  const duration = calculateTournamentDuration(classroom.student_count, roundsPerWeek || 1);
  const start = new Date(startDate || Date.now());
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + (duration.weeksNeeded * 7));

  // Create tournament
  const result = db.prepare(`
    INSERT INTO tournaments (classroom_id, name, season, status, difficulty_level, rounds_per_week, questions_per_match, start_date, end_date)
    VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?)
  `).run(
    classroomId,
    name || `${classroom.name} Tournament`,
    season || `${new Date().getFullYear()}`,
    difficultyLevel || 3,
    roundsPerWeek || 1,
    questionsPerMatch || 10,
    start.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  const tournamentId = result.lastInsertRowid;

  // Get students and generate schedule
  const students = db.prepare('SELECT id FROM students WHERE classroom_id = ?').all(classroomId);
  const studentIds = shuffleArray(students.map(s => s.id)); // Random initial seeding

  // Generate rounds
  const roundSchedule = generateRoundSchedule(start, duration.totalRounds, roundsPerWeek || 1);
  const matchups = generateRoundRobin(studentIds);

  // Insert rounds and matchups
  roundSchedule.forEach((schedule, index) => {
    const roundResult = db.prepare(`
      INSERT INTO tournament_rounds (tournament_id, round_number, status, opens_at, closes_at)
      VALUES (?, ?, 'pending', ?, ?)
    `).run(
      tournamentId,
      schedule.roundNumber,
      schedule.opensAt.toISOString(),
      schedule.closesAt.toISOString()
    );

    const roundId = roundResult.lastInsertRowid;

    // Insert matchups for this round
    matchups[index]?.forEach(matchup => {
      db.prepare(`
        INSERT INTO tournament_matchups (round_id, student_a_id, student_b_id, status)
        VALUES (?, ?, ?, 'pending')
      `).run(roundId, matchup.studentA, matchup.studentB);
    });
  });

  // Initialize standings for all students
  studentIds.filter(id => id !== null).forEach(studentId => {
    db.prepare(`
      INSERT INTO tournament_standings (tournament_id, student_id)
      VALUES (?, ?)
    `).run(tournamentId, studentId);
  });

  // Log event
  db.prepare(`
    INSERT INTO tournament_events (tournament_id, event_type, details)
    VALUES (?, 'created', ?)
  `).run(tournamentId, JSON.stringify({ student_count: classroom.student_count, rounds: duration.totalRounds }));

  res.json({
    id: tournamentId,
    ...duration,
    startDate: start.toISOString(),
    endDate: endDate.toISOString()
  });
});

// Start tournament (move from draft to active)
router.post('/:id/start', requireTeacher, (req, res) => {
  const tournament = db.prepare(`
    SELECT t.* FROM tournaments t
    JOIN classrooms c ON t.classroom_id = c.id
    WHERE t.id = ? AND c.teacher_id = ?
  `).get(req.params.id, req.teacher.id);

  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  if (tournament.status !== 'draft') {
    return res.status(400).json({ error: 'Tournament already started or completed' });
  }

  // Activate tournament
  db.prepare(`UPDATE tournaments SET status = 'active' WHERE id = ?`).run(tournament.id);

  // Activate first round if it should be open
  const firstRound = db.prepare(`
    SELECT * FROM tournament_rounds
    WHERE tournament_id = ? AND round_number = 1
  `).get(tournament.id);

  if (firstRound && new Date(firstRound.opens_at) <= new Date()) {
    db.prepare(`UPDATE tournament_rounds SET status = 'active' WHERE id = ?`).run(firstRound.id);
  }

  // Log event
  db.prepare(`
    INSERT INTO tournament_events (tournament_id, event_type, details)
    VALUES (?, 'started', ?)
  `).run(tournament.id, JSON.stringify({ started_by: req.teacher.id }));

  res.json({ success: true, status: 'active' });
});

// Get round details with matchups
router.get('/:id/rounds/:roundNumber', requireTeacher, (req, res) => {
  const tournament = db.prepare(`
    SELECT t.* FROM tournaments t
    JOIN classrooms c ON t.classroom_id = c.id
    WHERE t.id = ? AND c.teacher_id = ?
  `).get(req.params.id, req.teacher.id);

  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const round = db.prepare(`
    SELECT * FROM tournament_rounds
    WHERE tournament_id = ? AND round_number = ?
  `).get(tournament.id, req.params.roundNumber);

  if (!round) {
    return res.status(404).json({ error: 'Round not found' });
  }

  const matchups = db.prepare(`
    SELECT m.*,
           sa.display_name as student_a_name,
           sb.display_name as student_b_name
    FROM tournament_matchups m
    LEFT JOIN students sa ON m.student_a_id = sa.id
    LEFT JOIN students sb ON m.student_b_id = sb.id
    WHERE m.round_id = ?
    ORDER BY m.id
  `).all(round.id);

  res.json({ round, matchups });
});

// ============================================
// STUDENT ENDPOINTS
// ============================================

// Get active tournament for student's classroom
router.get('/student/active', requireStudent, (req, res) => {
  const tournament = db.prepare(`
    SELECT t.*, c.name as classroom_name
    FROM tournaments t
    JOIN classrooms c ON t.classroom_id = c.id
    WHERE c.id = ? AND t.status = 'active'
  `).get(req.student.classroom_id);

  if (!tournament) {
    return res.json({ active: false });
  }

  // Get current round
  const currentRound = db.prepare(`
    SELECT * FROM tournament_rounds
    WHERE tournament_id = ? AND status = 'active'
    ORDER BY round_number DESC
    LIMIT 1
  `).get(tournament.id);

  // Get student's standing
  const standing = db.prepare(`
    SELECT * FROM tournament_standings
    WHERE tournament_id = ? AND student_id = ?
  `).get(tournament.id, req.student.id);

  // Get student's matchup for current round
  let currentMatchup = null;
  if (currentRound) {
    currentMatchup = db.prepare(`
      SELECT m.*, s.display_name as opponent_name
      FROM tournament_matchups m
      LEFT JOIN students s ON (
        CASE WHEN m.student_a_id = ? THEN m.student_b_id ELSE m.student_a_id END
      ) = s.id
      WHERE m.round_id = ? AND (m.student_a_id = ? OR m.student_b_id = ?)
    `).get(req.student.id, currentRound.id, req.student.id, req.student.id);
  }

  res.json({
    active: true,
    tournament,
    currentRound,
    standing,
    currentMatchup
  });
});

// Get tournament standings (student view)
router.get('/student/standings', requireStudent, (req, res) => {
  const tournament = db.prepare(`
    SELECT t.* FROM tournaments t
    JOIN classrooms c ON t.classroom_id = c.id
    WHERE c.id = ? AND t.status IN ('active', 'completed')
    ORDER BY t.created_at DESC
    LIMIT 1
  `).get(req.student.classroom_id);

  if (!tournament) {
    return res.json({ standings: [] });
  }

  const standings = db.prepare(`
    SELECT ts.*, s.display_name,
           CASE WHEN ts.student_id = ? THEN 1 ELSE 0 END as is_me
    FROM tournament_standings ts
    JOIN students s ON ts.student_id = s.id
    WHERE ts.tournament_id = ?
    ORDER BY ts.rank ASC, ts.total_points DESC
  `).all(req.student.id, tournament.id);

  res.json({ tournament, standings });
});

// Start a tournament match (student begins their matchup)
router.post('/student/match/:matchupId/start', requireStudent, (req, res) => {
  // Verify matchup belongs to student and is in active round
  const matchup = db.prepare(`
    SELECT m.*, r.tournament_id, r.status as round_status, t.questions_per_match, t.difficulty_level
    FROM tournament_matchups m
    JOIN tournament_rounds r ON m.round_id = r.id
    JOIN tournaments t ON r.tournament_id = t.id
    WHERE m.id = ? AND (m.student_a_id = ? OR m.student_b_id = ?)
  `).get(req.params.matchupId, req.student.id, req.student.id);

  if (!matchup) {
    return res.status(404).json({ error: 'Matchup not found' });
  }

  if (matchup.round_status !== 'active') {
    return res.status(400).json({ error: 'Round is not active' });
  }

  if (matchup.status === 'completed') {
    return res.status(400).json({ error: 'Match already completed' });
  }

  // Check if this is a bye
  if (!matchup.student_b_id && matchup.student_a_id === req.student.id) {
    // Auto-win for bye
    db.prepare(`
      UPDATE tournament_matchups
      SET status = 'completed', winner_student_id = ?, student_a_score = 0, completed_at = datetime('now')
      WHERE id = ?
    `).run(req.student.id, matchup.id);

    // Update standings
    updateStandings(matchup.tournament_id, req.student.id, true, false, true);

    return res.json({ bye: true, winner: req.student.id });
  }

  // Create a heat for this match if not exists
  let heatId = matchup.heat_id;
  if (!heatId) {
    const classroom = db.prepare('SELECT id FROM classrooms WHERE id = ?').get(req.student.classroom_id);

    const heatResult = db.prepare(`
      INSERT INTO heats (classroom_id, difficulty_level, question_count, duration_seconds, status, started_at)
      VALUES (?, ?, ?, 300, 'active', datetime('now'))
    `).run(classroom.id, matchup.difficulty_level, matchup.questions_per_match);

    heatId = heatResult.lastInsertRowid;

    db.prepare(`UPDATE tournament_matchups SET heat_id = ?, status = 'active' WHERE id = ?`)
      .run(heatId, matchup.id);
  }

  res.json({ heatId, questionsCount: matchup.questions_per_match });
});

// Complete a tournament match (called after heat ends)
router.post('/student/match/:matchupId/complete', requireStudent, (req, res) => {
  const matchup = db.prepare(`
    SELECT m.*, r.tournament_id
    FROM tournament_matchups m
    JOIN tournament_rounds r ON m.round_id = r.id
    WHERE m.id = ? AND (m.student_a_id = ? OR m.student_b_id = ?)
  `).get(req.params.matchupId, req.student.id, req.student.id);

  if (!matchup || matchup.status === 'completed') {
    return res.status(400).json({ error: 'Invalid matchup or already completed' });
  }

  // Get scores from heat responses
  const studentAStats = db.prepare(`
    SELECT COUNT(*) as total, SUM(is_correct) as correct, AVG(response_time_ms) as avg_time
    FROM responses WHERE heat_id = ? AND student_id = ?
  `).get(matchup.heat_id, matchup.student_a_id);

  const studentBStats = matchup.student_b_id ? db.prepare(`
    SELECT COUNT(*) as total, SUM(is_correct) as correct, AVG(response_time_ms) as avg_time
    FROM responses WHERE heat_id = ? AND student_id = ?
  `).get(matchup.heat_id, matchup.student_b_id) : null;

  const scoreA = studentAStats?.correct || 0;
  const scoreB = studentBStats?.correct || 0;
  const accuracyA = studentAStats?.total > 0 ? (scoreA / studentAStats.total) * 100 : 0;
  const accuracyB = studentBStats?.total > 0 ? (scoreB / studentBStats.total) * 100 : 0;

  // Update matchup with scores
  db.prepare(`
    UPDATE tournament_matchups SET
      student_a_score = ?, student_b_score = ?,
      student_a_accuracy = ?, student_b_accuracy = ?,
      student_a_avg_time_ms = ?, student_b_avg_time_ms = ?
    WHERE id = ?
  `).run(
    scoreA, scoreB,
    accuracyA, accuracyB,
    studentAStats?.avg_time || null, studentBStats?.avg_time || null,
    matchup.id
  );

  // Determine winner
  const updatedMatchup = db.prepare('SELECT * FROM tournament_matchups WHERE id = ?').get(matchup.id);
  const { winnerId, isTie } = determineWinner(updatedMatchup);

  // Finalize matchup
  db.prepare(`
    UPDATE tournament_matchups SET
      status = 'completed', winner_student_id = ?, is_tie = ?, completed_at = datetime('now')
    WHERE id = ?
  `).run(winnerId, isTie ? 1 : 0, matchup.id);

  // Update standings for both players
  if (matchup.student_a_id) {
    const aWon = winnerId === matchup.student_a_id;
    updateStandings(matchup.tournament_id, matchup.student_a_id, aWon, isTie, false, scoreA, studentAStats?.total || 0, studentAStats?.avg_time);
  }
  if (matchup.student_b_id) {
    const bWon = winnerId === matchup.student_b_id;
    updateStandings(matchup.tournament_id, matchup.student_b_id, bWon, isTie, false, scoreB, studentBStats?.total || 0, studentBStats?.avg_time);
  }

  // Check if round is complete
  checkRoundCompletion(matchup.round_id);

  res.json({ winnerId, isTie, scoreA, scoreB });
});

// Helper: Update standings
function updateStandings(tournamentId, studentId, won, tied, isBye, correct = 0, total = 0, avgTime = null) {
  const points = calculatePoints(won, tied, isBye);

  db.prepare(`
    UPDATE tournament_standings SET
      matches_played = matches_played + 1,
      matches_won = matches_won + ?,
      matches_lost = matches_lost + ?,
      matches_tied = matches_tied + ?,
      total_points = total_points + ?,
      total_correct = total_correct + ?,
      total_questions = total_questions + ?,
      current_streak = CASE WHEN ? THEN current_streak + 1 ELSE 0 END,
      best_streak = MAX(best_streak, CASE WHEN ? THEN current_streak + 1 ELSE best_streak END),
      last_updated = datetime('now')
    WHERE tournament_id = ? AND student_id = ?
  `).run(
    won ? 1 : 0,
    (!won && !tied) ? 1 : 0,
    tied ? 1 : 0,
    points,
    correct,
    total,
    won,
    won,
    tournamentId,
    studentId
  );

  // Recalculate avg accuracy and response time
  db.prepare(`
    UPDATE tournament_standings SET
      avg_accuracy = CASE WHEN total_questions > 0 THEN (total_correct * 100.0 / total_questions) ELSE 0 END
    WHERE tournament_id = ? AND student_id = ?
  `).run(tournamentId, studentId);

  // Update ranks
  recalculateRanks(tournamentId);
}

// Helper: Recalculate ranks for a tournament
function recalculateRanks(tournamentId) {
  const standings = db.prepare(`
    SELECT * FROM tournament_standings WHERE tournament_id = ?
  `).all(tournamentId);

  const ranked = rankStandings(standings);

  ranked.forEach(standing => {
    db.prepare(`UPDATE tournament_standings SET rank = ? WHERE id = ?`)
      .run(standing.rank, standing.id);
  });
}

// Helper: Check if a round is complete and advance
function checkRoundCompletion(roundId) {
  const incomplete = db.prepare(`
    SELECT COUNT(*) as count FROM tournament_matchups
    WHERE round_id = ? AND status != 'completed'
  `).get(roundId);

  if (incomplete.count === 0) {
    // Round complete
    const round = db.prepare('SELECT * FROM tournament_rounds WHERE id = ?').get(roundId);

    db.prepare(`UPDATE tournament_rounds SET status = 'completed' WHERE id = ?`).run(roundId);

    // Log event
    db.prepare(`
      INSERT INTO tournament_events (tournament_id, round_id, event_type, details)
      VALUES (?, ?, 'round_completed', ?)
    `).run(round.tournament_id, roundId, JSON.stringify({ round_number: round.round_number }));

    // Check if next round should start
    const nextRound = db.prepare(`
      SELECT * FROM tournament_rounds
      WHERE tournament_id = ? AND round_number = ?
    `).get(round.tournament_id, round.round_number + 1);

    if (nextRound && new Date(nextRound.opens_at) <= new Date()) {
      db.prepare(`UPDATE tournament_rounds SET status = 'active' WHERE id = ?`).run(nextRound.id);
    }

    // Check if tournament is complete
    const pendingRounds = db.prepare(`
      SELECT COUNT(*) as count FROM tournament_rounds
      WHERE tournament_id = ? AND status != 'completed'
    `).get(round.tournament_id);

    if (pendingRounds.count === 0) {
      db.prepare(`UPDATE tournaments SET status = 'completed' WHERE id = ?`)
        .run(round.tournament_id);

      db.prepare(`
        INSERT INTO tournament_events (tournament_id, event_type, details)
        VALUES (?, 'completed', ?)
      `).run(round.tournament_id, JSON.stringify({ final_round: round.round_number }));
    }
  }
}

export default router;
