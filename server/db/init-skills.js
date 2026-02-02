// server/db/init-skills.js
// Initialize skills tables and seed data

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function initSkills() {
  console.log('🎯 Initializing Mathathlon Skills...\n');
  
  try {
    // 1. Run schema
    console.log('📋 Creating skills tables...');
    const schema = readFileSync(join(__dirname, 'skills-schema.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const stmt of statements) {
      try {
        db.execute(stmt);
      } catch (err) {
        // Ignore "table already exists" errors
        if (!err.message.includes('already exists')) {
          console.error(`  Error: ${err.message}`);
        }
      }
    }
    console.log('  ✓ Tables created\n');
    
    // 2. Check if already seeded
    const existingTiers = db.queryOne('SELECT COUNT(*) as count FROM skill_tiers');
    if (existingTiers.count > 0) {
      console.log('📦 Skills already seeded. Skipping seed data.\n');
      console.log('  To re-seed, run: npm run db:skills:reset\n');
    } else {
      // 3. Run seed data
      console.log('🌱 Seeding skills data...');
      const seed = readFileSync(join(__dirname, 'skills-seed.sql'), 'utf8');
      
      const seedStatements = seed
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const stmt of seedStatements) {
        try {
          db.execute(stmt);
        } catch (err) {
          console.error(`  Seed error: ${err.message}`);
        }
      }
      
      // Verify seeding
      const tierCount = db.queryOne('SELECT COUNT(*) as count FROM skill_tiers').count;
      const skillCount = db.queryOne('SELECT COUNT(*) as count FROM skills').count;
      const topicCount = db.queryOne('SELECT COUNT(*) as count FROM skill_topics').count;
      
      console.log(`  ✓ ${tierCount} skill tiers`);
      console.log(`  ✓ ${skillCount} skills`);
      console.log(`  ✓ ${topicCount} skill topics`);
    }
    
    // 4. Show Power 6
    console.log('\n🏆 Power 6 Skills (Critical for Algebra Success):');
    const powerSix = db.query(`
      SELECT s.name, st.name as tier
      FROM skills s
      JOIN skill_tiers st ON s.tier_id = st.id
      WHERE s.is_power_six = 1
      ORDER BY s.tier_id, s.display_order
    `);
    
    powerSix.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (${s.tier})`);
    });
    
    console.log('\n✅ Skills initialization complete!\n');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
initSkills();

export default initSkills;
