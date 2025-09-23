import express from 'express';
import { register, login, me, refresh, logout } from '../controllers/authController';
import { requireAccess } from '../middleware/auth';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);

// Session-aware
router.get('/me', requireAccess, me);        // returns minimal user profile if access cookie valid
router.post('/refresh', refresh);            // rotates refresh, issues new access cookie

// Authenticated
router.post('/logout', requireAccess, logout); // clears cookies and revokes refresh family

export default router;
