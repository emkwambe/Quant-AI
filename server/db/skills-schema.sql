-- =============================================
-- MATHATHLON SKILLS - DATABASE SCHEMA
-- Version: 1.0.0
-- Compatible: SQLite (current) + PostgreSQL (future)
-- =============================================

-- ============================================
-- SKILL FRAMEWORK TABLES
-- ============================================

-- Skill Tiers (6 tiers from pedagogical framework)
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

-- Individual Skills (24+ skills across tiers)
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

-- Skill Topics (granular sub-skills)
CREATE TABLE IF NOT EXISTS skill_topics (
  id INTEGER PRIMARY KEY,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  difficulty_weight REAL DEFAULT 1.0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(skill_id, slug)
);

-- Question Templates linked to Skills
CREATE TABLE IF NOT EXISTS skill_questions (
  id INTEGER PRIMARY KEY,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES skill_topics(id),
  template_key TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  points INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 30,
  hint TEXT,
  explanation TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STUDENT PROGRESS TABLES
-- ============================================

-- Student Skill Progress (aggregate per skill)
CREATE TABLE IF NOT EXISTS student_skill_progress (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  
  -- Performance metrics
  total_attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_time_ms INTEGER DEFAULT 0,
  
  -- Level progression (0=not started, 1-5=levels)
  current_level INTEGER DEFAULT 0,
  level_unlocked_at DATETIME,
  
  -- Recent performance (for level stability)
  recent_attempts INTEGER DEFAULT 0,
  recent_correct INTEGER DEFAULT 0,
  
  -- Timestamps
  first_attempt_at DATETIME,
  last_attempt_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(student_id, skill_id)
);

-- Student Topic Progress (granular tracking)
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

-- ============================================
-- SKILL SESSION TABLES
-- ============================================

-- Skill Practice Sessions
CREATE TABLE IF NOT EXISTS skill_sessions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  classroom_id INTEGER REFERENCES classrooms(id),
  
  -- Session config
  mode TEXT DEFAULT 'practice',
  question_count INTEGER DEFAULT 10,
  difficulty INTEGER DEFAULT 2,
  
  -- Results
  score INTEGER DEFAULT 0,
  max_score INTEGER,
  correct_count INTEGER DEFAULT 0,
  accuracy REAL,
  total_time_ms INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Skill Session Responses
CREATE TABLE IF NOT EXISTS skill_responses (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES skill_sessions(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  topic_id INTEGER REFERENCES skill_topics(id),
  question_id INTEGER REFERENCES skill_questions(id),
  
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

-- ============================================
-- CERTIFICATION TABLES
-- ============================================

-- Certificates Earned
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- What was certified
  certificate_type TEXT NOT NULL,
  skill_id INTEGER REFERENCES skills(id),
  cluster_name TEXT,
  level_achieved INTEGER,
  
  -- Achievement metrics
  accuracy REAL,
  total_questions INTEGER,
  best_streak INTEGER,
  avg_time_ms INTEGER,
  
  -- Snapshot at time of issue
  student_name TEXT,
  classroom_name TEXT,
  teacher_name TEXT,
  school_name TEXT,
  
  -- Verification
  verification_code TEXT UNIQUE,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  is_valid BOOLEAN DEFAULT 1
);

-- ============================================
-- CLASSROOM SKILL MANAGEMENT
-- ============================================

-- Classroom Skill Focus (teacher assigns skills)
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

-- Skill Heats (competitive skill-focused heats)
CREATE TABLE IF NOT EXISTS skill_heats (
  id INTEGER PRIMARY KEY,
  classroom_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  heat_id INTEGER REFERENCES heats(id),
  
  name TEXT,
  difficulty INTEGER DEFAULT 2,
  question_count INTEGER DEFAULT 15,
  duration_seconds INTEGER DEFAULT 180,
  
  status TEXT DEFAULT 'waiting',
  started_at DATETIME,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_skills_tier ON skills(tier_id);
CREATE INDEX IF NOT EXISTS idx_skills_power_six ON skills(is_power_six);
CREATE INDEX IF NOT EXISTS idx_skill_topics_skill ON skill_topics(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_questions_skill ON skill_questions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_questions_topic ON skill_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_skill_questions_template ON skill_questions(template_key);

CREATE INDEX IF NOT EXISTS idx_student_skill_progress_student ON student_skill_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skill_progress_skill ON student_skill_progress(skill_id);
CREATE INDEX IF NOT EXISTS idx_student_skill_progress_level ON student_skill_progress(current_level);
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_student ON student_topic_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_topic ON student_topic_progress(topic_id);

CREATE INDEX IF NOT EXISTS idx_skill_sessions_student ON skill_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_sessions_skill ON skill_sessions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_sessions_status ON skill_sessions(status);
CREATE INDEX IF NOT EXISTS idx_skill_responses_session ON skill_responses(session_id);

CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_skill ON certificates(skill_id);

CREATE INDEX IF NOT EXISTS idx_classroom_skill_focus_classroom ON classroom_skill_focus(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_skill_focus_skill ON classroom_skill_focus(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_heats_classroom ON skill_heats(classroom_id);
CREATE INDEX IF NOT EXISTS idx_skill_heats_skill ON skill_heats(skill_id);
