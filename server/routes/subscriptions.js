import { Router } from 'express';
import Stripe from 'stripe';
import db from '../db/index.js';
import { requireTeacher } from '../middleware/auth.js';

const router = Router();

// Initialize Stripe (use test key for development)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly_placeholder'
};

// Get current subscription status
router.get('/status', requireTeacher, (req, res) => {
  const teacher = db.prepare(`
    SELECT tier, subscription_expires_at, stripe_customer_id
    FROM teachers WHERE id = ?
  `).get(req.teacher.id);

  const isActive = teacher.tier === 'pro' &&
    (!teacher.subscription_expires_at ||
     new Date(teacher.subscription_expires_at) > new Date());

  res.json({
    tier: teacher.tier,
    isActive,
    expiresAt: teacher.subscription_expires_at,
    features: isActive ? {
      unlimitedClassrooms: true,
      unlimitedHeats: true,
      allGradeLevels: true,
      historicalTracking: true,
      exportData: true,
      classVsClass: true
    } : {
      unlimitedClassrooms: false,
      unlimitedHeats: false,
      allGradeLevels: false,
      historicalTracking: false,
      exportData: false,
      classVsClass: false
    }
  });
});

// Create checkout session
router.post('/checkout', requireTeacher, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Get or create Stripe customer
    let customerId = req.teacher.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.teacher.email,
        name: req.teacher.name,
        metadata: { teacherId: req.teacher.id.toString() }
      });
      customerId = customer.id;

      db.prepare('UPDATE teachers SET stripe_customer_id = ? WHERE id = ?')
        .run(customerId, req.teacher.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: PRICES[plan],
        quantity: 1
      }],
      success_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?subscription=success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?subscription=cancelled`,
      metadata: {
        teacherId: req.teacher.id.toString(),
        plan
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create billing portal session (manage subscription)
router.post('/portal', requireTeacher, async (req, res) => {
  try {
    const teacher = db.prepare('SELECT stripe_customer_id FROM teachers WHERE id = ?')
      .get(req.teacher.id);

    if (!teacher.stripe_customer_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: teacher.stripe_customer_id,
      return_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Stripe webhook handler
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // In production, verify webhook signature
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Development mode - parse directly
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle subscription events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const teacherId = session.metadata?.teacherId;

      if (teacherId) {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

        db.prepare(`
          UPDATE teachers
          SET tier = 'pro', subscription_expires_at = ?
          WHERE id = ?
        `).run(expiresAt, teacherId);

        console.log(`Activated Pro for teacher ${teacherId}, expires ${expiresAt}`);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.renewed': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const teacher = db.prepare('SELECT id FROM teachers WHERE stripe_customer_id = ?')
        .get(customerId);

      if (teacher) {
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
        const isActive = subscription.status === 'active';

        db.prepare(`
          UPDATE teachers
          SET tier = ?, subscription_expires_at = ?
          WHERE id = ?
        `).run(isActive ? 'pro' : 'free', expiresAt, teacher.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const teacher = db.prepare('SELECT id FROM teachers WHERE stripe_customer_id = ?')
        .get(customerId);

      if (teacher) {
        db.prepare(`
          UPDATE teachers SET tier = 'free' WHERE id = ?
        `).run(teacher.id);

        console.log(`Cancelled Pro for teacher ${teacher.id}`);
      }
      break;
    }
  }

  res.json({ received: true });
});

export default router;
