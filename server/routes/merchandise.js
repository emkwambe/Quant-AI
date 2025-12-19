import { Router } from 'express';
import db from '../db/index.js';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Get all products (public)
router.get('/products', (req, res) => {
  const { category } = req.query;

  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY category, price_cents';

  const products = db.prepare(query).all(...params);

  // Format prices for frontend
  const formattedProducts = products.map(p => ({
    ...p,
    price: p.price_cents / 100,
    priceDisplay: `$${(p.price_cents / 100).toFixed(2)}`
  }));

  res.json(formattedProducts);
});

// Get single product
router.get('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({
    ...product,
    price: product.price_cents / 100,
    priceDisplay: `$${(product.price_cents / 100).toFixed(2)}`
  });
});

// Get product categories
router.get('/categories', (req, res) => {
  const categories = db.prepare(
    'SELECT DISTINCT category FROM products WHERE is_active = 1 ORDER BY category'
  ).all();

  const categoryInfo = {
    'apparel': { name: 'Apparel', icon: '👕', description: 'T-shirts, jerseys, and wearables' },
    'awards': { name: 'Awards', icon: '🏆', description: 'Medals and trophies' },
    'supplies': { name: 'Supplies', icon: '✏️', description: 'Pencils, notebooks, and stickers' },
    'accessories': { name: 'Accessories', icon: '🎗️', description: 'Wristbands and more' },
    'bundles': { name: 'Bundles', icon: '📦', description: 'Value packs and kits' }
  };

  res.json(categories.map(c => ({
    id: c.category,
    ...categoryInfo[c.category]
  })));
});

// Create order (requires auth)
router.post('/orders', async (req, res) => {
  if (!req.session.teacherId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { items, shipping } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'No items in order' });
  }

  if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
    return res.status(400).json({ error: 'Shipping address required' });
  }

  // Calculate totals
  let subtotalCents = 0;
  const orderItems = [];

  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.productId} not found` });
    }

    const quantity = item.quantity || 1;
    const itemTotal = product.price_cents * quantity;
    subtotalCents += itemTotal;

    orderItems.push({
      productId: product.id,
      quantity,
      priceCents: product.price_cents,
      customization: item.customization || null
    });
  }

  // Simple shipping calculation (flat rate + per item)
  const shippingCents = 499 + (orderItems.reduce((sum, i) => sum + i.quantity, 0) * 100);
  const totalCents = subtotalCents + shippingCents;

  try {
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        teacherId: req.session.teacherId.toString()
      }
    });

    // Create order in database
    const result = db.prepare(`
      INSERT INTO orders (teacher_id, subtotal_cents, shipping_cents, total_cents,
        shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip,
        stripe_payment_intent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')
    `).run(
      req.session.teacherId,
      subtotalCents,
      shippingCents,
      totalCents,
      shipping.name,
      shipping.address,
      shipping.city,
      shipping.state,
      shipping.zip,
      paymentIntent.id
    );

    const orderId = result.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price_cents, customization)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of orderItems) {
      insertItem.run(orderId, item.productId, item.quantity, item.priceCents, item.customization);
    }

    res.json({
      orderId,
      clientSecret: paymentIntent.client_secret,
      subtotal: subtotalCents / 100,
      shipping: shippingCents / 100,
      total: totalCents / 100
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Confirm order payment
router.post('/orders/:id/confirm', (req, res) => {
  if (!req.session.teacherId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const order = db.prepare(
    'SELECT * FROM orders WHERE id = ? AND teacher_id = ?'
  ).get(req.params.id, req.session.teacherId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Update order status
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('paid', order.id);

  res.json({ success: true, status: 'paid' });
});

// Get teacher's orders
router.get('/orders', (req, res) => {
  if (!req.session.teacherId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const orders = db.prepare(`
    SELECT o.*,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    WHERE o.teacher_id = ?
    ORDER BY o.created_at DESC
  `).all(req.session.teacherId);

  res.json(orders.map(o => ({
    ...o,
    subtotal: o.subtotal_cents / 100,
    shipping: o.shipping_cents / 100,
    total: o.total_cents / 100
  })));
});

// Get single order details
router.get('/orders/:id', (req, res) => {
  if (!req.session.teacherId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const order = db.prepare(
    'SELECT * FROM orders WHERE id = ? AND teacher_id = ?'
  ).get(req.params.id, req.session.teacherId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare(`
    SELECT oi.*, p.name, p.description, p.image_url, p.category
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(order.id);

  res.json({
    ...order,
    subtotal: order.subtotal_cents / 100,
    shipping: order.shipping_cents / 100,
    total: order.total_cents / 100,
    items: items.map(i => ({
      ...i,
      price: i.price_cents / 100
    }))
  });
});

// Webhook for Stripe payment confirmation
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_MERCH_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Update order status
    db.prepare(`
      UPDATE orders SET status = 'paid' WHERE stripe_payment_intent = ?
    `).run(paymentIntent.id);

    console.log('Payment succeeded for:', paymentIntent.id);
  }

  res.json({ received: true });
});

export default router;
