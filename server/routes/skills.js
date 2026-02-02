// server/routes/skills.js
import { Router } from 'express';
import db from '../db/adapter.js';
import { getLevelInfo, LEVELS } from '../utils/mastery.js';

const router = Router();

// GET /api/skills - List all skills
router.get('/', (req, res) => {
  try {
    const tiers = db.query('SELECT * FROM skill_tiers ORDER BY display_order');
    const skills = db.query('SELECT s.*, st.name as tier_name, st.icon as tier_icon, st.color as tier_color FROM skills s JOIN skill_tiers st ON s.tier_id = st.id ORDER BY s.tier_id, s.display_order');
    const result = tiers.map(tier => ({
      ...tier,
      skills: skills.filter(s => s.tier_id === tier.id).map(s => ({
        ...s, ccss_codes: JSON.parse(s.ccss_codes || '[]')
      }))
    }));
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/skills/power-six
router.get('/power-six', (req, res) => {
  try {
    const skills = db.query('SELECT s.*, st.name as tier_name FROM skills s JOIN skill_tiers st ON s.tier_id = st.id WHERE s.is_power_six = 1 ORDER BY s.id');
    res.json({ title: 'The Power 6', skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Power 6' });
  }
});

// GET /api/skills/:skillId
router.get('/:skillId', (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = db.queryOne('SELECT s.*, st.name as tier_name FROM skills s JOIN skill_tiers st ON s.tier_id = st.id WHERE s.id = ? OR s.slug = ?', [skillId, skillId]);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    const topics = db.query('SELECT * FROM skill_topics WHERE skill_id = ? ORDER BY display_order', [skill.id]);
    res.json({ ...skill, topics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

// GET /api/skills/progress/student/:studentId
router.get('/progress/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = db.query('SELECT s.id as skill_id, s.name, s.slug, s.is_power_six, COALESCE(sp.total_attempts, 0) as total_attempts, COALESCE(sp.correct_answers, 0) as correct_answers, COALESCE(sp.current_level, 0) as current_level, COALESCE(sp.best_streak, 0) as best_streak FROM skills s LEFT JOIN student_skill_progress sp ON s.id = sp.skill_id AND sp.student_id = ? ORDER BY s.tier_id, s.display_order', [studentId]);
    res.json(progress.map(p => ({
      ...p,
      accuracy: p.total_attempts > 0 ? p.correct_answers / p.total_attempts : 0,
      levelInfo: getLevelInfo(p.current_level)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// GET /api/skills/certificates/verify/:code
router.get('/certificates/verify/:code', (req, res) => {
  try {
    const cert = db.queryOne('SELECT c.*, s.name as skill_name FROM certificates c LEFT JOIN skills s ON c.skill_id = s.id WHERE c.verification_code = ?', [req.params.code]);
    if (!cert) return res.status(404).json({ valid: false });
    res.json({ valid: cert.is_valid === 1, certificate: cert });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
