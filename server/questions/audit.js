/**
 * Question Generator Audit Tool
 *
 * Analyzes all question templates for:
 * - Correct formatting
 * - Sample output verification
 * - Potential issues (duplicate =?, unclear wording)
 *
 * Run: node server/questions/audit.js
 * Run with samples: node server/questions/audit.js --samples
 * Run specific grade: node server/questions/audit.js --grade=K-2
 */

import { generateQuestions } from './generator.js';

// Get templates directly from generator
const getTemplates = async () => {
  // Import the templates object
  const module = await import('./generator.js');

  // We need to extract templates - let's generate questions and analyze
  const allQuestions = [];

  // Generate questions for each grade band and difficulty
  const gradeBands = ['K-2', '3-5', '6-8'];
  const difficulties = [1, 2, 3, 4, 5];

  for (const grade of gradeBands) {
    for (const diff of difficulties) {
      try {
        const questions = generateQuestions(diff, 100, Date.now() + Math.random() * 10000, grade);
        allQuestions.push(...questions);
      } catch (e) {
        // Some combinations may not have questions
      }
    }
  }

  return allQuestions;
};

// Analyze a question for issues
function analyzeQuestion(q) {
  const issues = [];

  // Check for duplicate "= ?"
  if ((q.display.match(/= \?/g) || []).length > 1) {
    issues.push('DUPLICATE_EQUALS: Multiple "= ?" found');
  }

  // Check for unclear patterns
  if (q.display.includes('= ? = ?')) {
    issues.push('CONFUSING: Double question marks');
  }

  // Check for missing "= ?" in arithmetic
  if (/^\d+ [+\-×÷] \d+$/.test(q.display)) {
    issues.push('MISSING_EQUALS: Arithmetic without "= ?"');
  }

  // Check answer is a valid number
  if (typeof q.answer !== 'number' || isNaN(q.answer)) {
    issues.push('INVALID_ANSWER: Answer is not a number');
  }

  // Check for very long display
  if (q.display.length > 80) {
    issues.push('TOO_LONG: Display exceeds 80 chars');
  }

  // Check for non-integer answers in templates that should be integers
  if (!Number.isInteger(q.answer) && !q.template.includes('decimal') && !q.template.includes('frac')) {
    issues.push('NON_INTEGER: Unexpected decimal answer');
  }

  return issues;
}

// Main audit function
async function audit() {
  const args = process.argv.slice(2);
  const showSamples = args.includes('--samples');
  const gradeFilter = args.find(a => a.startsWith('--grade='))?.split('=')[1];

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('              MATHATHLON QUESTION GENERATOR AUDIT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Generate sample questions
  console.log('Generating sample questions...\n');

  const templateStats = {};
  const issues = [];

  // Generate many questions to cover all templates
  const gradeBands = gradeFilter ? [gradeFilter] : ['K-2', '3-5', '6-8'];

  for (const grade of gradeBands) {
    for (let seed = 1; seed <= 50; seed++) {
      for (const diff of [1, 2, 3, 4, 5]) {
        try {
          const questions = generateQuestions(diff, 20, seed * 1000 + diff, grade);

          for (const q of questions) {
            // Track template usage
            if (!templateStats[q.template]) {
              templateStats[q.template] = {
                template: q.template,
                grade: grade,
                count: 0,
                samples: [],
                issues: []
              };
            }

            templateStats[q.template].count++;

            // Store sample (max 3 per template)
            if (templateStats[q.template].samples.length < 3) {
              templateStats[q.template].samples.push({
                display: q.display,
                answer: q.answer
              });
            }

            // Check for issues
            const qIssues = analyzeQuestion(q);
            if (qIssues.length > 0) {
              templateStats[q.template].issues.push(...qIssues);
              issues.push({
                template: q.template,
                display: q.display,
                issues: qIssues
              });
            }
          }
        } catch (e) {
          // Skip invalid combinations
        }
      }
    }
  }

  // Sort templates by name
  const sortedTemplates = Object.values(templateStats).sort((a, b) =>
    a.template.localeCompare(b.template)
  );

  // Print summary by grade
  const gradeGroups = {
    'K-2': sortedTemplates.filter(t => t.template.startsWith('k2-')),
    '3-5': sortedTemplates.filter(t => !t.template.startsWith('k2-') && !t.template.startsWith('68-')),
    '6-8': sortedTemplates.filter(t => t.template.startsWith('68-') || t.template.startsWith('35-'))
  };

  console.log('TEMPLATE SUMMARY BY GRADE');
  console.log('─────────────────────────────────────────────────────────────────\n');

  let totalTemplates = 0;

  for (const [grade, templates] of Object.entries(gradeGroups)) {
    if (templates.length === 0) continue;

    console.log(`\n📚 ${grade} (${templates.length} templates)`);
    console.log('─'.repeat(60));

    for (const t of templates) {
      totalTemplates++;
      const issueFlag = t.issues.length > 0 ? ' ⚠️' : ' ✓';
      console.log(`  ${t.template.padEnd(35)}${issueFlag}`);

      if (showSamples && t.samples.length > 0) {
        for (const s of t.samples.slice(0, 2)) {
          console.log(`      → "${s.display}" = ${s.answer}`);
        }
      }
    }
  }

  // Print issues
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('                        ISSUES FOUND');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Deduplicate issues by template
  const uniqueIssues = {};
  for (const issue of issues) {
    const key = `${issue.template}:${issue.issues.join(',')}`;
    if (!uniqueIssues[key]) {
      uniqueIssues[key] = issue;
    }
  }

  const issueList = Object.values(uniqueIssues);

  if (issueList.length === 0) {
    console.log('✅ No issues found!\n');
  } else {
    console.log(`⚠️  ${issueList.length} potential issues:\n`);

    for (const issue of issueList) {
      console.log(`  Template: ${issue.template}`);
      console.log(`  Example:  "${issue.display}"`);
      console.log(`  Issues:   ${issue.issues.join(', ')}`);
      console.log('');
    }
  }

  // Final stats
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                          SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`  Total templates found:    ${totalTemplates}`);
  console.log(`  Templates with issues:    ${issueList.length}`);
  console.log(`  Issue-free templates:     ${totalTemplates - issueList.length}`);
  console.log(`  Pass rate:                ${((totalTemplates - issueList.length) / totalTemplates * 100).toFixed(1)}%`);

  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('Usage:');
  console.log('  node server/questions/audit.js              # Basic audit');
  console.log('  node server/questions/audit.js --samples    # Show sample questions');
  console.log('  node server/questions/audit.js --grade=K-2  # Filter by grade');
  console.log('─────────────────────────────────────────────────────────────────\n');
}

audit().catch(console.error);
