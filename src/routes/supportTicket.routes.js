import express from 'express';
import SupportTicketController from '../controllers/supportTicket.controller.js';
import { protectCustomer } from '../middleware/customerAuth.middleware.js';
import { authorizeStaff } from '../middleware/employeeAuth.middleware.js';
import { SYSTEM_PERMISSIONS } from '../constants.js';
import uploadMiddleware from '../middleware/upload.middleware.js';
import cacheMiddleware from '../middleware/cache.middleware.js';
import validate from '../middleware/validate.middleware.js';
import lockRequest from '../middleware/idempotency.middleware.js';
import { submitTicketSchema, replyToTicketSchema, getTicketsSchema } from '../validations/supportTicket.validation.js';

const router = express.Router();

/**
 * CUSTOMER ROUTES
 */
router.post(
    '/submit',
    protectCustomer,
    lockRequest(5),
    uploadMiddleware.single('attachment'),
    validate(submitTicketSchema),
    SupportTicketController.submitTicket
);

router.get(
    '/my-tickets',
    protectCustomer,
    validate(getTicketsSchema),
    cacheMiddleware(1800), // Cache for 30 mins
    SupportTicketController.getMyTickets
);

/**
 * ADMIN ROUTES
 */
router.get(
    '/admin/all',
    authorizeStaff(SYSTEM_PERMISSIONS.HELP_SUPPORT),
    validate(getTicketsSchema),
    cacheMiddleware(600), // Admin view cache for 10 mins
    SupportTicketController.getAllTickets
);

router.get(
    '/admin/stats',
    authorizeStaff(SYSTEM_PERMISSIONS.HELP_SUPPORT),
    cacheMiddleware(600),
    SupportTicketController.getStats
);

router.get(
    '/admin/export',
    authorizeStaff(SYSTEM_PERMISSIONS.HELP_SUPPORT),
    SupportTicketController.exportTickets // Export should NOT be cached
);

router.patch(
    '/admin/:ticketId/reply',
    authorizeStaff(SYSTEM_PERMISSIONS.HELP_SUPPORT),
    lockRequest(5),
    validate(replyToTicketSchema),
    SupportTicketController.replyToTicket
);

export default router;