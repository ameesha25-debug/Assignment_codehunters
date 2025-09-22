import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabaseClient';
import { ENV } from '../env'; // optional: if you use env.ts for env vars

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

// Register Controller
export const register = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile and password are required' });
    }

    const existingUser = await getUserByMobile(mobile);
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('users')
      .insert([{ mobile, password_hash: passwordHash }]);

    if (error) throw error;

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login Controller
export const login = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile and password are required' });
    }

    const user = await getUserByMobile(mobile);
    if (!user) {
      return res.status(400).json({ message: 'Invalid mobile or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid mobile or password' });
    }

    // JWT Payload (keep it small, never include password)
    const token = jwt.sign(
      {
        id: user.id,
        mobile: user.mobile,
      },
      JWT_SECRET,
      { expiresIn: '7d' } // token validity
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
