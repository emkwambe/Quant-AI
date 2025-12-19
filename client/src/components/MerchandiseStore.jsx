import { useState, useEffect } from 'preact/hooks';
import { merchandise } from '../api/index.js';

export function MerchandiseStore({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('catalog'); // 'catalog', 'cart', 'checkout', 'orders'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadStore();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  async function loadStore() {
    try {
      const cats = await merchandise.categories();
      setCategories(cats);
      await loadProducts();
    } catch (e) {
      console.error('Failed to load store:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const prods = await merchandise.products(selectedCategory);
      setProducts(prods);
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  }

  async function loadOrders() {
    try {
      const orderList = await merchandise.orders();
      setOrders(orderList);
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  }

  function addToCart(product) {
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      setCart(cart.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  }

  function updateQuantity(productId, delta) {
    setCart(cart.map(i => {
      if (i.product.id !== productId) return i;
      const newQty = i.quantity + delta;
      return newQty <= 0 ? null : { ...i, quantity: newQty };
    }).filter(Boolean));
  }

  function removeFromCart(productId) {
    setCart(cart.filter(i => i.product.id !== productId));
  }

  const subtotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const shipping = itemCount > 0 ? 4.99 + (itemCount * 1) : 0;
  const total = subtotal + shipping;

  async function handleCheckout(e) {
    e.preventDefault();
    setProcessing(true);

    try {
      const orderData = {
        items: cart.map(i => ({
          productId: i.product.id,
          quantity: i.quantity
        })),
        shipping: checkoutData
      };

      const result = await merchandise.createOrder(orderData);

      // In a real app, we'd use Stripe Elements here
      // For now, simulate payment confirmation
      await merchandise.confirmOrder(result.orderId);

      setCart([]);
      setView('orders');
      await loadOrders();
      alert('Order placed successfully!');
    } catch (e) {
      alert(e.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <div class="card text-center">Loading store...</div>;
  }

  return (
    <div>
      {/* Store Header */}
      <div class="flex flex-between mb-3">
        <h2>Mathlete Gear Shop</h2>
        <div class="flex gap-1">
          <button
            class={`btn ${view === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('catalog')}
          >
            Shop
          </button>
          <button
            class={`btn ${view === 'cart' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('cart')}
          >
            Cart ({itemCount})
          </button>
          <button
            class={`btn ${view === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setView('orders'); loadOrders(); }}
          >
            My Orders
          </button>
        </div>
      </div>

      {/* Catalog View */}
      {view === 'catalog' && (
        <>
          {/* Category Filter */}
          <div class="flex gap-1 mb-3" style={{ overflowX: 'auto' }}>
            <button
              class={`btn ${!selectedCategory ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                class={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div class="grid grid-3" style={{ gap: '1rem' }}>
            {products.map(product => (
              <div key={product.id} class="card">
                <div
                  style={{
                    height: '120px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    fontSize: '2rem'
                  }}
                >
                  {getCategoryEmoji(product.category)}
                </div>
                <h4 style={{ marginBottom: '0.25rem' }}>{product.name}</h4>
                <p class="text-light" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {product.description}
                </p>
                <div class="flex flex-between">
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    {product.priceDisplay}
                  </span>
                  <button class="btn btn-success" onClick={() => addToCart(product)}>
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cart View */}
      {view === 'cart' && (
        <div class="card">
          {cart.length === 0 ? (
            <div class="text-center">
              <p class="text-light mb-2">Your cart is empty</p>
              <button class="btn btn-primary" onClick={() => setView('catalog')}>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <h3 class="mb-2">Shopping Cart</h3>
              <ul class="leaderboard">
                {cart.map(item => (
                  <li key={item.product.id} class="leaderboard-item">
                    <div class="flex gap-2" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getCategoryEmoji(item.product.category)}</span>
                      <div>
                        <div class="leaderboard-name">{item.product.name}</div>
                        <div class="text-light" style={{ fontSize: '0.875rem' }}>
                          {item.product.priceDisplay} each
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-1" style={{ alignItems: 'center' }}>
                      <button class="btn btn-outline" onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                      <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button class="btn btn-outline" onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                      <button class="btn btn-outline" style={{ color: 'var(--error)' }} onClick={() => removeFromCart(item.product.id)}>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div class="mt-3" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <div class="flex flex-between mb-1">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div class="flex flex-between mb-1">
                  <span>Shipping:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div class="flex flex-between" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                class="btn btn-success btn-large mt-3"
                style={{ width: '100%' }}
                onClick={() => setView('checkout')}
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      )}

      {/* Checkout View */}
      {view === 'checkout' && (
        <div class="card">
          <h3 class="mb-2">Checkout</h3>

          <div class="mb-3" style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
            <p class="text-light mb-1">Order Summary</p>
            <p>{itemCount} items - ${total.toFixed(2)}</p>
          </div>

          <form onSubmit={handleCheckout}>
            <h4 class="mb-2">Shipping Address</h4>
            <div class="form-group">
              <label>Full Name</label>
              <input
                type="text"
                class="form-input"
                value={checkoutData.name}
                onInput={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                required
              />
            </div>
            <div class="form-group">
              <label>Street Address</label>
              <input
                type="text"
                class="form-input"
                value={checkoutData.address}
                onInput={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                required
              />
            </div>
            <div class="grid grid-3" style={{ gap: '1rem' }}>
              <div class="form-group">
                <label>City</label>
                <input
                  type="text"
                  class="form-input"
                  value={checkoutData.city}
                  onInput={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                  required
                />
              </div>
              <div class="form-group">
                <label>State</label>
                <input
                  type="text"
                  class="form-input"
                  value={checkoutData.state}
                  onInput={(e) => setCheckoutData({ ...checkoutData, state: e.target.value })}
                  required
                  maxLength="2"
                  placeholder="CA"
                />
              </div>
              <div class="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  class="form-input"
                  value={checkoutData.zip}
                  onInput={(e) => setCheckoutData({ ...checkoutData, zip: e.target.value })}
                  required
                  maxLength="10"
                />
              </div>
            </div>

            <div class="flex gap-1 mt-3">
              <button type="button" class="btn btn-outline" onClick={() => setView('cart')}>
                Back to Cart
              </button>
              <button
                type="submit"
                class="btn btn-success"
                style={{ flex: 1 }}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders View */}
      {view === 'orders' && (
        <div class="card">
          <h3 class="mb-2">My Orders</h3>
          {orders.length === 0 ? (
            <p class="text-light">No orders yet</p>
          ) : (
            <ul class="leaderboard">
              {orders.map(order => (
                <li key={order.id} class="leaderboard-item">
                  <div>
                    <div class="leaderboard-name">Order #{order.id}</div>
                    <div class="text-light" style={{ fontSize: '0.875rem' }}>
                      {new Date(order.created_at).toLocaleDateString()} - {order.item_count} items
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>${order.total.toFixed(2)}</div>
                    <span
                      class="badge"
                      style={{
                        background: order.status === 'paid' ? 'var(--success)' : '#f59e0b',
                        color: 'white'
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function getCategoryEmoji(category) {
  const emojis = {
    apparel: '👕',
    awards: '🏆',
    supplies: '✏️',
    accessories: '🎗️',
    bundles: '📦'
  };
  return emojis[category] || '📦';
}
