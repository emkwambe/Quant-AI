/**
 * Constants and Configuration for Question Generator
 * @module constants
 */

'use strict';

// ============================================
// GRADE LEVELS
// ============================================

/**
 * Available grade level categories
 * @readonly
 * @enum {string}
 */
const GRADE_LEVELS = Object.freeze({
  K2: 'K-2',
  GRADES_3_5: '3-5',
  GRADES_6_8: '6-8'
});

/**
 * Difficulty level definitions
 * @readonly
 * @enum {number}
 */
const DIFFICULTY_LEVELS = Object.freeze({
  WARM_UP: 1,
  PRACTICE: 2,
  CHALLENGE: 3
});

/**
 * Difficulty ranges mapping to internal difficulty scores
 * @readonly
 */
const DIFFICULTY_RANGES = Object.freeze({
  [DIFFICULTY_LEVELS.WARM_UP]: [0, 1, 2],
  [DIFFICULTY_LEVELS.PRACTICE]: [1, 2, 3],
  [DIFFICULTY_LEVELS.CHALLENGE]: [2, 3, 4, 5, 6]
});

/**
 * Grade level configuration with min/max difficulty scores
 * @readonly
 */
const GRADE_LEVEL_CONFIG = Object.freeze({
  [GRADE_LEVELS.K2]: { minDiff: 0, maxDiff: 2 },
  [GRADE_LEVELS.GRADES_3_5]: { minDiff: 1, maxDiff: 5 },
  [GRADE_LEVELS.GRADES_6_8]: { minDiff: 4, maxDiff: 6 }
});

// ============================================
// SKILL CATEGORIES
// ============================================

/**
 * Skill categories for question classification
 * @readonly
 * @enum {string}
 */
const SKILLS = Object.freeze({
  // K-2 Skills
  COUNTING: 'counting',
  ADDITION: 'addition',
  SUBTRACTION: 'subtraction',
  PLACE_VALUE: 'place-value',
  COMPARISON: 'comparison',
  NUMBER_BONDS: 'number-bonds',
  FACT_FAMILIES: 'fact-families',
  EVEN_ODD: 'even-odd',
  ARRAYS: 'arrays',

  // 3-5 Skills
  MULTIPLICATION: 'multiplication',
  DIVISION: 'division',
  FRACTIONS: 'fractions',
  DECIMALS: 'decimals',
  ROUNDING: 'rounding',
  GEOMETRY: 'geometry',
  MEASUREMENT: 'measurement',
  VOLUME: 'volume',
  FACTORS: 'factors',
  MULTIPLES: 'multiples',
  PRIMES: 'primes',
  PATTERNS: 'patterns',
  TIME: 'time',
  MONEY: 'money',
  ALGEBRA: 'algebra',
  MIXED: 'mixed',
  PROPERTIES: 'properties',
  CONVERSIONS: 'conversions',
  ESTIMATION: 'estimation',
  ORDER_OF_OPERATIONS: 'order-of-operations',

  // 6-8 Skills
  INTEGERS: 'integers',
  EXPONENTS: 'exponents',
  ROOTS: 'roots',
  PERCENT: 'percent',
  RATIOS: 'ratios',
  PROPORTIONS: 'proportions',
  INEQUALITIES: 'inequalities',
  COORDINATES: 'coordinates',
  STATISTICS: 'statistics',
  PROBABILITY: 'probability',
  FINANCIAL: 'financial',
  SCIENTIFIC_NOTATION: 'scientific-notation',
  LINEAR: 'linear',
  SURFACE_AREA: 'surface-area',
  RATES: 'rates',
  TRANSLATION: 'translation',
  WORD_PROBLEMS: 'word-problems'
});

// ============================================
// RANDOM NUMBER GENERATOR CONSTANTS
// ============================================

/**
 * Linear Congruential Generator parameters
 * These constants define the LCG algorithm used for deterministic random generation
 * @see https://en.wikipedia.org/wiki/Linear_congruential_generator
 */
const LCG_MULTIPLIER = 1103515245;
const LCG_INCREMENT = 12345;
const LCG_MODULUS = 0x7fffffff;

// ============================================
// MATHEMATICAL CONSTANTS
// ============================================

/**
 * Pi approximation for geometry calculations
 */
const PI_APPROXIMATION = 3.14;

/**
 * Conversion factors for measurements
 */
const CONVERSIONS = Object.freeze({
  FEET_TO_INCHES: 12,
  YARDS_TO_FEET: 3,
  METERS_TO_CM: 100,
  KG_TO_GRAMS: 1000,
  LITERS_TO_ML: 1000,
  HOURS_TO_MINUTES: 60,
  DAYS_TO_HOURS: 24,
  MILES_TO_FEET: 5280,
  KM_TO_METERS: 1000,
  LB_TO_OZ: 16,
  PINTS_TO_CUPS: 2,
  GALLONS_TO_QUARTS: 4
});

/**
 * Coin values in cents
 */
const COIN_VALUES = Object.freeze({
  QUARTER: 25,
  DIME: 10,
  NICKEL: 5,
  PENNY: 1
});

/**
 * Common fractions for conversion problems
 */
const COMMON_FRACTIONS = Object.freeze([
  { numerator: 1, denominator: 2, decimal: 0.5, percent: 50 },
  { numerator: 1, denominator: 4, decimal: 0.25, percent: 25 },
  { numerator: 3, denominator: 4, decimal: 0.75, percent: 75 },
  { numerator: 1, denominator: 5, decimal: 0.2, percent: 20 },
  { numerator: 2, denominator: 5, decimal: 0.4, percent: 40 },
  { numerator: 3, denominator: 5, decimal: 0.6, percent: 60 },
  { numerator: 4, denominator: 5, decimal: 0.8, percent: 80 },
  { numerator: 1, denominator: 3, decimal: 0.33, percent: 33 },
  { numerator: 2, denominator: 3, decimal: 0.67, percent: 67 }
]);

/**
 * Pythagorean triples for geometry problems
 */
const PYTHAGOREAN_TRIPLES = Object.freeze([
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15]
]);

/**
 * Prime numbers up to 50
 */
const PRIME_NUMBERS = Object.freeze([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47
]);

/**
 * Composite numbers commonly used in problems
 */
const COMPOSITE_NUMBERS = Object.freeze([
  4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30
]);

/**
 * Common emoji for counting problems
 */
const COUNTING_EMOJI = Object.freeze([
  '⭐', '🍎', '🔵', '❤️', '🌟', '🎈', '🌸', '🎁'
]);

// ============================================
// ANSWER ENCODING CONSTANTS
// ============================================

/**
 * Boolean answer encoding for yes/no questions
 */
const BOOLEAN_ANSWERS = Object.freeze({
  YES: 1,
  NO: 0,
  TRUE: 1,
  FALSE: 0,
  EVEN: 1,
  ODD: 0
});

// ============================================
// VALIDATION LIMITS
// ============================================

/**
 * Limits for question generation
 */
const LIMITS = Object.freeze({
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 1000,
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 3,
  MAX_TEMPLATE_RETRIES: 5
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
  GRADE_LEVELS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_RANGES,
  GRADE_LEVEL_CONFIG,
  SKILLS,
  LCG_MULTIPLIER,
  LCG_INCREMENT,
  LCG_MODULUS,
  PI_APPROXIMATION,
  CONVERSIONS,
  COIN_VALUES,
  COMMON_FRACTIONS,
  PYTHAGOREAN_TRIPLES,
  PRIME_NUMBERS,
  COMPOSITE_NUMBERS,
  COUNTING_EMOJI,
  BOOLEAN_ANSWERS,
  LIMITS
};
