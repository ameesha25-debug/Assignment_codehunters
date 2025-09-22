// src/lib/api.ts
import { supabase } from "./supabase";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number | null;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number | null;
  review_count: number | null;
  badge: string | null;
  category_id: string;
  created_at: string;
  image_url?: string | null;
  category?: string | null;
};

export type CategoryHero = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export const api = {
  // homepage roots
  roots: () => http<Category[]>("/api/categories"),

  // plp level 1: /category/:slug
  categoryPage: (slug: string) =>
    http<{
      category: Category;
      siblings: Category[];
      children: Category[];
      products: Product[];
    }>(`/api/category/${slug}`),

  // plp level 2: /category/:parentSlug/:subSlug
  subcategoryPage: (parentSlug: string, subSlug: string) =>
    http<{
      parent: Category;
      subcategory: Category;
      siblings: Category[];
      products: Product[];
    }>(`/api/category/${parentSlug}/${subSlug}`),

  // trendy module via Supabase RPC
  trendyByBadge: async (badge: "Bestseller" | "Trending", limit = 8) => {
    const { data, error } = await supabase.rpc("get_trendy_by_badge", {
      badge_in: badge,
      limit_count: limit,
    });
    if (error) throw error;
    return (data ?? []) as Array<{
      id: string;
      name: string;
      price: number;
      image_url: string | null;
      rating: number | null;
      review_count: number | null;
      badge: string | null;
      category: string | null;
      category_id: string | null;
      created_at: string;
    }>;
  },

  // inside export const api = { ... }
productById: async (id: string) => {
  if (!id || id === "null") throw new Error("Invalid product id");
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,rating,review_count,badge,category_id,created_at,image_url")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Product;
},


categorySiblings: async (categoryId: string) => {
  const { data: me, error: e1 } = await supabase
    .from("categories")
    .select("parent_id")
    .eq("id", categoryId)
    .single();
  if (e1) throw e1;
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,parent_id,sort_order,image_url")
    .eq("parent_id", me?.parent_id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
},

parentCategoryOf: async (categoryId: string) => {
  const { data: me, error } = await supabase
    .from("categories")
    .select("parent_id")
    .eq("id", categoryId)
    .single();
  if (error) throw error;
  if (!me?.parent_id) return null;
  const { data: parent, error: e2 } = await supabase
    .from("categories")
    .select("id,name,slug,parent_id,image_url,sort_order")
    .eq("id", me.parent_id)
    .single();
  if (e2) throw e2;
  return (parent ?? null) as Category | null;
},

productsByCategory: async (categoryId: string, opts?: { limit?: number; excludeId?: string }) => {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,rating,review_count,badge,category_id,created_at,image_url")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 12);
  if (error) throw error;
  let list = (data ?? []) as Product[];
  if (opts?.excludeId) list = list.filter((p) => p.id !== opts.excludeId);
  return list;
},

}

// fetch hero categories by slugs, preserving order
export async function fetchHeroCategories(slugs: string[]): Promise<CategoryHero[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,image_url")
    .in("slug", slugs);
  if (error) throw error;

  // Preserve the requested order
  const bySlug = new Map((data ?? []).map((c: any) => [c.slug, c]));
  return slugs
    .map((s) => bySlug.get(s))
    .filter(Boolean)
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image_url: c.image_url,
    }));
}

