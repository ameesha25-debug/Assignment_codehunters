// src/lib/wishlist.ts

// Central API base; falls back to localhost in dev (same as cart.ts)
const API_BASE =
  (import.meta.env.VITE_API_URL as string) ??
  (import.meta.env.VITE_API_BASE as string) ??
  'http://localhost:4000';

// Parse response into JSON with readable errors (same helper used in cart.ts)
async function toJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => '');
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }
  return data as T;
}

// Types returned by the API
export type WishlistItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image_url?: string | null;
  size?: string | null;
  // rating?: number; // add if backend returns it later
};

export type Wishlist = {
  items: WishlistItem[];
};

function broadcast() {
  try {
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
  } catch {
    // no-op if window not available (SSR)
  }
}

export const wishlist = {
  // Fetch current user's wishlist
  async get(): Promise<Wishlist> {
    const res = await fetch(`${API_BASE}/api/wishlist`, {
      credentials: 'include',
    });
    return toJson<Wishlist>(res);
  },

  // Add a product (optionally with size) to wishlist
  async add(productId: string, size?: string | null): Promise<{ ok: true }> {
    const res = await fetch(`${API_BASE}/api/wishlist/add`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size: size ?? null }),
    });
    const data = await toJson<{ ok: true }>(res);
    broadcast();
    return data;
  },

  // Remove by wishlist item id
  async removeByItem(itemId: string): Promise<{ ok: true }> {
    const res = await fetch(`${API_BASE}/api/wishlist/remove`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    const data = await toJson<{ ok: true }>(res);
    broadcast();
    return data;
  },

  // Remove by productId (+ optional size)
  async remove(productId: string, size?: string | null): Promise<{ ok: true }> {
    const res = await fetch(`${API_BASE}/api/wishlist/remove`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size: size ?? null }),
    });
    const data = await toJson<{ ok: true }>(res);
    broadcast();
    return data;
  },
};
