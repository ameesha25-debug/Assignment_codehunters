import { Router } from 'express';
import { addToWishlist, listWishlist, removeFromWishlist } from '../controllers/wishlistController';
import { requireUser } from '../middleware/requireUser';

const router = Router();

router.get('/', requireUser, listWishlist);
router.post('/add', requireUser, addToWishlist);
router.post('/remove', requireUser, removeFromWishlist);

export default router;
