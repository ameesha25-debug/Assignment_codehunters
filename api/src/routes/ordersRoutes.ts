import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../db';
import { requireUser } from '../middleware/requireUser';

const router = Router();

function getUserId(req: Request) {
  return (req as any).userId as string | undefined;
}

// Types to aid IDE (kept for clarity; not strictly required)
type AddressPick = {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

type OrderWithAddress = {
  id: string;
  created_at: string;
  amount: number;
  status: 'PLACED' | 'CANCELLED';
  payment_method: 'COD' | 'Stripe';
  addresses: AddressPick;
};

// POST /api/orders -> create COD order from cart (unchanged)
router.post('/', requireUser, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { address_id, payment_method } = req.body as { address_id: string; payment_method: 'COD' };
  if (payment_method !== 'COD') return res.status(400).json({ error: 'Unsupported payment method' });

  try {
    // Address ownership
    const { data: addr, error: addrErr } = await supabaseAdmin
      .from('addresses')
      .select('id')
      .eq('id', address_id)
      .eq('user_id', userId)
      .single();
    if (addrErr || !addr) return res.status(400).json({ error: 'Invalid address' });

    // Cart rows
    const { data: cartRows, error: cartErr } = await supabaseAdmin
      .from('cart_items')
      .select('product_id, qty, size')
      .eq('user_id', userId);
    if (cartErr) return res.status(400).json({ error: cartErr.message });
    if (!cartRows?.length) return res.status(400).json({ error: 'Cart empty' });

    // Product snapshots
    const pids = cartRows.map((r) => r.product_id);
    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image_url')
      .in('id', pids);
    if (prodErr) return res.status(400).json({ error: prodErr.message });
    const pmap = new Map((products || []).map((p) => [p.id, p] as const));

    // Amount
    const amount = cartRows.reduce(
      (sum, r) => sum + (pmap.get(r.product_id)?.price ?? 0) * r.qty,
      0,
    );

    // Create order (COD)
    const { data: order, error: ordErr } = await supabaseAdmin
      .from('orders')
      .insert([{ user_id: userId, address_id, amount, payment_method: 'COD', status: 'PLACED' }])
      .select('id')
      .single();
    if (ordErr) return res.status(400).json({ error: ordErr.message });

    // Items snapshot
    const orderItems = cartRows.map((r) => {
      const p = pmap.get(r.product_id);
      return {
        order_id: order!.id,
        product_id: r.product_id,
        name: p?.name ?? 'Unknown',
        price: p?.price ?? 0,
        qty: r.qty,
        size: r.size ?? null,
        image_url: p?.image_url ?? null,
      };
    });
    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (itemsErr) return res.status(400).json({ error: itemsErr.message });

    // Clear cart
    const { error: clearErr } = await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
    if (clearErr) return res.status(400).json({ error: clearErr.message });

    return res.status(201).json({ id: order!.id });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to place order' });
  }
});

// GET /api/orders -> list my orders with counts and previews
router.get('/', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;

    const { data: rows, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, amount, status, payment_method, address_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });

    const ids = (rows ?? []).map((o) => o.id);

    // item_count by summing qty
    const counts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: items, error: iErr } = await supabaseAdmin
        .from('order_items')
        .select('order_id, qty')
        .in('order_id', ids);
      if (iErr) return res.status(400).json({ error: iErr.message });
      for (const it of items ?? []) counts[it.order_id] = (counts[it.order_id] || 0) + (it.qty ?? 0);
    }

    // previews (0–3)
    const previews: Record<
      string,
      Array<{ name: string; size: string | null; image: string | null }>
    > = {};
    if (ids.length > 0) {
      const { data: items2, error: pErr } = await supabaseAdmin
        .from('order_items')
        .select('order_id, name, size, image_url, created_at')
        .in('order_id', ids)
        .order('created_at', { ascending: true });
      if (pErr) return res.status(400).json({ error: pErr.message });

      for (const it of items2 ?? []) {
        const arr = previews[it.order_id] || [];
        if (arr.length < 3)
          arr.push({ name: it.name, size: it.size ?? null, image: it.image_url ?? null });
        previews[it.order_id] = arr;
      }
    }

    const result = (rows ?? []).map((o) => ({
      id: o.id,
      created_at: o.created_at,
      amount: o.amount,
      status: o.status as 'PLACED' | 'CANCELLED',
      // IMPORTANT: pass through DB value so 'Stripe' appears when applicable
      payment_method: o.payment_method as 'COD' | 'Stripe',
      address_id: o.address_id,
      item_count: counts[o.id] ?? 0,
      items: previews[o.id] ?? [],
    }));

    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
});

// GET /api/orders/:id -> details (address, price, items with product_id)
router.get('/:id', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const id = req.params.id;

    // Fetch order by id + user
    const { data: order, error: oErr } = await supabaseAdmin
      .from('orders')
      .select(
        'id, created_at, amount, status, payment_method, payment_status, payment_intent_id, address_id, user_id',
      )
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (oErr || !order) return res.status(404).json({ error: 'Not found' });

    // Fetch address separately
    let address_block = '';
    const { data: addr } = await supabaseAdmin
      .from('addresses')
      .select('full_name, phone, line1, line2, city, state, pincode')
      .eq('id', order.address_id)
      .single();
    if (addr) {
      address_block = [
        addr.full_name,
        `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}`,
        `${addr.city}, ${addr.state} ${addr.pincode}`,
        `Mobile Number: ${addr.phone}`,
      ].join('\n');
    }

    // Items (include product_id)
    const { data: items, error: iErr } = await supabaseAdmin
      .from('order_items')
      .select('product_id, name, image_url, size, qty, price, created_at')
      .eq('order_id', id)
      .order('created_at', { ascending: true });
    if (iErr) return res.status(400).json({ error: iErr.message });

    // Price calc
    const mrp = (items ?? []).reduce((s, x) => s + Number(x.price) * Number(x.qty), 0);
    const total = Number(order.amount);
    const discount = Math.max(0, mrp - total);
    const shipping_fee = 0;
    const platform_fee = 20;

    return res.json({
      id: order.id,
      created_at: order.created_at,
      status: order.status as 'PLACED' | 'CANCELLED',
      payment_method: order.payment_method as 'COD' | 'Stripe',
      // Optional extras (safe for clients that ignore them)
      payment_status: (order as any).payment_status ?? undefined,
      payment_intent_id: (order as any).payment_intent_id ?? undefined,
      amount: total,
      price: { mrp, discount, shipping_fee, platform_fee, total },
      address_block,
      items: (items ?? []).map((x) => ({
        product_id: x.product_id, // expose for PDP link
        name: x.name,
        image: x.image_url,
        size: x.size,
        qty: x.qty,
      })),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
