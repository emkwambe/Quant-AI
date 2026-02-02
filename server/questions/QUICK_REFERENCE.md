# Quick Reference Guide

## Common Tasks

### Generate Questions
```javascript
const { generateQuestions } = require('./generator');

// Basic usage
const questions = generateQuestions(1, 10);

// With all parameters
const questions = generateQuestions(
  1,        // Difficulty (1=Warm Up, 2=Practice, 3=Challenge)
  10,       // Number of questions
  12345,    // Seed (for deterministic generation)
  'K-2'     // Grade level ('K-2', '3-5', '6-8')
);
```

### Using Constants
```javascript
const { GRADE_LEVELS, DIFFICULTY_LEVELS } = require('./constants');

generateQuestions(
  DIFFICULTY_LEVELS.WARM_UP,    // Instead of 1
  10,
  seed,
  GRADE_LEVELS.K2               // Instead of 'K-2'
);
```

### Error Handling
```javascript
try {
  const questions = generateQuestions(difficulty, count, seed, grade);
  // Use questions...
} catch (error) {
  console.error('Failed to generate questions:', error.message);
  // Handle error...
}
```

### Validation
```javascript
const { validateDifficultyLevel, validateQuestionCount } = require('./utils/validators');

try {
  validateDifficultyLevel(userInput);  // Throws if invalid
  validateQuestionCount(count);        // Throws if out of range
} catch (error) {
  // Show user-friendly error message
}
```

### Math Helpers
```javascript
const { gcd, lcm, isPrime, roundTo } = require('./utils/math');

gcd(12, 8);           // 4
lcm(12, 8);           // 24
isPrime(17);          // true
roundTo(3.14159, 2);  // 3.14
```

### Random Utilities
```javascript
const { seededRandom, randInt, pickOne } = require('./utils/random');

const rng = seededRandom(12345);
const dice = randInt(1, 6, rng);         // 1-6
const color = pickOne(['red', 'blue'], rng);  // Random color
```

### Creating Custom Questions
```javascript
const { createQuestion, createArithmeticQuestion } = require('./utils/questionFactory');

// Basic question
const q1 = createQuestion('5 + 3 = ?', 8, 'my-template');

// Arithmetic question
const q2 = createArithmeticQuestion(5, 3, '+', 8, 'my-template');
```

## Module Map

```
constants.js          → All configuration (grade levels, skills, conversions)
generatorNew.js       → Main generator (templates, generateQuestions)
utils/
  ├── random.js       → RNG utilities (seededRandom, randInt, pickOne)
  ├── math.js         → Math helpers (gcd, lcm, isPrime, roundTo)
  ├── validators.js   → Input validation (validateNumber, validateRange)
  └── questionFactory.js → Question creation (createQuestion, create*)
```

## Constants Reference

### Grade Levels
```javascript
GRADE_LEVELS.K2         // 'K-2'
GRADE_LEVELS.GRADES_3_5 // '3-5'
GRADE_LEVELS.GRADES_6_8 // '6-8'
```

### Difficulty Levels
```javascript
DIFFICULTY_LEVELS.WARM_UP    // 1
DIFFICULTY_LEVELS.PRACTICE   // 2
DIFFICULTY_LEVELS.CHALLENGE  // 3
```

### Skills
```javascript
SKILLS.ADDITION          // 'addition'
SKILLS.SUBTRACTION       // 'subtraction'
SKILLS.MULTIPLICATION    // 'multiplication'
SKILLS.FRACTIONS         // 'fractions'
// ... and 30+ more
```

### Conversions
```javascript
CONVERSIONS.FEET_TO_INCHES    // 12
CONVERSIONS.YARDS_TO_FEET     // 3
CONVERSIONS.HOURS_TO_MINUTES  // 60
// ... and more
```

## Common Patterns

### API Endpoint
```javascript
app.post('/api/questions', (req, res) => {
  try {
    const { difficulty, count, grade } = req.body;
    const questions = generateQuestions(
      difficulty || 1,
      count || 10,
      Date.now(),
      grade || '3-5'
    );
    res.json({ success: true, questions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### React Component
```javascript
function Questions({ difficulty, grade }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    try {
      const q = generateQuestions(difficulty, 10, Date.now(), grade);
      setQuestions(q);
    } catch (error) {
      console.error(error);
    }
  }, [difficulty, grade]);

  return <div>{/* render questions */}</div>;
}
```

### Testing
```javascript
test('generates valid questions', () => {
  const questions = generateQuestions(1, 10, 12345, 'K-2');

  expect(questions).toHaveLength(10);
  questions.forEach(q => {
    expect(q).toHaveProperty('display');
    expect(q).toHaveProperty('answer');
    expect(typeof q.answer).toBe('number');
  });
});
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid difficulty level: X" | Used number other than 1, 2, or 3 | Use 1, 2, or 3 |
| "Invalid grade level" | Typo in grade level | Use 'K-2', '3-5', or '6-8' |
| "count must be a positive integer" | Negative or non-integer count | Use positive integer |
| "min must be <= max" | Invalid range | Check min/max values |
| "No templates available" | No templates for criteria | Try different grade/difficulty |

## Cheat Sheet

### Validation
```javascript
// Import
const { validate* } = require('./utils/validators');

// Use
validateNumber(value, 'paramName');
validatePositiveInteger(value);
validateRange(value, min, max);
validateGradeLevel(grade);
validateDifficultyLevel(difficulty);
```

### Math
```javascript
// Import
const { gcd, lcm, isPrime, ... } = require('./utils/math');

// Use
gcd(a, b)                  // Greatest common divisor
lcm(a, b)                  // Least common multiple
isPrime(n)                 // Check if prime
getFactors(n)              // All factors
roundTo(value, decimals)   // Round to decimals
isEven(n) / isOdd(n)       // Parity check
```

### Random
```javascript
// Import
const { seededRandom, randInt, pickOne } = require('./utils/random');

// Use
const rng = seededRandom(seed);
randInt(min, max, rng)     // Random integer
pickOne(array, rng)        // Random element
shuffle(array, rng)        // Shuffle array
uniqueRandInts(count, min, max, rng)  // Unique integers
```

### Question Factories
```javascript
// Import
const { create* } = require('./utils/questionFactory');

// Use
createQuestion(display, answer, template)
createArithmeticQuestion(a, b, operator, answer, template)
createComparisonQuestion(prompt, a, b, answer, template)
createSequenceQuestion(sequence, answer, template)
createEquationQuestion(equation, answer, template)
createBooleanQuestion(text, answer, template, format)
```

## File Locations

```
📁 server/questions/
├── 📄 generator.js.backup       # Original (backup)
├── 📄 generatorNew.js           # Refactored generator
├── 📄 constants.js              # All constants
├── 📁 utils/
│   ├── 📄 random.js
│   ├── 📄 math.js
│   ├── 📄 validators.js
│   └── 📄 questionFactory.js
├── 📘 README.md                 # Full documentation
├── 📘 MIGRATION.md              # Migration guide
├── 📘 IMPROVEMENTS_NEEDED.md    # Original analysis
├── 📘 REFACTORING_SUMMARY.md    # Summary of changes
└── 📘 QUICK_REFERENCE.md        # This file
```

## Need Help?

1. Check [README.md](./README.md) for detailed docs
2. Review [MIGRATION.md](./MIGRATION.md) for migration
3. See [IMPROVEMENTS_NEEDED.md](./IMPROVEMENTS_NEEDED.md) for rationale
4. File an issue with error message and code sample
