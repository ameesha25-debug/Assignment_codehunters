// const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

// async function http<T>(path: string, init?: RequestInit): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, init);
//   if (!res.ok) {
//     const text = await res.text().catch(() => '');
//     throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
//   }
//   return res.json() as Promise<T>;
// }

// export type Category = {
//   id: string;
//   name: string;
//   slug: string;
//   image_url: string | null;
//   sort_order: number | null;
//   parent_id: string | null;
// };

// export type Product = {
//   id: string;
//   name: string;
//   price: number;
//   rating: number | null;
//   review_count: number | null;
//   badge: string | null;
//   category_id: string;
//   created_at: string;
// };

// export const api = {
//   roots: () => http<Category[]>('/api/categories'),
//   children: (parentId: string) => http<Category[]>(`/api/categories/${parentId}/children`),
//   categoryWithProducts: (slug: string) =>
//     http<{ category: Category; products: Product[] }>(`/api/category/${slug}`)
// };

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
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
};

export const api = {
  // homepage roots
  roots: () => http<Category[]>('/api/categories'),

  // plp level 1: /category/:slug
  categoryPage: (slug: string) =>
    http<{ category: Category; siblings: Category[]; children: Category[]; products: Product[] }>(
      `/api/category/${slug}`
    ),

  // plp level 2: /category/:parentSlug/:subSlug
  subcategoryPage: (parentSlug: string, subSlug: string) =>
    http<{ parent: Category; subcategory: Category; siblings: Category[]; products: Product[] }>(
      `/api/category/${parentSlug}/${subSlug}`
    ),
};
