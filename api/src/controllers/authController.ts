import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabaseClient';
import { ENV } from '../env';

const JWT_SECRET = process.env.JWT_SECRET || ENV.JWT_SECRET || 'your_jwt_secret';

// Helper: Get user by mobile
async function getUserByMobile(mobile: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('mobile', mobile)
    .single();

  if (error) return null;
  return data;
}

// Updated Register Controller
export const register = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile and password are required" });
    }

    const existingUser = await getUserByMobile(mobile);
    if (existingUser) {
      return res.status(400).json({ error: "Mobile already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: inserted, error } = await supabase
      .from("users")
      .insert([{ mobile, password_hash: passwordHash }])
      .select("id,mobile")
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: inserted.id, mobile: inserted.mobile },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: inserted.id, mobile: inserted.mobile },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
};

// Login Controller (unchanged, but errors use `error` key for consistency)
export const login = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ error: 'Mobile and password are required' });
    }

    const user = await getUserByMobile(mobile);
    if (!user) {
      return res.status(400).json({ error: 'Invalid mobile or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid mobile or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        mobile: user.mobile,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
