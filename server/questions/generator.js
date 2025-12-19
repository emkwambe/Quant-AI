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
      const a = randInt(11, 44, rng);
      const b = randInt(11, 55 - a % 10, rng);
      return { display: `${a} + ${b}`, answer: a + b, template: 'add-2digit-no-carry' };
    }
  },

  'sub-2digit-no-borrow': {
    grade: '3-5',
    difficulty: 2,
    skill: 'subtraction',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      const a = randInt(50, 99, rng);
      const b = randInt(10, Math.min(a - 10, 40), rng);
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
