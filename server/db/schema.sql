-- Mathathlon Database Schema
-- Version 2.0 - Full Features

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  school_name TEXT,
  country_code TEXT DEFAULT 'US',  -- ISO 3166-1 alpha-2 (e.g., US, GB, IN, CA)
  tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  grade_level INTEGER DEFAULT 4,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Students table (minimal PII - just display name)
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  classroom_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Heats (competition sessions)
CREATE TABLE IF NOT EXISTS heats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  classroom_id INTEGER NOT NULL,
  difficulty_level INTEGER DEFAULT 2,
  question_count INTEGER DEFAULT 20,
  duration_seconds INTEGER DEFAULT 120,
  started_at DATETIME,
  ended_at DATETIME,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Student responses
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heat_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  question_template TEXT NOT NULL,
  question_display TEXT NOT NULL,
  correct_answer INTEGER NOT NULL,
  student_answer INTEGER,
  is_correct BOOLEAN,
  response_time_ms INTEGER,
  answered_at DATETIME,
  FOREIGN KEY (heat_id) REFERENCES heats(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Class vs Class Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenger_classroom_id INTEGER NOT NULL,
  opponent_classroom_id INTEGER NOT NULL,
  difficulty_level INTEGER DEFAULT 2,
  status TEXT DEFAULT 'pending',
  winner_classroom_id INTEGER,
  started_at DATETIME,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenger_classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  FOREIGN KEY (opponent_classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Challenge heats (links heats to challenges)
CREATE TABLE IF NOT EXISTS challenge_heats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenge_id INTEGER NOT NULL,
  heat_id INTEGER NOT NULL,
  classroom_id INTEGER NOT NULL,
  total_score INTEGER DEFAULT 0,
  avg_accuracy REAL DEFAULT 0,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  FOREIGN KEY (heat_id) REFERENCES heats(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON classrooms(join_code);
CREATE INDEX IF NOT EXISTS idx_students_classroom ON students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_heats_classroom ON heats(classroom_id);
CREATE INDEX IF NOT EXISTS idx_heats_started ON heats(started_at);
CREATE INDEX IF NOT EXISTS idx_responses_heat ON responses(heat_id);
CREATE INDEX IF NOT EXISTS idx_responses_student ON responses(student_id);
CREATE INDEX IF NOT EXISTS idx_responses_answered ON responses(answered_at);
CREATE INDEX IF NOT EXISTS idx_responses_template ON responses(question_template);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_teachers_tier ON teachers(tier);

-- Merchandise Products
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  printful_id TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Merchandise Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  stripe_payment_intent TEXT,
  printful_order_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL,
  customization TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes for merchandise
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_teacher ON orders(teacher_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Seed initial products
INSERT OR IGNORE INTO products (id, name, description, category, price_cents, image_url) VALUES
  (1, 'Mathlete Champion T-Shirt', 'Premium cotton t-shirt for competition winners', 'apparel', 1800, '/images/products/champion-tshirt.png'),
  (2, 'Team Jersey', 'Classroom team jersey with number', 'apparel', 2500, '/images/products/team-jersey.png'),
  (3, 'Gold Medal', 'First place medal with ribbon', 'awards', 800, '/images/products/gold-medal.png'),
  (4, 'Silver Medal', 'Second place medal with ribbon', 'awards', 600, '/images/products/silver-medal.png'),
  (5, 'Bronze Medal', 'Third place medal with ribbon', 'awards', 400, '/images/products/bronze-medal.png'),
  (6, 'Champion Trophy', 'Plastic trophy for classroom champions', 'awards', 1500, '/images/products/trophy.png'),
  (7, 'Math Pencil Set (10)', 'Set of 10 pencils with math equations', 'supplies', 500, '/images/products/pencil-set.png'),
  (8, 'Sticker Pack (50)', '50 math-themed reward stickers', 'supplies', 300, '/images/products/stickers.png'),
  (9, 'I Love Math Notebook', 'Spiral notebook for math practice', 'supplies', 600, '/images/products/notebook.png'),
  (10, 'Mathlete Wristband', 'Silicone wristband for team identity', 'accessories', 200, '/images/products/wristband.png'),
  (11, 'Medal Bundle (3-pack)', 'One gold, one silver, one bronze medal', 'bundles', 1500, '/images/products/medal-bundle.png'),
  (12, 'Classroom Prize Kit', 'Medals, stickers, pencils for 30 students', 'bundles', 4500, '/images/products/prize-kit.png');

-- ============================================
-- RESOURCES: Guides, Worksheets, Prep Materials
-- ============================================

-- Resources table (guides, worksheets, prep materials)
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,  -- 'guide', 'worksheet', 'answer-key', 'competition-prep'
  category TEXT NOT NULL,  -- grade level or topic
  grade_level TEXT,  -- 'K-2', '3-5', '6-8', 'all'
  difficulty TEXT,  -- 'easy', 'medium', 'hard'
  is_free BOOLEAN DEFAULT 0,
  price_cents INTEGER DEFAULT 0,
  file_url TEXT,  -- URL to PDF or digital resource
  preview_url TEXT,  -- Preview image or first page
  page_count INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  tags TEXT,  -- comma-separated tags for filtering
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resource purchases/downloads tracking
CREATE TABLE IF NOT EXISTS resource_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  stripe_payment_intent TEXT,
  downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Resource bundles (grouped resources at discount)
CREATE TABLE IF NOT EXISTS resource_bundles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  discount_percent INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bundle items (which resources are in each bundle)
CREATE TABLE IF NOT EXISTS resource_bundle_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_id INTEGER NOT NULL,
  resource_id INTEGER NOT NULL,
  FOREIGN KEY (bundle_id) REFERENCES resource_bundles(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Indexes for resources
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_grade ON resources(grade_level);
CREATE INDEX IF NOT EXISTS idx_resources_free ON resources(is_free);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_teacher ON resource_downloads(teacher_id);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_resource ON resource_downloads(resource_id);

-- Seed initial free resources
INSERT OR IGNORE INTO resources (id, title, description, type, category, grade_level, difficulty, is_free, price_cents, page_count, tags) VALUES
  -- FREE Study Guides
  (1, 'Getting Started with Mathathlon', 'Introduction guide for teachers and students on how to use Mathathlon effectively', 'guide', 'getting-started', 'all', 'easy', 1, 0, 5, 'intro,basics,tutorial'),
  (2, 'Competition Day Tips', 'Strategies for students to perform their best during heats', 'guide', 'competition-prep', 'all', 'easy', 1, 0, 3, 'tips,strategy,competition'),
  (3, 'Mental Math Strategies', 'Techniques for fast mental calculation', 'guide', 'mental-math', '3-5', 'medium', 1, 0, 8, 'mental-math,speed,tricks'),

  -- FREE Practice Worksheets
  (4, 'Addition & Subtraction Warm-Up', '20 problems to practice basic operations', 'worksheet', 'operations', 'K-2', 'easy', 1, 0, 2, 'addition,subtraction,practice'),
  (5, 'Multiplication Facts Sprint', 'Timed practice for multiplication fluency', 'worksheet', 'operations', '3-5', 'medium', 1, 0, 2, 'multiplication,facts,timed'),
  (6, 'Integer Operations Practice', 'Adding and subtracting positive and negative numbers', 'worksheet', 'integers', '6-8', 'medium', 1, 0, 2, 'integers,negative,operations'),

  -- PAID Study Guides
  (7, 'Mastering Order of Operations', 'Deep dive into PEMDAS with practice problems', 'guide', 'order-of-ops', '3-5', 'medium', 0, 299, 12, 'pemdas,order,parentheses'),
  (8, 'Fraction Foundations', 'Complete guide to understanding fractions', 'guide', 'fractions', '3-5', 'medium', 0, 399, 18, 'fractions,equivalent,compare'),
  (9, 'Pre-Algebra Prep Guide', 'Everything needed before Algebra I', 'guide', 'algebra-prep', '6-8', 'hard', 0, 499, 25, 'algebra,variables,equations'),
  (10, 'Proportional Reasoning Mastery', 'Ratios, rates, and proportions explained', 'guide', 'proportions', '6-8', 'medium', 0, 399, 15, 'ratios,rates,proportions'),

  -- PAID Practice Worksheets
  (11, 'K-2 Competition Prep Pack', '50 problems across all K-2 topics', 'worksheet', 'competition-prep', 'K-2', 'medium', 0, 199, 10, 'competition,k2,comprehensive'),
  (12, 'Grade 3-5 Competition Prep Pack', '100 problems covering all 3-5 standards', 'worksheet', 'competition-prep', '3-5', 'medium', 0, 299, 20, 'competition,35,comprehensive'),
  (13, 'Grade 6-8 Competition Prep Pack', '100 challenging pre-algebra problems', 'worksheet', 'competition-prep', '6-8', 'hard', 0, 349, 20, 'competition,68,prealgebra'),
  (14, 'Properties of Operations Drill', 'Commutative, associative, distributive practice', 'worksheet', 'properties', '3-5', 'medium', 0, 199, 5, 'properties,commutative,distributive'),
  (15, 'Word Problem Workshop', 'Multi-step word problems with strategies', 'worksheet', 'word-problems', '3-5', 'hard', 0, 249, 8, 'word-problems,multi-step,strategy'),

  -- PAID Answer Keys (for worksheet bundles)
  (16, 'K-2 Competition Prep - Answer Key', 'Complete solutions with explanations', 'answer-key', 'competition-prep', 'K-2', 'medium', 0, 99, 5, 'answers,solutions,k2'),
  (17, 'Grade 3-5 Competition Prep - Answer Key', 'Complete solutions with explanations', 'answer-key', 'competition-prep', '3-5', 'medium', 0, 149, 10, 'answers,solutions,35'),
  (18, 'Grade 6-8 Competition Prep - Answer Key', 'Complete solutions with explanations', 'answer-key', 'competition-prep', '6-8', 'hard', 0, 149, 10, 'answers,solutions,68'),

  -- Competition Prep Guides
  (19, 'Coach''s Competition Handbook', 'How to run successful classroom competitions', 'competition-prep', 'coaching', 'all', 'medium', 0, 499, 20, 'coaching,teacher,management'),
  (20, 'Math Olympiad Prep: Elementary', 'Advanced problem-solving for gifted students', 'competition-prep', 'olympiad', '3-5', 'hard', 0, 599, 30, 'olympiad,advanced,gifted');

-- Seed resource bundles
INSERT OR IGNORE INTO resource_bundles (id, name, description, price_cents, discount_percent) VALUES
  (1, 'K-2 Complete Bundle', 'All K-2 guides, worksheets, and answer keys', 399, 25),
  (2, 'Grade 3-5 Complete Bundle', 'All 3-5 guides, worksheets, and answer keys', 799, 30),
  (3, 'Grade 6-8 Complete Bundle', 'All 6-8 guides, worksheets, and answer keys', 899, 30),
  (4, 'Competition Coach Bundle', 'Everything a teacher needs for competitions', 999, 35);

-- Link bundle items
INSERT OR IGNORE INTO resource_bundle_items (bundle_id, resource_id) VALUES
  -- K-2 Bundle
  (1, 4), (1, 11), (1, 16),
  -- 3-5 Bundle
  (2, 5), (2, 7), (2, 8), (2, 12), (2, 14), (2, 15), (2, 17),
  -- 6-8 Bundle
  (3, 6), (3, 9), (3, 10), (3, 13), (3, 18),
  -- Coach Bundle
  (4, 1), (4, 2), (4, 3), (4, 19);
