import { Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

// GET /api/wishlist
// Returns the current user's wishlist items with joined product data.
export const listWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Join to the singular table "product" via the FK on wishlist_items.product_id -> product.id
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(
        `
        id,
        product_id,
        size,
        product:product_id (
          name,
          price,
          image_url
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const items =
      (data ?? []).map((row: any) => ({
        id: row.id as string,
        product_id: row.product_id as string,
        name: row.product?.name as string,
        price: row.product?.price as number,
        image_url: (row.product?.image_url ?? null) as string | null,
        size: (row.size ?? null) as string | null,
      })) ?? [];

    return res.json({ items });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// POST /api/wishlist/add { productId, size? }
// Upsert by (user_id, product_id, size). If exists, do nothing.
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    let { productId, size = null } = (req.body || {}) as {
      productId?: string;
      size?: string | null;
    };

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'productId is required' });
    }
    // Normalize size: only string or null
    size = typeof size === 'string' && size.length ? size : null;

    // Check existing
    const { data: existing, error: exErr } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('size', size)
      .maybeSingle();
    if (exErr) throw exErr;

    if (!existing?.id) {
      const { error: insErr } = await supabase
        .from('wishlist_items')
        .insert([{ user_id: userId, product_id: productId, size }]);
      if (insErr) throw insErr;
    }

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// POST /api/wishlist/remove { itemId } OR { productId, size? }
// Removes a single wishlist row by item id, or by (productId, size) for the user.
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    let { itemId, productId, size = null } = (req.body || {}) as {
      itemId?: string;
      productId?: string;
      size?: string | null;
    };

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!itemId && !productId) {
      return res
        .status(400)
        .json({ error: 'Provide itemId or productId (with optional size) to remove' });
    }

    // Normalize size for pair-based removal
    size = typeof size === 'string' && size.length ? size : null;

    let query = supabase.from('wishlist_items').delete().eq('user_id', userId);

    if (itemId) {
      query = query.eq('id', itemId);
    } else {
      query = query.eq('product_id', productId as string).eq('size', size);
    }

    const { error } = await query;
    if (error) throw error;

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};
