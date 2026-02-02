/**
 * Question Factory
 * Standardized question object creation with validation
 * @module utils/questionFactory
 */

'use strict';

const { validateNonEmptyString, validateNumber } = require('./validators');

/**
 * Creates a standardized question object with validation
 *
 * This factory function ensures all questions have a consistent structure
 * and prevents common errors like missing fields or invalid types.
 *
 * @param {string} display - Question text to display to the user
 * @param {number} answer - Correct numerical answer
 * @param {string} template - Template identifier for tracking
 * @returns {{display: string, answer: number, template: string}} Question object
 * @throws {TypeError} If parameters are invalid
 *
 * @example
 * const question = createQuestion('5 + 3 = ?', 8, 'k2-add-within-10');
 * // Returns: { display: '5 + 3 = ?', answer: 8, template: 'k2-add-within-10' }
 */
function createQuestion(display, answer, template) {
  // Validate inputs
  validateNonEmptyString(display, 'display');
  validateNumber(answer, 'answer');
  validateNonEmptyString(template, 'template');

  // Create standardized question object
  return {
    display: String(display).trim(),
    answer: Number(answer),
    template: String(template).trim()
  };
}

/**
 * Creates an arithmetic question with standard formatting
 *
 * @param {number} a - First operand
 * @param {string} operator - Operator symbol (+, -, ×, ÷)
 * @param {number} b - Second operand
 * @param {number} answer - Correct answer
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createArithmeticQuestion(5, '+', 3, 8, 'k2-add-within-10');
 * // Returns: { display: '5 + 3 = ?', answer: 8, template: 'k2-add-within-10' }
 */
function createArithmeticQuestion(a, b, operator, answer, template) {
  const display = `${a} ${operator} ${b} = ?`;
  return createQuestion(display, answer, template);
}

/**
 * Creates a comparison question
 *
 * @param {string} prompt - Comparison prompt (e.g., "Greater number:")
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} answer - Correct answer
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createComparisonQuestion('Greater number:', 12, 45, 45, 'k2-compare-greater');
 * // Returns: { display: 'Greater number: 12 or 45?', answer: 45, template: 'k2-compare-greater' }
 */
function createComparisonQuestion(prompt, a, b, answer, template) {
  const display = `${prompt} ${a} or ${b}?`;
  return createQuestion(display, answer, template);
}

/**
 * Creates a sequence pattern question
 *
 * @param {number[]} sequence - Array of numbers in the sequence
 * @param {number} answer - Next number in sequence
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createSequenceQuestion([2, 4, 6], 8, 'k2-skip-count-2');
 * // Returns: { display: '2, 4, 6, ?', answer: 8, template: 'k2-skip-count-2' }
 */
function createSequenceQuestion(sequence, answer, template) {
  if (!Array.isArray(sequence) || sequence.length === 0) {
    throw new TypeError('sequence must be a non-empty array');
  }

  const display = `${sequence.join(', ')}, ?`;
  return createQuestion(display, answer, template);
}

/**
 * Creates a fill-in-the-blank equation question
 *
 * @param {string} equation - Equation with ? for the unknown
 * @param {number} answer - Value for the unknown
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createEquationQuestion('5 + ? = 10', 5, 'k2-number-bond-10');
 * // Returns: { display: '5 + ? = 10', answer: 5, template: 'k2-number-bond-10' }
 */
function createEquationQuestion(equation, answer, template) {
  if (!equation.includes('?')) {
    throw new Error('Equation must contain ? symbol for the unknown');
  }

  return createQuestion(equation, answer, template);
}

/**
 * Creates a fraction question
 *
 * @param {number} numerator - Numerator
 * @param {number} denominator - Denominator
 * @param {string} operation - Operation or question type
 * @param {number} answer - Correct answer
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createFractionQuestion(3, 4, '+ 1/4 = ?/4', 4, 'frac-add-same-denom');
 * // Returns: { display: '3/4 + 1/4 = ?/4', answer: 4, template: 'frac-add-same-denom' }
 */
function createFractionQuestion(numerator, denominator, operation, answer, template) {
  const display = `${numerator}/${denominator} ${operation}`;
  return createQuestion(display, answer, template);
}

/**
 * Creates a decimal question
 *
 * @param {number} a - First decimal value
 * @param {string} operator - Operator symbol
 * @param {number} b - Second decimal value (optional)
 * @param {number} answer - Correct answer
 * @param {string} template - Template identifier
 * @param {number} decimals - Number of decimal places to display
 * @returns {Object} Question object
 *
 * @example
 * createDecimalQuestion(1.5, '+', 2.3, 3.8, 'decimal-add-tenths', 1);
 * // Returns: { display: '1.5 + 2.3 = ?', answer: 3.8, template: 'decimal-add-tenths' }
 */
function createDecimalQuestion(a, operator, b, answer, template, decimals = 1) {
  let display;

  if (b !== null && b !== undefined) {
    display = `${a.toFixed(decimals)} ${operator} ${b.toFixed(decimals)} = ?`;
  } else {
    display = `${a.toFixed(decimals)} ${operator} ?`;
  }

  return createQuestion(display, answer, template);
}

/**
 * Creates a geometry question
 *
 * @param {string} shape - Shape type (e.g., "Rectangle", "Square")
 * @param {string} measurement - Measurement type (e.g., "area", "perimeter")
 * @param {Object} dimensions - Dimensions object
 * @param {number} answer - Correct answer
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createGeometryQuestion('Rectangle', 'area', {L: 5, W: 3}, 15, 'rect-area');
 * // Returns: { display: 'Rectangle area: L=5, W=3', answer: 15, template: 'rect-area' }
 */
function createGeometryQuestion(shape, measurement, dimensions, answer, template) {
  const dimStr = Object.entries(dimensions)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');

  const display = `${shape} ${measurement}: ${dimStr}`;
  return createQuestion(display, answer, template);
}

/**
 * Creates a yes/no or true/false question
 *
 * @param {string} questionText - Question text
 * @param {number} answer - Answer (1 for yes/true, 0 for no/false)
 * @param {string} template - Template identifier
 * @param {string} format - Response format ('yes/no' or 'true/false')
 * @returns {Object} Question object
 *
 * @example
 * createBooleanQuestion('Is 7 even', 0, 'k2-even-odd-identify', 'yes/no');
 * // Returns: { display: 'Is 7 even? (1=yes, 0=no)', answer: 0, template: 'k2-even-odd-identify' }
 */
function createBooleanQuestion(questionText, answer, template, format = 'yes/no') {
  if (answer !== 0 && answer !== 1) {
    throw new Error('Boolean question answer must be 0 or 1');
  }

  const labels = format === 'yes/no' ? '(1=yes, 0=no)' : '(1=true, 0=false)';
  const display = `${questionText}? ${labels}`;

  return createQuestion(display, answer, template);
}

/**
 * Creates a word problem question
 *
 * @param {string} problemText - Full problem text
 * @param {number} answer - Correct answer
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createWordProblem('John has 5 apples and gets 3 more. How many does he have?', 8, 'word-addition');
 */
function createWordProblem(problemText, answer, template) {
  return createQuestion(problemText, answer, template);
}

/**
 * Creates an algebraic equation question
 *
 * @param {string} equation - Algebraic equation
 * @param {number} answer - Value of the variable
 * @param {string} template - Template identifier
 * @returns {Object} Question object
 *
 * @example
 * createAlgebraQuestion('x + 5 = 12', 7, '68-solve-x-add');
 * // Returns: { display: 'x + 5 = 12', answer: 7, template: '68-solve-x-add' }
 */
function createAlgebraQuestion(equation, answer, template) {
  return createQuestion(equation, answer, template);
}

module.exports = {
  createQuestion,
  createArithmeticQuestion,
  createComparisonQuestion,
  createSequenceQuestion,
  createEquationQuestion,
  createFractionQuestion,
  createDecimalQuestion,
  createGeometryQuestion,
  createBooleanQuestion,
  createWordProblem,
  createAlgebraQuestion
};
