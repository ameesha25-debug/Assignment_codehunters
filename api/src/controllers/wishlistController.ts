import { Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

// GET /api/wishlist
export const listWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        size,
        product:product_id (
          name,
          price,
          image_url
        )
      `)
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
// NEW RULES:
// 1) Size-agnostic storage: we never store size in wishlist; it must be chosen when moving to basket.
// 2) Uniqueness by (user_id, product_id): if the product is already in wishlist, do nothing.
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { productId } = (req.body || {}) as { productId?: string };

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'productId is required' });
    }

    // Check if same product already exists (ignore size completely)
    const { data: existing, error: exErr } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    if (exErr) throw exErr;

    if (!existing?.id) {
      const { error: insErr } = await supabase
        .from('wishlist_items')
        .insert([{ user_id: userId, product_id: productId, size: null }]);
      if (insErr) throw insErr;
    }

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// POST /api/wishlist/remove { itemId } OR { productId }
// Removes by item id or by product id (size ignored).
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { itemId, productId } = (req.body || {}) as {
      itemId?: string;
      productId?: string;
    };

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!itemId && !productId) {
      return res
        .status(400)
        .json({ error: 'Provide itemId or productId to remove' });
    }

    let query = supabase.from('wishlist_items').delete().eq('user_id', userId);
    if (itemId) {
      query = query.eq('id', itemId);
    } else {
      query = query.eq('product_id', productId as string);
    }

    const { error } = await query;
    if (error) throw error;

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// POST /api/wishlist/move-to-basket { productId, size }
// Moves a wishlist product to basket with a required size, then removes any wishlist
// rows for that product for this user.
export const moveWishlistToBasket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { productId, size } = (req.body || {}) as {
      productId?: string;
      size?: string;
    };

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'productId is required' });
    }
    if (!size || typeof size !== 'string' || !size.trim()) {
      return res.status(400).json({ error: 'size is required' });
    }

    // 1) Upsert into basket by (user_id, product_id, size)
    const { error: cartErr } = await supabase
      .from('cart_items')
      .upsert(
        [{ user_id: userId, product_id: productId, size, quantity: 1 }],
        { onConflict: 'user_id,product_id,size' }
      );
    if (cartErr) throw cartErr;

    // 2) Remove any wishlist entries for this product for this user (size ignored)
    const { error: delErr } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (delErr) throw delErr;

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};
