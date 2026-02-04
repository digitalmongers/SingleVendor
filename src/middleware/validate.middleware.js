import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants.js';

/**
 * Enterprise Zod Validation Middleware
 * Transforms Zod errors into standardized ApiError format.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const validData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace req data with validated and parsed data
    // Note: req.query and req.params are sometimes read-only getters on certain environments
    req.body = validData.body;

    // We update req.query/params only if needed, or just let them be
    // Usually req.body is what needs the transformation most in POST requests
    if (validData.query && Object.keys(validData.query).length > 0) {
      try { req.query = validData.query; } catch (e) { /* ignore read-only */ }
    }
    if (validData.params && Object.keys(validData.params).length > 0) {
      try { req.params = validData.params; } catch (e) { /* ignore read-only */ }
    }

    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return next(new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', errors));
    }

    // Pass other errors to the global error handler
    next(error);
  }
};

export default validate;
