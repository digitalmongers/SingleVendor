import { z } from 'zod';

const couponSchema = {
    body: z.object({
        title: z.string().min(3).max(100),
        code: z.string().min(3).max(20).toUpperCase(),
        type: z.enum(['discount_on_purchase', 'free_delivery', 'first_order']),
        discountType: z.enum(['amount', 'percent']).optional(),
        discountAmount: z.number().min(0).default(0),
        minPurchase: z.number().min(0).default(0),
        limitForSameUser: z.number().int().min(1).default(1),
        startDate: z.string().datetime().or(z.date()),
        expireDate: z.string().datetime().or(z.date()),
        isActive: z.boolean().default(true),
        customerScope: z.enum(['all']).default('all')
    }).refine(data => {
        // expireDate must be after startDate
        return new Date(data.expireDate) > new Date(data.startDate);
    }, {
        message: "Expire date must be after start date",
        path: ["expireDate"]
    }).refine(data => {
        // If type is not free_delivery, discountType is required
        if (data.type !== 'free_delivery' && !data.discountType) return false;
        return true;
    }, {
        message: "Discount type is required for this coupon type",
        path: ["discountType"]
    })
};

const updateCouponSchema = {
    body: z.object({
        title: z.string().min(3).max(100).optional(),
        code: z.string().min(3).max(20).toUpperCase().optional(),
        type: z.enum(['discount_on_purchase', 'free_delivery', 'first_order']).optional(),
        discountType: z.enum(['amount', 'percent']).optional(),
        discountAmount: z.number().min(0).optional(),
        minPurchase: z.number().min(0).optional(),
        limitForSameUser: z.number().int().min(1).optional(),
        startDate: z.string().datetime().or(z.date()).optional(),
        expireDate: z.string().datetime().or(z.date()).optional(),
        isActive: z.boolean().optional(),
        customerScope: z.enum(['all']).optional()
    })
};

const toggleCouponStatusSchema = {
    body: z.object({
        isActive: z.boolean()
    })
};

const validateCouponCodeSchema = {
    body: z.object({
        code: z.string().min(1),
        orderAmount: z.number().min(0)
    })
};

export {
    couponSchema,
    updateCouponSchema,
    toggleCouponStatusSchema,
    validateCouponCodeSchema
};
