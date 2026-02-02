// server/utils/mastery.js
// Mastery level calculation and certification logic

/**
 * Mastery Level Definitions
 * Each level has requirements for accuracy and question count
 */
export const LEVELS = {
  0: { name: 'Not Started', minAccuracy: 0, minQuestions: 0, color: '#9ca3af' },
  1: { name: 'Explorer', minAccuracy: 0.60, minQuestions: 10, color: '#3b82f6' },
  2: { name: 'Practitioner', minAccuracy: 0.75, minQuestions: 25, color: '#22c55e' },
  3: { name: 'Specialist', minAccuracy: 0.85, minQuestions: 50, color: '#a855f7' },
  4: { name: 'Expert', minAccuracy: 0.90, minQuestions: 100, color: '#f59e0b' },
  5: { name: 'Champion', minAccuracy: 0.95, minQuestions: 150, color: '#ef4444' }
};

/**
 * Certification thresholds
 */
export const CERTIFICATION = {
  skill: {
    minLevel: 3,           // Specialist level required
    minQuestions: 50,
    minAccuracy: 0.85,
    minRecentAccuracy: 0.80, // Last 20 questions
    recentWindow: 20
  },
  cluster: {
    minLevel: 3,           // All Power 6 skills at Specialist
    skillsRequired: 6
  },
  algebraReady: {
    minLevel: 4,           // Expert level across Power 6
    skillsRequired: 6
  }
};

/**
 * Calculate current mastery level based on progress
 * @param {Object} progress - Student's skill progress record
 * @returns {number} Level 0-5
 */
export function calculateLevel(progress) {
  const { total_attempts, correct_answers, avg_time_ms } = progress;
  
  if (!total_attempts || total_attempts === 0) {
    return 0;
  }
  
  const accuracy = correct_answers / total_attempts;
  
  // Find highest level that meets all requirements
  let level = 0;
  for (let lvl = 5; lvl >= 1; lvl--) {
    const req = LEVELS[lvl];
    if (accuracy >= req.minAccuracy && total_attempts >= req.minQuestions) {
      level = lvl;
      break;
    }
  }
  
  // Level 4-5 also require reasonable speed (under 20 seconds average)
  if (level >= 4 && avg_time_ms && avg_time_ms > 20000) {
    level = 3;
  }
  
  return level;
}

/**
 * Calculate accuracy from progress
 * @param {Object} progress - Progress record
 * @returns {number} Accuracy as decimal (0-1)
 */
export function calculateAccuracy(progress) {
  if (!progress.total_attempts || progress.total_attempts === 0) {
    return 0;
  }
  return progress.correct_answers / progress.total_attempts;
}

/**
 * Calculate recent accuracy (for certification stability)
 * @param {Object} progress - Progress record with recent_* fields
 * @returns {number} Recent accuracy as decimal (0-1)
 */
export function calculateRecentAccuracy(progress) {
  if (!progress.recent_attempts || progress.recent_attempts === 0) {
    return calculateAccuracy(progress);
  }
  return progress.recent_correct / progress.recent_attempts;
}

/**
 * Check if student can be certified for a skill
 * @param {Object} progress - Student's skill progress record
 * @param {number} targetLevel - Target certification level (default: 3)
 * @returns {Object} { canCertify: boolean, reason: string, metrics: Object }
 */
export function canCertifySkill(progress, targetLevel = 3) {
  const currentLevel = calculateLevel(progress);
  const accuracy = calculateAccuracy(progress);
  const recentAccuracy = calculateRecentAccuracy(progress);
  const req = CERTIFICATION.skill;
  
  const metrics = {
    currentLevel,
    accuracy: (accuracy * 100).toFixed(1) + '%',
    recentAccuracy: (recentAccuracy * 100).toFixed(1) + '%',
    totalQuestions: progress.total_attempts,
    bestStreak: progress.best_streak
  };
  
  // Check level requirement
  if (currentLevel < targetLevel) {
    return {
      canCertify: false,
      reason: `Need ${LEVELS[targetLevel].name} level (currently ${LEVELS[currentLevel].name})`,
      metrics
    };
  }
  
  // Check minimum questions
  if (progress.total_attempts < req.minQuestions) {
    return {
      canCertify: false,
      reason: `Need ${req.minQuestions} questions (currently ${progress.total_attempts})`,
      metrics
    };
  }
  
  // Check accuracy
  if (accuracy < req.minAccuracy) {
    return {
      canCertify: false,
      reason: `Need ${(req.minAccuracy * 100)}% accuracy (currently ${(accuracy * 100).toFixed(1)}%)`,
      metrics
    };
  }
  
  // Check recent performance stability
  if (recentAccuracy < req.minRecentAccuracy) {
    return {
      canCertify: false,
      reason: `Recent performance below ${(req.minRecentAccuracy * 100)}% (currently ${(recentAccuracy * 100).toFixed(1)}%)`,
      metrics
    };
  }
  
  return {
    canCertify: true,
    reason: 'All requirements met!',
    metrics
  };
}

/**
 * Check if student can be certified for Power 6 cluster
 * @param {Array} progressArray - Array of progress records for Power 6 skills
 * @returns {Object} { canCertify: boolean, reason: string, skillsReady: number }
 */
export function canCertifyCluster(progressArray) {
  const req = CERTIFICATION.cluster;
  let skillsReady = 0;
  const skillStatus = [];
  
  for (const progress of progressArray) {
    const level = calculateLevel(progress);
    if (level >= req.minLevel) {
      skillsReady++;
      skillStatus.push({ skill: progress.skill_name, level, ready: true });
    } else {
      skillStatus.push({ skill: progress.skill_name, level, ready: false });
    }
  }
  
  if (skillsReady >= req.skillsRequired) {
    return {
      canCertify: true,
      reason: 'All Power 6 skills at Specialist level!',
      skillsReady,
      skillStatus
    };
  }
  
  return {
    canCertify: false,
    reason: `Need ${req.skillsRequired} skills at Specialist level (currently ${skillsReady})`,
    skillsReady,
    skillStatus
  };
}

/**
 * Calculate points earned for a response
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {number} responseTimeMs - Time to answer in milliseconds
 * @param {number} difficulty - Question difficulty (1-5)
 * @param {number} streak - Current streak count
 * @returns {number} Points earned
 */
export function calculatePoints(isCorrect, responseTimeMs, difficulty = 1, streak = 0) {
  if (!isCorrect) {
    return 0;
  }
  
  // Base points by difficulty
  const basePoints = difficulty * 10;
  
  // Speed bonus (faster = more points, max 50% bonus)
  const speedBonus = Math.max(0, Math.min(0.5, (30000 - responseTimeMs) / 60000));
  
  // Streak bonus (10% per streak, max 50% bonus)
  const streakBonus = Math.min(0.5, streak * 0.1);
  
  return Math.round(basePoints * (1 + speedBonus + streakBonus));
}

/**
 * Update progress after a response
 * @param {Object} progress - Current progress record
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {number} responseTimeMs - Time to answer
 * @returns {Object} Updated progress fields
 */
export function updateProgress(progress, isCorrect, responseTimeMs) {
  const updates = {
    total_attempts: (progress.total_attempts || 0) + 1,
    correct_answers: (progress.correct_answers || 0) + (isCorrect ? 1 : 0),
    current_streak: isCorrect ? (progress.current_streak || 0) + 1 : 0,
    best_streak: Math.max(
      progress.best_streak || 0, 
      isCorrect ? (progress.current_streak || 0) + 1 : 0
    ),
    total_time_ms: (progress.total_time_ms || 0) + responseTimeMs,
    last_attempt_at: new Date().toISOString()
  };
  
  // Calculate average time
  updates.avg_time_ms = Math.round(updates.total_time_ms / updates.total_attempts);
  
  // Update recent window (rolling last 20)
  updates.recent_attempts = Math.min(20, (progress.recent_attempts || 0) + 1);
  if (updates.recent_attempts <= 20) {
    updates.recent_correct = (progress.recent_correct || 0) + (isCorrect ? 1 : 0);
  } else {
    // Approximate rolling average
    const oldRatio = (progress.recent_correct || 0) / (progress.recent_attempts || 1);
    updates.recent_correct = Math.round(oldRatio * 19) + (isCorrect ? 1 : 0);
    updates.recent_attempts = 20;
  }
  
  // Set first attempt timestamp if not set
  if (!progress.first_attempt_at) {
    updates.first_attempt_at = new Date().toISOString();
  }
  
  // Calculate new level
  const newLevel = calculateLevel({ ...progress, ...updates });
  if (newLevel > (progress.current_level || 0)) {
    updates.current_level = newLevel;
    updates.level_unlocked_at = new Date().toISOString();
  } else {
    updates.current_level = newLevel;
  }
  
  return updates;
}

/**
 * Generate a unique certificate ID
 * @returns {string} UUID-like certificate ID
 */
export function generateCertificateId() {
  return 'cert-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Generate verification code for certificate
 * @param {string} skillSlug - Skill slug
 * @param {number} studentId - Student ID
 * @returns {string} Short verification code
 */
export function generateVerificationCode(skillSlug, studentId) {
  const prefix = skillSlug.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get level display info
 * @param {number} level - Level 0-5
 * @returns {Object} { name, color, stars, icon }
 */
export function getLevelInfo(level) {
  const info = LEVELS[level] || LEVELS[0];
  return {
    level,
    name: info.name,
    color: info.color,
    stars: level,
    icon: level === 5 ? '🏆' : level >= 3 ? '⭐' : level >= 1 ? '📚' : '🔒',
    requirements: level < 5 ? LEVELS[level + 1] : null
  };
}

/**
 * Calculate progress to next level
 * @param {Object} progress - Current progress
 * @returns {Object} { currentLevel, nextLevel, accuracyProgress, questionsProgress }
 */
export function progressToNextLevel(progress) {
  const currentLevel = calculateLevel(progress);
  const accuracy = calculateAccuracy(progress);
  
  if (currentLevel >= 5) {
    return {
      currentLevel,
      nextLevel: null,
      isMaxLevel: true,
      message: 'Maximum level achieved!'
    };
  }
  
  const nextReq = LEVELS[currentLevel + 1];
  
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    nextLevelName: nextReq.name,
    accuracyProgress: Math.min(1, accuracy / nextReq.minAccuracy),
    questionsProgress: Math.min(1, progress.total_attempts / nextReq.minQuestions),
    accuracyNeeded: nextReq.minAccuracy,
    questionsNeeded: nextReq.minQuestions,
    accuracyCurrent: accuracy,
    questionsCurrent: progress.total_attempts
  };
}

export default {
  LEVELS,
  CERTIFICATION,
  calculateLevel,
  calculateAccuracy,
  calculateRecentAccuracy,
  canCertifySkill,
  canCertifyCluster,
  calculatePoints,
  updateProgress,
  generateCertificateId,
  generateVerificationCode,
  getLevelInfo,
  progressToNextLevel
};
