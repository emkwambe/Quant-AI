# ============================================
# MATHATHLON SKILLS - AUTOMATED SETUP
# Run this in: C:\Users\HP\Documents\Quant-AI
# ============================================

Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║           MATHATHLON SKILLS - AUTOMATED SETUP                 ║
║                                                               ║
║  This script will:                                            ║
║  1. Create all necessary folders                              ║
║  2. Create all 8 new files                                    ║
║  3. Update server/index.js to register routes                 ║
║  4. Update package.json with new scripts                      ║
║  5. Initialize the skills database                            ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Verify we're in the right directory
if (-not (Test-Path "server/index.js")) {
    Write-Host "❌ ERROR: Run this script from your Quant-AI project root!" -ForegroundColor Red
    Write-Host "   Expected: C:\Users\HP\Documents\Quant-AI" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1/6] Creating folders..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "server/utils" | Out-Null
Write-Host "  ✓ server/utils created" -ForegroundColor Green

# ============================================
# FILE 1: Database Adapter
# ============================================
Write-Host "`n[2/6] Creating database files..." -ForegroundColor Yellow

$adapterJs = @'
// server/db/adapter.js
// Database adapter layer - supports SQLite (current) and PostgreSQL (future)

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db;

if (DB_TYPE === 'sqlite') {
  const dataDir = join(__dirname, '../../data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DATABASE_PATH || join(dataDir, 'mathathlon.db');
  const sqliteDb = new Database(dbPath);
  
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');

  db = {
    type: 'sqlite',
    raw: sqliteDb,

    query: (sql, params = []) => {
      const stmt = sqliteDb.prepare(sql);
      return params.length ? stmt.all(...params) : stmt.all();
    },

    queryOne: (sql, params = []) => {
      const stmt = sqliteDb.prepare(sql);
      return params.length ? stmt.get(...params) : stmt.get();
    },

    execute: (sql, params = []) => {
      const stmt = sqliteDb.prepare(sql);
      const result = params.length ? stmt.run(...params) : stmt.run();
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid
      };
    },

    transaction: (fn) => {
      const trx = sqliteDb.transaction(fn);
      return trx();
    },

    prepare: (sql) => sqliteDb.prepare(sql),
    close: () => sqliteDb.close()
  };

  console.log(`📦 Database: SQLite (${dbPath})`);
}

export default db;
'@

Set-Content -Path "server/db/adapter.js" -Value $adapterJs -Encoding UTF8
Write-Host "  ✓ server/db/adapter.js" -ForegroundColor Green

# ============================================
# FILE 2: Skills Schema
# ============================================
$skillsSchema = @'
-- MATHATHLON SKILLS - DATABASE SCHEMA

-- Skill Tiers
CREATE TABLE IF NOT EXISTS skill_tiers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY,
  tier_id INTEGER NOT NULL REFERENCES skill_tiers(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_name TEXT,
  description TEXT,
  why_it_matters TEXT,
  grade_start INTEGER DEFAULT 6,
  grade_end INTEGER DEFAULT 8,
  display_order INTEGER DEFAULT 0,
  is_power_six BOOLEAN DEFAULT 0,
  ccss_codes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skill Topics
CREATE TABLE IF NOT EXISTS skill_topics (
  id INTEGER PRIMARY KEY,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  difficulty_weight REAL DEFAULT 1.0,
  display_order INTEGER DEFAULT 0,
  UNIQUE(skill_id, slug)
);

-- Student Skill Progress
CREATE TABLE IF NOT EXISTS student_skill_progress (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_time_ms INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 0,
  level_unlocked_at DATETIME,
  recent_attempts INTEGER DEFAULT 0,
  recent_correct INTEGER DEFAULT 0,
  first_attempt_at DATETIME,
  last_attempt_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, skill_id)
);

-- Student Topic Progress
CREATE TABLE IF NOT EXISTS student_topic_progress (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES skill_topics(id) ON DELETE CASCADE,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  avg_time_ms INTEGER,
  last_attempt_at DATETIME,
  UNIQUE(student_id, topic_id)
);

-- Skill Sessions
CREATE TABLE IF NOT EXISTS skill_sessions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  classroom_id INTEGER REFERENCES classrooms(id),
  mode TEXT DEFAULT 'practice',
  question_count INTEGER DEFAULT 10,
  difficulty INTEGER DEFAULT 2,
  score INTEGER DEFAULT 0,
  max_score INTEGER,
  correct_count INTEGER DEFAULT 0,
  accuracy REAL,
  total_time_ms INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Skill Responses
CREATE TABLE IF NOT EXISTS skill_responses (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES skill_sessions(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  topic_id INTEGER REFERENCES skill_topics(id),
  question_id INTEGER,
  question_number INTEGER,
  question_text TEXT,
  question_data TEXT,
  student_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  response_time_ms INTEGER,
  points_earned INTEGER DEFAULT 0,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
  skill_id INTEGER REFERENCES skills(id),
  cluster_name TEXT,
  level_achieved INTEGER,
  accuracy REAL,
  total_questions INTEGER,
  best_streak INTEGER,
  avg_time_ms INTEGER,
  student_name TEXT,
  classroom_name TEXT,
  teacher_name TEXT,
  school_name TEXT,
  verification_code TEXT UNIQUE,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  is_valid BOOLEAN DEFAULT 1
);

-- Classroom Skill Focus
CREATE TABLE IF NOT EXISTS classroom_skill_focus (
  id INTEGER PRIMARY KEY,
  classroom_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  target_level INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT 1,
  UNIQUE(classroom_id, skill_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skills_tier ON skills(tier_id);
CREATE INDEX IF NOT EXISTS idx_skills_power_six ON skills(is_power_six);
CREATE INDEX IF NOT EXISTS idx_student_skill_progress_student ON student_skill_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skill_progress_skill ON student_skill_progress(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_sessions_student ON skill_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_sessions_status ON skill_sessions(status);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON certificates(verification_code);
'@

Set-Content -Path "server/db/skills-schema.sql" -Value $skillsSchema -Encoding UTF8
Write-Host "  ✓ server/db/skills-schema.sql" -ForegroundColor Green

# ============================================
# FILE 3: Skills Seed Data
# ============================================
$skillsSeed = @'
-- MATHATHLON SKILLS - SEED DATA

-- TIER 1: Make-or-Break Foundations
INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(1, 'Make-or-Break Foundations', 'tier-1-foundations', 'If these are weak, everything collapses later.', 1, '🔑', '#dc2626');

INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(1, 1, 'Integer Operations', 'integer-operations', 'Integers', 'Adding, subtracting, multiplying, and dividing positive and negative numbers.', 'Every equation uses integers. Weak integer skills create constant errors.', 1, '["6.NS.C.5", "7.NS.A.1", "7.NS.A.2"]', 1),
(2, 1, 'Order of Operations', 'order-of-operations', 'PEMDAS', 'Understanding mathematical structure through grouping and operation priority.', 'This is mathematical grammar. Essential for every formula.', 1, '["6.EE.A.2", "6.EE.A.3"]', 2),
(3, 1, 'Number Sense & Magnitude', 'number-sense', 'Number Sense', 'Comparing numbers, estimation, and absolute value.', 'Students who can estimate catch their own errors.', 0, '["6.NS.C.7", "7.NS.A.1"]', 3),
(4, 1, 'Equivalent Representations', 'equivalent-representations', 'Equivalents', 'Converting between fractions, decimals, and percents.', 'Real-world math constantly switches between forms.', 0, '["6.RP.A.3", "7.RP.A.3"]', 4),
(5, 1, 'Properties of Operations', 'properties-of-operations', 'Op Properties', 'Commutative, associative, distributive, identity, inverse properties.', 'These explain WHY algebraic manipulation works.', 1, '["6.EE.A.3", "6.EE.A.4"]', 5);

-- TIER 2: Algebra Readiness
INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(2, 'Algebra Readiness', 'tier-2-algebra-ready', 'These unlock Algebra I thinking.', 2, '🧠', '#7c3aed');

INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(6, 2, 'Expressions vs Equations', 'expressions-equations', 'Expressions', 'Understanding when to evaluate vs when to solve.', 'Critical distinction for all of algebra.', 0, '["6.EE.A.2", "6.EE.B.5"]', 1),
(7, 2, 'Variables', 'variables', 'Variables', 'Variables as placeholders, parameters, and patterns.', 'Strong variable sense enables modeling and abstraction.', 0, '["6.EE.A.2", "6.EE.B.6"]', 2),
(8, 2, 'Combining Like Terms', 'combining-like-terms', 'Like Terms', 'Recognizing and combining terms with same variable structure.', 'Foundation for simplification and factoring.', 0, '["6.EE.A.3", "7.EE.A.1"]', 3),
(9, 2, 'Properties of Equality', 'properties-of-equality', 'Eq Properties', 'Addition, subtraction, multiplication, division properties of equality.', 'The LEGAL MOVES in the algebra game.', 1, '["6.EE.A.3", "7.EE.A.1", "8.EE.C.7"]', 4),
(10, 2, 'Equality & Balance', 'equality-balance', 'Balance', 'Equations as balanced scales, using inverse operations.', 'This mindset IS algebraic reasoning.', 1, '["6.EE.B.7", "7.EE.B.4", "8.EE.C.7"]', 5);

-- TIER 3: Ratio & Proportion Power
INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(3, 'Ratio & Proportion Power', 'tier-3-ratios', 'Hidden superpowers connecting math to real world.', 3, '📊', '#0891b2');

INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(11, 3, 'Ratios & Rates', 'ratios-rates', 'Ratios', 'Ratios as comparisons and rates with different units.', 'Unit rates appear everywhere: speed, price, efficiency.', 1, '["6.RP.A.1", "6.RP.A.2", "6.RP.A.3"]', 1),
(12, 3, 'Proportional Relationships', 'proportional-relationships', 'Proportions', 'Constant of proportionality, y = kx relationships.', 'Foundation of linear functions and scientific formulas.', 0, '["7.RP.A.2", "7.RP.A.3"]', 2),
(13, 3, 'Percent Applications', 'percent-applications', 'Percents', 'Percent as rate per 100, percent change.', 'Universal language of comparison. Essential life skill.', 0, '["6.RP.A.3", "7.RP.A.3"]', 3),
(14, 3, 'Scale Factor', 'scale-factor', 'Scale', 'Multiplicative vs additive change, proportional scaling.', 'Maps, models, scaling connect math to physical reality.', 0, '["7.G.A.1", "8.G.A.4"]', 4);

-- TIER 4: Geometry That Feeds Algebra
INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(4, 'Geometry That Feeds Algebra', 'tier-4-geometry', 'Critical for visual-spatial reasoning.', 4, '📐', '#059669');

INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(15, 4, 'Coordinate Plane', 'coordinate-plane', 'Coordinates', 'Plotting points, quadrants, ordered pairs.', 'Every graph in Algebra lives here.', 0, '["6.NS.C.6", "6.NS.C.8"]', 1),
(16, 4, 'Area & Perimeter', 'area-perimeter', 'Area', 'Conceptual understanding of units and decomposition.', 'Area models explain multiplication and factoring.', 0, '["6.G.A.1", "7.G.B.4"]', 2),
(17, 4, 'Angle Relationships', 'angle-relationships', 'Angles', 'Complementary, supplementary, linear pairs.', 'Builds logical reasoning about constraints.', 0, '["7.G.B.5"]', 3);

-- TIER 5: Data & Logical Thinking
INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(5, 'Data & Logical Thinking', 'tier-5-data', 'Foundation for statistics and evidence-based reasoning.', 5, '📈', '#d97706');

INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(18, 5, 'Reading Graphs', 'reading-graphs', 'Graphs', 'Moving between tables, graphs, and descriptions.', 'Data literacy is modern literacy.', 0, '["6.SP.B.4", "6.SP.B.5"]', 1),
(19, 5, 'Measures of Center', 'measures-of-center', 'Averages', 'Mean, median, mode and sensitivity to outliers.', 'Knowing WHICH average to use matters most.', 0, '["6.SP.B.5", "7.SP.B.4"]', 2),
(20, 5, 'Probability', 'probability', 'Probability', 'Probability as ratios of favorable to total outcomes.', 'Foundation for statistics and risk reasoning.', 0, '["7.SP.C.5", "7.SP.C.6"]', 3);

-- TIER 6: Meta-Skills
INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(6, 'Meta-Skills', 'tier-6-meta', 'Extremely high value thinking skills.', 6, '🚀', '#be185d');

INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(21, 6, 'Math Language', 'math-language', 'Language', 'Precision with of, per, more than, less than.', 'Word problems fail when language fails.', 0, '["6.EE.A.2", "7.EE.B.4"]', 1),
(22, 6, 'Multi-Step Problems', 'multi-step', 'Multi-Step', 'Breaking complex problems into steps.', 'Real problems are never one-step.', 0, '["7.EE.B.3", "7.NS.A.3"]', 2),
(23, 6, 'Reasonableness', 'reasonableness', 'Checking', 'Estimation and mental math validation.', 'Catches errors and builds number sense.', 0, '["7.EE.B.3"]', 3),
(24, 6, 'Patterns', 'patterns', 'Patterns', 'Finding rules in tables and sequences.', 'Mathematics IS pattern recognition.', 0, '["6.EE.A.2", "8.F.A.1"]', 4);

-- SKILL TOPICS
INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
(1, 'Adding Integers', 'adding-integers', 1),
(1, 'Subtracting Integers', 'subtracting-integers', 2),
(1, 'Multiplying Integers', 'multiplying-integers', 3),
(1, 'Dividing Integers', 'dividing-integers', 4),
(1, 'Mixed Operations', 'mixed-operations', 5),
(2, 'Basic PEMDAS', 'basic-pemdas', 1),
(2, 'Parentheses', 'grouping-symbols', 2),
(2, 'Nested Grouping', 'nested-grouping', 3),
(5, 'Commutative Property', 'commutative', 1),
(5, 'Associative Property', 'associative', 2),
(5, 'Distributive Property', 'distributive', 3),
(5, 'Identity Properties', 'identity', 4),
(5, 'Inverse Properties', 'inverse', 5),
(9, 'Addition Property', 'addition-property', 1),
(9, 'Subtraction Property', 'subtraction-property', 2),
(9, 'Multiplication Property', 'multiplication-property', 3),
(9, 'Division Property', 'division-property', 4),
(10, 'One-Step Equations', 'one-step', 1),
(10, 'Two-Step Equations', 'two-step', 2),
(11, 'Writing Ratios', 'writing-ratios', 1),
(11, 'Unit Rates', 'unit-rates', 2),
(11, 'Equivalent Ratios', 'equivalent-ratios', 3);
'@

Set-Content -Path "server/db/skills-seed.sql" -Value $skillsSeed -Encoding UTF8
Write-Host "  ✓ server/db/skills-seed.sql" -ForegroundColor Green

# ============================================
# FILE 4: Init Skills Script
# ============================================
$initSkills = @'
// server/db/init-skills.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function initSkills() {
  console.log('🎯 Initializing Mathathlon Skills...\n');
  
  try {
    console.log('📋 Creating skills tables...');
    const schema = readFileSync(join(__dirname, 'skills-schema.sql'), 'utf8');
    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const stmt of statements) {
      try { db.execute(stmt); } catch (err) {
        if (!err.message.includes('already exists')) console.error(`  Error: ${err.message}`);
      }
    }
    console.log('  ✓ Tables created\n');
    
    const existingTiers = db.queryOne('SELECT COUNT(*) as count FROM skill_tiers');
    if (existingTiers.count > 0) {
      console.log('📦 Skills already seeded.\n');
    } else {
      console.log('🌱 Seeding skills data...');
      const seed = readFileSync(join(__dirname, 'skills-seed.sql'), 'utf8');
      const seedStatements = seed.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const stmt of seedStatements) {
        try { db.execute(stmt); } catch (err) { console.error(`  Seed error: ${err.message}`); }
      }
      
      const tierCount = db.queryOne('SELECT COUNT(*) as count FROM skill_tiers').count;
      const skillCount = db.queryOne('SELECT COUNT(*) as count FROM skills').count;
      console.log(`  ✓ ${tierCount} tiers, ${skillCount} skills seeded`);
    }
    
    console.log('\n🏆 Power 6 Skills:');
    const powerSix = db.query(`SELECT name FROM skills WHERE is_power_six = 1 ORDER BY id`);
    powerSix.forEach((s, i) => console.log(`  ${i + 1}. ${s.name}`));
    
    console.log('\n✅ Skills initialization complete!\n');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

initSkills();
'@

Set-Content -Path "server/db/init-skills.js" -Value $initSkills -Encoding UTF8
Write-Host "  ✓ server/db/init-skills.js" -ForegroundColor Green

# ============================================
# FILE 5: Mastery Utils
# ============================================
Write-Host "`n[3/6] Creating utility files..." -ForegroundColor Yellow

$masteryJs = @'
// server/utils/mastery.js
export const LEVELS = {
  0: { name: 'Not Started', minAccuracy: 0, minQuestions: 0, color: '#9ca3af' },
  1: { name: 'Explorer', minAccuracy: 0.60, minQuestions: 10, color: '#3b82f6' },
  2: { name: 'Practitioner', minAccuracy: 0.75, minQuestions: 25, color: '#22c55e' },
  3: { name: 'Specialist', minAccuracy: 0.85, minQuestions: 50, color: '#a855f7' },
  4: { name: 'Expert', minAccuracy: 0.90, minQuestions: 100, color: '#f59e0b' },
  5: { name: 'Champion', minAccuracy: 0.95, minQuestions: 150, color: '#ef4444' }
};

export function calculateLevel(progress) {
  const { total_attempts, correct_answers } = progress;
  if (!total_attempts || total_attempts === 0) return 0;
  const accuracy = correct_answers / total_attempts;
  let level = 0;
  for (let lvl = 5; lvl >= 1; lvl--) {
    const req = LEVELS[lvl];
    if (accuracy >= req.minAccuracy && total_attempts >= req.minQuestions) {
      level = lvl;
      break;
    }
  }
  return level;
}

export function calculateAccuracy(progress) {
  if (!progress.total_attempts) return 0;
  return progress.correct_answers / progress.total_attempts;
}

export function calculatePoints(isCorrect, responseTimeMs, difficulty = 1, streak = 0) {
  if (!isCorrect) return 0;
  const basePoints = difficulty * 10;
  const speedBonus = Math.max(0, Math.min(0.5, (30000 - responseTimeMs) / 60000));
  const streakBonus = Math.min(0.5, streak * 0.1);
  return Math.round(basePoints * (1 + speedBonus + streakBonus));
}

export function updateProgress(progress, isCorrect, responseTimeMs) {
  const updates = {
    total_attempts: (progress.total_attempts || 0) + 1,
    correct_answers: (progress.correct_answers || 0) + (isCorrect ? 1 : 0),
    current_streak: isCorrect ? (progress.current_streak || 0) + 1 : 0,
    best_streak: Math.max(progress.best_streak || 0, isCorrect ? (progress.current_streak || 0) + 1 : 0),
    total_time_ms: (progress.total_time_ms || 0) + responseTimeMs,
    last_attempt_at: new Date().toISOString()
  };
  updates.recent_attempts = Math.min(20, (progress.recent_attempts || 0) + 1);
  updates.recent_correct = Math.min(20, (progress.recent_correct || 0) + (isCorrect ? 1 : 0));
  if (!progress.first_attempt_at) updates.first_attempt_at = new Date().toISOString();
  updates.current_level = calculateLevel({ ...progress, ...updates });
  if (updates.current_level > (progress.current_level || 0)) {
    updates.level_unlocked_at = new Date().toISOString();
  }
  return updates;
}

export function getLevelInfo(level) {
  const info = LEVELS[level] || LEVELS[0];
  return { level, name: info.name, color: info.color, stars: level };
}

export function generateCertificateId() {
  return 'cert-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

export function generateVerificationCode(skillSlug, studentId) {
  const prefix = skillSlug.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

export default { LEVELS, calculateLevel, calculateAccuracy, calculatePoints, updateProgress, getLevelInfo, generateCertificateId, generateVerificationCode };
'@

Set-Content -Path "server/utils/mastery.js" -Value $masteryJs -Encoding UTF8
Write-Host "  ✓ server/utils/mastery.js" -ForegroundColor Green

# ============================================
# FILE 6: Skills Routes
# ============================================
Write-Host "`n[4/6] Creating route files..." -ForegroundColor Yellow

$skillsRoutes = @'
// server/routes/skills.js
import { Router } from 'express';
import db from '../db/adapter.js';
import { getLevelInfo, LEVELS } from '../utils/mastery.js';

const router = Router();

// GET /api/skills - List all skills
router.get('/', (req, res) => {
  try {
    const tiers = db.query('SELECT * FROM skill_tiers ORDER BY display_order');
    const skills = db.query(`
      SELECT s.*, st.name as tier_name, st.icon as tier_icon, st.color as tier_color
      FROM skills s JOIN skill_tiers st ON s.tier_id = st.id
      ORDER BY s.tier_id, s.display_order
    `);
    const result = tiers.map(tier => ({
      ...tier,
      skills: skills.filter(s => s.tier_id === tier.id).map(s => ({
        ...s, ccss_codes: JSON.parse(s.ccss_codes || '[]')
      }))
    }));
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/skills/power-six
router.get('/power-six', (req, res) => {
  try {
    const skills = db.query(`
      SELECT s.*, st.name as tier_name FROM skills s
      JOIN skill_tiers st ON s.tier_id = st.id
      WHERE s.is_power_six = 1 ORDER BY s.id
    `);
    res.json({ title: 'The Power 6', skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Power 6' });
  }
});

// GET /api/skills/:skillId
router.get('/:skillId', (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = db.queryOne(`
      SELECT s.*, st.name as tier_name FROM skills s
      JOIN skill_tiers st ON s.tier_id = st.id
      WHERE s.id = ? OR s.slug = ?
    `, [skillId, skillId]);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    const topics = db.query('SELECT * FROM skill_topics WHERE skill_id = ? ORDER BY display_order', [skill.id]);
    res.json({ ...skill, topics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

// GET /api/skills/progress/student/:studentId
router.get('/progress/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = db.query(`
      SELECT s.id as skill_id, s.name, s.slug, s.is_power_six,
        COALESCE(sp.total_attempts, 0) as total_attempts,
        COALESCE(sp.correct_answers, 0) as correct_answers,
        COALESCE(sp.current_level, 0) as current_level,
        COALESCE(sp.best_streak, 0) as best_streak
      FROM skills s
      LEFT JOIN student_skill_progress sp ON s.id = sp.skill_id AND sp.student_id = ?
      ORDER BY s.tier_id, s.display_order
    `, [studentId]);
    res.json(progress.map(p => ({
      ...p,
      accuracy: p.total_attempts > 0 ? p.correct_answers / p.total_attempts : 0,
      levelInfo: getLevelInfo(p.current_level)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// GET /api/skills/certificates/verify/:code
router.get('/certificates/verify/:code', (req, res) => {
  try {
    const cert = db.queryOne(`
      SELECT c.*, s.name as skill_name FROM certificates c
      LEFT JOIN skills s ON c.skill_id = s.id
      WHERE c.verification_code = ?
    `, [req.params.code]);
    if (!cert) return res.status(404).json({ valid: false });
    res.json({ valid: cert.is_valid === 1, certificate: cert });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
'@

Set-Content -Path "server/routes/skills.js" -Value $skillsRoutes -Encoding UTF8
Write-Host "  ✓ server/routes/skills.js" -ForegroundColor Green

# ============================================
# FILE 7: Skill Sessions Routes
# ============================================
$skillSessionsRoutes = @'
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

    const result = db.execute(`
      INSERT INTO skill_sessions (student_id, skill_id, question_count, difficulty)
      VALUES (?, ?, ?, ?)
    `, [studentId, skillId, questionCount, difficulty]);

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
    
    const session = db.queryOne(`
      SELECT ss.*, s.slug as skill_slug FROM skill_sessions ss
      JOIN skills s ON ss.skill_id = s.id WHERE ss.id = ? AND ss.status = 'active'
    `, [sessionId]);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const questions = generateSkillQuestions(session.skill_slug, session.question_count, session.difficulty, sessionId);
    const question = questions[questionNumber - 1];
    if (!question) return res.status(400).json({ error: 'Invalid question' });

    const isCorrect = String(answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    const progress = db.queryOne('SELECT * FROM student_skill_progress WHERE student_id = ? AND skill_id = ?', [studentId, session.skill_id]) || { current_streak: 0 };
    const points = calculatePoints(isCorrect, responseTimeMs, session.difficulty, progress.current_streak);

    db.execute(`
      INSERT INTO skill_responses (session_id, skill_id, question_number, question_text, student_answer, correct_answer, is_correct, response_time_ms, points_earned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [sessionId, session.skill_id, questionNumber, question.question, String(answer), String(question.correctAnswer), isCorrect ? 1 : 0, responseTimeMs, points]);

    db.execute('UPDATE skill_sessions SET score = score + ?, correct_count = correct_count + ? WHERE id = ?', [points, isCorrect ? 1 : 0, sessionId]);

    // Update progress
    let currentProgress = db.queryOne('SELECT * FROM student_skill_progress WHERE student_id = ? AND skill_id = ?', [studentId, session.skill_id]);
    if (!currentProgress) {
      db.execute('INSERT INTO student_skill_progress (student_id, skill_id) VALUES (?, ?)', [studentId, session.skill_id]);
      currentProgress = { total_attempts: 0, correct_answers: 0, current_streak: 0, best_streak: 0, total_time_ms: 0, current_level: 0 };
    }
    const updates = updateProgress(currentProgress, isCorrect, responseTimeMs);
    db.execute(`
      UPDATE student_skill_progress SET total_attempts = ?, correct_answers = ?, current_streak = ?, best_streak = ?, current_level = ?, last_attempt_at = ?
      WHERE student_id = ? AND skill_id = ?
    `, [updates.total_attempts, updates.correct_answers, updates.current_streak, updates.best_streak, updates.current_level, updates.last_attempt_at, studentId, session.skill_id]);

    const answeredCount = db.queryOne('SELECT COUNT(*) as count FROM skill_responses WHERE session_id = ?', [sessionId]).count;
    const isComplete = answeredCount >= session.question_count;
    if (isComplete) {
      const accuracy = session.correct_count / session.question_count;
      db.execute('UPDATE skill_sessions SET status = ?, accuracy = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?', ['completed', accuracy, sessionId]);
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
    const session = db.queryOne(`
      SELECT ss.*, s.name as skill_name FROM skill_sessions ss
      JOIN skills s ON ss.skill_id = s.id WHERE ss.id = ?
    `, [req.params.sessionId]);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const responses = db.query('SELECT * FROM skill_responses WHERE session_id = ? ORDER BY question_number', [session.id]);
    res.json({ session, responses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;
'@

Set-Content -Path "server/routes/skill-sessions.js" -Value $skillSessionsRoutes -Encoding UTF8
Write-Host "  ✓ server/routes/skill-sessions.js" -ForegroundColor Green

# ============================================
# FILE 8: Skill Question Generator
# ============================================
$skillGenerator = @'
// server/questions/skill-generator.js

function seededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generateSkillQuestions(skillSlug, count, difficulty, seed) {
  const rng = seededRandom(seed);
  const generator = GENERATORS[skillSlug];
  if (!generator) return generateFallback(count, rng);
  
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({ ...generator(rng, difficulty), id: `${skillSlug}-${seed}-${i}`, skillSlug, difficulty });
  }
  return questions;
}

const GENERATORS = {
  'integer-operations': (rng, diff) => {
    const range = 5 + diff * 5;
    const ops = ['+', '−', '×', '÷'];
    const op = ops[randomInt(rng, 0, 3)];
    let a, b, answer;
    
    if (op === '+') {
      a = randomInt(rng, -range, range);
      b = randomInt(rng, -range, range);
      answer = a + b;
    } else if (op === '−') {
      a = randomInt(rng, -range, range);
      b = randomInt(rng, -range, range);
      answer = a - b;
    } else if (op === '×') {
      a = randomInt(rng, -12, 12);
      b = randomInt(rng, -12, 12);
      answer = a * b;
    } else {
      b = randomInt(rng, 1, 12) * (rng() > 0.5 ? 1 : -1);
      answer = randomInt(rng, -12, 12);
      a = b * answer;
    }
    
    const fmt = n => n < 0 ? `(${n})` : String(n);
    return { type: 'numeric', question: `Calculate: ${fmt(a)} ${op} ${fmt(b)}`, correctAnswer: answer };
  },
  
  'order-of-operations': (rng, diff) => {
    const a = randomInt(rng, 2, 10);
    const b = randomInt(rng, 2, 10);
    const c = randomInt(rng, 1, 10);
    if (diff < 3) {
      return { type: 'numeric', question: `Calculate: ${a} + ${b} × ${c}`, correctAnswer: a + b * c, explanation: `First: ${b} × ${c} = ${b*c}, then: ${a} + ${b*c} = ${a + b*c}` };
    } else {
      return { type: 'numeric', question: `Calculate: (${a} + ${b}) × ${c}`, correctAnswer: (a + b) * c, explanation: `First: ${a} + ${b} = ${a+b}, then: ${a+b} × ${c} = ${(a+b)*c}` };
    }
  },
  
  'properties-of-operations': (rng, diff) => {
    const a = randomInt(rng, 2, 8);
    const b = randomInt(rng, 2, 10);
    const c = randomInt(rng, 2, 10);
    return { type: 'numeric', question: `Use Distributive Property: ${a}(${b} + ${c}) = ?`, correctAnswer: a * b + a * c, explanation: `${a}×${b} + ${a}×${c} = ${a*b} + ${a*c} = ${a*b + a*c}` };
  },
  
  'properties-of-equality': (rng, diff) => {
    const x = randomInt(rng, 2, 15);
    const b = randomInt(rng, 1, 10);
    const scenarios = [
      { q: `To solve x − ${b} = ${x}, add ___ to both sides`, a: b },
      { q: `To solve x + ${b} = ${x + b}, subtract ___ from both sides`, a: b },
      { q: `To solve ${b}x = ${b * x}, divide both sides by ___`, a: b }
    ];
    const s = scenarios[randomInt(rng, 0, scenarios.length - 1)];
    return { type: 'numeric', question: s.q, correctAnswer: s.a };
  },
  
  'equality-balance': (rng, diff) => {
    const x = randomInt(rng, 2, 12);
    const a = randomInt(rng, 2, 5);
    const b = randomInt(rng, 1, 8);
    if (diff < 3) {
      return { type: 'numeric', question: `Solve: x + ${b} = ${x + b}`, correctAnswer: x };
    } else {
      return { type: 'numeric', question: `Solve: ${a}x + ${b} = ${a * x + b}`, correctAnswer: x, explanation: `Subtract ${b}, then divide by ${a}` };
    }
  },
  
  'ratios-rates': (rng, diff) => {
    const items = randomInt(rng, 3, 8);
    const pricePerItem = randomInt(rng, 2, 5);
    const total = items * pricePerItem;
    return { type: 'numeric', question: `${items} items cost $${total}. What is the price per item?`, correctAnswer: pricePerItem, explanation: `$${total} ÷ ${items} = $${pricePerItem}` };
  }
};

function generateFallback(count, rng) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const a = randomInt(rng, 1, 20);
    const b = randomInt(rng, 1, 20);
    questions.push({ id: `fallback-${i}`, type: 'numeric', question: `${a} + ${b} = ?`, correctAnswer: a + b });
  }
  return questions;
}

export default { generateSkillQuestions };
'@

Set-Content -Path "server/questions/skill-generator.js" -Value $skillGenerator -Encoding UTF8
Write-Host "  ✓ server/questions/skill-generator.js" -ForegroundColor Green

# ============================================
# UPDATE server/index.js
# ============================================
Write-Host "`n[5/6] Updating server/index.js..." -ForegroundColor Yellow

$indexContent = Get-Content "server/index.js" -Raw

# Add imports if not present
if ($indexContent -notmatch "import skillRoutes") {
    $importLine = "import skillRoutes from './routes/skills.js';`nimport skillSessionRoutes from './routes/skill-sessions.js';"
    
    # Find last import line and add after it
    $indexContent = $indexContent -replace "(import \w+Routes from './routes/\w+\.js';)(?![\s\S]*import \w+Routes from)", "`$1`n$importLine"
    
    Write-Host "  ✓ Added skill route imports" -ForegroundColor Green
}

# Add route registrations if not present
if ($indexContent -notmatch "app\.use\('/api/skills'") {
    $routeLine = "`napp.use('/api/skills', skillRoutes);`napp.use('/api/skill-sessions', skillSessionRoutes);"
    
    # Find last app.use for routes and add after it
    $indexContent = $indexContent -replace "(app\.use\('/api/\w+', \w+Routes\);)(?![\s\S]*app\.use\('/api/\w+', \w+Routes\))", "`$1$routeLine"
    
    Write-Host "  ✓ Added skill route registrations" -ForegroundColor Green
}

Set-Content -Path "server/index.js" -Value $indexContent -Encoding UTF8

# ============================================
# UPDATE package.json
# ============================================
$pkgContent = Get-Content "package.json" -Raw | ConvertFrom-Json

if (-not $pkgContent.scripts.'db:skills') {
    $pkgContent.scripts | Add-Member -NotePropertyName 'db:skills' -NotePropertyValue 'node server/db/init-skills.js' -Force
    $pkgContent | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
    Write-Host "  ✓ Added db:skills script to package.json" -ForegroundColor Green
}

# ============================================
# INITIALIZE DATABASE
# ============================================
Write-Host "`n[6/6] Initializing skills database..." -ForegroundColor Yellow
try {
    node server/db/init-skills.js
} catch {
    Write-Host "  ⚠ Run 'npm run db:skills' manually after setup" -ForegroundColor Yellow
}

# ============================================
# DONE!
# ============================================
Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                    ✅ SETUP COMPLETE!                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Files created:                                               ║
║    ✓ server/db/adapter.js                                     ║
║    ✓ server/db/skills-schema.sql                              ║
║    ✓ server/db/skills-seed.sql                                ║
║    ✓ server/db/init-skills.js                                 ║
║    ✓ server/utils/mastery.js                                  ║
║    ✓ server/routes/skills.js                                  ║
║    ✓ server/routes/skill-sessions.js                          ║
║    ✓ server/questions/skill-generator.js                      ║
║                                                               ║
║  Next steps:                                                  ║
║    1. npm run dev                                             ║
║    2. Test: http://localhost:3000/api/skills                  ║
║    3. Test: http://localhost:3000/api/skills/power-six        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
