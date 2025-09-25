// api/src/controllers/cartController.ts
import { Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

export const addItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { productId, qty = 1, size = null } = req.body || {};
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!productId || typeof qty !== 'number' || qty < 1) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Upsert: if same product+size exists for user, increment qty
    const { data: existing, error: exErr } = await supabase
      .from('cart_items')
      .select('id,qty')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('size', size)
      .maybeSingle();

    if (exErr) throw exErr;

    if (existing?.id) {
      const { error: upErr } = await supabase
        .from('cart_items')
        .update({ qty: (existing.qty ?? 0) + qty })
        .eq('id', existing.id)
        .eq('user_id', userId);
      if (upErr) throw upErr;
    } else {
      const { error: insErr } = await supabase
        .from('cart_items')
        .insert([{ user_id: userId, product_id: productId, qty, size }]);
      if (insErr) throw insErr;
    }

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        product_id,
        qty,
        size,
        products:product_id (
          name,
          price,
          image_url
        )
      `
      )
      .eq('user_id', userId)
      .order('id', { ascending: true });

    if (error) throw error;

    const items =
      (data ?? []).map((row: any) => ({
        id: row.id as string,
        product_id: row.product_id as string,
        name: row.products?.name as string,
        price: row.products?.price as number,
        image_url: row.products?.image_url as string | null,
        qty: row.qty as number,
        size: row.size as string | null,
      })) ?? [];

    const subtotal = items.reduce((sum: number, it: any) => sum + (it.price || 0) * (it.qty || 0), 0);

    return res.json({ items, subtotal, currency: 'INR' });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { cartItemId } = req.body || {};
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!cartItemId) return res.status(400).json({ error: 'cartItemId is required' });

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId);
    if (error) throw error;

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// NEW: update quantity for a cart line
export const updateQty = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { cartItemId, qty } = req.body || {};
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const nextQty = Number(qty);
    if (!cartItemId || !Number.isFinite(nextQty) || nextQty < 1) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ qty: nextQty })
      .eq('id', cartItemId)
      .eq('user_id', userId);
    if (error) throw error;

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};
// controllers/cartController.ts
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

