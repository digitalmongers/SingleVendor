import CartRepository from '../repositories/cart.repository.js';
import ProductRepository from '../repositories/product.repository.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants.js';
import Logger from '../utils/logger.js';
import TransactionManager from '../utils/transaction.js';

class CartService {
    /**
     * Add Item to Cart (Guest or Auth)
     */
    async addToCart({ userId, guestId, productId, quantity, variation = null }) {
        return await TransactionManager.execute(async (session) => {
            Logger.info(`Adding product ${productId} to cart`, { userId, guestId, quantity });

            // 1. Check product and stock
            const product = await ProductRepository.findById(productId, '', true);
            if (!product) {
                throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
            }

            if (!product.isActive) {
                throw new AppError('Product is not available', HTTP_STATUS.BAD_REQUEST);
            }

            if (product.stock < quantity) {
                throw new AppError(`Only ${product.stock} items available in stock`, HTTP_STATUS.BAD_REQUEST);
            }

            // 2. Find or create cart
            const filter = userId ? { customerId: userId } : { guestId };
            let cart = await CartRepository.findOne(filter);

            if (!cart) {
                cart = await CartRepository.create({
                    ...(userId ? { customerId: userId } : { guestId }),
                    items: [{
                        product: productId,
                        quantity,
                        price: product.price, // We store price at time of adding
                        variation
                    }]
                }, { session });
            } else {
                // Check if product already in cart with same variation
                const itemIndex = cart.items.findIndex(item =>
                    item.product.toString() === productId &&
                    JSON.stringify(item.variation) === JSON.stringify(variation)
                );

                if (itemIndex > -1) {
                    // Update quantity
                    const newQuantity = cart.items[itemIndex].quantity + quantity;
                    if (product.stock < newQuantity) {
                        throw new AppError(`Cannot add more. Total in cart (${newQuantity}) exceeds stock (${product.stock})`, HTTP_STATUS.BAD_REQUEST);
                    }
                    cart.items[itemIndex].quantity = newQuantity;
                    cart.items[itemIndex].price = product.price; // Update to current price
                } else {
                    // Add new item
                    cart.items.push({
                        product: productId,
                        quantity,
                        price: product.price,
                        variation
                    });
                }
                await cart.save({ session });
            }

            return await CartRepository.findById(cart._id, '', true);
        });
    }

    /**
     * Update Cart Item Quantity
     */
    async updateCartItem({ userId, guestId, productId, quantity, variationId = null }) {
        const filter = userId ? { customerId: userId } : { guestId };
        const cart = await CartRepository.findOne(filter);

        if (!cart) {
            throw new AppError('Cart not found', HTTP_STATUS.NOT_FOUND);
        }

        const item = cart.items.find(item =>
            item.product._id.toString() === productId &&
            (variationId ? item._id.toString() === variationId : true)
        );

        if (!item) {
            throw new AppError('Item not found in cart', HTTP_STATUS.NOT_FOUND);
        }

        // Check stock
        const product = await ProductRepository.findById(productId, '', true);
        if (product.stock < quantity) {
            throw new AppError(`Only ${product.stock} items available in stock`, HTTP_STATUS.BAD_REQUEST);
        }

        item.quantity = quantity;
        item.price = product.price; // Ensure current price is reflected
        await cart.save();

        return cart;
    }

    /**
     * Remove Item from Cart
     */
    async removeFromCart({ userId, guestId, productId, variationId = null }) {
        const filter = userId ? { customerId: userId } : { guestId };
        const cart = await CartRepository.findOne(filter);

        if (!cart) {
            throw new AppError('Cart not found', HTTP_STATUS.NOT_FOUND);
        }

        cart.items = cart.items.filter(item =>
            !(item.product._id.toString() === productId &&
                (variationId ? item._id.toString() === variationId : true))
        );

        await cart.save();
        return cart;
    }

    /**
     * Get Cart Contents
     */
    async getCart({ userId, guestId }) {
        const filter = userId ? { customerId: userId } : { guestId };
        const cart = await CartRepository.findOne(filter, '', true);
        return cart || { items: [], totalPrice: 0 };
    }

    /**
     * Merge Guest Cart into Customer Cart on Login
     */
    async mergeGuestCart(guestId, customerId) {
        return await TransactionManager.execute(async (session) => {
            const guestCart = await CartRepository.findByGuestId(guestId);
            if (!guestCart || guestCart.items.length === 0) return null;

            let customerCart = await CartRepository.findByCustomerId(customerId);

            if (!customerCart) {
                // Assign guest cart to customer
                guestCart.customerId = customerId;
                guestCart.guestId = null;
                await guestCart.save({ session });
                Logger.info(`Guest cart ${guestId} assigned to customer ${customerId}`);
                return guestCart;
            }

            // Merge items
            for (const guestItem of guestCart.items) {
                const existingItemIndex = customerCart.items.findIndex(item =>
                    item.product._id.toString() === guestItem.product._id.toString() &&
                    JSON.stringify(item.variation) === JSON.stringify(guestItem.variation)
                );

                if (existingItemIndex > -1) {
                    // Update quantity (sum up)
                    customerCart.items[existingItemIndex].quantity += guestItem.quantity;
                } else {
                    // Add new item from guest cart
                    customerCart.items.push(guestItem);
                }
            }

            await customerCart.save({ session });
            await CartRepository.deleteById(guestCart._id); // Delete guest cart after merge

            Logger.info(`Guest cart ${guestId} merged into customer cart ${customerId}`);
            return customerCart;
        });
    }

    /**
     * Clear Cart
     */
    async clearCart({ userId, guestId }) {
        const filter = userId ? { customerId: userId } : { guestId };
        return await CartRepository.deleteById((await CartRepository.findOne(filter))._id);
    }
}

export default new CartService();
