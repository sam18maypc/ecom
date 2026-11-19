const express = require('express');
const session  = require('express-session');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'luxe123', resave: false, saveUninitialized: false }));

// ── In-Memory Database ────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

let users  = [];
let orders = [];

const products = [
  { _id:'p1', name:'Pro Headphones',   price:1499, desc:'Premium wireless noise-cancelling audio.',          image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', category:'Electronics' },
  { _id:'p2', name:'Smart Watch',      price:2999, desc:'Sleek smartwatch with health & fitness tracking.',  image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', category:'Electronics' },
  { _id:'p3', name:'Air Sneakers',     price:1999, desc:'Ultra-light performance running shoes.',            image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', category:'Footwear'    },
  { _id:'p4', name:'Minimal Backpack', price:999,  desc:'Clean, spacious and waterproof daily backpack.',   image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', category:'Bags'        },
  { _id:'p5', name:'DSLR Camera',      price:4999, desc:'Capture life in stunning 4K clarity.',             image:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600', category:'Electronics' },
  { _id:'p6', name:'Aviator Shades',   price:699,  desc:'UV400 protection with a timeless pilot frame.',    image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', category:'Accessories' },
  { _id:'p7', name:'Slim Laptop',      price:5499, desc:'Featherlight 14" laptop for creators on the go.', image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', category:'Electronics' },
  { _id:'p8', name:'Leather Wallet',   price:549,  desc:'Hand-stitched full-grain leather bifold wallet.', image:'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', category:'Accessories' },
  { _id:'p9', name:'Eau de Parfum',    price:1299, desc:'Long-lasting signature scent for any occasion.',  image:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600', category:'Beauty'      },
];

// Seed demo user sam / sam.18may
(async () => {
  users.push({ _id: uid(), name: 'Sam', email: 'sam@demo.com', password: await bcrypt.hash('sam.18may', 10), cart: [] });
  console.log('✅  Demo user ready → sam@demo.com / sam.18may');
  console.log('🚀  http://localhost:3000');
})();

// ── Helpers ───────────────────────────────────────────────────
const getUser  = id  => users.find(u => u._id === id);
const auth = (req, res, next) => req.session.uid ? next() : res.status(401).json({ error: 'Login required' });

// ── Auth ──────────────────────────────────────────────────────
app.get('/api/me', (req, res) => {
  const u = getUser(req.session.uid);
  u ? res.json({ name: u.name }) : res.status(401).json({});
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  const user = { _id: uid(), name, email, password: await bcrypt.hash(password, 10), cart: [] };
  users.push(user);
  req.session.uid = user._id;
  res.json({ name: user.name });
});

app.post('/api/login', async (req, res) => {
  const user = users.find(u => u.email === req.body.email);
  if (!user || !await bcrypt.compare(req.body.password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });
  req.session.uid = user._id;
  res.json({ name: user.name });
});

app.post('/api/logout', (req, res) => { req.session.destroy(); res.json({ ok: true }); });

// ── Products ──────────────────────────────────────────────────
app.get('/api/products', (req, res) => res.json(products));

// ── Cart ──────────────────────────────────────────────────────
app.get('/api/cart', auth, (req, res) => {
  const u = getUser(req.session.uid);
  res.json(u.cart.map(i => {
    const p = products.find(p => p._id === i.pid);
    return p ? { ...p, qty: i.qty } : null;
  }).filter(Boolean));
});

app.post('/api/cart/add', auth, (req, res) => {
  const u = getUser(req.session.uid);
  const idx = u.cart.findIndex(i => i.pid === req.body.id);
  idx > -1 ? u.cart[idx].qty++ : u.cart.push({ pid: req.body.id, qty: 1 });
  res.json({ ok: true });
});

app.post('/api/cart/update', auth, (req, res) => {
  const u = getUser(req.session.uid);
  const { id, qty } = req.body;
  const idx = u.cart.findIndex(i => i.pid === id);
  if (idx > -1) qty < 1 ? u.cart.splice(idx, 1) : (u.cart[idx].qty = qty);
  res.json({ ok: true });
});

// ── Orders ────────────────────────────────────────────────────
app.post('/api/orders', auth, (req, res) => {
  const u = getUser(req.session.uid);
  const items = u.cart.map(i => {
    const p = products.find(p => p._id === i.pid);
    return p ? { name: p.name, price: p.price, qty: i.qty } : null;
  }).filter(Boolean);
  if (!items.length) return res.status(400).json({ error: 'Cart is empty' });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  orders.push({ _id: uid(), userId: u._id, items, total, address: req.body.address, status: 'Processing', createdAt: new Date() });
  u.cart = [];
  res.json({ ok: true });
});

app.get('/api/orders', auth, (req, res) => {
  res.json(orders.filter(o => o.userId === req.session.uid).sort((a, b) => b.createdAt - a.createdAt));
});

app.listen(3000, () => {});
