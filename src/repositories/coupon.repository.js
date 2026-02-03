import Coupon from '../models/coupon.model.js';

class CouponRepository {
    async create(data) {
        return await Coupon.create(data);
    }

    async findAll(filter = {}, sort = { createdAt: -1 }, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await Coupon.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async findById(id) {
        return await Coupon.findById(id).lean();
    }

    async findOne(filter) {
        return await Coupon.findOne(filter).lean();
    }

    /**
     * @desc    Find an active coupon by its code
     */
    async findActiveByCode(code) {
        const now = new Date();
        return await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: now },
            expireDate: { $gte: now }
        }).lean();
    }

    async update(id, data) {
        return await Coupon.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
    }

    async delete(id) {
        return await Coupon.findByIdAndDelete(id);
    }

    async count(filter = {}) {
        return await Coupon.countDocuments(filter);
    }

    /**
     * @desc    Atomically increment usage count
     */
    async incrementUsage(id) {
        return await Coupon.findByIdAndUpdate(
            id,
            { $inc: { totalUsed: 1 } },
            { new: true }
        ).lean();
    }
}

export default new CouponRepository();
