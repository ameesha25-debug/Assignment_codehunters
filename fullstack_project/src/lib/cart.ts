// src/lib/cart.ts

// Central API base; falls back to localhost in dev
const API_BASE =
  (import.meta.env.VITE_API_URL as string) ??
  (import.meta.env.VITE_API_BASE as string) ??
  'http://localhost:4000';

// Parse response into JSON with readable errors
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

// Public types
export type CartItem = {
  id: string; // cart row id
  product_id: string;
  name: string;
  price: number;
  image_url?: string | null;
  qty: number;
  size?: string | null;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  currency: 'INR';
};

// Thin cart client
export const cart = {
  // Add or increment a product line for the signed-in user
  async addItem(productId: string, qty: number = 1, size?: string | null): Promise<{ ok: true }> {
    const res = await fetch(`${API_BASE}/api/cart/add`, {
      method: 'POST',
      credentials: 'include', // include cookies for session
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty, size }),
    });
    return toJson<{ ok: true }>(res);
  },

  // Fetch the current cart snapshot
  async get(): Promise<Cart> {
    const res = await fetch(`${API_BASE}/api/cart`, {
      credentials: 'include',
    });
    return toJson<Cart>(res);
  },

  // Remove a cart row by its id
  async removeItem(cartItemId: string): Promise<{ ok: true }> {
    const res = await fetch(`${API_BASE}/api/cart/remove`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId }),
    });
    return toJson<{ ok: true }>(res);
  },

  // Update quantity for a cart line item
  async updateQty(cartItemId: string, qty: number): Promise<{ ok: true }> {
    const res = await fetch(`${API_BASE}/api/cart/update`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId, qty }),
    });
    return toJson<{ ok: true }>(res);
  },

  // Optional clear-all (requires backend endpoint if you choose to enable it)
  async clear(): Promise<{ ok: true }> {
    const res = await fetch(`${API_BASE}/api/cart/clear`, {
      method: 'POST',
      credentials: 'include',
    });
    return toJson<{ ok: true }>(res);
  },
};
