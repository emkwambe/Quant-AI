import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session?.teacherId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Get resource types/categories for filtering
router.get('/types', (req, res) => {
  const types = [
    { id: 'guide', name: 'Study Guides', icon: '📖', description: 'In-depth explanations and strategies' },
    { id: 'worksheet', name: 'Worksheets', icon: '📝', description: 'Printable practice problems' },
    { id: 'answer-key', name: 'Answer Keys', icon: '✅', description: 'Solutions and explanations' },
    { id: 'competition-prep', name: 'Competition Prep', icon: '🏆', description: 'Get ready for heats' }
  ];
  res.json(types);
});

// Get grade levels for filtering
router.get('/grades', (req, res) => {
  const grades = [
    { id: 'all', name: 'All Grades' },
    { id: 'K-2', name: 'Grades K-2' },
    { id: '3-5', name: 'Grades 3-5' },
    { id: '6-8', name: 'Grades 6-8' }
  ];
  res.json(grades);
});

// List resources with optional filters
router.get('/list', (req, res) => {
  const { type, grade, free, search } = req.query;

  let query = `
    SELECT id, title, description, type, category, grade_level, difficulty,
           is_free, price_cents, page_count, download_count, tags
    FROM resources
    WHERE is_active = 1
  `;
  const params = [];

  if (type) {
    query += ` AND type = ?`;
    params.push(type);
  }

  if (grade && grade !== 'all') {
    query += ` AND (grade_level = ? OR grade_level = 'all')`;
    params.push(grade);
  }

  if (free === 'true') {
    query += ` AND is_free = 1`;
  } else if (free === 'false') {
    query += ` AND is_free = 0`;
  }

  if (search) {
    query += ` AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY is_free DESC, download_count DESC, created_at DESC`;

  try {
    const resources = db.prepare(query).all(...params);

    // Format prices for display
    const formatted = resources.map(r => ({
      ...r,
      priceDisplay: r.is_free ? 'Free' : `$${(r.price_cents / 100).toFixed(2)}`,
      tags: r.tags ? r.tags.split(',') : []
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Failed to list resources:', err);
    res.status(500).json({ error: 'Failed to load resources' });
  }
});

// Get single resource details
router.get('/:id', (req, res) => {
  try {
    const resource = db.prepare(`
      SELECT * FROM resources WHERE id = ? AND is_active = 1
    `).get(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      ...resource,
      priceDisplay: resource.is_free ? 'Free' : `$${(resource.price_cents / 100).toFixed(2)}`,
      tags: resource.tags ? resource.tags.split(',') : []
    });
  } catch (err) {
    console.error('Failed to get resource:', err);
    res.status(500).json({ error: 'Failed to load resource' });
  }
});

// Get bundles
router.get('/bundles/list', (req, res) => {
  try {
    const bundles = db.prepare(`
      SELECT rb.*, COUNT(rbi.resource_id) as item_count
      FROM resource_bundles rb
      LEFT JOIN resource_bundle_items rbi ON rb.id = rbi.bundle_id
      WHERE rb.is_active = 1
      GROUP BY rb.id
      ORDER BY rb.price_cents ASC
    `).all();

    // Get items for each bundle
    const bundlesWithItems = bundles.map(bundle => {
      const items = db.prepare(`
        SELECT r.id, r.title, r.type, r.price_cents
        FROM resource_bundle_items rbi
        JOIN resources r ON rbi.resource_id = r.id
        WHERE rbi.bundle_id = ?
      `).all(bundle.id);

      const totalValue = items.reduce((sum, item) => sum + item.price_cents, 0);

      return {
        ...bundle,
        priceDisplay: `$${(bundle.price_cents / 100).toFixed(2)}`,
        totalValueDisplay: `$${(totalValue / 100).toFixed(2)}`,
        savings: totalValue - bundle.price_cents,
        savingsDisplay: `$${((totalValue - bundle.price_cents) / 100).toFixed(2)}`,
        items
      };
    });

    res.json(bundlesWithItems);
  } catch (err) {
    console.error('Failed to list bundles:', err);
    res.status(500).json({ error: 'Failed to load bundles' });
  }
});

// Check if teacher owns a resource
router.get('/:id/owned', requireAuth, (req, res) => {
  try {
    const resource = db.prepare(`SELECT is_free FROM resources WHERE id = ?`).get(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Free resources are always "owned"
    if (resource.is_free) {
      return res.json({ owned: true, free: true });
    }

    // Check if teacher has downloaded/purchased
    const download = db.prepare(`
      SELECT id FROM resource_downloads
      WHERE resource_id = ? AND teacher_id = ?
    `).get(req.params.id, req.session.teacherId);

    res.json({ owned: !!download, free: false });
  } catch (err) {
    console.error('Failed to check ownership:', err);
    res.status(500).json({ error: 'Failed to check ownership' });
  }
});

// Get teacher's downloaded resources
router.get('/my/downloads', requireAuth, (req, res) => {
  try {
    const downloads = db.prepare(`
      SELECT r.*, rd.downloaded_at
      FROM resource_downloads rd
      JOIN resources r ON rd.resource_id = r.id
      WHERE rd.teacher_id = ?
      ORDER BY rd.downloaded_at DESC
    `).all(req.session.teacherId);

    // Also include all free resources
    const freeResources = db.prepare(`
      SELECT *, NULL as downloaded_at
      FROM resources
      WHERE is_free = 1 AND is_active = 1
    `).all();

    // Merge and dedupe
    const allResources = [...downloads];
    for (const free of freeResources) {
      if (!allResources.find(r => r.id === free.id)) {
        allResources.push(free);
      }
    }

    res.json(allResources.map(r => ({
      ...r,
      priceDisplay: r.is_free ? 'Free' : `$${(r.price_cents / 100).toFixed(2)}`,
      tags: r.tags ? r.tags.split(',') : []
    })));
  } catch (err) {
    console.error('Failed to get downloads:', err);
    res.status(500).json({ error: 'Failed to load downloads' });
  }
});

// Download/access a resource (free or already purchased)
router.post('/:id/download', requireAuth, (req, res) => {
  try {
    const resource = db.prepare(`SELECT * FROM resources WHERE id = ? AND is_active = 1`).get(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if free or already owned
    if (!resource.is_free) {
      const existing = db.prepare(`
        SELECT id FROM resource_downloads
        WHERE resource_id = ? AND teacher_id = ?
      `).get(req.params.id, req.session.teacherId);

      if (!existing) {
        return res.status(402).json({ error: 'Resource not purchased' });
      }
    }

    // Track download (or update if exists)
    db.prepare(`
      INSERT OR REPLACE INTO resource_downloads (resource_id, teacher_id, downloaded_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(req.params.id, req.session.teacherId);

    // Increment download count
    db.prepare(`UPDATE resources SET download_count = download_count + 1 WHERE id = ?`).run(req.params.id);

    // Return download URL (in production, this would be a signed URL)
    res.json({
      success: true,
      downloadUrl: resource.file_url || `/api/resources/${req.params.id}/file`,
      title: resource.title
    });
  } catch (err) {
    console.error('Failed to download resource:', err);
    res.status(500).json({ error: 'Failed to download resource' });
  }
});

// Purchase a resource
router.post('/:id/purchase', requireAuth, async (req, res) => {
  try {
    const resource = db.prepare(`SELECT * FROM resources WHERE id = ? AND is_active = 1`).get(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.is_free) {
      return res.status(400).json({ error: 'Resource is free' });
    }

    // Check if already owned
    const existing = db.prepare(`
      SELECT id FROM resource_downloads
      WHERE resource_id = ? AND teacher_id = ?
    `).get(req.params.id, req.session.teacherId);

    if (existing) {
      return res.status(400).json({ error: 'Resource already purchased' });
    }

    // In production, create Stripe checkout session here
    // For now, simulate successful purchase
    const stripeEnabled = process.env.STRIPE_SECRET_KEY;

    if (stripeEnabled) {
      // TODO: Implement Stripe checkout for resources
      return res.status(501).json({ error: 'Stripe checkout not yet implemented for resources' });
    }

    // Demo mode: auto-purchase
    db.prepare(`
      INSERT INTO resource_downloads (resource_id, teacher_id, stripe_payment_intent)
      VALUES (?, ?, 'demo_purchase')
    `).run(req.params.id, req.session.teacherId);

    db.prepare(`UPDATE resources SET download_count = download_count + 1 WHERE id = ?`).run(req.params.id);

    res.json({
      success: true,
      message: 'Resource purchased successfully',
      downloadUrl: resource.file_url || `/api/resources/${req.params.id}/file`
    });
  } catch (err) {
    console.error('Failed to purchase resource:', err);
    res.status(500).json({ error: 'Failed to purchase resource' });
  }
});

// Purchase a bundle
router.post('/bundles/:id/purchase', requireAuth, async (req, res) => {
  try {
    const bundle = db.prepare(`SELECT * FROM resource_bundles WHERE id = ? AND is_active = 1`).get(req.params.id);

    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    // Get bundle items
    const items = db.prepare(`
      SELECT resource_id FROM resource_bundle_items WHERE bundle_id = ?
    `).all(req.params.id);

    // In production, create Stripe checkout session here
    const stripeEnabled = process.env.STRIPE_SECRET_KEY;

    if (stripeEnabled) {
      return res.status(501).json({ error: 'Stripe checkout not yet implemented for bundles' });
    }

    // Demo mode: auto-purchase all items in bundle
    const insert = db.prepare(`
      INSERT OR IGNORE INTO resource_downloads (resource_id, teacher_id, stripe_payment_intent)
      VALUES (?, ?, 'demo_bundle_purchase')
    `);

    let addedCount = 0;
    for (const item of items) {
      const result = insert.run(item.resource_id, req.session.teacherId);
      if (result.changes > 0) {
        addedCount++;
        db.prepare(`UPDATE resources SET download_count = download_count + 1 WHERE id = ?`).run(item.resource_id);
      }
    }

    res.json({
      success: true,
      message: `Bundle purchased! ${addedCount} new resources added to your library.`,
      resourceCount: items.length
    });
  } catch (err) {
    console.error('Failed to purchase bundle:', err);
    res.status(500).json({ error: 'Failed to purchase bundle' });
  }
});

export default router;
