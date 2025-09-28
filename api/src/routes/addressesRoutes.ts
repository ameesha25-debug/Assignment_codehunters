
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../db';
import { requireUser } from '../middleware/requireUser';

const router = Router();

function getUserId(req: Request) {
  return (req as any).userId as string | undefined;
}

// GET /api/addresses - list user's addresses
router.get('/', requireUser, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data ?? []);
});

// POST /api/addresses - add new address
router.post('/', requireUser, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const a = req.body || {};

  const payload = {
    user_id: userId,
    full_name: a.full_name,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 || null,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    landmark: a.landmark || null,
    address_type: a.address_type || 'HOME',
    // do not set true directly; we’ll promote via RPC if requested
    is_default: false,
  };

  // Insert first (avoids partial unique index violation)
  const { data: row, error } = await supabaseAdmin
    .from('addresses')
    .insert([payload])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // If caller wants this as default, flip atomically via RPC
  let final = row;
  if (a.is_default) {
    const { data, error: rpcErr } = await supabaseAdmin
      .rpc('set_default_address_v2', { p_user_id: userId, p_address_id: row.id });
    if (rpcErr) return res.status(400).json({ error: rpcErr.message });
    final = data as any;
  }

  res.status(201).json(final);
});

// PUT /api/addresses/:id - update existing address
router.put('/:id', requireUser, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const a = req.body || {};

  // If request wants to make this default, do that via RPC first
  if (a.is_default === true) {
    const { data, error } = await supabaseAdmin
      .rpc('set_default_address_v2', { p_user_id: userId, p_address_id: id });
    if (error) return res.status(400).json({ error: (error as any).message });
    // Continue to update other fields (without touching is_default)
  }

  // Update fields excluding is_default (handled above if needed)
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .update({
      full_name: a.full_name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 || null,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      landmark: a.landmark || null,
      address_type: a.address_type || 'HOME',
      // do not set is_default here; RPC already handled true case
      // allow turning default off explicitly if requested
      ...(a.is_default === false ? { is_default: false } : {}),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/addresses/:id - delete address
router.delete('/:id', requireUser, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// POST /api/addresses/:id/default - set address as default (atomic via RPC)
router.post('/:id/default', requireUser, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .rpc('set_default_address_v2', { p_user_id: userId, p_address_id: id });

  if (error) {
    const code = (error as any).code;
    if (code === '23505') return res.status(409).json({ error: 'Only one default address allowed.' });
    return res.status(400).json({ error: (error as any).message });
  }

  res.json(data);
});

export default router;
