import express from 'express';
import CouponController from '../controllers/coupon.controller.js';
import { authorizeStaff } from '../middleware/employeeAuth.middleware.js';
import { SYSTEM_PERMISSIONS } from '../constants.js';
import validate from '../middleware/validate.middleware.js';
import {
    couponSchema,
    updateCouponSchema,
    toggleCouponStatusSchema,
    validateCouponCodeSchema
} from '../validations/coupon.validation.js';
import lockRequest from '../middleware/idempotency.middleware.js';

const router = express.Router();

/**
 * PUBLIC/CUSTOMER ROUTES (Need Auth for usage)
 */
// In a real app, you might use a general auth middleware here
router.post('/validate', validate(validateCouponCodeSchema), CouponController.validateCoupon);

/**
 * ADMIN ROUTES (Staff Protected)
 */
router.use(authorizeStaff(SYSTEM_PERMISSIONS.OFFERS_AND_DEALS));

router.route('/')
    .post(lockRequest('create_coupon'), validate(couponSchema), CouponController.createCoupon)
    .get(CouponController.getAllCoupons);

router.route('/:id')
    .get(CouponController.getCouponById)
    .patch(lockRequest('update_coupon'), validate(updateCouponSchema), CouponController.updateCoupon)
    .delete(lockRequest('delete_coupon'), CouponController.deleteCoupon);

router.patch('/:id/status', lockRequest('toggle_coupon_status'), validate(toggleCouponStatusSchema), CouponController.toggleStatus);

export default router;
