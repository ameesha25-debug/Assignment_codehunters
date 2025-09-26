// src/lib/api.ts
import { supabase } from "./supabase";

export const API_BASE =
  (import.meta.env.VITE_API_URL as string) ??
  (import.meta.env.VITE_API_BASE as string) ??
  "http://localhost:4000";

// ---------- Utilities ----------
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    try {
      const t = await res.text();
      return t ? { message: t } : {};
    } catch {
      return {};
    }
  }
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function normalizeForSearch(s: string) {
  return s
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212\-_/.,+()'"&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildIlikePatterns(q: string) {
  const base = normalizeForSearch(q);
  const tokens = base ? base.split(" ") : [];
  const patterns = new Set<string>();

  if (base) patterns.add(`%${base}%`);
  tokens.forEach((t) => patterns.add(`%${t}%`));

  const synonyms: Record<string, string[]> = {
    tshirt: ["tshirt", "t shirt", "tee", "tees"],
    "t shirt": ["tshirt", "t shirt", "tee", "tees"],
    tee: ["tee", "tees", "tshirt", "t shirt"],
    tees: ["tee", "tees", "tshirt", "t shirt"],
    top: ["top", "tops", "tee", "tees"],
    tops: ["top", "tops", "tee", "tees"],
  };
  tokens.forEach((t) => {
    const syns = synonyms[t];
    if (syns) syns.forEach((s) => patterns.add(`%${s}%`));
    if (t.endsWith("s")) patterns.add(`%${t.slice(0, -1)}%`);
    else patterns.add(`%${t}s%`);
  });

  return Array.from(patterns);
}

// ---------- Data Types ----------
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

export type SearchResolution =
  | { type: "category"; category: { id: string; slug: string } }
  | {
      type: "subcategory";
      category: { id: string; slug: string };
      parent: { id: string; slug: string };
    }
  | {
      type: "products";
      products: Array<{
        id: string;
        name: string;
        image_url: string | null;
        price: number;
        category_id: string;
        created_at: string;
        rating: number | null;
        review_count: number | null;
        badge: string | null;
      }>;
      query: string;
    }
  | { type: "none"; query: string };

// ---------- DB helpers ----------
async function categoriesBySlug(slug: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("id,slug,parent_id")
    .eq("slug", slug)
    .single();
  if (error && (error as any).code !== "PGRST116") throw error;
  return (data ?? null) as { id: string; slug: string; parent_id: string | null } | null;
}

async function categoryById(id: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("id,slug,parent_id")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as { id: string; slug: string; parent_id: string | null };
}

async function searchProductsFTS(query: string) {
  const patterns = buildIlikePatterns(query);
  if (patterns.length === 0) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,image_url,price,category_id,created_at,rating,review_count,badge"
    ) // expanded so cards have rating/badge
    .or(patterns.map((p) => `name.ilike.${p}`).join(","))
    .limit(48);
  if (error) throw error;
  return (data ?? []) as Array<{
    id: string;
    name: string;
    image_url: string | null;
    price: number;
    category_id: string;
    created_at: string;
    rating: number | null;
    review_count: number | null;
    badge: string | null;
  }>;
}

// ---------- Shared HTTP helper ----------
// Auto-includes credentials for cookie-based auth.
// Optionally includes Authorization header if a token is present.
function authHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  // Optional token support if you later switch from cookies to bearer:
  const token = localStorage.getItem("token");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: authHeaders(init),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Public API ----------
export type Api = typeof api;

export const api = {
  roots: () => http<Category[]>("/api/categories"),

  categoryPage: (slug: string) =>
    http<{
      category: Category;
      siblings: Category[];
      children: Category[];
      products: Product[];
    }>(`/api/category/${slug}`),

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

  productById: async (id: string) => {
    if (!id || id === "null") throw new Error("Invalid product id");
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,price,rating,review_count,badge,category_id,created_at,image_url"
      )
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

  productsByCategory: async (
    categoryId: string,
    opts?: { limit?: number; excludeId?: string }
  ) => {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,price,rating,review_count,badge,category_id,created_at,image_url"
      )
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })
      .limit(opts?.limit ?? 12);
    if (error) throw error;
    let list = (data ?? []) as Product[];
    if (opts?.excludeId) list = list.filter((p) => p.id !== opts.excludeId);
    return list;
  },

  // Authentication API calls
  registerUser: async (mobile: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await safeJson(res);
    if (!res.ok)
      throw new Error(
        (data as any)?.error || (data as any)?.message || res.statusText
      );
    return data;
  },

  loginUser: async (mobile: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await safeJson(res);
    if (!res.ok)
      throw new Error(
        (data as any)?.error || (data as any)?.message || res.statusText
      );
    return data;
  },

  // Update current user's profile (firstName, lastName, email)
  updateProfile: async (body: { firstName: string; lastName: string; email: string }) => {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error((data as any)?.error || (data as any)?.message || res.statusText);
    }
    return data;
  },

  // resolve free‑text search into category/subcategory/size/products/none
  resolveSearch: async (q: string): Promise<SearchResolution> => {
    const query = q?.trim() ?? "";
    if (!query) return { type: "none", query: "" };

    const slugVariants = new Set<string>([
      normalize(query),
      normalizeForSearch(query),
    ]);
    if (query.toLowerCase().endsWith("s"))
      slugVariants.add(query.slice(0, -1).toLowerCase());
    else slugVariants.add((query + "s").toLowerCase());
    ["tshirt", "t shirt", "tee", "tees", "top", "tops"].forEach((w) =>
      slugVariants.add(w)
    );

    for (const v of slugVariants) {
      const cat = await categoriesBySlug(v);
      if (cat) {
        if (cat.parent_id) {
          const parent = await categoryById(cat.parent_id);
          return {
            type: "subcategory",
            category: { id: cat.id, slug: cat.slug },
            parent: { id: parent.id, slug: parent.slug },
          };
        }
        return { type: "category", category: { id: cat.id, slug: cat.slug } };
      }
    }

    const products = await searchProductsFTS(query);
    if (products.length) return { type: "products", products, query };

    return { type: "none", query };
  },

  categoriesByIds: async (ids: string[]) => {
    if (!ids?.length) return [];
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,parent_id,image_url,sort_order")
      .in("id", ids);
    if (error) throw error;
    const byId = new Map((data ?? []).map((c: any) => [c.id, c]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as Category[];
  },

  getCategory: async (id: string) => {
    if (!id) throw new Error("Invalid category id");
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,parent_id,image_url,sort_order")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Category;
  },

  // Include children if the slug points to a parent category
  categoryAndChildrenProductsBySlug: async (slug: string, limit = 200) => {
    const { data: cat, error: e1 } = await supabase
      .from("categories")
      .select("id,slug,parent_id")
      .eq("slug", slug)
      .single();
    if (e1 || !cat) return [];

    const ids: string[] = [cat.id];
    if (!cat.parent_id) {
      const { data: kids } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", cat.id);
      if (kids?.length) ids.push(...kids.map((k: any) => k.id));
    }

    const { data } = await supabase
      .from("products")
      .select(
        "id,name,image_url,price,category_id,created_at,rating,review_count,badge"
      )
      .in("category_id", ids)
      .order("created_at", { ascending: false })
      .limit(limit);

    return (data ?? []) as Product[];
  },
};

// ---------- Shared HTTP helper ----------
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Optional helper ----------
export async function fetchHeroCategories(
  slugs: string[]
): Promise<CategoryHero[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,image_url")
    .in("slug", slugs);
  if (error) throw error;

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
