import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Augment Request with user info
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// Access-cookie guard for protected endpoints like /api/auth/me and /api/auth/logout
export const requireAccess = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access as string | undefined;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'], issuer: 'api', audience: 'web' }) as any;
    req.user = { id: decoded.sub };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
