import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabaseClient';
import { ENV } from '../env';
import * as jwt from 'jsonwebtoken';
import type { Algorithm, SignOptions, Secret } from 'jsonwebtoken';

// Config
const JWT_SECRET: Secret =
  (process.env.JWT_SECRET || ENV.JWT_SECRET || 'your_jwt_secret') as Secret;
const ACCESS_TTL: SignOptions['expiresIn'] =
  (process.env.ACCESS_TOKEN_TTL || '15m') as SignOptions['expiresIn'];
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
const PROD = process.env.NODE_ENV === 'production';

// Helpers
function setCookie(res: Response, name: string, value: string, maxAgeMs: number, path = '/') {
  res.cookie(name, value, {
    httpOnly: true,
    secure: PROD,
    sameSite: 'lax',
    path,
    maxAge: maxAgeMs,
  });
}

function signAccess(payload: object) {
  const opts: SignOptions = {
    algorithm: 'HS512' as Algorithm,
    expiresIn: ACCESS_TTL,
    issuer: 'api',
    audience: 'web',
  };
  return jwt.sign(payload, JWT_SECRET, opts);
}

function signRefresh(payload: object) {
  const opts: SignOptions = {
    algorithm: 'HS512' as Algorithm,
    expiresIn: `${REFRESH_TTL_DAYS}d`,
    issuer: 'api',
    audience: 'web',
  };
  return jwt.sign(payload, JWT_SECRET, opts);
}


async function getUserByMobile(mobile: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('mobile', mobile)
    .single();
  if (error) return null;
  return data as any;
}

function toSummary(u: any) {
  return { id: u.id, mobile: u.mobile, name: u.name ?? 'User', credit: u.credit_balance ?? 0 };
}

// Controllers
export const register = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password are required' });

    const existing = await getUserByMobile(mobile);
    if (existing) return res.status(400).json({ error: 'Mobile already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: inserted, error } = await supabase
      .from('users')
      .insert([{ mobile, password_hash: passwordHash }])
      .select('*')
      .single();
    if (error) throw error;

    const access = signAccess({ sub: inserted.id });
    const refresh = signRefresh({ sub: inserted.id });

    setCookie(res, 'access', access, 15 * 60 * 1000);
    setCookie(res, 'refresh', refresh, REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000, '/api/auth');

    return res.status(201).json({ user: toSummary(inserted) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password are required' });

    const user = await getUserByMobile(mobile);
    if (!user) return res.status(400).json({ error: 'Invalid mobile or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid mobile or password' });

    const access = signAccess({ sub: user.id });
    const refresh = signRefresh({ sub: user.id });

    setCookie(res, 'access', access, 15 * 60 * 1000);
    setCookie(res, 'refresh', refresh, REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000, '/api/auth');

    return res.status(200).json({ user: toSummary(user) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

// New: returns current user based on access cookie
export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.access as string | undefined;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'], issuer: 'api', audience: 'web' }) as any;
    const user = await supabase.from('users').select('*').eq('id', decoded.sub).single();
    if (user.error || !user.data) return res.status(401).json({ error: 'Unauthorized' });
    return res.json(toSummary(user.data));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// New: refreshes cookies using refresh token cookie
export const refresh = async (_req: Request, res: Response) => {
  try {
    const token = _req.cookies?.refresh as string | undefined;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'], issuer: 'api', audience: 'web' }) as any;

    const access = signAccess({ sub: decoded.sub });
    const refreshTok = signRefresh({ sub: decoded.sub });

    setCookie(res, 'access', access, 15 * 60 * 1000);
    setCookie(res, 'refresh', refreshTok, REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000, '/api/auth');

    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// New: clears cookies; optional revoke can be added if you store refreshes in DB
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('access', { path: '/' });
  res.clearCookie('refresh', { path: '/api/auth' });
  return res.status(204).end();
};
