/**
 * Mathematical Helper Functions
 * Provides common mathematical operations for question generation
 * @module utils/math
 */

'use strict';

/**
 * Calculates Greatest Common Divisor using Euclidean algorithm
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} GCD of a and b (always non-negative)
 * @throws {Error} If both a and b are 0
 * @throws {TypeError} If a or b are not numbers
 *
 * @example
 * gcd(12, 8);  // Returns 4
 * gcd(17, 19); // Returns 1 (coprime)
 */
function gcd(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both parameters must be numbers');
  }

  if (a === 0 && b === 0) {
    throw new Error('GCD is undefined for (0, 0)');
  }

  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/**
 * Calculates Least Common Multiple
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} LCM of a and b (always non-negative)
 * @throws {TypeError} If a or b are not numbers
 *
 * @example
 * lcm(4, 6);  // Returns 12
 * lcm(5, 7);  // Returns 35
 */
function lcm(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both parameters must be numbers');
  }

  if (a === 0 || b === 0) {
    return 0;
  }

  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Checks if a number is prime
 *
 * @param {number} n - Number to check
 * @returns {boolean} True if n is prime, false otherwise
 *
 * @example
 * isPrime(7);  // Returns true
 * isPrime(10); // Returns false
 */
function isPrime(n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    return false;
  }

  if (n < 2) {
    return false;
  }

  if (n === 2) {
    return true;
  }

  if (n % 2 === 0) {
    return false;
  }

  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Returns all factors of a number
 *
 * @param {number} n - Number to find factors for
 * @returns {number[]} Array of factors in ascending order
 * @throws {TypeError} If n is not a positive integer
 *
 * @example
 * getFactors(12); // Returns [1, 2, 3, 4, 6, 12]
 */
function getFactors(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) {
    throw new TypeError('n must be a positive integer');
  }

  const factors = [];

  for (let i = 1; i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
    }
  }

  return factors;
}

/**
 * Returns all prime factors of a number
 *
 * @param {number} n - Number to factorize
 * @returns {number[]} Array of prime factors (with repetition)
 * @throws {TypeError} If n is not a positive integer > 1
 *
 * @example
 * primeFactorization(12); // Returns [2, 2, 3]
 * primeFactorization(17); // Returns [17]
 */
function primeFactorization(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 1) {
    throw new TypeError('n must be an integer greater than 1');
  }

  const factors = [];
  let remaining = n;

  // Check for factor of 2
  while (remaining % 2 === 0) {
    factors.push(2);
    remaining /= 2;
  }

  // Check for odd factors
  for (let i = 3; i <= Math.sqrt(remaining); i += 2) {
    while (remaining % i === 0) {
      factors.push(i);
      remaining /= i;
    }
  }

  // If remaining > 1, then it's a prime factor
  if (remaining > 1) {
    factors.push(remaining);
  }

  return factors;
}

/**
 * Rounds a number to specified decimal places
 * Handles floating point precision issues
 *
 * @param {number} value - Number to round
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {number} Rounded number
 *
 * @example
 * roundTo(3.14159, 2); // Returns 3.14
 * roundTo(2.5, 0);     // Returns 3 (rounds half up)
 */
function roundTo(value, decimals = 0) {
  if (typeof value !== 'number') {
    throw new TypeError('value must be a number');
  }

  if (typeof decimals !== 'number' || !Number.isInteger(decimals) || decimals < 0) {
    throw new TypeError('decimals must be a non-negative integer');
  }

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Checks if a number is even
 *
 * @param {number} n - Number to check
 * @returns {boolean} True if even, false otherwise
 *
 * @example
 * isEven(4);  // Returns true
 * isEven(7);  // Returns false
 */
function isEven(n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    return false;
  }
  return n % 2 === 0;
}

/**
 * Checks if a number is odd
 *
 * @param {number} n - Number to check
 * @returns {boolean} True if odd, false otherwise
 *
 * @example
 * isOdd(7);  // Returns true
 * isOdd(4);  // Returns false
 */
function isOdd(n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    return false;
  }
  return n % 2 !== 0;
}

/**
 * Calculates absolute value
 *
 * @param {number} n - Number
 * @returns {number} Absolute value of n
 *
 * @example
 * abs(-5);  // Returns 5
 * abs(3);   // Returns 3
 */
function abs(n) {
  if (typeof n !== 'number') {
    throw new TypeError('n must be a number');
  }
  return Math.abs(n);
}

/**
 * Calculates power
 *
 * @param {number} base - Base number
 * @param {number} exponent - Exponent
 * @returns {number} base^exponent
 *
 * @example
 * power(2, 3);  // Returns 8
 * power(5, 2);  // Returns 25
 */
function power(base, exponent) {
  if (typeof base !== 'number' || typeof exponent !== 'number') {
    throw new TypeError('Both base and exponent must be numbers');
  }
  return Math.pow(base, exponent);
}

/**
 * Calculates square root
 *
 * @param {number} n - Number to find square root of
 * @returns {number} Square root of n
 * @throws {RangeError} If n is negative
 *
 * @example
 * sqrt(16); // Returns 4
 * sqrt(25); // Returns 5
 */
function sqrt(n) {
  if (typeof n !== 'number') {
    throw new TypeError('n must be a number');
  }

  if (n < 0) {
    throw new RangeError('Cannot calculate square root of negative number');
  }

  return Math.sqrt(n);
}

/**
 * Checks if a number is a perfect square
 *
 * @param {number} n - Number to check
 * @returns {boolean} True if n is a perfect square
 *
 * @example
 * isPerfectSquare(16); // Returns true
 * isPerfectSquare(15); // Returns false
 */
function isPerfectSquare(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
    return false;
  }

  const root = Math.sqrt(n);
  return root === Math.floor(root);
}

/**
 * Simplifies a fraction to lowest terms
 *
 * @param {number} numerator - Fraction numerator
 * @param {number} denominator - Fraction denominator
 * @returns {{numerator: number, denominator: number}} Simplified fraction
 * @throws {Error} If denominator is 0
 *
 * @example
 * simplifyFraction(6, 8); // Returns {numerator: 3, denominator: 4}
 */
function simplifyFraction(numerator, denominator) {
  if (denominator === 0) {
    throw new Error('Denominator cannot be 0');
  }

  const divisor = gcd(numerator, denominator);

  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  };
}

/**
 * Converts decimal to fraction
 * Note: Only works accurately for simple decimals
 *
 * @param {number} decimal - Decimal number
 * @param {number} precision - Number of decimal places to consider
 * @returns {{numerator: number, denominator: number}} Fraction representation
 *
 * @example
 * decimalToFraction(0.5, 1);  // Returns {numerator: 1, denominator: 2}
 * decimalToFraction(0.75, 2); // Returns {numerator: 3, denominator: 4}
 */
function decimalToFraction(decimal, precision = 2) {
  const denominator = Math.pow(10, precision);
  const numerator = Math.round(decimal * denominator);

  return simplifyFraction(numerator, denominator);
}

/**
 * Clamps a number between min and max
 *
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 *
 * @example
 * clamp(5, 0, 10);   // Returns 5
 * clamp(-5, 0, 10);  // Returns 0
 * clamp(15, 0, 10);  // Returns 10
 */
function clamp(value, min, max) {
  if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('All parameters must be numbers');
  }

  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates percentage
 *
 * @param {number} part - Part value
 * @param {number} whole - Whole value
 * @returns {number} Percentage (0-100)
 * @throws {Error} If whole is 0
 *
 * @example
 * percentage(25, 100); // Returns 25
 * percentage(1, 4);    // Returns 25
 */
function percentage(part, whole) {
  if (whole === 0) {
    throw new Error('Cannot calculate percentage with whole = 0');
  }

  return (part / whole) * 100;
}

/**
 * Calculates distance between two points in 2D space
 *
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Distance between the points
 *
 * @example
 * distance(0, 0, 3, 4); // Returns 5 (3-4-5 triangle)
 */
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

module.exports = {
  gcd,
  lcm,
  isPrime,
  getFactors,
  primeFactorization,
  roundTo,
  isEven,
  isOdd,
  abs,
  power,
  sqrt,
  isPerfectSquare,
  simplifyFraction,
  decimalToFraction,
  clamp,
  percentage,
  distance
};
