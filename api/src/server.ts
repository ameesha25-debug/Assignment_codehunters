import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import { supabaseAdmin } from './db'; // Make sure this is set up correctly

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Trust proxy so Secure cookies work behind reverse proxies/load balancers
app.set('trust proxy', 1);

// CORS must allow credentials for cookie auth
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing and cookies
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// --- Auth Routes ---
// NOTE: mount under /api/auth and ensure routes inside set/clear HttpOnly cookies.
app.use('/api/auth', authRoutes);

// --- Health Check ---
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// --- Top-Level Categories ---
app.get('/api/categories', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id,name,slug,image_url,sort_order,parent_id')
      .is('parent_id', null)
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Subcategories by Parent ID ---
app.get('/api/categories/:id/children', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id,name,slug,image_url,sort_order,parent_id')
      .eq('parent_id', id)
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Category PLP (Parent + Children + Products) ---
app.get('/api/category/:slug', async (req, res) => {
  const { slug } = req.params;

  const { data: category, error: cErr } = await supabaseAdmin
    .from('categories')
    .select('id,name,slug,parent_id,sort_order')
    .eq('slug', slug)
    .single();

  if (cErr || !category) return res.status(404).json({ error: 'Category not found' });

  const siblingsQuery = category.parent_id
    ? supabaseAdmin
        .from('categories')
        .select('id,name,slug,parent_id,sort_order')
        .eq('parent_id', category.parent_id)
        .order('sort_order', { ascending: true })
    : supabaseAdmin
        .from('categories')
        .select('id,name,slug,parent_id,sort_order')
        .is('parent_id', null)
        .order('sort_order', { ascending: true });

  const [
    { data: siblingsRaw, error: sibErr },
    { data: childrenRaw, error: chErr },
  ] = await Promise.all([
    siblingsQuery,
    supabaseAdmin
      .from('categories')
      .select('id,name,slug,parent_id,sort_order')
      .eq('parent_id', category.id)
      .order('sort_order', { ascending: true }),
  ]);

  if (sibErr) return res.status(500).json({ error: sibErr.message });
  if (chErr) return res.status(500).json({ error: chErr.message });

  const siblings = siblingsRaw ?? [];
  const children = childrenRaw ?? [];

  const ids = [category.id, ...children.map((c) => c.id)];

  const { data: products = [], error: pErr } = await supabaseAdmin
    .from('products')
    .select('id,name,price,rating,review_count,badge,category_id,created_at,image_url')
    .in('category_id', ids)
    .order('created_at', { ascending: false });

  if (pErr) return res.status(500).json({ error: pErr.message });

  res.json({ category, siblings, children, products });
});

// --- Subcategory PLP ---
app.get('/api/category/:parentSlug/:subSlug', async (req, res) => {
  const { parentSlug, subSlug } = req.params;

  const { data: parent, error: pErr } = await supabaseAdmin
    .from('categories')
    .select('id,name,slug')
    .eq('slug', parentSlug)
    .single();

  if (pErr || !parent) return res.status(404).json({ error: 'Parent not found' });

  const { data: sub, error: sErr } = await supabaseAdmin
    .from('categories')
    .select('id,name,slug,parent_id')
    .eq('slug', subSlug)
    .eq('parent_id', parent.id)
    .single();

  if (sErr || !sub) return res.status(404).json({ error: 'Subcategory not found' });

  const { data: siblings = [] } = await supabaseAdmin
    .from('categories')
    .select('id,name,slug,parent_id,sort_order')
    .eq('parent_id', parent.id)
    .order('sort_order', { ascending: true });

  const { data: products = [], error: prodErr } = await supabaseAdmin
    .from('products')
    .select('id,name,price,rating,review_count,badge,category_id,created_at,image_url')
    .eq('category_id', sub.id)
    .order('created_at', { ascending: false });

  if (prodErr) return res.status(500).json({ error: prodErr.message });

  res.json({ parent, subcategory: sub, siblings, products });
});

// --- Product Details by ID ---
app.get('/api/product/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id,name,price,rating,review_count,badge,category_id,created_at,image_url')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
