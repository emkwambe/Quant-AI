// server/questions/skill-generator.js
// Procedural question generator for Mathathlon Skills
// Uses seeded RNG for deterministic question generation

/**
 * Seeded random number generator
 * Same seed = same sequence of random numbers
 */
function seededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generate questions for a skill
 * @param {string} skillSlug - Skill identifier
 * @param {number} count - Number of questions
 * @param {number} difficulty - 1-5 difficulty level
 * @param {number} seed - Seed for reproducible generation
 * @returns {Array} Array of question objects
 */
export function generateSkillQuestions(skillSlug, count, difficulty, seed) {
  const rng = seededRandom(seed);
  const generator = SKILL_GENERATORS[skillSlug];
  
  if (!generator) {
    console.warn(`No generator for skill: ${skillSlug}, using fallback`);
    return generateFallbackQuestions(count, difficulty, rng);
  }
  
  const questions = [];
  for (let i = 0; i < count; i++) {
    const question = generator(rng, difficulty);
    questions.push({
      ...question,
      id: `${skillSlug}-${seed}-${i}`,
      skillSlug,
      difficulty
    });
  }
  
  return questions;
}

// ============================================
// QUESTION GENERATORS BY SKILL
// ============================================

const SKILL_GENERATORS = {
  
  // ==========================================
  // SKILL 1: INTEGER OPERATIONS
  // ==========================================
  'integer-operations': (rng, difficulty) => {
    const topics = [
      { slug: 'adding-integers', weight: 0.2 },
      { slug: 'subtracting-integers', weight: 0.2 },
      { slug: 'multiplying-integers', weight: 0.2 },
      { slug: 'dividing-integers', weight: 0.2 },
      { slug: 'mixed-operations', weight: 0.2 }
    ];
    
    const topic = selectByWeight(topics, rng);
    const range = 5 + difficulty * 5; // 10-30 based on difficulty
    
    switch (topic.slug) {
      case 'adding-integers': {
        const a = randomInt(rng, -range, range);
        const b = randomInt(rng, -range, range);
        return {
          type: 'numeric',
          topicSlug: topic.slug,
          question: `Calculate: ${formatNumber(a)} + ${formatNumber(b)}`,
          correctAnswer: a + b,
          explanation: `${a} + ${b} = ${a + b}`
        };
      }
      
      case 'subtracting-integers': {
        const a = randomInt(rng, -range, range);
        const b = randomInt(rng, -range, range);
        return {
          type: 'numeric',
          topicSlug: topic.slug,
          question: `Calculate: ${formatNumber(a)} − ${formatNumber(b)}`,
          correctAnswer: a - b,
          explanation: `${a} − ${b} = ${a} + ${-b} = ${a - b}`
        };
      }
      
      case 'multiplying-integers': {
        const a = randomInt(rng, -12, 12);
        const b = randomInt(rng, -12, 12);
        return {
          type: 'numeric',
          topicSlug: topic.slug,
          question: `Calculate: ${formatNumber(a)} × ${formatNumber(b)}`,
          correctAnswer: a * b,
          explanation: getMultiplicationExplanation(a, b)
        };
      }
      
      case 'dividing-integers': {
        const b = randomInt(rng, 1, 12) * (rng() > 0.5 ? 1 : -1);
        const answer = randomInt(rng, -12, 12);
        const a = b * answer;
        return {
          type: 'numeric',
          topicSlug: topic.slug,
          question: `Calculate: ${formatNumber(a)} ÷ ${formatNumber(b)}`,
          correctAnswer: answer,
          explanation: `${a} ÷ ${b} = ${answer} (${getSignExplanation(a, b)})`
        };
      }
      
      case 'mixed-operations': {
        const a = randomInt(rng, -range, range);
        const b = randomInt(rng, -10, 10);
        const c = randomInt(rng, -10, 10);
        const op = rng() > 0.5 ? '+' : '−';
        if (op === '+') {
          return {
            type: 'numeric',
            topicSlug: topic.slug,
            question: `Calculate: ${formatNumber(a)} + ${formatNumber(b)} + ${formatNumber(c)}`,
            correctAnswer: a + b + c,
            explanation: `${a} + ${b} + ${c} = ${a + b + c}`
          };
        } else {
          return {
            type: 'numeric',
            topicSlug: topic.slug,
            question: `Calculate: ${formatNumber(a)} − ${formatNumber(b)} − ${formatNumber(c)}`,
            correctAnswer: a - b - c,
            explanation: `${a} − ${b} − ${c} = ${a - b - c}`
          };
        }
      }
    }
  },
  
  // ==========================================
  // SKILL 2: ORDER OF OPERATIONS
  // ==========================================
  'order-of-operations': (rng, difficulty) => {
    const templates = [
      // Level 1-2: Basic
      () => {
        const a = randomInt(rng, 2, 10);
        const b = randomInt(rng, 2, 10);
        const c = randomInt(rng, 1, 10);
        return {
          question: `Calculate: ${a} + ${b} × ${c}`,
          correctAnswer: a + b * c,
          explanation: `First multiply: ${b} × ${c} = ${b * c}, then add: ${a} + ${b * c} = ${a + b * c}`
        };
      },
      () => {
        const a = randomInt(rng, 10, 30);
        const b = randomInt(rng, 2, 5);
        const c = randomInt(rng, 1, 10);
        return {
          question: `Calculate: ${a} − ${b} × ${c}`,
          correctAnswer: a - b * c,
          explanation: `First multiply: ${b} × ${c} = ${b * c}, then subtract: ${a} − ${b * c} = ${a - b * c}`
        };
      },
      // Level 3-4: Parentheses
      () => {
        const a = randomInt(rng, 2, 8);
        const b = randomInt(rng, 2, 8);
        const c = randomInt(rng, 2, 5);
        return {
          question: `Calculate: (${a} + ${b}) × ${c}`,
          correctAnswer: (a + b) * c,
          explanation: `First parentheses: ${a} + ${b} = ${a + b}, then multiply: ${a + b} × ${c} = ${(a + b) * c}`
        };
      },
      () => {
        const a = randomInt(rng, 2, 6);
        const b = randomInt(rng, 2, 6);
        const c = randomInt(rng, 2, 6);
        const d = randomInt(rng, 2, 6);
        return {
          question: `Calculate: ${a} × ${b} + ${c} × ${d}`,
          correctAnswer: a * b + c * d,
          explanation: `Multiply first: ${a} × ${b} = ${a * b} and ${c} × ${d} = ${c * d}, then add: ${a * b} + ${c * d} = ${a * b + c * d}`
        };
      },
      // Level 5: Exponents
      () => {
        const a = randomInt(rng, 2, 5);
        const b = randomInt(rng, 1, 10);
        return {
          question: `Calculate: ${a}² + ${b}`,
          correctAnswer: a * a + b,
          explanation: `First exponent: ${a}² = ${a * a}, then add: ${a * a} + ${b} = ${a * a + b}`
        };
      }
    ];
    
    const maxIndex = Math.min(templates.length - 1, Math.floor(difficulty * templates.length / 5));
    const template = templates[randomInt(rng, 0, maxIndex)];
    
    return {
      type: 'numeric',
      topicSlug: 'basic-pemdas',
      ...template()
    };
  },
  
  // ==========================================
  // SKILL 5: PROPERTIES OF OPERATIONS
  // ==========================================
  'properties-of-operations': (rng, difficulty) => {
    const properties = [
      {
        name: 'Commutative Property of Addition',
        generate: () => {
          const a = randomInt(rng, 1, 20);
          const b = randomInt(rng, 1, 20);
          return {
            question: `Which property says ${a} + ${b} = ${b} + ${a}?`,
            correctAnswer: 'Commutative Property of Addition',
            choices: [
              'Commutative Property of Addition',
              'Associative Property of Addition',
              'Identity Property',
              'Distributive Property'
            ]
          };
        }
      },
      {
        name: 'Commutative Property of Multiplication',
        generate: () => {
          const a = randomInt(rng, 2, 12);
          const b = randomInt(rng, 2, 12);
          return {
            question: `Which property says ${a} × ${b} = ${b} × ${a}?`,
            correctAnswer: 'Commutative Property of Multiplication',
            choices: [
              'Commutative Property of Multiplication',
              'Associative Property of Multiplication',
              'Distributive Property',
              'Identity Property'
            ]
          };
        }
      },
      {
        name: 'Distributive Property',
        generate: () => {
          const a = randomInt(rng, 2, 8);
          const b = randomInt(rng, 2, 10);
          const c = randomInt(rng, 2, 10);
          return {
            question: `Use the Distributive Property: ${a}(${b} + ${c}) = ?`,
            correctAnswer: a * b + a * c,
            explanation: `${a}(${b} + ${c}) = ${a}×${b} + ${a}×${c} = ${a * b} + ${a * c} = ${a * b + a * c}`
          };
        }
      },
      {
        name: 'Distributive with Variable',
        generate: () => {
          const a = randomInt(rng, 2, 6);
          const b = randomInt(rng, 1, 10);
          return {
            question: `Distribute: ${a}(x + ${b})`,
            correctAnswer: `${a}x + ${a * b}`,
            choices: [
              `${a}x + ${a * b}`,
              `${a}x + ${b}`,
              `${a + b}x`,
              `x + ${a * b}`
            ]
          };
        }
      },
      {
        name: 'Identity Property',
        generate: () => {
          const a = randomInt(rng, 5, 50);
          const op = rng() > 0.5 ? '+' : '×';
          const identity = op === '+' ? 0 : 1;
          return {
            question: `What number goes in the blank? ${a} ${op} ___ = ${a}`,
            correctAnswer: identity,
            explanation: `${identity} is the identity element for ${op === '+' ? 'addition' : 'multiplication'}`
          };
        }
      }
    ];
    
    const prop = properties[randomInt(rng, 0, properties.length - 1)];
    const result = prop.generate();
    
    return {
      type: result.choices ? 'multiple-choice' : 'numeric',
      topicSlug: 'distributive',
      ...result
    };
  },
  
  // ==========================================
  // SKILL 9: PROPERTIES OF EQUALITY
  // ==========================================
  'properties-of-equality': (rng, difficulty) => {
    const templates = [
      // Addition Property
      () => {
        const x = randomInt(rng, 1, 15);
        const subtract = randomInt(rng, 1, 10);
        return {
          topicSlug: 'addition-property',
          question: `To solve x − ${subtract} = ${x}, what should you add to both sides?`,
          correctAnswer: subtract,
          explanation: `Add ${subtract} to both sides: x − ${subtract} + ${subtract} = ${x} + ${subtract}, so x = ${x + subtract}`
        };
      },
      // Subtraction Property
      () => {
        const x = randomInt(rng, 5, 20);
        const add = randomInt(rng, 1, 10);
        return {
          topicSlug: 'subtraction-property',
          question: `To solve x + ${add} = ${x + add}, what should you subtract from both sides?`,
          correctAnswer: add,
          explanation: `Subtract ${add} from both sides: x + ${add} − ${add} = ${x + add} − ${add}, so x = ${x}`
        };
      },
      // Multiplication Property
      () => {
        const answer = randomInt(rng, 2, 12);
        const divisor = randomInt(rng, 2, 6);
        return {
          topicSlug: 'multiplication-property',
          question: `To solve x ÷ ${divisor} = ${answer}, what should you multiply both sides by?`,
          correctAnswer: divisor,
          explanation: `Multiply both sides by ${divisor}: x = ${answer} × ${divisor} = ${answer * divisor}`
        };
      },
      // Division Property
      () => {
        const answer = randomInt(rng, 2, 12);
        const multiplier = randomInt(rng, 2, 8);
        return {
          topicSlug: 'division-property',
          question: `To solve ${multiplier}x = ${multiplier * answer}, what should you divide both sides by?`,
          correctAnswer: multiplier,
          explanation: `Divide both sides by ${multiplier}: x = ${multiplier * answer} ÷ ${multiplier} = ${answer}`
        };
      },
      // Identify Property Used
      () => {
        const scenarios = [
          { step: 'x + 5 = 12 → x + 5 − 5 = 12 − 5', answer: 'Subtraction Property of Equality' },
          { step: '3x = 15 → 3x ÷ 3 = 15 ÷ 3', answer: 'Division Property of Equality' },
          { step: 'x ÷ 4 = 7 → 4 × (x ÷ 4) = 4 × 7', answer: 'Multiplication Property of Equality' },
          { step: 'x − 8 = 3 → x − 8 + 8 = 3 + 8', answer: 'Addition Property of Equality' }
        ];
        const scenario = scenarios[randomInt(rng, 0, scenarios.length - 1)];
        return {
          topicSlug: 'identifying',
          question: `What property justifies this step?\n${scenario.step}`,
          correctAnswer: scenario.answer,
          choices: [
            'Addition Property of Equality',
            'Subtraction Property of Equality',
            'Multiplication Property of Equality',
            'Division Property of Equality'
          ]
        };
      }
    ];
    
    const template = templates[randomInt(rng, 0, templates.length - 1)];
    const result = template();
    
    return {
      type: result.choices ? 'multiple-choice' : 'numeric',
      ...result
    };
  },
  
  // ==========================================
  // SKILL 10: EQUALITY & BALANCE
  // ==========================================
  'equality-balance': (rng, difficulty) => {
    const templates = [
      // One-step equations
      () => {
        const x = randomInt(rng, 2, 15);
        const b = randomInt(rng, 1, 10);
        const ops = [
          { eq: `x + ${b} = ${x + b}`, answer: x },
          { eq: `x − ${b} = ${x - b}`, answer: x },
          { eq: `${b}x = ${b * x}`, answer: x },
        ];
        const op = ops[randomInt(rng, 0, ops.length - 1)];
        return {
          topicSlug: 'one-step',
          question: `Solve for x: ${op.eq}`,
          correctAnswer: op.answer
        };
      },
      // Two-step equations
      () => {
        const x = randomInt(rng, 2, 10);
        const a = randomInt(rng, 2, 5);
        const b = randomInt(rng, 1, 8);
        return {
          topicSlug: 'two-step',
          question: `Solve for x: ${a}x + ${b} = ${a * x + b}`,
          correctAnswer: x,
          explanation: `Subtract ${b}: ${a}x = ${a * x}. Divide by ${a}: x = ${x}`
        };
      },
      () => {
        const x = randomInt(rng, 2, 10);
        const a = randomInt(rng, 2, 5);
        const b = randomInt(rng, 1, 8);
        return {
          topicSlug: 'two-step',
          question: `Solve for x: ${a}x − ${b} = ${a * x - b}`,
          correctAnswer: x,
          explanation: `Add ${b}: ${a}x = ${a * x}. Divide by ${a}: x = ${x}`
        };
      }
    ];
    
    const maxIndex = Math.min(templates.length - 1, Math.floor(difficulty * templates.length / 5));
    const template = templates[randomInt(rng, 0, maxIndex)];
    
    return {
      type: 'numeric',
      ...template()
    };
  },
  
  // ==========================================
  // SKILL 11: RATIOS & RATES
  // ==========================================
  'ratios-rates': (rng, difficulty) => {
    const templates = [
      // Writing ratios
      () => {
        const a = randomInt(rng, 2, 12);
        const b = randomInt(rng, 2, 12);
        return {
          topicSlug: 'writing-ratios',
          question: `A bag has ${a} red marbles and ${b} blue marbles. What is the ratio of red to blue?`,
          correctAnswer: `${a}:${b}`,
          choices: [`${a}:${b}`, `${b}:${a}`, `${a}:${a + b}`, `${b}:${a + b}`]
        };
      },
      // Unit rates
      () => {
        const items = randomInt(rng, 3, 8);
        const price = items * randomInt(rng, 2, 5);
        return {
          topicSlug: 'unit-rates',
          question: `${items} apples cost $${price}. What is the price per apple?`,
          correctAnswer: price / items,
          explanation: `$${price} ÷ ${items} = $${price / items} per apple`
        };
      },
      () => {
        const distance = randomInt(rng, 100, 300);
        const hours = randomInt(rng, 2, 5);
        return {
          topicSlug: 'unit-rates',
          question: `A car travels ${distance} miles in ${hours} hours. What is the speed in miles per hour?`,
          correctAnswer: distance / hours,
          explanation: `${distance} miles ÷ ${hours} hours = ${distance / hours} mph`
        };
      },
      // Equivalent ratios
      () => {
        const a = randomInt(rng, 2, 6);
        const b = randomInt(rng, 2, 6);
        const mult = randomInt(rng, 2, 5);
        return {
          topicSlug: 'equivalent-ratios',
          question: `${a}:${b} = ${a * mult}:?`,
          correctAnswer: b * mult,
          explanation: `Multiply both parts by ${mult}: ${a}×${mult}:${b}×${mult} = ${a * mult}:${b * mult}`
        };
      },
      // Comparing rates
      () => {
        const items1 = randomInt(rng, 4, 8);
        const price1 = items1 * 2;
        const items2 = randomInt(rng, 5, 10);
        const price2 = items2 * 2 + randomInt(rng, -2, 2);
        const rate1 = price1 / items1;
        const rate2 = price2 / items2;
        const better = rate1 < rate2 ? 'Store A' : 'Store B';
        return {
          topicSlug: 'comparing-rates',
          question: `Store A: ${items1} items for $${price1}. Store B: ${items2} items for $${price2}. Which is the better deal?`,
          correctAnswer: better,
          choices: ['Store A', 'Store B'],
          explanation: `Store A: $${rate1.toFixed(2)}/item. Store B: $${rate2.toFixed(2)}/item. ${better} is cheaper.`
        };
      }
    ];
    
    const template = templates[randomInt(rng, 0, templates.length - 1)];
    const result = template();
    
    return {
      type: result.choices ? 'multiple-choice' : 'numeric',
      ...result
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function formatNumber(n) {
  return n < 0 ? `(${n})` : String(n);
}

function selectByWeight(items, rng) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let random = rng() * total;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

function getMultiplicationExplanation(a, b) {
  const result = a * b;
  if ((a >= 0 && b >= 0) || (a < 0 && b < 0)) {
    return `${a} × ${b} = ${result} (positive × positive OR negative × negative = positive)`;
  } else {
    return `${a} × ${b} = ${result} (positive × negative = negative)`;
  }
}

function getSignExplanation(a, b) {
  if ((a >= 0 && b >= 0) || (a < 0 && b < 0)) {
    return 'same signs = positive';
  } else {
    return 'different signs = negative';
  }
}

function generateFallbackQuestions(count, difficulty, rng) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const a = randomInt(rng, 1, 10 * difficulty);
    const b = randomInt(rng, 1, 10 * difficulty);
    questions.push({
      id: `fallback-${i}`,
      type: 'numeric',
      question: `Calculate: ${a} + ${b}`,
      correctAnswer: a + b,
      explanation: `${a} + ${b} = ${a + b}`
    });
  }
  return questions;
}

export default { generateSkillQuestions };
