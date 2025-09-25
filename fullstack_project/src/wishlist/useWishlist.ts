// src/wishlist/useWishlist.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { wishlist, type WishlistItem } from '@/lib/wishlist';

// Minimal in-memory cache to avoid refetching repeatedly within a session
let cachedItems: WishlistItem[] | null = null;
let lastFetchedAt = 0;
const STALE_MS = 30_000; // 30s cache window

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>(cachedItems ?? []);
  const [loading, setLoading] = useState<boolean>(!cachedItems);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const now = Date.now();

      if (cachedItems && now - lastFetchedAt < STALE_MS) {
        setItems(cachedItems);
        setLoading(false);
        return;
      }

      const data = await wishlist.get();
      cachedItems = data.items || [];
      lastFetchedAt = now;
      setItems(cachedItems);
    } catch (e: any) {
      setError(e?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    load();
  }, [load]);

  useEffect(() => {
    // Refresh on external updates
    const onUpdate = () => {
      // bust cache and reload
      cachedItems = null;
      lastFetchedAt = 0;
      load();
    };
    window.addEventListener('wishlist-updated', onUpdate as any);
    return () => window.removeEventListener('wishlist-updated', onUpdate as any);
  }, [load]);

  const productSizeSet = useMemo(() => {
    // Build a Set of product_id::sizeKey for O(1) lookup
    const set = new Set<string>();
    for (const it of items) {
      const sizeKey = it.size ?? '';
      set.add(`${it.product_id}::${sizeKey}`);
    }
    return set;
  }, [items]);

  // Quick check: product is in wishlist (optionally match size)
  const inWishlist = useCallback(
    (productId: string, size?: string | null) => {
      const key = `${productId}::${size ?? ''}`;
      return productSizeSet.has(key);
    },
    [productSizeSet]
  );

  const refresh = useCallback(() => {
    cachedItems = null;
    lastFetchedAt = 0;
    return load();
  }, [load]);

  return {
    items,
    loading,
    error,
    inWishlist,
    refresh,
  };
}
