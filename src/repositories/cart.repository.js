import Cart from '../models/cart.model.js';
import Logger from '../utils/logger.js';

class CartRepository {
  async findByCustomerId(customerId, lean = false) {
    Logger.debug(`DB: Finding cart for customer: ${customerId}`);
    const query = Cart.findOne({ customerId }).populate('items.product', 'name thumbnail price stock unit');
    return lean ? query.lean() : query;
  }

  async findByGuestId(guestId, lean = false) {
    Logger.debug(`DB: Finding cart for guest: ${guestId}`);
    const query = Cart.findOne({ guestId }).populate('items.product', 'name thumbnail price stock unit');
    return lean ? query.lean() : query;
  }

  async create(cartData) {
    Logger.debug('DB: Creating new cart', { cartData });
    return await Cart.create(cartData);
  }

  async findOne(filter, lean = false) {
    const query = Cart.findOne(filter).populate('items.product', 'name thumbnail price stock unit');
    return lean ? query.lean() : query;
  }

  async updateById(id, updateData, options = { new: true }) {
    Logger.debug(`DB: Updating cart ID: ${id}`);
    return await Cart.findByIdAndUpdate(id, updateData, options).populate('items.product', 'name thumbnail price stock unit');
  }

  async deleteById(id) {
    Logger.debug(`DB: Deleting cart ID: ${id}`);
    return await Cart.findByIdAndDelete(id);
  }
}

export default new CartRepository();
