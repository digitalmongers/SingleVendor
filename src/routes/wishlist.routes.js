import express from 'express';
import WishlistController from '../controllers/wishlist.controller.js';
import { protectCustomer } from '../middleware/customerAuth.middleware.js';
import lockRequest from '../middleware/idempotency.middleware.js';

const router = express.Router();

/**
 * Wishlist Routes
 * All routes require customer authentication
 */

// Get wishlist
router.get('/', protectCustomer, WishlistController.getWishlist);

// Add product to wishlist
router.post('/', protectCustomer, lockRequest(), WishlistController.addToWishlist);

// Check if product is in wishlist
router.get('/check/:productId', protectCustomer, WishlistController.checkProduct);

// Remove product from wishlist
router.delete('/:productId', protectCustomer, lockRequest(), WishlistController.removeFromWishlist);

// Clear entire wishlist
router.delete('/', protectCustomer, lockRequest(), WishlistController.clearWishlist);

export default router;
