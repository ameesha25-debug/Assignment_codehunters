import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../db';
import { requireUser } from '../middleware/requireUser';

const router = Router();

function getUserId(req: Request) {
  return (req as any).userId as string | undefined;
}

// GET /api/addresses
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

// POST /api/addresses
router.post('/', requireUser, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const a = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .insert([{
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
      is_default: !!a.is_default,
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  if (data?.is_default) {
    await supabaseAdmin
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .neq('id', data.id);
  }

  res.status(201).json(data);
});

export default router;
