// api/src/routes/cartRoutes.ts
import { Router } from 'express';
import { addItem, getCart, removeItem, updateQty } from '../controllers/cartController';
import { requireUser } from '../middleware/requireUser';

const router = Router();

router.post('/add', requireUser, addItem);
router.get('/', requireUser, getCart);
router.post('/remove', requireUser, removeItem);
router.post('/update', requireUser, updateQty); // NEW

// Optional clear all
// router.post('/clear', requireUser, clearCart);

export default router;
