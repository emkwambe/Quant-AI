/**
 * Mathathlon Seed Data
 * Creates a demo school with teachers, classrooms, students, and historical data
 *
 * Run with: node server/db/seed.js
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '../../data/mathathlon.db'));

const SALT_ROUNDS = 10;

// Demo School Configuration
const DEMO_SCHOOL = {
  name: 'Lincoln Elementary School',
  country: 'US'
};

// Demo Teachers
const TEACHERS = [
  { email: 'principal@lincoln.edu', password: 'demo123', name: 'Dr. Sarah Johnson', role: 'principal', tier: 'pro' },
  { email: 'smith@lincoln.edu', password: 'demo123', name: 'Ms. Emily Smith', role: 'teacher', tier: 'pro' },
  { email: 'garcia@lincoln.edu', password: 'demo123', name: 'Mr. Carlos Garcia', role: 'teacher', tier: 'free' },
  { email: 'chen@lincoln.edu', password: 'demo123', name: 'Ms. Lisa Chen', role: 'teacher', tier: 'pro' },
  { email: 'wilson@lincoln.edu', password: 'demo123', name: 'Mr. James Wilson', role: 'teacher', tier: 'free' },
];

// Demo Classrooms (one per teacher, except principal)
const CLASSROOMS = [
  { teacherEmail: 'smith@lincoln.edu', name: '2nd Grade Math Stars', gradeLevel: 2, joinCode: 'MATH2A' },
  { teacherEmail: 'garcia@lincoln.edu', name: '4th Grade Mathletes', gradeLevel: 4, joinCode: 'MATH4A' },
  { teacherEmail: 'chen@lincoln.edu', name: '5th Grade Champions', gradeLevel: 5, joinCode: 'MATH5A' },
  { teacherEmail: 'wilson@lincoln.edu', name: '7th Grade Algebra Prep', gradeLevel: 7, joinCode: 'MATH7A' },
  { teacherEmail: 'chen@lincoln.edu', name: '6th Grade Problem Solvers', gradeLevel: 6, joinCode: 'MATH6A' },
];

// Student names for realistic data
const STUDENT_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Cameron', 'Dakota', 'Emerson', 'Finley', 'Harper', 'Hayden', 'Jamie', 'Jesse',
  'Kai', 'Kennedy', 'Logan', 'Madison', 'Noah', 'Olivia', 'Parker', 'Peyton',
  'Reese', 'Sage', 'Skyler', 'Sydney', 'Tatum', 'Tyler', 'Aiden', 'Bella'
];

async function seed() {
  console.log('🌱 Starting seed process...\n');

  // Clear existing demo data (be careful in production!)
  console.log('🧹 Clearing existing demo data...');

  // Get teacher IDs for demo school
  const demoTeacherEmails = TEACHERS.map(t => t.email);
  const placeholders = demoTeacherEmails.map(() => '?').join(',');

  // Delete in order to respect foreign keys
  db.prepare(`DELETE FROM responses WHERE heat_id IN (SELECT id FROM heats WHERE classroom_id IN (SELECT id FROM classrooms WHERE teacher_id IN (SELECT id FROM teachers WHERE email IN (${placeholders}))))`).run(...demoTeacherEmails);
  db.prepare(`DELETE FROM heats WHERE classroom_id IN (SELECT id FROM classrooms WHERE teacher_id IN (SELECT id FROM teachers WHERE email IN (${placeholders})))`).run(...demoTeacherEmails);
  db.prepare(`DELETE FROM students WHERE classroom_id IN (SELECT id FROM classrooms WHERE teacher_id IN (SELECT id FROM teachers WHERE email IN (${placeholders})))`).run(...demoTeacherEmails);
  db.prepare(`DELETE FROM classrooms WHERE teacher_id IN (SELECT id FROM teachers WHERE email IN (${placeholders}))`).run(...demoTeacherEmails);
  db.prepare(`DELETE FROM teachers WHERE email IN (${placeholders})`).run(...demoTeacherEmails);

  // 1. Create Teachers
  console.log('👩‍🏫 Creating teachers...');
  const teacherIds = {};

  for (const teacher of TEACHERS) {
    const passwordHash = await bcrypt.hash(teacher.password, SALT_ROUNDS);
    const result = db.prepare(`
      INSERT INTO teachers (email, password_hash, name, school_name, country_code, tier)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(teacher.email, passwordHash, teacher.name, DEMO_SCHOOL.name, DEMO_SCHOOL.country, teacher.tier);

    teacherIds[teacher.email] = result.lastInsertRowid;
    console.log(`  ✓ ${teacher.name} (${teacher.email}) - ${teacher.tier}`);
  }

  // 2. Create Classrooms
  console.log('\n🏫 Creating classrooms...');
  const classroomIds = {};

  for (const classroom of CLASSROOMS) {
    const teacherId = teacherIds[classroom.teacherEmail];
    const result = db.prepare(`
      INSERT INTO classrooms (teacher_id, name, join_code, grade_level)
      VALUES (?, ?, ?, ?)
    `).run(teacherId, classroom.name, classroom.joinCode, classroom.gradeLevel);

    classroomIds[classroom.joinCode] = result.lastInsertRowid;
    console.log(`  ✓ ${classroom.name} (Code: ${classroom.joinCode}) - Grade ${classroom.gradeLevel}`);
  }

  // 3. Create Students (5-8 per classroom)
  console.log('\n👨‍🎓 Creating students...');
  const studentIds = {};
  let nameIndex = 0;

  for (const classroom of CLASSROOMS) {
    const classroomId = classroomIds[classroom.joinCode];
    const studentCount = 5 + Math.floor(Math.random() * 4); // 5-8 students
    studentIds[classroom.joinCode] = [];

    for (let i = 0; i < studentCount; i++) {
      const name = STUDENT_NAMES[nameIndex % STUDENT_NAMES.length];
      nameIndex++;

      const result = db.prepare(`
        INSERT INTO students (classroom_id, display_name)
        VALUES (?, ?)
      `).run(classroomId, name);

      studentIds[classroom.joinCode].push({ id: result.lastInsertRowid, name });
    }
    console.log(`  ✓ ${classroom.name}: ${studentCount} students`);
  }

  // 4. Create Historical Heats with Responses
  console.log('\n🏁 Creating historical heats...');

  for (const classroom of CLASSROOMS) {
    const classroomId = classroomIds[classroom.joinCode];
    const students = studentIds[classroom.joinCode];

    // Create 3 historical heats per classroom
    for (let heatNum = 1; heatNum <= 3; heatNum++) {
      const difficulty = Math.min(3, Math.floor(Math.random() * 3) + 1);
      const daysAgo = heatNum * 2 + Math.floor(Math.random() * 3);

      const heatResult = db.prepare(`
        INSERT INTO heats (classroom_id, difficulty_level, status, started_at, ended_at)
        VALUES (?, ?, 'ended', datetime('now', '-${daysAgo} days'), datetime('now', '-${daysAgo} days', '+2 minutes'))
      `).run(classroomId, difficulty);

      const heatId = heatResult.lastInsertRowid;

      // Create responses for each student (10-18 questions answered)
      for (const student of students) {
        const questionsAnswered = 10 + Math.floor(Math.random() * 9);

        for (let q = 0; q < questionsAnswered; q++) {
          const isCorrect = Math.random() > 0.3; // 70% accuracy average
          const responseTime = 2000 + Math.floor(Math.random() * 8000); // 2-10 seconds

          db.prepare(`
            INSERT INTO responses (heat_id, student_id, question_index, question_template, question_display, correct_answer, student_answer, is_correct, response_time_ms, answered_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${daysAgo} days'))
          `).run(
            heatId,
            student.id,
            q,
            'seed-question',
            `${Math.floor(Math.random() * 10)} + ${Math.floor(Math.random() * 10)}`,
            10,
            isCorrect ? 10 : 11,
            isCorrect ? 1 : 0,
            responseTime
          );
        }
      }
    }
    console.log(`  ✓ ${classroom.name}: 3 heats with responses`);
  }

  console.log('\n✅ Seed complete!\n');

  // Print summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    DEMO ACCOUNTS CREATED');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📧 Teacher Logins (all passwords: demo123)\n');

  for (const teacher of TEACHERS) {
    console.log(`   ${teacher.name.padEnd(20)} │ ${teacher.email.padEnd(25)} │ ${teacher.tier}`);
  }

  console.log('\n📝 Classroom Join Codes\n');
  for (const classroom of CLASSROOMS) {
    console.log(`   ${classroom.joinCode}  │ ${classroom.name} (Grade ${classroom.gradeLevel})`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('\n🔗 Access URLs:');
  console.log('   Teacher Login:  http://localhost:5173 → "I\'m a Teacher" → Login');
  console.log('   Student Join:   http://localhost:5173 → "I\'m a Student" → Enter Code');
  console.log('\n');

  db.close();
}

seed().catch(console.error);
