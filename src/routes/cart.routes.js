import express from 'express';
import { optionalProtect } from '../middleware/optionalAuth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import CartValidation from '../validations/cart.validation.js';
import CartController from '../controllers/cart.controller.js';
import lockRequest from '../middleware/idempotency.middleware.js';

const router = express.Router();

// All cart routes use optionalProtect to identify if user is logged in
router.use(optionalProtect);

router.get('/', CartController.getCart);

router.post(
    '/add',
    lockRequest(),
    validate(CartValidation.addToCart),
    CartController.addToCart
);

router.patch(
    '/update',
    lockRequest(),
    validate(CartValidation.updateCartItem),
    CartController.updateCartItem
);

router.delete(
    '/remove',
    lockRequest(),
    validate(CartValidation.removeFromCart),
    CartController.removeFromCart
);

router.delete('/clear', CartController.clearCart);

export default router;
