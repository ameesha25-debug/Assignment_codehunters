// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import { supabaseAdmin } from './db';

// const app = express();
// app.use(cors({ origin: true }));
// app.use(express.json({ limit: '5mb' }));

// // Health
// app.get('/api/health', (_req, res) => res.json({ ok: true }));

// // Homepage: top-level categories
// app.get('/api/categories', async (_req, res) => {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from('categories')
//       .select('id,name,slug,image_url,sort_order,parent_id')
//       .is('parent_id', null)
//       .order('sort_order', { ascending: true });
//     if (error) return res.status(500).json({ error: error.message });
//     res.json(data);
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // Children by parent id (optional for previews)
// app.get('/api/categories/:id/children', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { data, error } = await supabaseAdmin
//       .from('categories')
//       .select('id,name,slug,image_url,sort_order,parent_id')
//       .eq('parent_id', id)
//       .order('sort_order', { ascending: true });
//     if (error) return res.status(500).json({ error: error.message });
//     res.json(data);
//   } catch (e: any) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // Category PLP (level 1)
// app.get('/api/category/:slug', async (req, res) => {
//   const { slug } = req.params;

//   const { data: category, error: cErr } = await supabaseAdmin
//     .from('categories')
//     .select('id,name,slug,parent_id,sort_order')
//     .eq('slug', slug)
//     .single();
//   if (cErr || !category) return res.status(404).json({ error: 'Category not found' });

//   const siblingsQuery = category.parent_id
//     ? supabaseAdmin.from('categories').select('id,name,slug,parent_id,sort_order')
//         .eq('parent_id', category.parent_id)
//         .order('sort_order', { ascending: true })
//     : supabaseAdmin.from('categories').select('id,name,slug,parent_id,sort_order')
//         .is('parent_id', null)
//         .order('sort_order', { ascending: true });

//   const [{ data: siblings = [] }, { data: children = [], error: chErr }] = await Promise.all([
//     siblingsQuery,
//     supabaseAdmin.from('categories')
//       .select('id,name,slug,parent_id,sort_order')
//       .eq('parent_id', category.id)
//       .order('sort_order', { ascending: true })
//   ]);
//   if (chErr) return res.status(500).json({ error: chErr.message });

//   const { data: products = [], error: pErr } = await supabaseAdmin
//     .from('products')
//     .select('id,name,price,rating,review_count,badge,category_id,created_at,image_url');
//   if (pErr) return res.status(500).json({ error: pErr.message });

//   res.json({ category, siblings, children, products });
// });

// // Subcategory PLP (level 2)
// app.get('/api/category/:parentSlug/:subSlug', async (req, res) => {
//   const { parentSlug, subSlug } = req.params;

//   const { data: parent, error: pErr } = await supabaseAdmin
//     .from('categories')
//     .select('id,name,slug')
//     .eq('slug', parentSlug)
//     .single();
//   if (pErr || !parent) return res.status(404).json({ error: 'Parent not found' });

//   const { data: sub, error: sErr } = await supabaseAdmin
//     .from('categories')
//     .select('id,name,slug,parent_id')
//     .eq('slug', subSlug)
//     .eq('parent_id', parent.id)
//     .single();
//   if (sErr || !sub) return res.status(404).json({ error: 'Subcategory not found' });

//   const { data: siblings = [] } = await supabaseAdmin
//     .from('categories')
//     .select('id,name,slug,parent_id,sort_order')
//     .eq('parent_id', parent.id)
//     .order('sort_order', { ascending: true });

//   const { data: products = [], error: prodErr } = await supabaseAdmin
//     .from('products')
//    .select('id,name,price,rating,review_count,badge,category_id,created_at,image_url')
//     .eq('category_id', sub.id)
//     .order('created_at', { ascending: false });
//   if (prodErr) return res.status(500).json({ error: prodErr.message });

//   res.json({ parent, subcategory: sub, siblings, products });
// });

// const port = Number(process.env.PORT || 4000);
// app.listen(port, () => console.log(`API running at http://localhost:${port}`));





import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabaseAdmin } from "./db";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "5mb" }));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Homepage: top-level categories
app.get("/api/categories", async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id,name,slug,image_url,sort_order,parent_id")
      .is("parent_id", null)
      .order("sort_order", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Children by parent id
app.get("/api/categories/:id/children", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id,name,slug,image_url,sort_order,parent_id")
      .eq("parent_id", id)
      .order("sort_order", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Category PLP (level 1) — parent + its direct children only
app.get("/api/category/:slug", async (req, res) => {
  const { slug } = req.params;

  // 1) find the category by slug
  const { data: category, error: cErr } = await supabaseAdmin
    .from("categories")
    .select("id,name,slug,parent_id,sort_order")
    .eq("slug", slug)
    .single();

  if (cErr || !category)
    return res.status(404).json({ error: "Category not found" });

  // 2) siblings at same level
  const siblingsQuery = category.parent_id
    ? supabaseAdmin
        .from("categories")
        .select("id,name,slug,parent_id,sort_order")
        .eq("parent_id", category.parent_id)
        .order("sort_order", { ascending: true })
    : supabaseAdmin
        .from("categories")
        .select("id,name,slug,parent_id,sort_order")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });

  // 3) children of this category
  const [
    { data: siblingsRaw, error: sibErr },
    { data: childrenRaw, error: chErr },
  ] = await Promise.all([
    siblingsQuery,
    supabaseAdmin
      .from("categories")
      .select("id,name,slug,parent_id,sort_order")
      .eq("parent_id", category.id)
      .order("sort_order", { ascending: true }),
  ]);

  if (sibErr) return res.status(500).json({ error: sibErr.message });
  if (chErr) return res.status(500).json({ error: chErr.message });

  const siblings =
    (siblingsRaw ?? []) as {
      id: string;
      name: string;
      slug: string;
      parent_id: string | null;
      sort_order: number | null;
    }[];

  const children =
    (childrenRaw ?? []) as {
      id: string;
      name: string;
      slug: string;
      parent_id: string | null;
      sort_order: number | null;
    }[];

  // 4) ids = parent + its children
  const ids = [category.id, ...children.map((c) => c.id)];

  // 5) only products in that id set
  const { data: products = [], error: pErr } = await supabaseAdmin
    .from("products")
    .select(
      "id,name,price,rating,review_count,badge,category_id,created_at,image_url"
    )
    .in("category_id", ids)
    .order("created_at", { ascending: false });

  if (pErr) return res.status(500).json({ error: pErr.message });

  res.json({ category, siblings, children, products });
});

// Subcategory PLP (level 2) — only the subcategory
app.get("/api/category/:parentSlug/:subSlug", async (req, res) => {
  const { parentSlug, subSlug } = req.params;

  // 1) parent by slug
  const { data: parent, error: pErr } = await supabaseAdmin
    .from("categories")
    .select("id,name,slug")
    .eq("slug", parentSlug)
    .single();

  if (pErr || !parent)
    return res.status(404).json({ error: "Parent not found" });

  // 2) subcategory by slug under the parent
  const { data: sub, error: sErr } = await supabaseAdmin
    .from("categories")
    .select("id,name,slug,parent_id")
    .eq("slug", subSlug)
    .eq("parent_id", parent.id)
    .single();

  if (sErr || !sub)
    return res.status(404).json({ error: "Subcategory not found" });

  // 3) siblings under the same parent (for the pills bar)
  const { data: siblings = [] } = await supabaseAdmin
    .from("categories")
    .select("id,name,slug,parent_id,sort_order")
    .eq("parent_id", parent.id)
    .order("sort_order", { ascending: true });

  // 4) products only in this subcategory
  const { data: products = [], error: prodErr } = await supabaseAdmin
    .from("products")
    .select(
      "id,name,price,rating,review_count,badge,category_id,created_at,image_url"
    )
    .eq("category_id", sub.id)
    .order("created_at", { ascending: false });

  if (prodErr) return res.status(500).json({ error: prodErr.message });

  res.json({ parent, subcategory: sub, siblings, products });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () =>
  console.log(`API running at http://localhost:${port}`)
);
