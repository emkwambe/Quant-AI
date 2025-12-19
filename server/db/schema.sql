-- Mathathlon Database Schema
-- Version 2.0 - Full Features

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  school_name TEXT,
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
