import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ENV } from '../env';

const JWT_SECRET = ENV.JWT_SECRET || process.env.JWT_SECRET || 'your_jwt_secret';

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access as string | undefined;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS512'],
      issuer: 'api',
      audience: 'web',
    }) as any;
    (req as any).userId = decoded.sub as string;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
