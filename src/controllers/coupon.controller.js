import CouponService from '../services/coupon.service.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/apiResponse.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants.js';
import AuditLogger from '../utils/audit.js';

class CouponController {
    /**
     * @desc    Create new coupon
     * @access  Private (Admin)
     */
    createCoupon = catchAsync(async (req, res) => {
        const coupon = await CouponService.createCoupon(req.body);

        AuditLogger.log('COUPON_CREATE', 'ADMIN', {
            couponId: coupon._id,
            code: coupon.code,
            type: coupon.type
        }, req);

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse(HTTP_STATUS.CREATED, coupon, SUCCESS_MESSAGES.CREATED)
        );
    });

    /**
     * @desc    Get all coupons
     * @access  Private (Admin)
     */
    getAllCoupons = catchAsync(async (req, res) => {
        const result = await CouponService.getAllCoupons(req.query);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(HTTP_STATUS.OK, result, SUCCESS_MESSAGES.FETCHED)
        );
    });

    /**
     * @desc    Get single coupon
     * @access  Private (Admin)
     */
    getCouponById = catchAsync(async (req, res) => {
        const coupon = await CouponService.getCouponById(req.params.id);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(HTTP_STATUS.OK, coupon, SUCCESS_MESSAGES.FETCHED)
        );
    });

    /**
     * @desc    Update coupon
     * @access  Private (Admin)
     */
    updateCoupon = catchAsync(async (req, res) => {
        const coupon = await CouponService.updateCoupon(req.params.id, req.body);

        AuditLogger.log('COUPON_UPDATE', 'ADMIN', {
            couponId: coupon._id,
            updates: Object.keys(req.body)
        }, req);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(HTTP_STATUS.OK, coupon, SUCCESS_MESSAGES.UPDATED)
        );
    });

    /**
     * @desc    Delete coupon
     * @access  Private (Admin)
     */
    deleteCoupon = catchAsync(async (req, res) => {
        await CouponService.deleteCoupon(req.params.id);

        AuditLogger.log('COUPON_DELETE', 'ADMIN', {
            couponId: req.params.id
        }, req);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(HTTP_STATUS.OK, null, SUCCESS_MESSAGES.DELETED)
        );
    });

    /**
     * @desc    Toggle coupon status
     * @access  Private (Admin)
     */
    toggleStatus = catchAsync(async (req, res) => {
        const coupon = await CouponService.toggleStatus(req.params.id, req.body.isActive);

        AuditLogger.log('COUPON_STATUS_TOGGLE', 'ADMIN', {
            couponId: req.params.id,
            isActive: req.body.isActive
        }, req);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(HTTP_STATUS.OK, coupon, 'Coupon status updated successfully')
        );
    });

    /**
     * @desc    Validate coupon code (Customer)
     * @access  Public (Authenticated)
     */
    validateCoupon = catchAsync(async (req, res) => {
        const { code, orderAmount } = req.body;
        // In a real flow, userId would come from req.user.id
        const coupon = await CouponService.validateCoupon(code, req.user?.id, orderAmount);

        const discount = CouponService.calculateDiscount(coupon, orderAmount);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(HTTP_STATUS.OK, {
                coupon: {
                    code: coupon.code,
                    type: coupon.type,
                    discountType: coupon.discountType,
                    discountAmount: coupon.discountAmount
                },
                discountCalculated: discount,
                finalAmount: orderAmount - discount
            }, 'Coupon code is valid')
        );
    });
}

export default new CouponController();
