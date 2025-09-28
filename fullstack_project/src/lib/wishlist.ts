// src/lib/wishlist.ts

const API_BASE =
  (import.meta.env.VITE_API_URL as string) ??
  (import.meta.env.VITE_API_BASE as string) ??
  'http://localhost:4000';

async function toJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => '');
  let data: any = {};
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: text }; }
  }
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data as T;
}

export type WishlistItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image_url?: string | null;
  size?: string | null; // always null from backend now
};

export type Wishlist = { items: WishlistItem[] };

function broadcast() {
  try {
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
  } catch {}
}

// Generic in-flight guard with correct return typing
const inFlight = new Set<string>();
function guard<T>(key: string, run: () => Promise<T>): Promise<T> {
  if (inFlight.has(key)) {
    // If a duplicate call comes while in-flight, just resolve immediately with no effect;
    // adjust to instead await the original if you track per-key promises.
    return Promise.resolve(undefined as unknown as T);
  }
  inFlight.add(key);
  return run().finally(() => inFlight.delete(key));
}

export const wishlist = {
  async get(): Promise<Wishlist> {
    const res = await fetch(`${API_BASE}/api/wishlist`, { credentials: 'include' });
    return toJson<Wishlist>(res);
  },

  // Add without size; backend deduplicates by product_id
  async add(productId: string): Promise<{ ok: true }> {
    const pid = (productId || '').trim();
    if (!pid) throw new Error('Invalid productId');
    return guard<{ ok: true }>(`add:${pid}`, async () => {
      const res = await fetch(`${API_BASE}/api/wishlist/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: pid }),
      });
      const data = await toJson<{ ok: true }>(res);
      broadcast();
      return data;
    });
  },

  // Remove by wishlist item id
  async removeByItem(itemId: string): Promise<{ ok: true }> {
    const id = (itemId || '').trim();
    if (!id) throw new Error('Invalid itemId');
    const res = await fetch(`${API_BASE}/api/wishlist/remove`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id }),
    });
    const data = await toJson<{ ok: true }>(res);
    broadcast();
    return data;
  },

  // Remove by productId
  async remove(productId: string): Promise<{ ok: true }> {
    const pid = (productId || '').trim();
    if (!pid) throw new Error('Invalid productId');
    return guard<{ ok: true }>(`remove:${pid}`, async () => {
      const res = await fetch(`${API_BASE}/api/wishlist/remove`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: pid }),
      });
      const data = await toJson<{ ok: true }>(res);
      broadcast();
      return data;
    });
  },

  // Move a wishlist product into basket with a required size
  async moveToBasket(productId: string, size: string): Promise<{ ok: true }> {
    const pid = (productId || '').trim();
    const sz = (size || '').trim();
    if (!pid) throw new Error('Invalid productId');
    if (!sz) throw new Error('Please select a size');

    return guard<{ ok: true }>(`move:${pid}:${sz}`, async () => {
      const res = await fetch(`${API_BASE}/api/wishlist/move-to-basket`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: pid, size: sz }),
      });
      const data = await toJson<{ ok: true }>(res);
      broadcast();
      try { window.dispatchEvent(new CustomEvent('cart-updated')); } catch {}
      return data;
    });
  },
};
