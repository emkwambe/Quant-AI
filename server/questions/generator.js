// Question Generator - Procedural math question generation
// Full K-8 curriculum coverage

// Seeded random for deterministic question generation
function seededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function randInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne(arr, rng) {
  return arr[randInt(0, arr.length - 1, rng)];
}

// Question templates organized by grade level and difficulty
const templates = {

  // ============================================
  // GRADES K-2 (Counting, Basic Addition/Subtraction)
  // ============================================

  'k2-count-objects': {
    grade: 'K-2',
    difficulty: 0,
    skill: 'counting',
    standard: 'CCSS.K.CC.B.5',
    generate: (rng) => {
      const n = randInt(1, 10, rng);
      const emoji = pickOne(['⭐', '🍎', '🔵', '❤️', '🌟'], rng);
      return { display: `${emoji.repeat(n)} = ?`, answer: n, template: 'k2-count-objects' };
    }
  },

  'k2-add-within-5': {
    grade: 'K-2',
    difficulty: 0,
    skill: 'addition',
    standard: 'CCSS.K.OA.A.5',
    generate: (rng) => {
      const a = randInt(1, 4, rng);
      const b = randInt(1, 5 - a, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'k2-add-within-5' };
    }
  },

  'k2-sub-within-5': {
    grade: 'K-2',
    difficulty: 0,
    skill: 'subtraction',
    standard: 'CCSS.K.OA.A.5',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(1, a - 1, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'k2-sub-within-5' };
    }
  },

  'k2-add-within-10': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'addition',
    standard: 'CCSS.1.OA.C.6',
    generate: (rng) => {
      const a = randInt(1, 9, rng);
      const b = randInt(1, 10 - a, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'k2-add-within-10' };
    }
  },

  'k2-sub-within-10': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'subtraction',
    standard: 'CCSS.1.OA.C.6',
    generate: (rng) => {
      const a = randInt(3, 10, rng);
      const b = randInt(1, a - 1, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'k2-sub-within-10' };
    }
  },

  'k2-add-within-20': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'addition',
    standard: 'CCSS.1.OA.C.6',
    generate: (rng) => {
      const a = randInt(5, 15, rng);
      const b = randInt(1, 20 - a, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'k2-add-within-20' };
    }
  },

  'k2-sub-within-20': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'subtraction',
    standard: 'CCSS.1.OA.C.6',
    generate: (rng) => {
      const a = randInt(10, 20, rng);
      const b = randInt(1, a - 1, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'k2-sub-within-20' };
    }
  },

  'k2-doubles': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'addition',
    standard: 'CCSS.1.OA.C.6',
    generate: (rng) => {
      const a = randInt(1, 10, rng);
      return { display: `${a} + ${a}`, answer: a + a, template: 'k2-doubles' };
    }
  },

  'k2-add-within-100': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'addition',
    standard: 'CCSS.2.NBT.B.5',
    generate: (rng) => {
      const a = randInt(10, 50, rng);
      const b = randInt(10, 99 - a, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'k2-add-within-100' };
    }
  },

  'k2-sub-within-100': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'subtraction',
    standard: 'CCSS.2.NBT.B.5',
    generate: (rng) => {
      const a = randInt(50, 99, rng);
      const b = randInt(10, a - 10, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'k2-sub-within-100' };
    }
  },

  'k2-skip-count-2': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'counting',
    standard: 'CCSS.2.NBT.A.2',
    generate: (rng) => {
      const start = randInt(2, 10, rng) * 2;
      return { display: `${start}, ${start + 2}, ${start + 4}, ?`, answer: start + 6, template: 'k2-skip-count-2' };
    }
  },

  'k2-skip-count-5': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'counting',
    standard: 'CCSS.2.NBT.A.2',
    generate: (rng) => {
      const start = randInt(1, 8, rng) * 5;
      return { display: `${start}, ${start + 5}, ${start + 10}, ?`, answer: start + 15, template: 'k2-skip-count-5' };
    }
  },

  'k2-skip-count-10': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'counting',
    standard: 'CCSS.2.NBT.A.2',
    generate: (rng) => {
      const start = randInt(1, 6, rng) * 10;
      return { display: `${start}, ${start + 10}, ${start + 20}, ?`, answer: start + 30, template: 'k2-skip-count-10' };
    }
  },

  // HIGH PRIORITY: K-2 Place Value
  'k2-place-tens-ones': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'place-value',
    standard: 'CCSS.1.NBT.B.2',
    generate: (rng) => {
      const tens = randInt(1, 9, rng);
      const ones = randInt(0, 9, rng);
      const number = tens * 10 + ones;
      return { display: `${number} = ? tens + ${ones} ones`, answer: tens, template: 'k2-place-tens-ones' };
    }
  },

  'k2-place-value-ones': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'place-value',
    standard: 'CCSS.1.NBT.B.2',
    generate: (rng) => {
      const tens = randInt(1, 9, rng);
      const ones = randInt(0, 9, rng);
      const number = tens * 10 + ones;
      return { display: `${number} = ${tens} tens + ? ones`, answer: ones, template: 'k2-place-value-ones' };
    }
  },

  'k2-place-make-number': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'place-value',
    standard: 'CCSS.1.NBT.B.2',
    generate: (rng) => {
      const tens = randInt(1, 9, rng);
      const ones = randInt(0, 9, rng);
      return { display: `${tens} tens + ${ones} ones = ?`, answer: tens * 10 + ones, template: 'k2-place-make-number' };
    }
  },

  // MEDIUM PRIORITY: K-2 Comparison
  'k2-compare-greater': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'comparison',
    standard: 'CCSS.1.NBT.B.3',
    generate: (rng) => {
      const a = randInt(10, 99, rng);
      let b = randInt(10, 99, rng);
      while (b === a) b = randInt(10, 99, rng);
      return { display: `Which is greater: ${a} or ${b}?`, answer: Math.max(a, b), template: 'k2-compare-greater' };
    }
  },

  'k2-compare-less': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'comparison',
    standard: 'CCSS.1.NBT.B.3',
    generate: (rng) => {
      const a = randInt(10, 99, rng);
      let b = randInt(10, 99, rng);
      while (b === a) b = randInt(10, 99, rng);
      return { display: `Which is less: ${a} or ${b}?`, answer: Math.min(a, b), template: 'k2-compare-less' };
    }
  },

  'k2-compare-10more': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'comparison',
    standard: 'CCSS.1.NBT.C.5',
    generate: (rng) => {
      const a = randInt(10, 80, rng);
      return { display: `10 more than ${a} = ?`, answer: a + 10, template: 'k2-compare-10more' };
    }
  },

  'k2-compare-10less': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'comparison',
    standard: 'CCSS.1.NBT.C.5',
    generate: (rng) => {
      const a = randInt(20, 99, rng);
      return { display: `10 less than ${a} = ?`, answer: a - 10, template: 'k2-compare-10less' };
    }
  },

  // K-2: Number Bonds and Fact Families
  'k2-number-bond-10': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'number-bonds',
    standard: 'CCSS.K.OA.A.4',
    generate: (rng) => {
      const a = randInt(1, 9, rng);
      return { display: `${a} + ? = 10`, answer: 10 - a, template: 'k2-number-bond-10' };
    }
  },

  'k2-number-bond-20': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'number-bonds',
    standard: 'CCSS.1.OA.C.6',
    generate: (rng) => {
      const a = randInt(1, 19, rng);
      return { display: `${a} + ? = 20`, answer: 20 - a, template: 'k2-number-bond-20' };
    }
  },

  'k2-fact-family-add': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'fact-families',
    standard: 'CCSS.1.OA.B.4',
    generate: (rng) => {
      const a = randInt(2, 9, rng);
      const b = randInt(1, a - 1, rng);
      const c = a; // a = b + ?
      return { display: `${b} + ? = ${c}`, answer: c - b, template: 'k2-fact-family-add' };
    }
  },

  'k2-fact-family-sub': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'fact-families',
    standard: 'CCSS.1.OA.B.4',
    generate: (rng) => {
      const total = randInt(5, 15, rng);
      const part = randInt(1, total - 1, rng);
      return { display: `${total} - ${part} = ?`, answer: total - part, template: 'k2-fact-family-sub' };
    }
  },

  // K-2: Even and Odd
  'k2-even-odd-identify': {
    grade: 'K-2',
    difficulty: 1,
    skill: 'even-odd',
    standard: 'CCSS.2.OA.C.3',
    generate: (rng) => {
      const n = randInt(1, 20, rng);
      // Answer: 0 for even, 1 for odd
      return { display: `Is ${n} even(0) or odd(1)?`, answer: n % 2, template: 'k2-even-odd-identify' };
    }
  },

  'k2-next-even': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'even-odd',
    standard: 'CCSS.2.OA.C.3',
    generate: (rng) => {
      const n = randInt(1, 18, rng) * 2; // even number
      return { display: `Next even after ${n}?`, answer: n + 2, template: 'k2-next-even' };
    }
  },

  'k2-next-odd': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'even-odd',
    standard: 'CCSS.2.OA.C.3',
    generate: (rng) => {
      const n = randInt(1, 17, rng) * 2 + 1; // odd number
      return { display: `Next odd after ${n}?`, answer: n + 2, template: 'k2-next-odd' };
    }
  },

  // K-2: Arrays and Equal Groups
  'k2-array-total': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'arrays',
    standard: 'CCSS.2.OA.C.4',
    generate: (rng) => {
      const rows = randInt(2, 5, rng);
      const cols = randInt(2, 5, rng);
      return { display: `${rows} rows × ${cols} columns = ?`, answer: rows * cols, template: 'k2-array-total' };
    }
  },

  'k2-equal-groups': {
    grade: 'K-2',
    difficulty: 2,
    skill: 'arrays',
    standard: 'CCSS.2.OA.C.4',
    generate: (rng) => {
      const groups = randInt(2, 5, rng);
      const perGroup = randInt(2, 5, rng);
      return { display: `${groups} groups of ${perGroup} = ?`, answer: groups * perGroup, template: 'k2-equal-groups' };
    }
  },

  // ============================================
  // GRADES 3-5 (Original templates - kept as is)
  // ============================================

  'add-simple': {
    grade: '3-5',
    difficulty: 1,
    skill: 'addition',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      const a = randInt(1, 20, rng);
      const b = randInt(1, 20, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'add-simple' };
    }
  },

  'sub-simple': {
    grade: '3-5',
    difficulty: 1,
    skill: 'subtraction',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      const a = randInt(10, 30, rng);
      const b = randInt(1, a - 1, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'sub-simple' };
    }
  },

  'add-2digit-no-carry': {
    grade: '3-5',
    difficulty: 2,
    skill: 'addition',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      // Ensure ones digits sum ≤ 9 and tens digits sum ≤ 9
      const a1 = randInt(1, 4, rng); // tens digit of a
      const a0 = randInt(1, 4, rng); // ones digit of a
      const b1 = randInt(1, 9 - a1, rng); // tens digit of b
      const b0 = randInt(1, 9 - a0, rng); // ones digit of b
      const a = a1 * 10 + a0;
      const b = b1 * 10 + b0;
      return { display: `${a} + ${b}`, answer: a + b, template: 'add-2digit-no-carry' };
    }
  },

  'sub-2digit-no-borrow': {
    grade: '3-5',
    difficulty: 2,
    skill: 'subtraction',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      // Ensure ones digit of a ≥ ones digit of b (no borrowing)
      const a1 = randInt(3, 9, rng); // tens digit of a
      const a0 = randInt(2, 9, rng); // ones digit of a (at least 2 so b0 can be 1+)
      const b1 = randInt(1, a1 - 1, rng); // tens digit of b < a1
      const b0 = randInt(1, a0, rng); // ones digit of b ≤ a0
      const a = a1 * 10 + a0;
      const b = b1 * 10 + b0;
      return { display: `${a} - ${b}`, answer: a - b, template: 'sub-2digit-no-borrow' };
    }
  },

  'mult-by-1': {
    grade: '3-5',
    difficulty: 2,
    skill: 'multiplication',
    standard: 'CCSS.3.OA.C.7',
    generate: (rng) => {
      const a = randInt(2, 9, rng);
      const b = randInt(2, 5, rng);
      return { display: `${a} × ${b}`, answer: a * b, template: 'mult-by-1' };
    }
  },

  'mult-by-10': {
    grade: '3-5',
    difficulty: 2,
    skill: 'multiplication',
    standard: 'CCSS.4.NBT.B.5',
    generate: (rng) => {
      const a = randInt(2, 12, rng);
      return { display: `${a} × 10`, answer: a * 10, template: 'mult-by-10' };
    }
  },

  'div-simple': {
    grade: '3-5',
    difficulty: 2,
    skill: 'division',
    standard: 'CCSS.3.OA.C.7',
    generate: (rng) => {
      const b = randInt(2, 5, rng);
      const answer = randInt(2, 9, rng);
      const a = b * answer;
      return { display: `${a} ÷ ${b}`, answer, template: 'div-simple' };
    }
  },

  'add-2digit-carry': {
    grade: '3-5',
    difficulty: 3,
    skill: 'addition',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      const a = randInt(25, 75, rng);
      const b = randInt(25, 99 - a, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'add-2digit-carry' };
    }
  },

  'sub-2digit-borrow': {
    grade: '3-5',
    difficulty: 3,
    skill: 'subtraction',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      const a = randInt(50, 99, rng);
      const b = randInt(a - 49, a - 10, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'sub-2digit-borrow' };
    }
  },

  'mult-facts': {
    grade: '3-5',
    difficulty: 3,
    skill: 'multiplication',
    standard: 'CCSS.3.OA.C.7',
    generate: (rng) => {
      const a = randInt(2, 12, rng);
      const b = randInt(2, 12, rng);
      return { display: `${a} × ${b}`, answer: a * b, template: 'mult-facts' };
    }
  },

  'mult-by-100': {
    grade: '3-5',
    difficulty: 3,
    skill: 'multiplication',
    standard: 'CCSS.4.NBT.B.5',
    generate: (rng) => {
      const a = randInt(2, 20, rng);
      return { display: `${a} × 100`, answer: a * 100, template: 'mult-by-100' };
    }
  },

  'div-facts': {
    grade: '3-5',
    difficulty: 3,
    skill: 'division',
    standard: 'CCSS.3.OA.C.7',
    generate: (rng) => {
      const b = randInt(2, 12, rng);
      const answer = randInt(2, 12, rng);
      const a = b * answer;
      return { display: `${a} ÷ ${b}`, answer, template: 'div-facts' };
    }
  },

  'missing-add': {
    grade: '3-5',
    difficulty: 3,
    skill: 'algebra',
    standard: 'CCSS.4.OA.A.3',
    generate: (rng) => {
      const answer = randInt(5, 30, rng);
      const a = randInt(1, answer - 1, rng);
      const c = a + answer;
      return { display: `${a} + ? = ${c}`, answer, template: 'missing-add' };
    }
  },

  'missing-sub': {
    grade: '3-5',
    difficulty: 3,
    skill: 'algebra',
    standard: 'CCSS.4.OA.A.3',
    generate: (rng) => {
      const a = randInt(20, 50, rng);
      const answer = randInt(5, a - 5, rng);
      const c = a - answer;
      return { display: `${a} - ? = ${c}`, answer, template: 'missing-sub' };
    }
  },

  'add-3digit': {
    grade: '3-5',
    difficulty: 4,
    skill: 'addition',
    standard: 'CCSS.4.NBT.B.4',
    generate: (rng) => {
      const a = randInt(100, 500, rng);
      const b = randInt(100, 999 - a, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'add-3digit' };
    }
  },

  'sub-3digit': {
    grade: '3-5',
    difficulty: 4,
    skill: 'subtraction',
    standard: 'CCSS.4.NBT.B.4',
    generate: (rng) => {
      const a = randInt(500, 999, rng);
      const b = randInt(100, a - 100, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'sub-3digit' };
    }
  },

  'mult-2digit-by-1digit': {
    grade: '3-5',
    difficulty: 4,
    skill: 'multiplication',
    standard: 'CCSS.4.NBT.B.5',
    generate: (rng) => {
      const a = randInt(11, 25, rng);
      const b = randInt(2, 9, rng);
      return { display: `${a} × ${b}`, answer: a * b, template: 'mult-2digit-by-1digit' };
    }
  },

  'div-2digit': {
    grade: '3-5',
    difficulty: 4,
    skill: 'division',
    standard: 'CCSS.4.NBT.B.6',
    generate: (rng) => {
      const b = randInt(2, 9, rng);
      const answer = randInt(10, 20, rng);
      const a = b * answer;
      return { display: `${a} ÷ ${b}`, answer, template: 'div-2digit' };
    }
  },

  'div-with-remainder': {
    grade: '3-5',
    difficulty: 4,
    skill: 'division',
    standard: 'CCSS.4.NBT.B.6',
    generate: (rng) => {
      const b = randInt(3, 9, rng);
      const quotient = randInt(5, 15, rng);
      const remainder = randInt(1, b - 1, rng);
      const a = b * quotient + remainder;
      return { display: `${a} ÷ ${b} = ? R${remainder}`, answer: quotient, template: 'div-with-remainder' };
    }
  },

  'missing-mult': {
    grade: '3-5',
    difficulty: 4,
    skill: 'algebra',
    standard: 'CCSS.4.OA.A.3',
    generate: (rng) => {
      const a = randInt(2, 9, rng);
      const answer = randInt(2, 12, rng);
      const c = a * answer;
      return { display: `${a} × ? = ${c}`, answer, template: 'missing-mult' };
    }
  },

  'add-3-numbers': {
    grade: '3-5',
    difficulty: 5,
    skill: 'addition',
    standard: 'CCSS.4.NBT.B.4',
    generate: (rng) => {
      const a = randInt(10, 40, rng);
      const b = randInt(10, 40, rng);
      const c = randInt(10, 40, rng);
      return { display: `${a} + ${b} + ${c}`, answer: a + b + c, template: 'add-3-numbers' };
    }
  },

  'mixed-add-sub': {
    grade: '3-5',
    difficulty: 5,
    skill: 'mixed',
    standard: 'CCSS.4.OA.A.3',
    generate: (rng) => {
      const a = randInt(50, 100, rng);
      const b = randInt(10, 30, rng);
      const c = randInt(10, 30, rng);
      return { display: `${a} - ${b} + ${c}`, answer: a - b + c, template: 'mixed-add-sub' };
    }
  },

  'mixed-mult-add': {
    grade: '3-5',
    difficulty: 5,
    skill: 'mixed',
    standard: 'CCSS.5.OA.A.1',
    generate: (rng) => {
      const a = randInt(2, 6, rng);
      const b = randInt(2, 6, rng);
      const c = randInt(1, 10, rng);
      return { display: `${a} × ${b} + ${c}`, answer: a * b + c, template: 'mixed-mult-add' };
    }
  },

  'order-of-ops': {
    grade: '3-5',
    difficulty: 5,
    skill: 'mixed',
    standard: 'CCSS.5.OA.A.1',
    generate: (rng) => {
      const a = randInt(2, 10, rng);
      const b = randInt(2, 5, rng);
      const c = randInt(2, 5, rng);
      return { display: `${a} + ${b} × ${c}`, answer: a + b * c, template: 'order-of-ops' };
    }
  },

  'square-numbers': {
    grade: '3-5',
    difficulty: 5,
    skill: 'multiplication',
    standard: 'CCSS.5.NBT.B.5',
    generate: (rng) => {
      const a = randInt(2, 12, rng);
      return { display: `${a}²`, answer: a * a, template: 'square-numbers' };
    }
  },

  // HIGH PRIORITY: 3-5 Fractions
  'frac-add-same-denom': {
    grade: '3-5',
    difficulty: 3,
    skill: 'fractions',
    standard: 'CCSS.4.NF.B.3',
    generate: (rng) => {
      const denom = pickOne([4, 5, 6, 8, 10], rng);
      // Ensure sum stays under denom (proper fraction result)
      const maxA = denom - 2; // leave room for b >= 1
      const a = randInt(1, maxA, rng);
      const maxB = denom - a - 1; // sum < denom
      const b = randInt(1, Math.max(1, maxB), rng); // ensure b >= 1
      return { display: `${a}/${denom} + ${b}/${denom} = ?/${denom}`, answer: a + b, template: 'frac-add-same-denom' };
    }
  },

  'frac-sub-same-denom': {
    grade: '3-5',
    difficulty: 3,
    skill: 'fractions',
    standard: 'CCSS.4.NF.B.3',
    generate: (rng) => {
      const denom = pickOne([4, 5, 6, 8, 10], rng);
      const a = randInt(3, denom - 1, rng);
      const b = randInt(1, a - 1, rng);
      return { display: `${a}/${denom} - ${b}/${denom} = ?/${denom}`, answer: a - b, template: 'frac-sub-same-denom' };
    }
  },

  'frac-compare': {
    grade: '3-5',
    difficulty: 3,
    skill: 'fractions',
    standard: 'CCSS.4.NF.A.2',
    generate: (rng) => {
      const denom = pickOne([4, 5, 6, 8], rng);
      const a = randInt(1, denom - 1, rng);
      let b = randInt(1, denom - 1, rng);
      while (b === a) b = randInt(1, denom - 1, rng);
      // Answer is the larger numerator
      return { display: `Which is greater: ${a}/${denom} or ${b}/${denom}?`, answer: Math.max(a, b), template: 'frac-compare' };
    }
  },

  'frac-equivalent': {
    grade: '3-5',
    difficulty: 4,
    skill: 'fractions',
    standard: 'CCSS.4.NF.A.1',
    generate: (rng) => {
      const numer = randInt(1, 4, rng);
      const denom = randInt(numer + 1, 6, rng);
      const mult = randInt(2, 4, rng);
      // numer/denom = ?/(denom*mult)
      return { display: `${numer}/${denom} = ?/${denom * mult}`, answer: numer * mult, template: 'frac-equivalent' };
    }
  },

  'frac-mixed-to-improper': {
    grade: '3-5',
    difficulty: 4,
    skill: 'fractions',
    standard: 'CCSS.4.NF.B.3',
    generate: (rng) => {
      const whole = randInt(1, 4, rng);
      const denom = randInt(2, 6, rng);
      const numer = randInt(1, denom - 1, rng);
      // whole numer/denom = ?/denom (improper)
      const answer = whole * denom + numer;
      return { display: `${whole} ${numer}/${denom} = ?/${denom}`, answer, template: 'frac-mixed-to-improper' };
    }
  },

  // HIGH PRIORITY: 3-5 Decimals
  'decimal-add-tenths': {
    grade: '3-5',
    difficulty: 3,
    skill: 'decimals',
    standard: 'CCSS.5.NBT.B.7',
    generate: (rng) => {
      const a = randInt(1, 50, rng) / 10;
      const b = randInt(1, 50, rng) / 10;
      const answer = Math.round((a + b) * 10) / 10;
      return { display: `${a.toFixed(1)} + ${b.toFixed(1)}`, answer, template: 'decimal-add-tenths' };
    }
  },

  'decimal-sub-tenths': {
    grade: '3-5',
    difficulty: 3,
    skill: 'decimals',
    standard: 'CCSS.5.NBT.B.7',
    generate: (rng) => {
      const a = randInt(30, 90, rng) / 10;
      const b = randInt(10, Math.floor(a * 10) - 5, rng) / 10;
      const answer = Math.round((a - b) * 10) / 10;
      return { display: `${a.toFixed(1)} - ${b.toFixed(1)}`, answer, template: 'decimal-sub-tenths' };
    }
  },

  'decimal-to-fraction': {
    grade: '3-5',
    difficulty: 4,
    skill: 'decimals',
    standard: 'CCSS.4.NF.C.6',
    generate: (rng) => {
      const numer = randInt(1, 9, rng);
      // 0.X = X/10, answer is X
      return { display: `0.${numer} = ?/10`, answer: numer, template: 'decimal-to-fraction' };
    }
  },

  'decimal-compare': {
    grade: '3-5',
    difficulty: 3,
    skill: 'decimals',
    standard: 'CCSS.5.NBT.A.3',
    generate: (rng) => {
      const a = randInt(10, 99, rng) / 10;
      let b = randInt(10, 99, rng) / 10;
      while (b === a) b = randInt(10, 99, rng) / 10;
      const answer = Math.round(Math.max(a, b) * 10) / 10;
      return { display: `Which is greater: ${a.toFixed(1)} or ${b.toFixed(1)}?`, answer, template: 'decimal-compare' };
    }
  },

  'decimal-mult-10': {
    grade: '3-5',
    difficulty: 4,
    skill: 'decimals',
    standard: 'CCSS.5.NBT.A.2',
    generate: (rng) => {
      // Use integer math to avoid floating point issues
      const aInt = randInt(1, 99, rng);
      const a = aInt / 10;
      const answer = aInt; // a * 10 = (aInt/10) * 10 = aInt
      return { display: `${a.toFixed(1)} × 10`, answer, template: 'decimal-mult-10' };
    }
  },

  // MEDIUM PRIORITY: 3-5 Rounding
  'round-to-10': {
    grade: '3-5',
    difficulty: 2,
    skill: 'rounding',
    standard: 'CCSS.3.NBT.A.1',
    generate: (rng) => {
      const n = randInt(11, 99, rng);
      const answer = Math.round(n / 10) * 10;
      return { display: `Round ${n} to nearest 10`, answer, template: 'round-to-10' };
    }
  },

  'round-to-100': {
    grade: '3-5',
    difficulty: 3,
    skill: 'rounding',
    standard: 'CCSS.3.NBT.A.1',
    generate: (rng) => {
      const n = randInt(101, 999, rng);
      const answer = Math.round(n / 100) * 100;
      return { display: `Round ${n} to nearest 100`, answer, template: 'round-to-100' };
    }
  },

  'round-to-1000': {
    grade: '3-5',
    difficulty: 4,
    skill: 'rounding',
    standard: 'CCSS.4.NBT.A.3',
    generate: (rng) => {
      const n = randInt(1001, 9999, rng);
      const answer = Math.round(n / 1000) * 1000;
      return { display: `Round ${n} to nearest 1000`, answer, template: 'round-to-1000' };
    }
  },

  // MEDIUM PRIORITY: 3-5 Perimeter/Area
  'rect-perimeter': {
    grade: '3-5',
    difficulty: 3,
    skill: 'geometry',
    standard: 'CCSS.3.MD.D.8',
    generate: (rng) => {
      const length = randInt(3, 15, rng);
      const width = randInt(2, 12, rng);
      const answer = 2 * (length + width);
      return { display: `Perimeter: L=${length}, W=${width}`, answer, template: 'rect-perimeter' };
    }
  },

  'rect-area': {
    grade: '3-5',
    difficulty: 3,
    skill: 'geometry',
    standard: 'CCSS.3.MD.C.7',
    generate: (rng) => {
      const length = randInt(2, 12, rng);
      const width = randInt(2, 10, rng);
      const answer = length * width;
      return { display: `Area: L=${length}, W=${width}`, answer, template: 'rect-area' };
    }
  },

  'rect-find-side': {
    grade: '3-5',
    difficulty: 4,
    skill: 'geometry',
    standard: 'CCSS.4.MD.A.3',
    generate: (rng) => {
      const length = randInt(3, 10, rng);
      const width = randInt(2, 8, rng);
      const area = length * width;
      return { display: `Area=${area}, L=${length}, W=?`, answer: width, template: 'rect-find-side' };
    }
  },

  'square-perimeter': {
    grade: '3-5',
    difficulty: 3,
    skill: 'geometry',
    standard: 'CCSS.3.MD.D.8',
    generate: (rng) => {
      const side = randInt(2, 15, rng);
      return { display: `Square perimeter: side=${side}`, answer: 4 * side, template: 'square-perimeter' };
    }
  },

  'square-area': {
    grade: '3-5',
    difficulty: 3,
    skill: 'geometry',
    standard: 'CCSS.3.MD.C.7',
    generate: (rng) => {
      const side = randInt(2, 12, rng);
      return { display: `Square area: side=${side}`, answer: side * side, template: 'square-area' };
    }
  },

  // LOW PRIORITY: 3-5 Time/Money
  'time-elapsed-hours': {
    grade: '3-5',
    difficulty: 3,
    skill: 'time',
    standard: 'CCSS.3.MD.A.1',
    generate: (rng) => {
      const start = randInt(1, 10, rng);
      const elapsed = randInt(1, 6, rng);
      const end = start + elapsed;
      return { display: `${start}:00 to ${end}:00 = ? hours`, answer: elapsed, template: 'time-elapsed-hours' };
    }
  },

  'time-elapsed-30min': {
    grade: '3-5',
    difficulty: 4,
    skill: 'time',
    standard: 'CCSS.3.MD.A.1',
    generate: (rng) => {
      const hours = randInt(1, 4, rng);
      const addHalf = randInt(0, 1, rng);
      const totalMinutes = hours * 60 + addHalf * 30;
      const display = addHalf ? `${hours} hr 30 min = ? minutes` : `${hours} hours = ? minutes`;
      return { display, answer: totalMinutes, template: 'time-elapsed-30min' };
    }
  },

  'money-add-coins': {
    grade: '3-5',
    difficulty: 2,
    skill: 'money',
    standard: 'CCSS.2.MD.C.8',
    generate: (rng) => {
      const quarters = randInt(1, 4, rng);
      const dimes = randInt(0, 5, rng);
      const nickels = randInt(0, 4, rng);
      const total = quarters * 25 + dimes * 10 + nickels * 5;
      return { display: `${quarters}Q + ${dimes}D + ${nickels}N = ? cents`, answer: total, template: 'money-add-coins' };
    }
  },

  'money-make-change': {
    grade: '3-5',
    difficulty: 3,
    skill: 'money',
    standard: 'CCSS.2.MD.C.8',
    generate: (rng) => {
      const paid = pickOne([100, 200, 500, 1000], rng);
      const cost = randInt(10, paid - 10, rng);
      const change = paid - cost;
      const paidDisplay = paid >= 100 ? `$${paid / 100}` : `${paid}¢`;
      const costDisplay = cost >= 100 ? `$${(cost / 100).toFixed(2)}` : `${cost}¢`;
      return { display: `Paid ${paidDisplay}, cost ${costDisplay}, change=?¢`, answer: change, template: 'money-make-change' };
    }
  },

  // 3-5: Factors and Multiples
  'factors-list': {
    grade: '3-5',
    difficulty: 3,
    skill: 'factors',
    standard: 'CCSS.4.OA.B.4',
    generate: (rng) => {
      const n = pickOne([12, 16, 18, 20, 24, 30, 36], rng);
      const factors = [];
      for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
      return { display: `How many factors does ${n} have?`, answer: factors.length, template: 'factors-list' };
    }
  },

  'is-factor': {
    grade: '3-5',
    difficulty: 2,
    skill: 'factors',
    standard: 'CCSS.4.OA.B.4',
    generate: (rng) => {
      const n = randInt(12, 50, rng);
      const f = randInt(2, 9, rng);
      // Answer: 1 if factor, 0 if not
      return { display: `Is ${f} a factor of ${n}? (1=yes, 0=no)`, answer: n % f === 0 ? 1 : 0, template: 'is-factor' };
    }
  },

  'first-multiples': {
    grade: '3-5',
    difficulty: 2,
    skill: 'multiples',
    standard: 'CCSS.4.OA.B.4',
    generate: (rng) => {
      const n = randInt(3, 9, rng);
      const pos = randInt(4, 8, rng);
      return { display: `${pos}th multiple of ${n}?`, answer: n * pos, template: 'first-multiples' };
    }
  },

  'is-multiple': {
    grade: '3-5',
    difficulty: 2,
    skill: 'multiples',
    standard: 'CCSS.4.OA.B.4',
    generate: (rng) => {
      const base = randInt(3, 9, rng);
      const mult = randInt(2, 10, rng);
      const n = base * mult + randInt(0, 1, rng); // sometimes exact multiple
      return { display: `Is ${n} a multiple of ${base}? (1=yes, 0=no)`, answer: n % base === 0 ? 1 : 0, template: 'is-multiple' };
    }
  },

  'is-prime': {
    grade: '3-5',
    difficulty: 3,
    skill: 'primes',
    standard: 'CCSS.4.OA.B.4',
    generate: (rng) => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
      const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];
      const isPrime = randInt(0, 1, rng);
      const n = isPrime ? pickOne(primes, rng) : pickOne(composites, rng);
      return { display: `Is ${n} prime? (1=yes, 0=no)`, answer: isPrime, template: 'is-prime' };
    }
  },

  'prime-factorization-small': {
    grade: '3-5',
    difficulty: 4,
    skill: 'primes',
    standard: 'CCSS.4.OA.B.4',
    generate: (rng) => {
      // Products of small primes
      const a = pickOne([2, 3, 5], rng);
      const b = pickOne([2, 3, 5, 7], rng);
      const n = a * b;
      // Answer is the smaller prime factor
      return { display: `Smallest prime factor of ${n}?`, answer: Math.min(a, b), template: 'prime-factorization-small' };
    }
  },

  // 3-5: Patterns and Sequences
  'pattern-add': {
    grade: '3-5',
    difficulty: 2,
    skill: 'patterns',
    standard: 'CCSS.4.OA.C.5',
    generate: (rng) => {
      const start = randInt(2, 10, rng);
      const step = randInt(2, 7, rng);
      const seq = [start, start + step, start + 2 * step];
      return { display: `${seq.join(', ')}, ?`, answer: start + 3 * step, template: 'pattern-add' };
    }
  },

  'pattern-mult': {
    grade: '3-5',
    difficulty: 3,
    skill: 'patterns',
    standard: 'CCSS.4.OA.C.5',
    generate: (rng) => {
      const start = randInt(1, 3, rng);
      const mult = randInt(2, 3, rng);
      const seq = [start, start * mult, start * mult * mult];
      return { display: `${seq.join(', ')}, ?`, answer: start * mult * mult * mult, template: 'pattern-mult' };
    }
  },

  'pattern-rule': {
    grade: '3-5',
    difficulty: 3,
    skill: 'patterns',
    standard: 'CCSS.4.OA.C.5',
    generate: (rng) => {
      const step = randInt(3, 8, rng);
      const start = randInt(1, 10, rng);
      const pos = randInt(5, 10, rng);
      // What is the Nth term if pattern starts at 'start' and adds 'step'?
      return { display: `Start=${start}, add ${step} each time. Term ${pos}=?`, answer: start + (pos - 1) * step, template: 'pattern-rule' };
    }
  },

  'input-output': {
    grade: '3-5',
    difficulty: 3,
    skill: 'patterns',
    standard: 'CCSS.4.OA.C.5',
    generate: (rng) => {
      const mult = randInt(2, 5, rng);
      const add = randInt(0, 5, rng);
      const input = randInt(3, 10, rng);
      // Rule: output = input × mult + add
      return { display: `Rule: ×${mult}${add > 0 ? '+' + add : ''}. Input=${input}, Output=?`, answer: input * mult + add, template: 'input-output' };
    }
  },

  // 3-5: Measurement Conversions
  'convert-feet-inches': {
    grade: '3-5',
    difficulty: 2,
    skill: 'measurement',
    standard: 'CCSS.4.MD.A.1',
    generate: (rng) => {
      const feet = randInt(1, 8, rng);
      return { display: `${feet} feet = ? inches`, answer: feet * 12, template: 'convert-feet-inches' };
    }
  },

  'convert-yards-feet': {
    grade: '3-5',
    difficulty: 2,
    skill: 'measurement',
    standard: 'CCSS.4.MD.A.1',
    generate: (rng) => {
      const yards = randInt(1, 10, rng);
      return { display: `${yards} yards = ? feet`, answer: yards * 3, template: 'convert-yards-feet' };
    }
  },

  'convert-meters-cm': {
    grade: '3-5',
    difficulty: 2,
    skill: 'measurement',
    standard: 'CCSS.4.MD.A.1',
    generate: (rng) => {
      const meters = randInt(1, 10, rng);
      return { display: `${meters} meters = ? cm`, answer: meters * 100, template: 'convert-meters-cm' };
    }
  },

  'convert-kg-g': {
    grade: '3-5',
    difficulty: 2,
    skill: 'measurement',
    standard: 'CCSS.4.MD.A.1',
    generate: (rng) => {
      const kg = randInt(1, 10, rng);
      return { display: `${kg} kg = ? grams`, answer: kg * 1000, template: 'convert-kg-g' };
    }
  },

  'convert-liters-ml': {
    grade: '3-5',
    difficulty: 2,
    skill: 'measurement',
    standard: 'CCSS.4.MD.A.1',
    generate: (rng) => {
      const liters = randInt(1, 8, rng);
      return { display: `${liters} liters = ? mL`, answer: liters * 1000, template: 'convert-liters-ml' };
    }
  },

  'convert-hours-minutes': {
    grade: '3-5',
    difficulty: 2,
    skill: 'measurement',
    standard: 'CCSS.4.MD.A.1',
    generate: (rng) => {
      const hours = randInt(1, 6, rng);
      return { display: `${hours} hours = ? minutes`, answer: hours * 60, template: 'convert-hours-minutes' };
    }
  },

  'convert-days-hours': {
    grade: '3-5',
    difficulty: 2,
    skill: 'measurement',
    standard: 'CCSS.4.MD.A.1',
    generate: (rng) => {
      const days = randInt(1, 5, rng);
      return { display: `${days} days = ? hours`, answer: days * 24, template: 'convert-days-hours' };
    }
  },

  // 3-5: Volume (3D Shapes)
  'volume-cube': {
    grade: '3-5',
    difficulty: 4,
    skill: 'volume',
    standard: 'CCSS.5.MD.C.5',
    generate: (rng) => {
      const side = randInt(2, 6, rng);
      return { display: `Cube volume: side=${side}`, answer: side * side * side, template: 'volume-cube' };
    }
  },

  'volume-rectangular': {
    grade: '3-5',
    difficulty: 4,
    skill: 'volume',
    standard: 'CCSS.5.MD.C.5',
    generate: (rng) => {
      const l = randInt(2, 6, rng);
      const w = randInt(2, 5, rng);
      const h = randInt(2, 5, rng);
      return { display: `Box volume: ${l}×${w}×${h}`, answer: l * w * h, template: 'volume-rectangular' };
    }
  },

  'volume-unit-cubes': {
    grade: '3-5',
    difficulty: 3,
    skill: 'volume',
    standard: 'CCSS.5.MD.C.3',
    generate: (rng) => {
      const layers = randInt(2, 4, rng);
      const perLayer = randInt(4, 12, rng);
      return { display: `${layers} layers, ${perLayer} cubes each = ?`, answer: layers * perLayer, template: 'volume-unit-cubes' };
    }
  },

  'volume-find-dimension': {
    grade: '3-5',
    difficulty: 5,
    skill: 'volume',
    standard: 'CCSS.5.MD.C.5',
    generate: (rng) => {
      const l = randInt(2, 6, rng);
      const w = randInt(2, 5, rng);
      const h = randInt(2, 5, rng);
      const v = l * w * h;
      return { display: `V=${v}, L=${l}, W=${w}, H=?`, answer: h, template: 'volume-find-dimension' };
    }
  },

  // ============================================
  // TIER 1: ORDER OF OPERATIONS - DEEP MASTERY
  // (Grouping symbols, nested expressions, PEMDAS)
  // ============================================

  '35-parentheses-simple': {
    grade: '3-5',
    difficulty: 3,
    skill: 'order-of-operations',
    standard: 'CCSS.5.OA.A.1',
    generate: (rng) => {
      const a = randInt(2, 6, rng);
      const b = randInt(2, 6, rng);
      const c = randInt(2, 4, rng);
      // (a + b) × c - parentheses change the result
      return { display: `(${a} + ${b}) × ${c}`, answer: (a + b) * c, template: '35-parentheses-simple' };
    }
  },

  '35-parentheses-subtract': {
    grade: '3-5',
    difficulty: 3,
    skill: 'order-of-operations',
    standard: 'CCSS.5.OA.A.1',
    generate: (rng) => {
      const a = randInt(10, 20, rng);
      const b = randInt(2, 5, rng);
      const c = randInt(1, b - 1, rng);
      return { display: `${a} - (${b} - ${c})`, answer: a - (b - c), template: '35-parentheses-subtract' };
    }
  },

  '35-parentheses-vs-no': {
    grade: '3-5',
    difficulty: 4,
    skill: 'order-of-operations',
    standard: 'CCSS.5.OA.A.1',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(2, 5, rng);
      const c = randInt(2, 4, rng);
      // Compare: a + b × c vs (a + b) × c - answer is the DIFFERENCE
      const withoutParen = a + b * c;
      const withParen = (a + b) * c;
      return { display: `(${a}+${b})×${c} minus ${a}+${b}×${c} = ?`, answer: withParen - withoutParen, template: '35-parentheses-vs-no' };
    }
  },

  '35-nested-parentheses': {
    grade: '3-5',
    difficulty: 5,
    skill: 'order-of-operations',
    standard: 'CCSS.5.OA.A.1',
    generate: (rng) => {
      const a = randInt(2, 4, rng);
      const b = randInt(1, 4, rng);
      const c = randInt(1, 3, rng);
      const d = randInt(2, 3, rng);
      // a × (b + (c + d))
      return { display: `${a} × (${b} + (${c} + ${d}))`, answer: a * (b + (c + d)), template: '35-nested-parentheses' };
    }
  },

  // ============================================
  // TIER 1: PROPERTIES OF OPERATIONS
  // (Commutative, Associative, Distributive, Identity, Inverse)
  // ============================================

  '35-commutative-add': {
    grade: '3-5',
    difficulty: 2,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(12, 35, rng);
      const b = randInt(10, 30, rng);
      // If a + b = 47, then b + a = ?
      return { display: `If ${a}+${b}=${a + b}, then ${b}+${a}=?`, answer: a + b, template: '35-commutative-add' };
    }
  },

  '35-commutative-mult': {
    grade: '3-5',
    difficulty: 2,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(3, 9, rng);
      const b = randInt(4, 12, rng);
      return { display: `If ${a}×${b}=${a * b}, then ${b}×${a}=?`, answer: a * b, template: '35-commutative-mult' };
    }
  },

  '35-associative-add': {
    grade: '3-5',
    difficulty: 3,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(10, 25, rng);
      const b = randInt(5, 15, rng);
      const c = randInt(5, 15, rng);
      // (a + b) + c = a + (b + c)
      return { display: `(${a}+${b})+${c} = ${a}+(?+${c})`, answer: b, template: '35-associative-add' };
    }
  },

  '35-associative-mult': {
    grade: '3-5',
    difficulty: 3,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(2, 5, rng);
      const c = randInt(2, 4, rng);
      return { display: `(${a}×${b})×${c} = ${a}×(?×${c})`, answer: b, template: '35-associative-mult' };
    }
  },

  '35-identity-add': {
    grade: '3-5',
    difficulty: 1,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(15, 99, rng);
      return { display: `${a} + 0 = ?`, answer: a, template: '35-identity-add' };
    }
  },

  '35-identity-mult': {
    grade: '3-5',
    difficulty: 1,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(15, 99, rng);
      return { display: `${a} × 1 = ?`, answer: a, template: '35-identity-mult' };
    }
  },

  '35-zero-property': {
    grade: '3-5',
    difficulty: 1,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(25, 150, rng);
      return { display: `${a} × 0 = ?`, answer: 0, template: '35-zero-property' };
    }
  },

  '35-distributive-intro': {
    grade: '3-5',
    difficulty: 4,
    skill: 'properties',
    standard: 'CCSS.3.OA.B.5',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(5, 10, rng);
      const c = randInt(1, 5, rng);
      // a × (b + c) = a×b + a×c
      return { display: `${a}×(${b}+${c}) = ${a}×${b} + ${a}×?`, answer: c, template: '35-distributive-intro' };
    }
  },

  // ============================================
  // TIER 1: EQUIVALENT REPRESENTATIONS
  // (Fraction ↔ Decimal ↔ Percent conversions)
  // ============================================

  '35-frac-to-percent-halves': {
    grade: '3-5',
    difficulty: 3,
    skill: 'conversions',
    standard: 'CCSS.4.NF.C.6',
    generate: (rng) => {
      const fracs = [
        { n: 1, d: 2, p: 50 },
        { n: 1, d: 4, p: 25 },
        { n: 3, d: 4, p: 75 },
        { n: 1, d: 5, p: 20 },
        { n: 2, d: 5, p: 40 },
        { n: 3, d: 5, p: 60 },
        { n: 4, d: 5, p: 80 }
      ];
      const f = pickOne(fracs, rng);
      return { display: `${f.n}/${f.d} = ?%`, answer: f.p, template: '35-frac-to-percent-halves' };
    }
  },

  '35-percent-to-decimal': {
    grade: '3-5',
    difficulty: 3,
    skill: 'conversions',
    standard: 'CCSS.4.NF.C.6',
    generate: (rng) => {
      const percent = pickOne([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90], rng);
      // Answer as integer representing hundredths: 25% = 25 (meaning 0.25)
      return { display: `${percent}% = 0.? (as hundredths)`, answer: percent, template: '35-percent-to-decimal' };
    }
  },

  '35-decimal-to-percent': {
    grade: '3-5',
    difficulty: 3,
    skill: 'conversions',
    standard: 'CCSS.4.NF.C.6',
    generate: (rng) => {
      const percent = pickOne([10, 20, 25, 30, 40, 50, 60, 70, 75, 80], rng);
      const decimal = percent / 100;
      return { display: `${decimal.toFixed(2)} = ?%`, answer: percent, template: '35-decimal-to-percent' };
    }
  },

  '35-frac-dec-equiv': {
    grade: '3-5',
    difficulty: 4,
    skill: 'conversions',
    standard: 'CCSS.4.NF.C.6',
    generate: (rng) => {
      // Known fraction-decimal pairs with clear right/wrong options
      const pairs = [
        { n: 1, d: 2, correct: '0.5', wrong: '0.2' },
        { n: 1, d: 4, correct: '0.25', wrong: '0.4' },
        { n: 3, d: 4, correct: '0.75', wrong: '0.34' },
        { n: 1, d: 5, correct: '0.2', wrong: '0.5' },
        { n: 2, d: 5, correct: '0.4', wrong: '0.25' }
      ];
      const p = pickOne(pairs, rng);
      const isCorrect = randInt(0, 1, rng);
      const shown = isCorrect ? p.correct : p.wrong;
      return { display: `${p.n}/${p.d} = ${shown}? (1=yes, 0=no)`, answer: isCorrect, template: '35-frac-dec-equiv' };
    }
  },

  // ============================================
  // TIER 1: ESTIMATION & REASONABLENESS
  // (Mental math, checking answers)
  // ============================================

  '35-estimate-sum': {
    grade: '3-5',
    difficulty: 2,
    skill: 'estimation',
    standard: 'CCSS.3.NBT.A.1',
    generate: (rng) => {
      const a = randInt(2, 8, rng) * 10 + randInt(1, 9, rng);
      const b = randInt(2, 8, rng) * 10 + randInt(1, 9, rng);
      const rounded = Math.round(a / 10) * 10 + Math.round(b / 10) * 10;
      return { display: `Estimate: ${a} + ${b} ≈ ?`, answer: rounded, template: '35-estimate-sum' };
    }
  },

  '35-estimate-diff': {
    grade: '3-5',
    difficulty: 2,
    skill: 'estimation',
    standard: 'CCSS.3.NBT.A.1',
    generate: (rng) => {
      const a = randInt(5, 9, rng) * 10 + randInt(1, 9, rng);
      const b = randInt(2, 4, rng) * 10 + randInt(1, 9, rng);
      const rounded = Math.round(a / 10) * 10 - Math.round(b / 10) * 10;
      return { display: `Estimate: ${a} - ${b} ≈ ?`, answer: rounded, template: '35-estimate-diff' };
    }
  },

  '35-estimate-product': {
    grade: '3-5',
    difficulty: 3,
    skill: 'estimation',
    standard: 'CCSS.4.NBT.B.5',
    generate: (rng) => {
      const a = randInt(2, 8, rng) * 10 + randInt(1, 9, rng);
      const b = randInt(2, 6, rng);
      const rounded = Math.round(a / 10) * 10 * b;
      return { display: `Estimate: ${a} × ${b} ≈ ?`, answer: rounded, template: '35-estimate-product' };
    }
  },

  '35-reasonable-answer': {
    grade: '3-5',
    difficulty: 3,
    skill: 'estimation',
    standard: 'CCSS.4.OA.A.3',
    generate: (rng) => {
      const a = randInt(20, 50, rng);
      const b = randInt(20, 50, rng);
      const correct = a + b;
      const isReasonable = randInt(0, 1, rng);
      const shown = isReasonable ? correct : correct + randInt(1, 5, rng) * 100;
      return { display: `${a}+${b}=${shown}. Reasonable? (1=yes, 0=no)`, answer: isReasonable, template: '35-reasonable-answer' };
    }
  },

  // ============================================
  // GRADES 6-8 (Pre-Algebra, Integers, Ratios)
  // ============================================

  '68-negative-add': {
    grade: '6-8',
    difficulty: 4,
    skill: 'integers',
    standard: 'CCSS.6.NS.C.5',
    generate: (rng) => {
      const a = randInt(-20, 20, rng);
      const b = randInt(-20, 20, rng);
      const display = b >= 0 ? `${a} + ${b}` : `${a} + (${b})`;
      return { display, answer: a + b, template: '68-negative-add' };
    }
  },

  '68-negative-sub': {
    grade: '6-8',
    difficulty: 4,
    skill: 'integers',
    standard: 'CCSS.6.NS.C.5',
    generate: (rng) => {
      const a = randInt(-20, 20, rng);
      const b = randInt(-20, 20, rng);
      const display = b >= 0 ? `${a} - ${b}` : `${a} - (${b})`;
      return { display, answer: a - b, template: '68-negative-sub' };
    }
  },

  '68-negative-mult': {
    grade: '6-8',
    difficulty: 5,
    skill: 'integers',
    standard: 'CCSS.7.NS.A.2',
    generate: (rng) => {
      const a = randInt(-12, 12, rng);
      const b = randInt(-12, 12, rng);
      if (a === 0 || b === 0) return { display: `${a} × ${b}`, answer: 0, template: '68-negative-mult' };
      const display = `(${a}) × (${b})`;
      return { display, answer: a * b, template: '68-negative-mult' };
    }
  },

  '68-negative-div': {
    grade: '6-8',
    difficulty: 5,
    skill: 'integers',
    standard: 'CCSS.7.NS.A.2',
    generate: (rng) => {
      const b = pickOne([-10, -5, -4, -2, 2, 4, 5, 10], rng);
      const answer = randInt(-10, 10, rng);
      const a = b * answer;
      const display = `(${a}) ÷ (${b})`;
      return { display, answer, template: '68-negative-div' };
    }
  },

  '68-absolute-value': {
    grade: '6-8',
    difficulty: 4,
    skill: 'integers',
    standard: 'CCSS.6.NS.C.7',
    generate: (rng) => {
      const a = randInt(-50, 50, rng);
      return { display: `|${a}|`, answer: Math.abs(a), template: '68-absolute-value' };
    }
  },

  '68-exponents': {
    grade: '6-8',
    difficulty: 5,
    skill: 'exponents',
    standard: 'CCSS.6.EE.A.1',
    generate: (rng) => {
      const base = randInt(2, 5, rng);
      const exp = randInt(2, 4, rng);
      return { display: `${base}^${exp}`, answer: Math.pow(base, exp), template: '68-exponents' };
    }
  },

  '68-square-root': {
    grade: '6-8',
    difficulty: 5,
    skill: 'roots',
    standard: 'CCSS.8.EE.A.2',
    generate: (rng) => {
      const answer = randInt(2, 12, rng);
      const a = answer * answer;
      return { display: `√${a}`, answer, template: '68-square-root' };
    }
  },

  '68-order-of-ops-complex': {
    grade: '6-8',
    difficulty: 6,
    skill: 'mixed',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(2, 5, rng);
      const c = randInt(1, 5, rng);
      // a² + b × c
      return { display: `${a}² + ${b} × ${c}`, answer: a * a + b * c, template: '68-order-of-ops-complex' };
    }
  },

  '68-percent-of': {
    grade: '6-8',
    difficulty: 5,
    skill: 'percent',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const percent = pickOne([10, 20, 25, 50], rng);
      const whole = randInt(2, 20, rng) * (100 / percent);
      const answer = (percent / 100) * whole;
      return { display: `${percent}% of ${whole}`, answer, template: '68-percent-of' };
    }
  },

  '68-fraction-of': {
    grade: '6-8',
    difficulty: 4,
    skill: 'fractions',
    standard: 'CCSS.6.NS.A.1',
    generate: (rng) => {
      const denom = pickOne([2, 3, 4, 5], rng);
      const numer = randInt(1, denom - 1, rng);
      const whole = denom * randInt(2, 8, rng);
      const answer = (numer / denom) * whole;
      return { display: `${numer}/${denom} of ${whole}`, answer, template: '68-fraction-of' };
    }
  },

  '68-solve-x-add': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.6.EE.B.7',
    generate: (rng) => {
      const answer = randInt(1, 20, rng);
      const a = randInt(1, 20, rng);
      const c = a + answer;
      return { display: `x + ${a} = ${c}`, answer, template: '68-solve-x-add' };
    }
  },

  '68-solve-x-mult': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.6.EE.B.7',
    generate: (rng) => {
      const a = randInt(2, 10, rng);
      const answer = randInt(2, 12, rng);
      const c = a * answer;
      return { display: `${a}x = ${c}`, answer, template: '68-solve-x-mult' };
    }
  },

  '68-solve-2step': {
    grade: '6-8',
    difficulty: 6,
    skill: 'algebra',
    standard: 'CCSS.7.EE.B.4',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(1, 10, rng);
      const answer = randInt(1, 10, rng);
      const c = a * answer + b;
      return { display: `${a}x + ${b} = ${c}`, answer, template: '68-solve-2step' };
    }
  },

  '68-ratio': {
    grade: '6-8',
    difficulty: 4,
    skill: 'ratios',
    standard: 'CCSS.6.RP.A.1',
    generate: (rng) => {
      const a = randInt(2, 6, rng);
      const b = randInt(2, 6, rng);
      const mult = randInt(2, 5, rng);
      // If a:b = (a*mult):?, find ?
      return { display: `${a}:${b} = ${a * mult}:?`, answer: b * mult, template: '68-ratio' };
    }
  },

  '68-gcf': {
    grade: '6-8',
    difficulty: 5,
    skill: 'factors',
    standard: 'CCSS.6.NS.B.4',
    generate: (rng) => {
      const gcf = randInt(2, 10, rng);
      const a = gcf * randInt(2, 5, rng);
      const b = gcf * randInt(2, 5, rng);
      // Calculate actual GCF
      const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
      return { display: `GCF(${a}, ${b})`, answer: gcd(a, b), template: '68-gcf' };
    }
  },

  '68-lcm': {
    grade: '6-8',
    difficulty: 5,
    skill: 'multiples',
    standard: 'CCSS.6.NS.B.4',
    generate: (rng) => {
      const a = randInt(2, 8, rng);
      const b = randInt(2, 8, rng);
      const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
      const lcm = (a * b) / gcd(a, b);
      return { display: `LCM(${a}, ${b})`, answer: lcm, template: '68-lcm' };
    }
  },

  '68-distribute': {
    grade: '6-8',
    difficulty: 6,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(1, 10, rng);
      const c = randInt(1, 10, rng);
      // a(b + c) = ?
      return { display: `${a}(${b} + ${c})`, answer: a * (b + c), template: '68-distribute' };
    }
  },

  '68-combine-like': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const a = randInt(2, 10, rng);
      const b = randInt(2, 10, rng);
      // ax + bx = ?x (what coefficient?)
      return { display: `${a}x + ${b}x = ?x`, answer: a + b, template: '68-combine-like' };
    }
  },

  '68-pythagorean': {
    grade: '6-8',
    difficulty: 6,
    skill: 'geometry',
    standard: 'CCSS.8.G.B.7',
    generate: (rng) => {
      // Use Pythagorean triples for integer answers
      const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]];
      const [a, b, c] = pickOne(triples, rng);
      return { display: `a=${a}, b=${b}, c=?`, answer: c, template: '68-pythagorean' };
    }
  },

  // HIGH PRIORITY: 6-8 Proportions
  '68-unit-rate': {
    grade: '6-8',
    difficulty: 4,
    skill: 'ratios',
    standard: 'CCSS.6.RP.A.2',
    generate: (rng) => {
      const rate = randInt(2, 10, rng);
      const quantity = randInt(2, 8, rng);
      const total = rate * quantity;
      return { display: `${total} items for ${quantity} people = ? per person`, answer: rate, template: '68-unit-rate' };
    }
  },

  '68-cross-multiply': {
    grade: '6-8',
    difficulty: 5,
    skill: 'proportions',
    standard: 'CCSS.7.RP.A.2',
    generate: (rng) => {
      const a = randInt(2, 8, rng);
      const b = randInt(2, 8, rng);
      const mult = randInt(2, 5, rng);
      // a/b = (a*mult)/?
      return { display: `${a}/${b} = ${a * mult}/?`, answer: b * mult, template: '68-cross-multiply' };
    }
  },

  '68-scale-factor': {
    grade: '6-8',
    difficulty: 5,
    skill: 'proportions',
    standard: 'CCSS.7.G.A.1',
    generate: (rng) => {
      const original = randInt(3, 12, rng);
      const scale = randInt(2, 5, rng);
      const scaled = original * scale;
      return { display: `Original: ${original}, Scaled: ${scaled}, Factor=?`, answer: scale, template: '68-scale-factor' };
    }
  },

  '68-proportion-word': {
    grade: '6-8',
    difficulty: 5,
    skill: 'proportions',
    standard: 'CCSS.7.RP.A.3',
    generate: (rng) => {
      const rate = randInt(2, 6, rng);
      const time1 = randInt(2, 5, rng);
      const amount1 = rate * time1;
      const time2 = randInt(3, 8, rng);
      return { display: `${amount1} in ${time1} hrs, ? in ${time2} hrs`, answer: rate * time2, template: '68-proportion-word' };
    }
  },

  // MEDIUM PRIORITY: 6-8 Inequalities
  '68-inequality-add': {
    grade: '6-8',
    difficulty: 5,
    skill: 'inequalities',
    standard: 'CCSS.7.EE.B.4',
    generate: (rng) => {
      const answer = randInt(1, 15, rng);
      const a = randInt(1, 10, rng);
      const c = a + answer;
      // x + a < c, so x < (c - a), answer is the boundary
      return { display: `x + ${a} < ${c}, x < ?`, answer: c - a, template: '68-inequality-add' };
    }
  },

  '68-inequality-mult': {
    grade: '6-8',
    difficulty: 5,
    skill: 'inequalities',
    standard: 'CCSS.7.EE.B.4',
    generate: (rng) => {
      const a = randInt(2, 6, rng);
      const answer = randInt(2, 10, rng);
      const c = a * answer;
      // ax ≤ c, so x ≤ c/a
      return { display: `${a}x ≤ ${c}, x ≤ ?`, answer, template: '68-inequality-mult' };
    }
  },

  '68-inequality-2step': {
    grade: '6-8',
    difficulty: 6,
    skill: 'inequalities',
    standard: 'CCSS.7.EE.B.4',
    generate: (rng) => {
      const a = randInt(2, 4, rng);
      const b = randInt(1, 8, rng);
      const answer = randInt(2, 8, rng);
      const c = a * answer + b;
      // ax + b > c, so x > (c-b)/a
      return { display: `${a}x + ${b} > ${c}, x > ?`, answer, template: '68-inequality-2step' };
    }
  },

  // MEDIUM PRIORITY: 6-8 Coordinates
  '68-distance-horizontal': {
    grade: '6-8',
    difficulty: 4,
    skill: 'coordinates',
    standard: 'CCSS.6.NS.C.8',
    generate: (rng) => {
      const x1 = randInt(-10, 5, rng);
      const x2 = randInt(x1 + 2, 10, rng);
      const y = randInt(-5, 5, rng);
      const distance = Math.abs(x2 - x1);
      return { display: `Distance: (${x1},${y}) to (${x2},${y})`, answer: distance, template: '68-distance-horizontal' };
    }
  },

  '68-distance-vertical': {
    grade: '6-8',
    difficulty: 4,
    skill: 'coordinates',
    standard: 'CCSS.6.NS.C.8',
    generate: (rng) => {
      const x = randInt(-5, 5, rng);
      const y1 = randInt(-10, 5, rng);
      const y2 = randInt(y1 + 2, 10, rng);
      const distance = Math.abs(y2 - y1);
      return { display: `Distance: (${x},${y1}) to (${x},${y2})`, answer: distance, template: '68-distance-vertical' };
    }
  },

  '68-midpoint-x': {
    grade: '6-8',
    difficulty: 5,
    skill: 'coordinates',
    standard: 'CCSS.8.G.B.8',
    generate: (rng) => {
      // Use even numbers to ensure integer midpoint
      const x1 = randInt(-8, 4, rng) * 2;
      const x2 = randInt(-4, 8, rng) * 2;
      const y = randInt(-5, 5, rng);
      const midX = (x1 + x2) / 2;
      return { display: `Midpoint x: (${x1},${y}) to (${x2},${y})`, answer: midX, template: '68-midpoint-x' };
    }
  },

  '68-quadrant': {
    grade: '6-8',
    difficulty: 4,
    skill: 'coordinates',
    standard: 'CCSS.6.NS.C.6',
    generate: (rng) => {
      const quadrant = randInt(1, 4, rng);
      let x, y;
      if (quadrant === 1) { x = randInt(1, 10, rng); y = randInt(1, 10, rng); }
      else if (quadrant === 2) { x = randInt(-10, -1, rng); y = randInt(1, 10, rng); }
      else if (quadrant === 3) { x = randInt(-10, -1, rng); y = randInt(-10, -1, rng); }
      else { x = randInt(1, 10, rng); y = randInt(-10, -1, rng); }
      return { display: `(${x}, ${y}) is in Quadrant ?`, answer: quadrant, template: '68-quadrant' };
    }
  },

  // LOW PRIORITY: 6-8 Statistics
  '68-mean': {
    grade: '6-8',
    difficulty: 5,
    skill: 'statistics',
    standard: 'CCSS.6.SP.B.5',
    generate: (rng) => {
      const count = randInt(3, 5, rng);
      const mean = randInt(10, 20, rng); // higher mean to avoid edge cases
      const total = mean * count;
      // Generate numbers around the mean that sum to total
      const nums = [];
      let remaining = total;
      for (let i = 0; i < count - 1; i++) {
        // Keep values reasonable (between mean-5 and mean+5)
        const minVal = Math.max(1, remaining - (count - i - 1) * (mean + 5));
        const maxVal = Math.min(mean + 5, remaining - (count - i - 1));
        const n = randInt(Math.max(1, minVal), Math.max(1, maxVal), rng);
        nums.push(n);
        remaining -= n;
      }
      nums.push(remaining);
      return { display: `Mean of ${nums.join(', ')}`, answer: mean, template: '68-mean' };
    }
  },

  '68-median-odd': {
    grade: '6-8',
    difficulty: 4,
    skill: 'statistics',
    standard: 'CCSS.6.SP.B.5',
    generate: (rng) => {
      const nums = [];
      for (let i = 0; i < 5; i++) {
        nums.push(randInt(1, 20, rng));
      }
      nums.sort((a, b) => a - b);
      const median = nums[2];
      // Shuffle for display
      const shuffled = [...nums].sort(() => rng() - 0.5);
      return { display: `Median of ${shuffled.join(', ')}`, answer: median, template: '68-median-odd' };
    }
  },

  '68-mode': {
    grade: '6-8',
    difficulty: 4,
    skill: 'statistics',
    standard: 'CCSS.6.SP.B.5',
    generate: (rng) => {
      const mode = randInt(2, 15, rng);
      const nums = [mode, mode, mode];
      // Add some other numbers
      for (let i = 0; i < 3; i++) {
        let n = randInt(1, 20, rng);
        while (n === mode) n = randInt(1, 20, rng);
        nums.push(n);
      }
      const shuffled = nums.sort(() => rng() - 0.5);
      return { display: `Mode of ${shuffled.join(', ')}`, answer: mode, template: '68-mode' };
    }
  },

  '68-range': {
    grade: '6-8',
    difficulty: 4,
    skill: 'statistics',
    standard: 'CCSS.6.SP.B.5',
    generate: (rng) => {
      const min = randInt(1, 10, rng);
      const range = randInt(5, 20, rng);
      const max = min + range;
      const nums = [min, max];
      for (let i = 0; i < 3; i++) {
        nums.push(randInt(min, max, rng));
      }
      const shuffled = nums.sort(() => rng() - 0.5);
      return { display: `Range of ${shuffled.join(', ')}`, answer: range, template: '68-range' };
    }
  },

  // LOW PRIORITY: 6-8 Probability
  '68-prob-simple': {
    grade: '6-8',
    difficulty: 4,
    skill: 'probability',
    standard: 'CCSS.7.SP.C.5',
    generate: (rng) => {
      const favorable = randInt(1, 5, rng);
      const total = randInt(favorable + 1, 10, rng);
      // Express as "X out of Y, numerator = ?"
      return { display: `${favorable} favorable out of ${total}: ?/${total}`, answer: favorable, template: '68-prob-simple' };
    }
  },

  '68-prob-complement': {
    grade: '6-8',
    difficulty: 5,
    skill: 'probability',
    standard: 'CCSS.7.SP.C.5',
    generate: (rng) => {
      const total = randInt(5, 10, rng);
      const favorable = randInt(1, total - 1, rng);
      const complement = total - favorable;
      return { display: `P(A)=${favorable}/${total}, P(not A)=?/${total}`, answer: complement, template: '68-prob-complement' };
    }
  },

  '68-prob-dice': {
    grade: '6-8',
    difficulty: 5,
    skill: 'probability',
    standard: 'CCSS.7.SP.C.6',
    generate: (rng) => {
      const target = randInt(1, 6, rng);
      // Rolling exactly target on a 6-sided die: 1/6, but we ask differently
      // "How many ways to roll less than X?"
      return { display: `Ways to roll < ${target + 1} on a die`, answer: target, template: '68-prob-dice' };
    }
  },

  '68-prob-expected': {
    grade: '6-8',
    difficulty: 6,
    skill: 'probability',
    standard: 'CCSS.7.SP.C.6',
    generate: (rng) => {
      const prob = pickOne([2, 4, 5, 10], rng); // represents X/10 probability
      const trials = randInt(2, 5, rng) * 10;
      const expected = (prob / 10) * trials;
      return { display: `P=${prob}/10, ${trials} trials, expected=?`, answer: expected, template: '68-prob-expected' };
    }
  },

  // 6-8: Percent Change and Financial Math
  '68-percent-increase': {
    grade: '6-8',
    difficulty: 5,
    skill: 'percent',
    standard: 'CCSS.7.RP.A.3',
    generate: (rng) => {
      const original = randInt(2, 10, rng) * 10;
      const percent = pickOne([10, 20, 25, 50], rng);
      const increase = original * percent / 100;
      return { display: `${original} + ${percent}% = ?`, answer: original + increase, template: '68-percent-increase' };
    }
  },

  '68-percent-decrease': {
    grade: '6-8',
    difficulty: 5,
    skill: 'percent',
    standard: 'CCSS.7.RP.A.3',
    generate: (rng) => {
      const original = randInt(2, 10, rng) * 10;
      const percent = pickOne([10, 20, 25, 50], rng);
      const decrease = original * percent / 100;
      return { display: `${original} - ${percent}% = ?`, answer: original - decrease, template: '68-percent-decrease' };
    }
  },

  '68-find-percent-change': {
    grade: '6-8',
    difficulty: 5,
    skill: 'percent',
    standard: 'CCSS.7.RP.A.3',
    generate: (rng) => {
      const original = randInt(2, 10, rng) * 10;
      const percent = pickOne([10, 20, 25, 50], rng);
      const newVal = original + original * percent / 100;
      return { display: `${original} → ${newVal}, % increase?`, answer: percent, template: '68-find-percent-change' };
    }
  },

  '68-simple-interest': {
    grade: '6-8',
    difficulty: 5,
    skill: 'financial',
    standard: 'CCSS.7.RP.A.3',
    generate: (rng) => {
      const principal = randInt(1, 5, rng) * 100;
      const rate = pickOne([5, 10, 20], rng);
      const years = randInt(1, 3, rng);
      const interest = principal * rate * years / 100;
      return { display: `I = $${principal} × ${rate}% × ${years}yr`, answer: interest, template: '68-simple-interest' };
    }
  },

  '68-discount': {
    grade: '6-8',
    difficulty: 5,
    skill: 'financial',
    standard: 'CCSS.7.RP.A.3',
    generate: (rng) => {
      const price = randInt(2, 10, rng) * 10;
      const discount = pickOne([10, 20, 25, 50], rng);
      const sale = price - price * discount / 100;
      return { display: `$${price} with ${discount}% off = ?`, answer: sale, template: '68-discount' };
    }
  },

  '68-tax-tip': {
    grade: '6-8',
    difficulty: 5,
    skill: 'financial',
    standard: 'CCSS.7.RP.A.3',
    generate: (rng) => {
      // Use 10% or 20% to ensure integer answers
      const tipPercent = pickOne([10, 20], rng);
      const bill = randInt(2, 10, rng) * 10;
      const tip = bill * tipPercent / 100;
      return { display: `$${bill} + ${tipPercent}% tip = ?`, answer: bill + tip, template: '68-tax-tip' };
    }
  },

  // 6-8: Scientific Notation
  '68-sci-notation-read': {
    grade: '6-8',
    difficulty: 5,
    skill: 'scientific-notation',
    standard: 'CCSS.8.EE.A.3',
    generate: (rng) => {
      const coef = randInt(1, 9, rng);
      const exp = randInt(2, 5, rng);
      const answer = coef * Math.pow(10, exp);
      return { display: `${coef} × 10^${exp} = ?`, answer, template: '68-sci-notation-read' };
    }
  },

  '68-sci-notation-write-exp': {
    grade: '6-8',
    difficulty: 5,
    skill: 'scientific-notation',
    standard: 'CCSS.8.EE.A.3',
    generate: (rng) => {
      const exp = randInt(3, 6, rng);
      const n = Math.pow(10, exp);
      return { display: `${n.toLocaleString()} = 10^?`, answer: exp, template: '68-sci-notation-write-exp' };
    }
  },

  '68-sci-notation-compare': {
    grade: '6-8',
    difficulty: 6,
    skill: 'scientific-notation',
    standard: 'CCSS.8.EE.A.3',
    generate: (rng) => {
      const exp1 = randInt(3, 6, rng);
      let exp2 = randInt(3, 6, rng);
      const coef1 = randInt(1, 9, rng);
      let coef2 = randInt(1, 9, rng);
      // Ensure they're different
      while (exp1 === exp2 && coef1 === coef2) {
        exp2 = randInt(3, 6, rng);
        coef2 = randInt(1, 9, rng);
      }
      const n1 = coef1 * Math.pow(10, exp1);
      const n2 = coef2 * Math.pow(10, exp2);
      // Answer: 1 if first is larger, 2 if second
      return { display: `Larger: (1) ${coef1}×10^${exp1} or (2) ${coef2}×10^${exp2}?`, answer: n1 > n2 ? 1 : 2, template: '68-sci-notation-compare' };
    }
  },

  // 6-8: Linear Equations (Slope and Graphing)
  '68-slope-from-points': {
    grade: '6-8',
    difficulty: 5,
    skill: 'linear',
    standard: 'CCSS.8.EE.B.6',
    generate: (rng) => {
      const rise = randInt(-5, 5, rng);
      const run = randInt(1, 5, rng);
      const x1 = randInt(0, 5, rng);
      const y1 = randInt(0, 5, rng);
      const x2 = x1 + run;
      const y2 = y1 + rise;
      // Answer is rise (slope = rise/run, but we ask for rise)
      return { display: `(${x1},${y1}) to (${x2},${y2}): rise=?`, answer: rise, template: '68-slope-from-points' };
    }
  },

  '68-slope-from-equation': {
    grade: '6-8',
    difficulty: 5,
    skill: 'linear',
    standard: 'CCSS.8.EE.B.6',
    generate: (rng) => {
      const m = randInt(-5, 5, rng);
      const b = randInt(-10, 10, rng);
      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      return { display: `y = ${m}x ${bStr}, slope=?`, answer: m, template: '68-slope-from-equation' };
    }
  },

  '68-y-intercept': {
    grade: '6-8',
    difficulty: 5,
    skill: 'linear',
    standard: 'CCSS.8.F.A.3',
    generate: (rng) => {
      const m = randInt(-5, 5, rng);
      const b = randInt(-10, 10, rng);
      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      return { display: `y = ${m}x ${bStr}, y-intercept=?`, answer: b, template: '68-y-intercept' };
    }
  },

  '68-find-y': {
    grade: '6-8',
    difficulty: 5,
    skill: 'linear',
    standard: 'CCSS.8.F.A.1',
    generate: (rng) => {
      const m = randInt(1, 5, rng);
      const b = randInt(0, 10, rng);
      const x = randInt(1, 5, rng);
      return { display: `y = ${m}x + ${b}, x=${x}, y=?`, answer: m * x + b, template: '68-find-y' };
    }
  },

  '68-find-x': {
    grade: '6-8',
    difficulty: 6,
    skill: 'linear',
    standard: 'CCSS.8.F.A.1',
    generate: (rng) => {
      const m = randInt(2, 5, rng);
      const b = randInt(0, 10, rng);
      const x = randInt(1, 5, rng);
      const y = m * x + b;
      return { display: `y = ${m}x + ${b}, y=${y}, x=?`, answer: x, template: '68-find-x' };
    }
  },

  // 6-8: Surface Area and Volume (3D)
  '68-volume-cylinder': {
    grade: '6-8',
    difficulty: 5,
    skill: 'volume',
    standard: 'CCSS.8.G.C.9',
    generate: (rng) => {
      const r = randInt(2, 5, rng);
      const h = randInt(2, 6, rng);
      // V = πr²h, use π≈3.14, round to nearest integer
      const v = Math.round(3.14 * r * r * h);
      return { display: `Cylinder: r=${r}, h=${h}, V≈? (π≈3.14)`, answer: v, template: '68-volume-cylinder' };
    }
  },

  '68-volume-cone': {
    grade: '6-8',
    difficulty: 6,
    skill: 'volume',
    standard: 'CCSS.8.G.C.9',
    generate: (rng) => {
      const r = randInt(2, 4, rng);
      const h = randInt(3, 9, rng);
      // V = (1/3)πr²h
      const v = Math.round(3.14 * r * r * h / 3);
      return { display: `Cone: r=${r}, h=${h}, V≈? (π≈3.14)`, answer: v, template: '68-volume-cone' };
    }
  },

  '68-volume-sphere': {
    grade: '6-8',
    difficulty: 6,
    skill: 'volume',
    standard: 'CCSS.8.G.C.9',
    generate: (rng) => {
      const r = randInt(2, 4, rng);
      // V = (4/3)πr³
      const v = Math.round(4 * 3.14 * r * r * r / 3);
      return { display: `Sphere: r=${r}, V≈? (π≈3.14)`, answer: v, template: '68-volume-sphere' };
    }
  },

  '68-surface-area-cube': {
    grade: '6-8',
    difficulty: 5,
    skill: 'surface-area',
    standard: 'CCSS.7.G.B.6',
    generate: (rng) => {
      const s = randInt(2, 8, rng);
      return { display: `Cube surface area: s=${s}`, answer: 6 * s * s, template: '68-surface-area-cube' };
    }
  },

  '68-surface-area-box': {
    grade: '6-8',
    difficulty: 5,
    skill: 'surface-area',
    standard: 'CCSS.7.G.B.6',
    generate: (rng) => {
      const l = randInt(2, 5, rng);
      const w = randInt(2, 4, rng);
      const h = randInt(2, 4, rng);
      const sa = 2 * (l * w + l * h + w * h);
      return { display: `Box SA: ${l}×${w}×${h}`, answer: sa, template: '68-surface-area-box' };
    }
  },

  // 6-8: Unit Conversions (Advanced)
  '68-convert-miles-feet': {
    grade: '6-8',
    difficulty: 4,
    skill: 'conversions',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const miles = randInt(1, 3, rng);
      return { display: `${miles} mile(s) = ? feet`, answer: miles * 5280, template: '68-convert-miles-feet' };
    }
  },

  '68-convert-km-m': {
    grade: '6-8',
    difficulty: 4,
    skill: 'conversions',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const km = randInt(1, 10, rng);
      return { display: `${km} km = ? m`, answer: km * 1000, template: '68-convert-km-m' };
    }
  },

  '68-convert-oz-lb': {
    grade: '6-8',
    difficulty: 4,
    skill: 'conversions',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const lb = randInt(1, 8, rng);
      return { display: `${lb} lb = ? oz`, answer: lb * 16, template: '68-convert-oz-lb' };
    }
  },

  '68-convert-cups-pints': {
    grade: '6-8',
    difficulty: 4,
    skill: 'conversions',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const pints = randInt(1, 8, rng);
      return { display: `${pints} pints = ? cups`, answer: pints * 2, template: '68-convert-cups-pints' };
    }
  },

  '68-convert-quarts-gallons': {
    grade: '6-8',
    difficulty: 4,
    skill: 'conversions',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const gallons = randInt(1, 6, rng);
      return { display: `${gallons} gallons = ? quarts`, answer: gallons * 4, template: '68-convert-quarts-gallons' };
    }
  },

  '68-speed-distance-time': {
    grade: '6-8',
    difficulty: 5,
    skill: 'rates',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const speed = randInt(20, 60, rng);
      const time = randInt(2, 5, rng);
      return { display: `${speed} mph × ${time} hours = ? miles`, answer: speed * time, template: '68-speed-distance-time' };
    }
  },

  '68-unit-rate-complex': {
    grade: '6-8',
    difficulty: 5,
    skill: 'rates',
    standard: 'CCSS.6.RP.A.3',
    generate: (rng) => {
      const rate = randInt(2, 8, rng);
      const total = rate * randInt(3, 10, rng);
      const items = total / rate;
      return { display: `$${total} for ${items} items = $? each`, answer: rate, template: '68-unit-rate-complex' };
    }
  },

  // ============================================
  // TIER 1 (6-8): NUMBER LINE & INTEGERS DEEP
  // (Visual understanding, sign rules WHY they work)
  // ============================================

  '68-number-line-position': {
    grade: '6-8',
    difficulty: 4,
    skill: 'integers',
    standard: 'CCSS.6.NS.C.6',
    generate: (rng) => {
      const a = randInt(-10, 10, rng);
      const direction = pickOne(['left', 'right'], rng);
      const steps = randInt(2, 6, rng);
      const answer = direction === 'right' ? a + steps : a - steps;
      return { display: `Start at ${a}, move ${steps} ${direction}: ?`, answer, template: '68-number-line-position' };
    }
  },

  '68-distance-on-line': {
    grade: '6-8',
    difficulty: 4,
    skill: 'integers',
    standard: 'CCSS.6.NS.C.7',
    generate: (rng) => {
      const a = randInt(-10, 5, rng);
      const b = randInt(a + 2, 10, rng);
      return { display: `Distance from ${a} to ${b} on number line?`, answer: Math.abs(b - a), template: '68-distance-on-line' };
    }
  },

  '68-negative-sign-rule-mult': {
    grade: '6-8',
    difficulty: 5,
    skill: 'integers',
    standard: 'CCSS.7.NS.A.2',
    generate: (rng) => {
      // Test understanding: neg × neg = pos, neg × pos = neg
      const type = randInt(0, 2, rng);
      if (type === 0) {
        // neg × neg = ?
        return { display: `negative × negative = ? (1=pos, 0=neg)`, answer: 1, template: '68-negative-sign-rule-mult' };
      } else if (type === 1) {
        // neg × pos = ?
        return { display: `negative × positive = ? (1=pos, 0=neg)`, answer: 0, template: '68-negative-sign-rule-mult' };
      } else {
        // pos × neg = ?
        return { display: `positive × negative = ? (1=pos, 0=neg)`, answer: 0, template: '68-negative-sign-rule-mult' };
      }
    }
  },

  '68-additive-inverse': {
    grade: '6-8',
    difficulty: 4,
    skill: 'properties',
    standard: 'CCSS.7.NS.A.1',
    generate: (rng) => {
      const a = randInt(-20, 20, rng);
      if (a === 0) return { display: `0 + ? = 0`, answer: 0, template: '68-additive-inverse' };
      return { display: `${a} + ? = 0`, answer: -a, template: '68-additive-inverse' };
    }
  },

  '68-multiplicative-inverse': {
    grade: '6-8',
    difficulty: 5,
    skill: 'properties',
    standard: 'CCSS.7.NS.A.2',
    generate: (rng) => {
      // Use simple fractions for integer answers in "reciprocal thinking"
      const n = pickOne([2, 3, 4, 5, 10], rng);
      // 1/n × ? = 1 → answer is n
      return { display: `1/${n} × ? = 1`, answer: n, template: '68-multiplicative-inverse' };
    }
  },

  // ============================================
  // TIER 1 (6-8): ORDER OF OPERATIONS ADVANCED
  // (Brackets, nested, multiple operations)
  // ============================================

  '68-pemdas-brackets': {
    grade: '6-8',
    difficulty: 5,
    skill: 'order-of-operations',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(2, 5, rng);
      const c = randInt(2, 4, rng);
      const d = randInt(1, 4, rng);
      // [a + b] × c - d
      return { display: `[${a} + ${b}] × ${c} - ${d}`, answer: (a + b) * c - d, template: '68-pemdas-brackets' };
    }
  },

  '68-pemdas-nested': {
    grade: '6-8',
    difficulty: 6,
    skill: 'order-of-operations',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const a = randInt(2, 4, rng);
      const b = randInt(2, 4, rng);
      const c = randInt(1, 3, rng);
      const d = randInt(2, 4, rng);
      // a × [b + (c × d)]
      return { display: `${a} × [${b} + (${c} × ${d})]`, answer: a * (b + (c * d)), template: '68-pemdas-nested' };
    }
  },

  '68-pemdas-exponent': {
    grade: '6-8',
    difficulty: 6,
    skill: 'order-of-operations',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const base = randInt(2, 4, rng);
      const add = randInt(1, 5, rng);
      const mult = randInt(2, 3, rng);
      // base² + add × mult
      return { display: `${base}² + ${add} × ${mult}`, answer: base * base + add * mult, template: '68-pemdas-exponent' };
    }
  },

  // ============================================
  // TIER 2: ALGEBRA READINESS - EXPRESSIONS
  // (Evaluate, variables as placeholders)
  // ============================================

  '68-evaluate-simple': {
    grade: '6-8',
    difficulty: 4,
    skill: 'algebra',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const coef = randInt(2, 6, rng);
      const add = randInt(1, 10, rng);
      const x = randInt(2, 8, rng);
      return { display: `${coef}x + ${add} when x=${x}`, answer: coef * x + add, template: '68-evaluate-simple' };
    }
  },

  '68-evaluate-2vars': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const a = randInt(1, 4, rng);
      const b = randInt(1, 4, rng);
      const x = randInt(2, 5, rng);
      const y = randInt(2, 5, rng);
      return { display: `${a}x + ${b}y when x=${x}, y=${y}`, answer: a * x + b * y, template: '68-evaluate-2vars' };
    }
  },

  '68-evaluate-squared': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const add = randInt(1, 5, rng);
      const n = randInt(2, 6, rng);
      return { display: `n² + ${add} when n=${n}`, answer: n * n + add, template: '68-evaluate-squared' };
    }
  },

  '68-variable-pattern': {
    grade: '6-8',
    difficulty: 4,
    skill: 'algebra',
    standard: 'CCSS.6.EE.B.6',
    generate: (rng) => {
      // Pattern: input × 3 + 2 = output. Given input, find output
      const mult = randInt(2, 4, rng);
      const add = randInt(1, 5, rng);
      const input = randInt(3, 8, rng);
      return { display: `Rule: n×${mult}+${add}. n=${input}, result=?`, answer: input * mult + add, template: '68-variable-pattern' };
    }
  },

  // ============================================
  // TIER 2: EQUALITY & BALANCE CONCEPT
  // (Foundation for algebraic manipulation)
  // ============================================

  '68-balance-add': {
    grade: '6-8',
    difficulty: 4,
    skill: 'algebra',
    standard: 'CCSS.6.EE.B.7',
    generate: (rng) => {
      const x = randInt(3, 12, rng);
      const sub = randInt(2, 8, rng);
      // x - sub = (some value) → add sub to both sides
      const result = x - sub;
      return { display: `x - ${sub} = ${result}. Add ${sub} to both sides: x = ?`, answer: x, template: '68-balance-add' };
    }
  },

  '68-balance-subtract': {
    grade: '6-8',
    difficulty: 4,
    skill: 'algebra',
    standard: 'CCSS.6.EE.B.7',
    generate: (rng) => {
      const x = randInt(5, 15, rng);
      const add = randInt(2, 8, rng);
      const result = x + add;
      return { display: `x + ${add} = ${result}. Subtract ${add} from both sides: x = ?`, answer: x, template: '68-balance-subtract' };
    }
  },

  '68-balance-divide': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.6.EE.B.7',
    generate: (rng) => {
      const x = randInt(2, 10, rng);
      const mult = randInt(2, 6, rng);
      const result = x * mult;
      return { display: `${mult}x = ${result}. Divide both sides by ${mult}: x = ?`, answer: x, template: '68-balance-divide' };
    }
  },

  '68-inverse-operation': {
    grade: '6-8',
    difficulty: 4,
    skill: 'algebra',
    standard: 'CCSS.6.EE.B.7',
    generate: (rng) => {
      // What's the inverse? +→-, ×→÷
      const ops = [
        { op: '+', inv: '-', code: 1 },
        { op: '-', inv: '+', code: 2 },
        { op: '×', inv: '÷', code: 3 },
        { op: '÷', inv: '×', code: 4 }
      ];
      const chosen = pickOne(ops, rng);
      return { display: `Inverse of ${chosen.op}? (1=−, 2=+, 3=÷, 4=×)`, answer: chosen.code, template: '68-inverse-operation' };
    }
  },

  // ============================================
  // TIER 2: COMBINING LIKE TERMS (DEEP)
  // (Structural thinking for simplification)
  // ============================================

  '68-combine-like-2types': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const ax = randInt(2, 6, rng);
      const ay = randInt(1, 5, rng);
      const bx = randInt(1, 5, rng);
      const by = randInt(1, 5, rng);
      // ax·x + ay·y + bx·x + by·y → answer is coefficient of x
      return { display: `${ax}x + ${ay}y + ${bx}x + ${by}y = ?x + ${ay + by}y`, answer: ax + bx, template: '68-combine-like-2types' };
    }
  },

  '68-combine-with-negatives': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const a = randInt(3, 8, rng);
      const b = randInt(1, a - 1, rng);
      // ax - bx = ?x
      return { display: `${a}x - ${b}x = ?x`, answer: a - b, template: '68-combine-with-negatives' };
    }
  },

  '68-identify-like-terms': {
    grade: '6-8',
    difficulty: 4,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      // Are 3x and 5x like terms? Are 3x and 3y like terms?
      const isLike = randInt(0, 1, rng);
      if (isLike) {
        const a = randInt(2, 6, rng);
        const b = randInt(2, 6, rng);
        return { display: `Are ${a}x and ${b}x like terms? (1=yes, 0=no)`, answer: 1, template: '68-identify-like-terms' };
      } else {
        const a = randInt(2, 6, rng);
        const b = randInt(2, 6, rng);
        return { display: `Are ${a}x and ${b}y like terms? (1=yes, 0=no)`, answer: 0, template: '68-identify-like-terms' };
      }
    }
  },

  // ============================================
  // TIER 2: DISTRIBUTIVE PROPERTY (DEEP MASTERY)
  // (Area model, factoring foundation)
  // ============================================

  '68-distribute-subtract': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const a = randInt(2, 5, rng);
      const b = randInt(5, 12, rng);
      const c = randInt(1, 4, rng);
      // a(b - c) = ?
      return { display: `${a}(${b} - ${c})`, answer: a * (b - c), template: '68-distribute-subtract' };
    }
  },

  '68-distribute-negative': {
    grade: '6-8',
    difficulty: 6,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const a = randInt(2, 4, rng);
      const b = randInt(2, 6, rng);
      const c = randInt(1, 5, rng);
      // -a(b + c) = ?
      return { display: `-${a}(${b} + ${c})`, answer: -a * (b + c), template: '68-distribute-negative' };
    }
  },

  '68-factor-gcf': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const gcf = randInt(2, 5, rng);
      const a = randInt(2, 6, rng);
      const b = randInt(2, 6, rng);
      // gcf×a + gcf×b = gcf(a + b), answer is gcf
      return { display: `${gcf * a} + ${gcf * b} = ?(${a} + ${b})`, answer: gcf, template: '68-factor-gcf' };
    }
  },

  '68-area-model': {
    grade: '6-8',
    difficulty: 5,
    skill: 'algebra',
    standard: 'CCSS.7.EE.A.1',
    generate: (rng) => {
      const width = randInt(2, 5, rng);
      const part1 = randInt(5, 10, rng);
      const part2 = randInt(2, 5, rng);
      // Rectangle width × (part1 + part2) = width×part1 + width×part2
      const total = width * (part1 + part2);
      return { display: `Rectangle: width=${width}, length=${part1}+${part2}. Area=?`, answer: total, template: '68-area-model' };
    }
  },

  // ============================================
  // TIER 3: PROPORTIONAL RELATIONSHIPS
  // (Constant of proportionality, y=kx)
  // ============================================

  '68-constant-of-prop': {
    grade: '6-8',
    difficulty: 5,
    skill: 'proportions',
    standard: 'CCSS.7.RP.A.2',
    generate: (rng) => {
      const k = randInt(2, 8, rng);
      const x = randInt(2, 6, rng);
      const y = k * x;
      return { display: `y=${y} when x=${x}. If y=kx, then k=?`, answer: k, template: '68-constant-of-prop' };
    }
  },

  '68-is-proportional': {
    grade: '6-8',
    difficulty: 5,
    skill: 'proportions',
    standard: 'CCSS.7.RP.A.2',
    generate: (rng) => {
      const isProp = randInt(0, 1, rng);
      const k = randInt(2, 5, rng);
      const x1 = 2, x2 = 4;
      const y1 = k * x1;
      const y2 = isProp ? k * x2 : k * x2 + randInt(1, 3, rng);
      return { display: `(${x1},${y1}) and (${x2},${y2}): proportional? (1=yes, 0=no)`, answer: isProp, template: '68-is-proportional' };
    }
  },

  '68-y-equals-kx': {
    grade: '6-8',
    difficulty: 5,
    skill: 'proportions',
    standard: 'CCSS.7.RP.A.2',
    generate: (rng) => {
      const k = randInt(2, 6, rng);
      const x = randInt(3, 10, rng);
      return { display: `y = ${k}x. When x=${x}, y=?`, answer: k * x, template: '68-y-equals-kx' };
    }
  },

  '68-multiplicative-vs-additive': {
    grade: '6-8',
    difficulty: 5,
    skill: 'proportions',
    standard: 'CCSS.7.RP.A.2',
    generate: (rng) => {
      const original = randInt(5, 12, rng);
      const mult = randInt(2, 4, rng);
      const scaled = original * mult;
      // Is this multiplicative (×) or additive (+)?
      const diff = scaled - original;
      return { display: `${original}→${scaled}: multiplied by ? (not added)`, answer: mult, template: '68-multiplicative-vs-additive' };
    }
  },

  // ============================================
  // TIER 4: ANGLE RELATIONSHIPS
  // (Complementary, Supplementary, Linear Pairs)
  // ============================================

  '68-complementary': {
    grade: '6-8',
    difficulty: 4,
    skill: 'geometry',
    standard: 'CCSS.7.G.B.5',
    generate: (rng) => {
      const angle = randInt(15, 75, rng);
      return { display: `Complement of ${angle}°?`, answer: 90 - angle, template: '68-complementary' };
    }
  },

  '68-supplementary': {
    grade: '6-8',
    difficulty: 4,
    skill: 'geometry',
    standard: 'CCSS.7.G.B.5',
    generate: (rng) => {
      const angle = randInt(30, 150, rng);
      return { display: `Supplement of ${angle}°?`, answer: 180 - angle, template: '68-supplementary' };
    }
  },

  '68-angles-on-line': {
    grade: '6-8',
    difficulty: 5,
    skill: 'geometry',
    standard: 'CCSS.7.G.B.5',
    generate: (rng) => {
      const angle1 = randInt(40, 100, rng);
      const angle2 = randInt(20, 180 - angle1 - 10, rng);
      const angle3 = 180 - angle1 - angle2;
      return { display: `Angles on line: ${angle1}° + ${angle2}° + ?° = 180°`, answer: angle3, template: '68-angles-on-line' };
    }
  },

  '68-vertical-angles': {
    grade: '6-8',
    difficulty: 4,
    skill: 'geometry',
    standard: 'CCSS.7.G.B.5',
    generate: (rng) => {
      const angle = randInt(25, 155, rng);
      return { display: `Vertical angle to ${angle}°?`, answer: angle, template: '68-vertical-angles' };
    }
  },

  // ============================================
  // TIER 6: MATHEMATICAL LANGUAGE PRECISION
  // (Word→Math translation, key phrases)
  // ============================================

  '68-word-more-than': {
    grade: '6-8',
    difficulty: 4,
    skill: 'translation',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const n = randInt(3, 12, rng);
      const more = randInt(2, 8, rng);
      // "5 more than 7" = 12
      return { display: `${more} more than ${n} = ?`, answer: n + more, template: '68-word-more-than' };
    }
  },

  '68-word-less-than': {
    grade: '6-8',
    difficulty: 4,
    skill: 'translation',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const n = randInt(10, 25, rng);
      const less = randInt(2, n - 2, rng);
      // "5 less than 12" = 7 (NOT 12-5, it's n-less)
      return { display: `${less} less than ${n} = ?`, answer: n - less, template: '68-word-less-than' };
    }
  },

  '68-word-times-as-many': {
    grade: '6-8',
    difficulty: 4,
    skill: 'translation',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const n = randInt(3, 8, rng);
      const times = randInt(2, 5, rng);
      return { display: `${times} times as many as ${n} = ?`, answer: n * times, template: '68-word-times-as-many' };
    }
  },

  '68-word-of-means-mult': {
    grade: '6-8',
    difficulty: 4,
    skill: 'translation',
    standard: 'CCSS.6.EE.A.2',
    generate: (rng) => {
      const frac = pickOne([
        { n: 1, d: 2 },
        { n: 1, d: 3 },
        { n: 1, d: 4 },
        { n: 2, d: 3 },
        { n: 3, d: 4 }
      ], rng);
      const whole = frac.d * randInt(2, 5, rng);
      return { display: `${frac.n}/${frac.d} of ${whole} = ?`, answer: (frac.n / frac.d) * whole, template: '68-word-of-means-mult' };
    }
  },

  '68-word-per-means-divide': {
    grade: '6-8',
    difficulty: 4,
    skill: 'translation',
    standard: 'CCSS.6.RP.A.2',
    generate: (rng) => {
      const rate = randInt(3, 10, rng);
      const count = randInt(3, 8, rng);
      const total = rate * count;
      return { display: `${total} items for ${count} people = ? per person`, answer: rate, template: '68-word-per-means-divide' };
    }
  },

  // ============================================
  // TIER 6: MULTI-STEP WORD PROBLEMS
  // (Decomposition, strategic thinking)
  // ============================================

  '68-multistep-buy': {
    grade: '6-8',
    difficulty: 5,
    skill: 'word-problems',
    standard: 'CCSS.7.EE.B.3',
    generate: (rng) => {
      const priceEach = randInt(3, 8, rng);
      const qty = randInt(3, 6, rng);
      const paid = priceEach * qty + randInt(5, 20, rng);
      const change = paid - priceEach * qty;
      return { display: `Buy ${qty} items at $${priceEach} each. Pay $${paid}. Change=?`, answer: change, template: '68-multistep-buy' };
    }
  },

  '68-multistep-distance': {
    grade: '6-8',
    difficulty: 5,
    skill: 'word-problems',
    standard: 'CCSS.7.EE.B.3',
    generate: (rng) => {
      const speed = randInt(30, 60, rng);
      const time = randInt(2, 4, rng);
      const extra = randInt(10, 30, rng);
      // Traveled speed×time + walked extra more
      return { display: `Drive ${speed}mph for ${time}hrs, then walk ${extra}mi. Total=?`, answer: speed * time + extra, template: '68-multistep-distance' };
    }
  },

  '68-multistep-share': {
    grade: '6-8',
    difficulty: 5,
    skill: 'word-problems',
    standard: 'CCSS.7.EE.B.3',
    generate: (rng) => {
      // Ensure integer result: people × perPerson = total
      const people = randInt(3, 6, rng);
      const perPerson = randInt(5, 15, rng);
      const total = people * perPerson;
      return { display: `${total} items shared by ${people} people = ? each`, answer: perPerson, template: '68-multistep-share' };
    }
  },

  // ============================================
  // TIER 5: DATA & OUTLIERS
  // (Statistical thinking, sensitivity)
  // ============================================

  '68-outlier-identify': {
    grade: '6-8',
    difficulty: 5,
    skill: 'statistics',
    standard: 'CCSS.6.SP.B.5',
    generate: (rng) => {
      const base = randInt(10, 20, rng);
      const normal = [base, base + 1, base + 2, base - 1, base + 1];
      const outlier = base + randInt(20, 40, rng);
      const allNums = [...normal, outlier].sort(() => rng() - 0.5);
      return { display: `Outlier in ${allNums.join(', ')}?`, answer: outlier, template: '68-outlier-identify' };
    }
  },

  '68-outlier-effect-mean': {
    grade: '6-8',
    difficulty: 6,
    skill: 'statistics',
    standard: 'CCSS.6.SP.B.5',
    generate: (rng) => {
      // Without outlier: mean = 10. With outlier 50: mean = ?
      const mean = randInt(8, 15, rng);
      const count = 4;
      const outlier = mean + randInt(20, 40, rng);
      const total = mean * count + outlier;
      const newMean = Math.floor(total / (count + 1));
      return { display: `Mean of 4 nums is ${mean}. Add ${outlier}. New mean≈?`, answer: newMean, template: '68-outlier-effect-mean' };
    }
  },

  '68-best-measure': {
    grade: '6-8',
    difficulty: 5,
    skill: 'statistics',
    standard: 'CCSS.6.SP.B.5',
    generate: (rng) => {
      // With outlier, median is better. Without, mean is fine.
      const hasOutlier = randInt(0, 1, rng);
      if (hasOutlier) {
        return { display: `Data with outlier: use mean(1) or median(2)?`, answer: 2, template: '68-best-measure' };
      } else {
        return { display: `Symmetric data, no outliers: use mean(1) or median(2)?`, answer: 1, template: '68-best-measure' };
      }
    }
  }
};

// Grade level to difficulty mapping
const gradeLevelConfig = {
  'K-2': { minDiff: 0, maxDiff: 2 },
  '3-5': { minDiff: 1, maxDiff: 5 },
  '6-8': { minDiff: 4, maxDiff: 6 }
};

// Get templates by grade level and difficulty
function getTemplatesByGradeAndDifficulty(gradeLevel, difficultyLevel) {
  // Difficulty ranges for each level within a grade
  const ranges = {
    1: [0, 1, 2],  // Warm Up
    2: [1, 2, 3],  // Practice
    3: [2, 3, 4, 5, 6] // Challenge
  };

  const difficulties = ranges[difficultyLevel] || [1, 2, 3];
  const gradeConfig = gradeLevelConfig[gradeLevel];

  return Object.entries(templates)
    .filter(([_, t]) => {
      // Match grade level
      const matchesGrade = !gradeLevel || t.grade === gradeLevel;
      // Match difficulty
      const matchesDiff = difficulties.includes(t.difficulty);
      return matchesGrade && matchesDiff;
    })
    .map(([name, t]) => ({ name, ...t }));
}

// Get templates by difficulty range (legacy - for 3-5 default)
function getTemplatesByDifficulty(level, gradeLevel = '3-5') {
  return getTemplatesByGradeAndDifficulty(gradeLevel, level);
}

// Generate questions for a heat
export function generateQuestions(difficultyLevel, count, seed = Date.now(), gradeLevel = '3-5') {
  const rng = seededRandom(seed);
  const availableTemplates = getTemplatesByGradeAndDifficulty(gradeLevel, difficultyLevel);

  // Fallback to 3-5 if no templates found
  const templatesToUse = availableTemplates.length > 0
    ? availableTemplates
    : getTemplatesByGradeAndDifficulty('3-5', difficultyLevel);

  const questions = [];

  for (let i = 0; i < count; i++) {
    const templateIndex = randInt(0, templatesToUse.length - 1, rng);
    const template = templatesToUse[templateIndex];
    const question = template.generate(rng);
    questions.push(question);
  }

  return questions;
}

// Get all available grade levels
export function getGradeLevels() {
  return ['K-2', '3-5', '6-8'];
}

// Export templates for testing
export { templates };
