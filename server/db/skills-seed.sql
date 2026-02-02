-- =============================================
-- MATHATHLON SKILLS - SEED DATA
-- The Complete Strategic Skill Framework
-- =============================================

-- ============================================
-- TIER 1: Make-or-Break Foundations
-- ============================================

INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(1, 'Make-or-Break Foundations', 'tier-1-foundations', 
   'If these are weak, everything collapses later. Master these first.', 
   1, '🔑', '#dc2626');

-- Tier 1 Skills
INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(1, 1, 'Integer Operations', 'integer-operations', 'Integers',
   'Adding, subtracting, multiplying, and dividing positive and negative numbers.',
   'Every equation, every formula, every calculation in Algebra and beyond uses integers. Weak integer skills create constant errors.',
   1, '["6.NS.C.5", "6.NS.C.6", "7.NS.A.1", "7.NS.A.2"]', 1),

(2, 1, 'Order of Operations', 'order-of-operations', 'PEMDAS',
   'Understanding mathematical structure through grouping, nesting, and operation priority.',
   'This is mathematical grammar. Without it, expressions become meaningless. Essential for every formula in science and coding.',
   1, '["6.EE.A.2", "6.EE.A.3"]', 2),

(3, 1, 'Number Sense & Magnitude', 'number-sense', 'Number Sense',
   'Comparing numbers, estimation, reasonableness, and understanding absolute value.',
   'Students who can estimate catch their own errors. This skill prevents "calculator dependence" and builds mathematical intuition.',
   0, '["6.NS.C.7", "7.NS.A.1"]', 3),

(4, 1, 'Equivalent Representations', 'equivalent-representations', 'Equivalents',
   'Converting fluently between fractions, decimals, and percents with visual models.',
   'Real-world math constantly switches between forms. Fluency here means confidence in finance, data, and measurement.',
   0, '["6.RP.A.3", "7.RP.A.3"]', 4),

(5, 1, 'Properties of Operations', 'properties-of-operations', 'Op Properties',
   'Commutative, associative, distributive, identity, inverse, and zero properties.',
   'These properties are the "rules of the game" for algebra. They explain WHY manipulation works, not just HOW.',
   1, '["6.EE.A.3", "6.EE.A.4"]', 5);

-- ============================================
-- TIER 2: Algebra Readiness
-- ============================================

INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(2, 'Algebra Readiness', 'tier-2-algebra-ready', 
   'These unlock Algebra I thinking and set you up for high school success.', 
   2, '🧠', '#7c3aed');

-- Tier 2 Skills
INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(6, 2, 'Expressions, Equations & Inequalities', 'expressions-equations', 'Expressions',
   'Understanding the difference between expressions to evaluate and equations to solve.',
   'Confusion here causes students to "solve" when they should simplify. Critical distinction for all of algebra.',
   0, '["6.EE.A.2", "6.EE.B.5", "7.EE.B.4"]', 1),

(7, 2, 'Variables as Generalized Numbers', 'variables', 'Variables',
   'Understanding variables as placeholders, parameters, and pattern representations—not just unknowns.',
   'Limited variable understanding limits algebraic thinking. Strong variable sense enables modeling and abstraction.',
   0, '["6.EE.A.2", "6.EE.B.6"]', 2),

(8, 2, 'Combining Like Terms', 'combining-like-terms', 'Like Terms',
   'Recognizing and combining terms with the same variable structure.',
   'This is structural thinking—seeing 3x + 2x as "3 groups + 2 groups." Foundation for simplification and factoring.',
   0, '["6.EE.A.3", "6.EE.A.4", "7.EE.A.1"]', 3),

(9, 2, 'Properties of Equality', 'properties-of-equality', 'Eq Properties',
   'The rules that let us manipulate equations while keeping them balanced: addition, subtraction, multiplication, division, substitution, reflexive, symmetric, and transitive properties.',
   'Every equation you solve uses these properties. They are the LEGAL MOVES in the algebra game. Without them, equation solving is just memorized tricks.',
   1, '["6.EE.A.3", "6.EE.A.4", "7.EE.A.1", "8.EE.C.7"]', 4),

(10, 2, 'Equality & Balance', 'equality-balance', 'Balance',
   'Understanding equations as balanced scales and using inverse operations to maintain equality.',
   'This mindset IS algebraic reasoning. Students who "get" balance can solve any equation. Those who don''t struggle forever.',
   1, '["6.EE.B.7", "7.EE.B.4", "8.EE.C.7"]', 5);

-- ============================================
-- TIER 3: Ratio & Proportion Power
-- ============================================

INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(3, 'Ratio & Proportion Power', 'tier-3-ratios', 
   'Hidden superpowers that connect math to the real world.', 
   3, '📊', '#0891b2');

-- Tier 3 Skills
INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(11, 3, 'Ratios & Rates', 'ratios-rates', 'Ratios',
   'Understanding ratios as comparisons and rates as ratios with different units.',
   'Unit rates appear everywhere: speed, price per item, efficiency. This is practical math literacy.',
   1, '["6.RP.A.1", "6.RP.A.2", "6.RP.A.3"]', 1),

(12, 3, 'Proportional Relationships', 'proportional-relationships', 'Proportions',
   'Recognizing constant of proportionality, y = kx relationships, and graphs through the origin.',
   'Proportional thinking is the foundation of linear functions, similar figures, and scientific formulas.',
   0, '["7.RP.A.2", "7.RP.A.3"]', 2),

(13, 3, 'Percent Applications', 'percent-applications', 'Percents',
   'Percent as rate per 100, percent change, and real-world fluency.',
   'Finance, statistics, science—percents are the universal language of comparison. Essential life skill.',
   0, '["6.RP.A.3", "7.RP.A.3"]', 3),

(14, 3, 'Scale Factor & Similarity', 'scale-factor', 'Scale',
   'Understanding multiplicative vs additive change and proportional scaling.',
   'Maps, models, enlargements, reductions—scaling is how we connect math to physical reality.',
   0, '["7.G.A.1", "8.G.A.4"]', 4);

-- ============================================
-- TIER 4: Geometry That Feeds Algebra
-- ============================================

INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(4, 'Geometry That Feeds Algebra', 'tier-4-geometry', 
   'Often undervalued, but critical for visual-spatial reasoning.', 
   4, '📐', '#059669');

-- Tier 4 Skills
INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(15, 4, 'Coordinate Plane', 'coordinate-plane', 'Coordinates',
   'Plotting points, understanding quadrants, and interpreting ordered pairs.',
   'Every graph in Algebra lives here. Weak coordinate skills = weak function understanding.',
   0, '["6.NS.C.6", "6.NS.C.8"]', 1),

(16, 4, 'Area & Perimeter Concepts', 'area-perimeter', 'Area',
   'Conceptual understanding of units, squared units, and decomposition—not just formulas.',
   'Area models explain multiplication, distribution, and factoring. This is algebra in visual form.',
   0, '["6.G.A.1", "7.G.B.4", "7.G.B.6"]', 2),

(17, 4, 'Angle Relationships', 'angle-relationships', 'Angles',
   'Complementary, supplementary, linear pairs, and reasoning about constraints.',
   'Early practice with mathematical constraints and relationships. Builds logical reasoning.',
   0, '["7.G.B.5"]', 3);

-- ============================================
-- TIER 5: Data & Logical Thinking
-- ============================================

INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(5, 'Data & Logical Thinking', 'tier-5-data', 
   'Foundation for statistics, probability, and evidence-based reasoning.', 
   5, '📈', '#d97706');

-- Tier 5 Skills
INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(18, 5, 'Reading & Interpreting Graphs', 'reading-graphs', 'Graphs',
   'Moving fluently between tables, graphs, and verbal descriptions.',
   'Data literacy is modern literacy. Every news article, every report uses graphs.',
   0, '["6.SP.B.4", "6.SP.B.5"]', 1),

(19, 5, 'Measures of Center', 'measures-of-center', 'Averages',
   'Understanding mean, median, mode conceptually—including sensitivity to outliers.',
   'Knowing WHICH average to use is more important than calculating them. Critical for data interpretation.',
   0, '["6.SP.B.5", "7.SP.B.4"]', 2),

(20, 5, 'Probability Foundations', 'probability', 'Probability',
   'Probability as ratios of favorable to total outcomes.',
   'Foundation for statistics, risk assessment, and decision-making under uncertainty.',
   0, '["7.SP.C.5", "7.SP.C.6", "7.SP.C.7"]', 3);

-- ============================================
-- TIER 6: Meta-Skills
-- ============================================

INSERT INTO skill_tiers (id, name, slug, description, display_order, icon, color) VALUES
(6, 'Meta-Skills', 'tier-6-meta', 
   'Often ignored but extremely high value thinking skills.', 
   6, '🚀', '#be185d');

-- Tier 6 Skills
INSERT INTO skills (id, tier_id, name, slug, short_name, description, why_it_matters, is_power_six, ccss_codes, display_order) VALUES
(21, 6, 'Mathematical Language', 'math-language', 'Math Language',
   'Precision with terms like "of," "per," "more than," "less than"—translating words to math.',
   'Word problems fail when language fails. This skill unlocks problem comprehension.',
   0, '["6.EE.A.2", "7.EE.B.4"]', 1),

(22, 6, 'Multi-Step Problem Solving', 'multi-step', 'Multi-Step',
   'Breaking complex problems into steps before calculating.',
   'Real problems are never one-step. This is strategic thinking—the skill employers want most.',
   0, '["7.EE.B.3", "7.NS.A.3"]', 2),

(23, 6, 'Checking Reasonableness', 'reasonableness', 'Checking',
   'Using estimation and mental math to validate answers.',
   'Catches errors, builds number sense, develops mathematical skepticism.',
   0, '["7.EE.B.3"]', 3),

(24, 6, 'Pattern Recognition', 'patterns', 'Patterns',
   'Finding rules in tables, sequences, and data—early functional thinking.',
   'Mathematics IS pattern recognition. This skill is the essence of mathematical thinking.',
   0, '["6.EE.A.2", "8.F.A.1"]', 4);

-- ============================================
-- SKILL TOPICS (Granular sub-skills)
-- ============================================

-- Integer Operations Topics (Skill 1)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(1, 'Adding Integers', 'adding-integers', 'Adding positive and negative numbers using number line reasoning', 1),
(1, 'Subtracting Integers', 'subtracting-integers', 'Subtracting integers by adding the opposite', 2),
(1, 'Multiplying Integers', 'multiplying-integers', 'Multiplying positive and negative numbers with sign rules', 3),
(1, 'Dividing Integers', 'dividing-integers', 'Dividing integers with sign rules', 4),
(1, 'Number Line Reasoning', 'number-line', 'Visualizing integer operations on a number line', 5),
(1, 'Mixed Integer Operations', 'mixed-operations', 'Combining multiple operations with integers', 6);

-- Order of Operations Topics (Skill 2)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(2, 'Basic PEMDAS', 'basic-pemdas', 'Applying order of operations without grouping symbols', 1),
(2, 'Parentheses & Brackets', 'grouping-symbols', 'Evaluating expressions with grouping symbols', 2),
(2, 'Nested Grouping', 'nested-grouping', 'Working from innermost to outermost grouping', 3),
(2, 'Exponents in Expressions', 'exponents-expressions', 'Order of operations with powers', 4),
(2, 'Left-to-Right Rule', 'left-to-right', 'Equal priority operations (×÷ and +−)', 5);

-- Properties of Operations Topics (Skill 5)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(5, 'Commutative Property', 'commutative', 'Order does not matter: a + b = b + a, a × b = b × a', 1),
(5, 'Associative Property', 'associative', 'Grouping does not matter: (a + b) + c = a + (b + c)', 2),
(5, 'Distributive Property', 'distributive', 'a(b + c) = ab + ac - THE bridge to algebra', 3),
(5, 'Identity Properties', 'identity', 'a + 0 = a and a × 1 = a', 4),
(5, 'Inverse Properties', 'inverse', 'a + (-a) = 0 and a × (1/a) = 1', 5),
(5, 'Zero Property', 'zero-property', 'a × 0 = 0', 6);

-- Properties of Equality Topics (Skill 9)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(9, 'Addition Property of Equality', 'addition-property', 'If a = b, then a + c = b + c', 1),
(9, 'Subtraction Property of Equality', 'subtraction-property', 'If a = b, then a - c = b - c', 2),
(9, 'Multiplication Property of Equality', 'multiplication-property', 'If a = b, then ac = bc', 3),
(9, 'Division Property of Equality', 'division-property', 'If a = b and c ≠ 0, then a/c = b/c', 4),
(9, 'Substitution Property', 'substitution', 'If a = b, then b can replace a in any expression', 5),
(9, 'Symmetric Property', 'symmetric', 'If a = b, then b = a', 6),
(9, 'Transitive Property', 'transitive', 'If a = b and b = c, then a = c', 7);

-- Equality & Balance Topics (Skill 10)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(10, 'One-Step Equations', 'one-step', 'Solving equations with one operation', 1),
(10, 'Two-Step Equations', 'two-step', 'Solving equations with two operations', 2),
(10, 'Variables on Both Sides', 'both-sides', 'Equations with variables on both sides', 3),
(10, 'Inverse Operations', 'inverse-ops', 'Using opposite operations to isolate variables', 4),
(10, 'Checking Solutions', 'checking', 'Substituting solutions back to verify', 5);

-- Ratios & Rates Topics (Skill 11)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(11, 'Writing Ratios', 'writing-ratios', 'Expressing ratios in different forms (a:b, a/b, a to b)', 1),
(11, 'Equivalent Ratios', 'equivalent-ratios', 'Finding and identifying equivalent ratios', 2),
(11, 'Unit Rates', 'unit-rates', 'Finding rates per one unit', 3),
(11, 'Comparing Rates', 'comparing-rates', 'Determining which rate is better/faster/cheaper', 4),
(11, 'Rate Problems', 'rate-problems', 'Solving real-world rate problems', 5);

-- Combining Like Terms Topics (Skill 8)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(8, 'Identifying Like Terms', 'identifying', 'Recognizing terms with same variable parts', 1),
(8, 'Combining with Addition', 'combining-add', 'Adding coefficients of like terms', 2),
(8, 'Combining with Subtraction', 'combining-sub', 'Subtracting coefficients of like terms', 3),
(8, 'Multiple Variable Types', 'multiple-vars', 'Simplifying expressions with different variables', 4),
(8, 'Combining with Distribution', 'with-distribution', 'Distribute first, then combine', 5);

-- Coordinate Plane Topics (Skill 15)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(15, 'Plotting Points', 'plotting', 'Locating points on the coordinate plane', 1),
(15, 'Identifying Coordinates', 'identifying-coords', 'Reading coordinates from plotted points', 2),
(15, 'Quadrant Recognition', 'quadrants', 'Identifying which quadrant a point is in', 3),
(15, 'Distance on Axes', 'distance-axes', 'Finding horizontal and vertical distances', 4),
(15, 'Reflections', 'reflections', 'Finding reflections across axes', 5);

-- Percent Applications Topics (Skill 13)
INSERT INTO skill_topics (skill_id, name, slug, description, display_order) VALUES
(13, 'Percent of a Number', 'percent-of', 'Finding a percentage of a quantity', 1),
(13, 'Percent Increase', 'percent-increase', 'Calculating percent increase', 2),
(13, 'Percent Decrease', 'percent-decrease', 'Calculating percent decrease', 3),
(13, 'Finding the Whole', 'finding-whole', 'Given part and percent, find the whole', 4),
(13, 'Percent Comparison', 'percent-compare', 'Comparing using percentages', 5);
