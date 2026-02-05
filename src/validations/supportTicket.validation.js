import { z } from 'zod';

/**
 * Support Ticket Validation Schemas
 */

export const submitTicketSchema = z.object({
    body: z.object({
        subject: z.string({
            required_error: 'Subject is required',
        }).trim().min(5, 'Subject must be at least 5 characters long').max(100, 'Subject cannot exceed 100 characters'),
        priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
        description: z.string({
            required_error: 'Description is required',
        }).trim().min(20, 'Description must be at least 20 characters long').max(2000, 'Description cannot exceed 2000 characters'),
    }),
});

export const replyToTicketSchema = z.object({
    params: z.object({
        ticketId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Ticket ID format'),
    }),
    body: z.object({
        adminReply: z.string({
            required_error: 'Admin reply is required',
        }).trim().min(5, 'Reply must be at least 5 characters long').max(2000, 'Reply cannot exceed 2000 characters'),
    }),
});

export default {
    submitTicketSchema,
    replyToTicketSchema,
};
