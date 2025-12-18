// Question Generator - Procedural math question generation
// 25 templates covering Grades 3-5 arithmetic

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

// Question templates organized by difficulty
const templates = {
  // ===== DIFFICULTY 1 (Warm Up) =====

  'add-simple': {
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
    difficulty: 1,
    skill: 'subtraction',
    standard: 'CCSS.3.NBT.A.2',
    generate: (rng) => {
      const a = randInt(10, 30, rng);
      const b = randInt(1, a - 1, rng);
      return { display: `${a} - ${b}`, answer: a - b, template: 'sub-simple' };
    }
  },

  // ===== DIFFICULTY 2 (Easy) =====

  'add-2digit-no-carry': {
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
    difficulty: 2,
    skill: 'multiplication',
    standard: 'CCSS.4.NBT.B.5',
    generate: (rng) => {
      const a = randInt(2, 12, rng);
      return { display: `${a} × 10`, answer: a * 10, template: 'mult-by-10' };
    }
  },

  'div-simple': {
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

  // ===== DIFFICULTY 3 (Medium) =====

  'add-2digit-carry': {
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
    difficulty: 3,
    skill: 'multiplication',
    standard: 'CCSS.4.NBT.B.5',
    generate: (rng) => {
      const a = randInt(2, 20, rng);
      return { display: `${a} × 100`, answer: a * 100, template: 'mult-by-100' };
    }
  },

  'div-facts': {
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

  // ===== DIFFICULTY 4 (Hard) =====

  'add-3digit': {
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
    difficulty: 4,
    skill: 'division',
    standard: 'CCSS.4.NBT.B.6',
    generate: (rng) => {
      const b = randInt(3, 9, rng);
      const quotient = randInt(5, 15, rng);
      const remainder = randInt(1, b - 1, rng);
      const a = b * quotient + remainder;
      // Ask for just the quotient
      return { display: `${a} ÷ ${b} = ? R${remainder}`, answer: quotient, template: 'div-with-remainder' };
    }
  },

  'missing-mult': {
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

  // ===== DIFFICULTY 5 (Challenge) =====

  'add-3-numbers': {
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
    difficulty: 5,
    skill: 'mixed',
    standard: 'CCSS.5.OA.A.1',
    generate: (rng) => {
      const a = randInt(2, 10, rng);
      const b = randInt(2, 5, rng);
      const c = randInt(2, 5, rng);
      // a + b × c (multiplication first)
      return { display: `${a} + ${b} × ${c}`, answer: a + b * c, template: 'order-of-ops' };
    }
  },

  'square-numbers': {
    difficulty: 5,
    skill: 'multiplication',
    standard: 'CCSS.5.NBT.B.5',
    generate: (rng) => {
      const a = randInt(2, 12, rng);
      return { display: `${a}²`, answer: a * a, template: 'square-numbers' };
    }
  }
};

// Get templates by difficulty range
function getTemplatesByDifficulty(level) {
  // Level 1: difficulties 1-2
  // Level 2: difficulties 2-3
  // Level 3: difficulties 3-5
  const ranges = {
    1: [1, 2],
    2: [2, 3],
    3: [3, 5]
  };

  const [min, max] = ranges[level] || [2, 3];

  return Object.entries(templates)
    .filter(([_, t]) => t.difficulty >= min && t.difficulty <= max)
    .map(([name, t]) => ({ name, ...t }));
}

// Generate questions for a heat
export function generateQuestions(difficultyLevel, count, seed = Date.now()) {
  const rng = seededRandom(seed);
  const availableTemplates = getTemplatesByDifficulty(difficultyLevel);
  const questions = [];

  for (let i = 0; i < count; i++) {
    // Pick a random template
    const templateIndex = randInt(0, availableTemplates.length - 1, rng);
    const template = availableTemplates[templateIndex];

    // Generate question using template's rng
    const question = template.generate(rng);
    questions.push(question);
  }

  return questions;
}

// Export templates for testing
export { templates };
