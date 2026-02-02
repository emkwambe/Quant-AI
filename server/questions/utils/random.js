/**
 * Random Number Generation Utilities
 * Provides deterministic, seeded random number generation for question creation
 * @module utils/random
 */

'use strict';

const { LCG_MULTIPLIER, LCG_INCREMENT, LCG_MODULUS } = require('../constants');

/**
 * Creates a seeded pseudo-random number generator using Linear Congruential Generator (LCG)
 *
 * The LCG algorithm ensures deterministic generation - the same seed will always
 * produce the same sequence of random numbers. This is critical for:
 * - Reproducible question sets
 * - Consistent difficulty levels
 * - Debugging and testing
 *
 * @param {number} seed - Initial seed value (must be a finite number)
 * @returns {Function} Function that returns random numbers between 0 and 1
 * @throws {TypeError} If seed is not a finite number
 *
 * @example
 * const rng = seededRandom(12345);
 * const random1 = rng(); // 0.234...
 * const random2 = rng(); // 0.876...
 */
function seededRandom(seed) {
  if (typeof seed !== 'number' || !Number.isFinite(seed)) {
    throw new TypeError(`Seed must be a finite number, got: ${typeof seed}`);
  }

  let state = Math.floor(seed);

  return function() {
    state = (state * LCG_MULTIPLIER + LCG_INCREMENT) & LCG_MODULUS;
    return state / LCG_MODULUS;
  };
}

/**
 * Generates a random integer within a range (inclusive on both ends)
 *
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {Function} rng - Random number generator function
 * @returns {number} Random integer between min and max (inclusive)
 * @throws {TypeError} If parameters are invalid types
 * @throws {RangeError} If min > max
 *
 * @example
 * const rng = seededRandom(12345);
 * const dice = randInt(1, 6, rng); // Returns 1-6
 */
function randInt(min, max, rng) {
  // Type validation
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError(`min and max must be numbers. Got min: ${typeof min}, max: ${typeof max}`);
  }

  if (typeof rng !== 'function') {
    throw new TypeError(`rng must be a function, got: ${typeof rng}`);
  }

  // Range validation
  if (min > max) {
    throw new RangeError(`min (${min}) must be <= max (${max})`);
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError('min and max must be finite numbers');
  }

  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Picks a random element from an array
 *
 * @template T
 * @param {T[]} array - Array to pick from (must be non-empty)
 * @param {Function} rng - Random number generator function
 * @returns {T} Random element from the array
 * @throws {TypeError} If array is not an array or rng is not a function
 * @throws {RangeError} If array is empty
 *
 * @example
 * const rng = seededRandom(12345);
 * const colors = ['red', 'blue', 'green'];
 * const color = pickOne(colors, rng); // Returns random color
 */
function pickOne(array, rng) {
  if (!Array.isArray(array)) {
    throw new TypeError(`First parameter must be an array, got: ${typeof array}`);
  }

  if (array.length === 0) {
    throw new RangeError('Cannot pick from an empty array');
  }

  if (typeof rng !== 'function') {
    throw new TypeError(`rng must be a function, got: ${typeof rng}`);
  }

  const index = randInt(0, array.length - 1, rng);
  return array[index];
}

/**
 * Generates a random element from an array with weights
 * Higher weights increase the probability of selection
 *
 * @template T
 * @param {Array<{item: T, weight: number}>} weightedArray - Array of objects with item and weight
 * @param {Function} rng - Random number generator function
 * @returns {T} Random weighted element
 * @throws {TypeError} If parameters are invalid
 * @throws {RangeError} If array is empty or weights are invalid
 *
 * @example
 * const rng = seededRandom(12345);
 * const items = [
 *   { item: 'common', weight: 10 },
 *   { item: 'rare', weight: 1 }
 * ];
 * const result = pickWeighted(items, rng);
 */
function pickWeighted(weightedArray, rng) {
  if (!Array.isArray(weightedArray) || weightedArray.length === 0) {
    throw new RangeError('weightedArray must be a non-empty array');
  }

  const totalWeight = weightedArray.reduce((sum, { weight }) => {
    if (typeof weight !== 'number' || weight < 0) {
      throw new TypeError('All weights must be non-negative numbers');
    }
    return sum + weight;
  }, 0);

  if (totalWeight === 0) {
    throw new RangeError('Total weight must be greater than 0');
  }

  let random = rng() * totalWeight;

  for (const { item, weight } of weightedArray) {
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }

  // Fallback (should never reach here due to floating point)
  return weightedArray[weightedArray.length - 1].item;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 *
 * @template T
 * @param {T[]} array - Array to shuffle
 * @param {Function} rng - Random number generator function
 * @returns {T[]} The shuffled array (same reference)
 * @throws {TypeError} If array is not an array
 *
 * @example
 * const rng = seededRandom(12345);
 * const arr = [1, 2, 3, 4, 5];
 * shuffle(arr, rng); // arr is now shuffled
 */
function shuffle(array, rng) {
  if (!Array.isArray(array)) {
    throw new TypeError('First parameter must be an array');
  }

  if (typeof rng !== 'function') {
    throw new TypeError('rng must be a function');
  }

  for (let i = array.length - 1; i > 0; i--) {
    const j = randInt(0, i, rng);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

/**
 * Generates an array of unique random integers
 *
 * @param {number} count - Number of unique integers to generate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {Function} rng - Random number generator function
 * @returns {number[]} Array of unique random integers
 * @throws {RangeError} If count > (max - min + 1)
 *
 * @example
 * const rng = seededRandom(12345);
 * const unique = uniqueRandInts(3, 1, 10, rng); // [7, 2, 9]
 */
function uniqueRandInts(count, min, max, rng) {
  const range = max - min + 1;

  if (count > range) {
    throw new RangeError(`Cannot generate ${count} unique integers from range [${min}, ${max}] (only ${range} possible values)`);
  }

  if (count <= 0) {
    return [];
  }

  const result = [];
  const used = new Set();

  while (result.length < count) {
    const value = randInt(min, max, rng);
    if (!used.has(value)) {
      used.add(value);
      result.push(value);
    }
  }

  return result;
}

module.exports = {
  seededRandom,
  randInt,
  pickOne,
  pickWeighted,
  shuffle,
  uniqueRandInts
};
