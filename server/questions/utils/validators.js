/**
 * Validation Functions
 * Provides input validation for question generation
 * @module utils/validators
 */

'use strict';

const { GRADE_LEVELS, DIFFICULTY_LEVELS, LIMITS } = require('../constants');

/**
 * Validates that a value is a finite number
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated number
 * @throws {TypeError} If value is not a finite number
 */
function validateNumber(value, paramName = 'value') {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${paramName} must be a finite number, got: ${typeof value}`);
  }
  return value;
}

/**
 * Validates that a value is a positive integer
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated integer
 * @throws {TypeError} If value is not a positive integer
 */
function validatePositiveInteger(value, paramName = 'value') {
  validateNumber(value, paramName);

  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${paramName} must be a positive integer, got: ${value}`);
  }

  return value;
}

/**
 * Validates that a value is a non-negative integer
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated integer
 * @throws {TypeError} If value is not a non-negative integer
 */
function validateNonNegativeInteger(value, paramName = 'value') {
  validateNumber(value, paramName);

  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${paramName} must be a non-negative integer, got: ${value}`);
  }

  return value;
}

/**
 * Validates that a value is within a range
 *
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {string} paramName - Parameter name for error messages
 * @returns {number} The validated number
 * @throws {RangeError} If value is outside the range
 */
function validateRange(value, min, max, paramName = 'value') {
  validateNumber(value, paramName);

  if (value < min || value > max) {
    throw new RangeError(`${paramName} must be between ${min} and ${max}, got: ${value}`);
  }

  return value;
}

/**
 * Validates a grade level
 *
 * @param {*} gradeLevel - Grade level to validate
 * @returns {string} The validated grade level
 * @throws {Error} If grade level is invalid
 */
function validateGradeLevel(gradeLevel) {
  const validLevels = Object.values(GRADE_LEVELS);

  if (!validLevels.includes(gradeLevel)) {
    throw new Error(
      `Invalid grade level: "${gradeLevel}". Must be one of: ${validLevels.join(', ')}`
    );
  }

  return gradeLevel;
}

/**
 * Validates a difficulty level
 *
 * @param {*} difficultyLevel - Difficulty level to validate
 * @returns {number} The validated difficulty level
 * @throws {Error} If difficulty level is invalid
 */
function validateDifficultyLevel(difficultyLevel) {
  validateNumber(difficultyLevel, 'difficultyLevel');

  const validLevels = Object.values(DIFFICULTY_LEVELS);

  if (!validLevels.includes(difficultyLevel)) {
    throw new Error(
      `Invalid difficulty level: ${difficultyLevel}. Must be one of: ${validLevels.join(', ')}`
    );
  }

  return difficultyLevel;
}

/**
 * Validates question count
 *
 * @param {*} count - Number of questions to generate
 * @returns {number} The validated count
 * @throws {TypeError} If count is invalid
 */
function validateQuestionCount(count) {
  validatePositiveInteger(count, 'count');

  if (count < LIMITS.MIN_QUESTIONS || count > LIMITS.MAX_QUESTIONS) {
    throw new RangeError(
      `Question count must be between ${LIMITS.MIN_QUESTIONS} and ${LIMITS.MAX_QUESTIONS}, got: ${count}`
    );
  }

  return count;
}

/**
 * Validates a random seed
 *
 * @param {*} seed - Seed value
 * @returns {number} The validated seed
 * @throws {TypeError} If seed is invalid
 */
function validateSeed(seed) {
  return validateNumber(seed, 'seed');
}

/**
 * Validates that a value is a function
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {Function} The validated function
 * @throws {TypeError} If value is not a function
 */
function validateFunction(value, paramName = 'value') {
  if (typeof value !== 'function') {
    throw new TypeError(`${paramName} must be a function, got: ${typeof value}`);
  }
  return value;
}

/**
 * Validates that a value is a non-empty array
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {Array} The validated array
 * @throws {TypeError} If value is not a non-empty array
 */
function validateNonEmptyArray(value, paramName = 'value') {
  if (!Array.isArray(value)) {
    throw new TypeError(`${paramName} must be an array, got: ${typeof value}`);
  }

  if (value.length === 0) {
    throw new RangeError(`${paramName} must be a non-empty array`);
  }

  return value;
}

/**
 * Validates that a value is a non-empty string
 *
 * @param {*} value - Value to validate
 * @param {string} paramName - Parameter name for error messages
 * @returns {string} The validated string
 * @throws {TypeError} If value is not a non-empty string
 */
function validateNonEmptyString(value, paramName = 'value') {
  if (typeof value !== 'string') {
    throw new TypeError(`${paramName} must be a string, got: ${typeof value}`);
  }

  if (value.trim().length === 0) {
    throw new TypeError(`${paramName} must be a non-empty string`);
  }

  return value;
}

/**
 * Validates a question object structure
 *
 * @param {*} question - Question object to validate
 * @returns {Object} The validated question object
 * @throws {TypeError} If question structure is invalid
 */
function validateQuestion(question) {
  if (typeof question !== 'object' || question === null) {
    throw new TypeError('Question must be an object');
  }

  validateNonEmptyString(question.display, 'question.display');
  validateNumber(question.answer, 'question.answer');
  validateNonEmptyString(question.template, 'question.template');

  return question;
}

/**
 * Validates a question template
 *
 * @param {*} template - Template object to validate
 * @param {string} templateName - Template name for error messages
 * @returns {Object} The validated template
 * @throws {Error} If template structure is invalid
 */
function validateTemplate(template, templateName = 'template') {
  if (typeof template !== 'object' || template === null) {
    throw new Error(`${templateName} must be an object`);
  }

  validateGradeLevel(template.grade);
  validateNonNegativeInteger(template.difficulty, `${templateName}.difficulty`);
  validateNonEmptyString(template.skill, `${templateName}.skill`);
  validateNonEmptyString(template.standard, `${templateName}.standard`);
  validateFunction(template.generate, `${templateName}.generate`);

  return template;
}

/**
 * Validates division parameters (ensures no division by zero)
 *
 * @param {number} divisor - Divisor value
 * @returns {number} The validated divisor
 * @throws {Error} If divisor is zero
 */
function validateDivisor(divisor) {
  validateNumber(divisor, 'divisor');

  if (divisor === 0) {
    throw new Error('Divisor cannot be zero');
  }

  return divisor;
}

/**
 * Validates fraction parameters
 *
 * @param {number} numerator - Numerator
 * @param {number} denominator - Denominator
 * @returns {{numerator: number, denominator: number}} Validated fraction
 * @throws {Error} If fraction is invalid
 */
function validateFraction(numerator, denominator) {
  validateNumber(numerator, 'numerator');
  validateDivisor(denominator);

  if (!Number.isInteger(numerator)) {
    throw new TypeError('Numerator must be an integer');
  }

  if (!Number.isInteger(denominator)) {
    throw new TypeError('Denominator must be an integer');
  }

  return { numerator, denominator };
}

/**
 * Validates percentage value (0-100)
 *
 * @param {number} percent - Percentage value
 * @returns {number} The validated percentage
 * @throws {RangeError} If percentage is outside 0-100 range
 */
function validatePercentage(percent) {
  return validateRange(percent, 0, 100, 'percentage');
}

/**
 * Validates coordinate values
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {{x: number, y: number}} Validated coordinates
 */
function validateCoordinates(x, y) {
  validateNumber(x, 'x');
  validateNumber(y, 'y');

  return { x, y };
}

/**
 * Validates that min <= max for range parameters
 *
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {{min: number, max: number}} Validated range
 * @throws {RangeError} If min > max
 */
function validateMinMax(min, max) {
  validateNumber(min, 'min');
  validateNumber(max, 'max');

  if (min > max) {
    throw new RangeError(`min (${min}) must be <= max (${max})`);
  }

  return { min, max };
}

module.exports = {
  validateNumber,
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateRange,
  validateGradeLevel,
  validateDifficultyLevel,
  validateQuestionCount,
  validateSeed,
  validateFunction,
  validateNonEmptyArray,
  validateNonEmptyString,
  validateQuestion,
  validateTemplate,
  validateDivisor,
  validateFraction,
  validatePercentage,
  validateCoordinates,
  validateMinMax
};
