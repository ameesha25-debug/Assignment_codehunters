import { Router } from 'express';
import { requireUser } from '../middleware/requireUser';
import {
  listWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToBasket,
} from '../controllers/wishlistController';

const router = Router();

// Mounted at /api/wishlist in app.ts
router.get('/', requireUser, listWishlist);                    // GET /api/wishlist
router.post('/add', requireUser, addToWishlist);               // POST /api/wishlist/add
router.post('/remove', requireUser, removeFromWishlist);       // POST /api/wishlist/remove
router.post('/move-to-basket', requireUser, moveWishlistToBasket); // POST /api/wishlist/move-to-basket

export default router;
