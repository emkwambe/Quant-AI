/**
 * Tournament Generator
 *
 * Generates round-robin matchups for classroom tournaments.
 * Uses the "circle method" algorithm to ensure every student
 * plays every other student exactly once.
 */

/**
 * Generate a complete round-robin schedule
 * @param {number[]} studentIds - Array of student IDs
 * @returns {Array<Array<{studentA: number, studentB: number|null}>>} - Rounds with matchups
 */
export function generateRoundRobin(studentIds) {
  const students = [...studentIds];

  // If odd number of students, add null for bye
  if (students.length % 2 !== 0) {
    students.push(null);
  }

  const n = students.length;
  const rounds = [];
  const numRounds = n - 1;

  // Circle method: fix first position, rotate others
  for (let round = 0; round < numRounds; round++) {
    const matchups = [];

    for (let i = 0; i < n / 2; i++) {
      const studentA = students[i];
      const studentB = students[n - 1 - i];

      // Skip if both are null (shouldn't happen)
      if (studentA === null && studentB === null) continue;

      // Ensure studentA is never null (swap if needed)
      if (studentA === null) {
        matchups.push({ studentA: studentB, studentB: null });
      } else {
        matchups.push({ studentA, studentB });
      }
    }

    rounds.push(matchups);

    // Rotate: keep first element fixed, rotate rest
    const fixed = students[0];
    const last = students.pop();
    students.splice(1, 0, last);
    students[0] = fixed;
  }

  return rounds;
}

/**
 * Generate weekly round schedule
 * @param {Date} startDate - Tournament start date
 * @param {number} numRounds - Number of rounds
 * @param {number} roundsPerWeek - How many rounds per week (default 1)
 * @returns {Array<{roundNumber: number, opensAt: Date, closesAt: Date}>}
 */
export function generateRoundSchedule(startDate, numRounds, roundsPerWeek = 1) {
  const schedule = [];
  const start = new Date(startDate);

  // Start on Monday of the start week
  const dayOfWeek = start.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
  start.setDate(start.getDate() + daysUntilMonday);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < numRounds; i++) {
    const weekOffset = Math.floor(i / roundsPerWeek);
    const opensAt = new Date(start);
    opensAt.setDate(start.getDate() + (weekOffset * 7));

    const closesAt = new Date(opensAt);
    closesAt.setDate(opensAt.getDate() + 6); // Closes on Sunday
    closesAt.setHours(23, 59, 59, 999);

    schedule.push({
      roundNumber: i + 1,
      opensAt,
      closesAt
    });
  }

  return schedule;
}

/**
 * Calculate tournament duration info
 * @param {number} studentCount - Number of students
 * @param {number} roundsPerWeek - Rounds per week
 * @returns {{totalRounds: number, weeksNeeded: number, matchupsPerRound: number}}
 */
export function calculateTournamentDuration(studentCount, roundsPerWeek = 1) {
  const effectiveCount = studentCount % 2 === 0 ? studentCount : studentCount + 1;
  const totalRounds = effectiveCount - 1;
  const matchupsPerRound = effectiveCount / 2;
  const weeksNeeded = Math.ceil(totalRounds / roundsPerWeek);

  return {
    totalRounds,
    matchupsPerRound,
    weeksNeeded,
    totalMatches: totalRounds * matchupsPerRound,
    hasByes: studentCount % 2 !== 0
  };
}

/**
 * Determine match winner based on scoring rules
 * @param {Object} matchup - Matchup with scores
 * @returns {{winnerId: number|null, isTie: boolean}}
 */
export function determineWinner(matchup) {
  const { student_a_id, student_b_id, student_a_score, student_b_score,
          student_a_accuracy, student_b_accuracy,
          student_a_avg_time_ms, student_b_avg_time_ms } = matchup;

  // Bye - student_a automatically wins
  if (!student_b_id) {
    return { winnerId: student_a_id, isTie: false };
  }

  // Primary: Most correct answers
  if (student_a_score > student_b_score) {
    return { winnerId: student_a_id, isTie: false };
  }
  if (student_b_score > student_a_score) {
    return { winnerId: student_b_id, isTie: false };
  }

  // Tiebreaker 1: Higher accuracy (if different question counts)
  if (Math.abs(student_a_accuracy - student_b_accuracy) > 0.001) {
    return {
      winnerId: student_a_accuracy > student_b_accuracy ? student_a_id : student_b_id,
      isTie: false
    };
  }

  // Tiebreaker 2: Faster average response time
  if (student_a_avg_time_ms && student_b_avg_time_ms) {
    if (student_a_avg_time_ms < student_b_avg_time_ms) {
      return { winnerId: student_a_id, isTie: false };
    }
    if (student_b_avg_time_ms < student_a_avg_time_ms) {
      return { winnerId: student_b_id, isTie: false };
    }
  }

  // True tie
  return { winnerId: null, isTie: true };
}

/**
 * Calculate standings points for a match result
 * @param {boolean} won
 * @param {boolean} tied
 * @param {boolean} isBye
 * @returns {number}
 */
export function calculatePoints(won, tied, isBye = false) {
  if (isBye) return 3; // Bye counts as a win
  if (won) return 3;
  if (tied) return 1;
  return 0;
}

/**
 * Sort standings by rank criteria
 * @param {Array} standings - Array of standing objects
 * @returns {Array} - Sorted standings with rank assigned
 */
export function rankStandings(standings) {
  const sorted = [...standings].sort((a, b) => {
    // 1. Total points (descending)
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    // 2. Matches won (descending)
    if (b.matches_won !== a.matches_won) {
      return b.matches_won - a.matches_won;
    }
    // 3. Average accuracy (descending)
    if (Math.abs(b.avg_accuracy - a.avg_accuracy) > 0.001) {
      return b.avg_accuracy - a.avg_accuracy;
    }
    // 4. Total correct answers (descending)
    if (b.total_correct !== a.total_correct) {
      return b.total_correct - a.total_correct;
    }
    // 5. Average response time (ascending - faster is better)
    if (a.avg_response_time_ms && b.avg_response_time_ms) {
      return a.avg_response_time_ms - b.avg_response_time_ms;
    }
    return 0;
  });

  // Assign ranks (handle ties)
  let currentRank = 1;
  sorted.forEach((standing, index) => {
    if (index === 0) {
      standing.rank = currentRank;
    } else {
      const prev = sorted[index - 1];
      // Same rank if same points and accuracy
      if (standing.total_points === prev.total_points &&
          Math.abs(standing.avg_accuracy - prev.avg_accuracy) < 0.001) {
        standing.rank = prev.rank;
      } else {
        standing.rank = index + 1;
      }
    }
  });

  return sorted;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array
 * @returns {Array}
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Test the generator
if (process.argv[1]?.includes('generator.js')) {
  console.log('=== Round Robin Generator Test ===\n');

  // Test with 6 students
  const students = [1, 2, 3, 4, 5, 6];
  console.log('Students:', students);
  console.log('Duration:', calculateTournamentDuration(students.length));
  console.log('\nRound Robin Schedule:');

  const rounds = generateRoundRobin(students);
  rounds.forEach((matchups, i) => {
    console.log(`\nRound ${i + 1}:`);
    matchups.forEach(m => {
      console.log(`  Student ${m.studentA} vs ${m.studentB || 'BYE'}`);
    });
  });

  // Test with odd number
  console.log('\n\n=== Test with 5 students (has byes) ===');
  const students5 = [1, 2, 3, 4, 5];
  console.log('Duration:', calculateTournamentDuration(students5.length));
  const rounds5 = generateRoundRobin(students5);
  rounds5.forEach((matchups, i) => {
    console.log(`\nRound ${i + 1}:`);
    matchups.forEach(m => {
      console.log(`  Student ${m.studentA} vs ${m.studentB || 'BYE'}`);
    });
  });

  // Test schedule generation
  console.log('\n\n=== Schedule Test ===');
  const schedule = generateRoundSchedule(new Date(), 5, 1);
  schedule.forEach(r => {
    console.log(`Round ${r.roundNumber}: ${r.opensAt.toDateString()} - ${r.closesAt.toDateString()}`);
  });
}
