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
    // Use Object.assign for query and params as they might be read-only getters in some environments
    req.body = validData.body;

    if (validData.query) {
      try {
        // Clear existing keys and assign new ones to effectively "replace" the content without replacing the reference
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, validData.query);
      } catch (e) { /* ignore read-only */ }
    }

    if (validData.params) {
      try {
        // Clear existing keys and assign new ones
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, validData.params);
      } catch (e) { /* ignore read-only */ }
    }

    next();
  } catch (error) {
    if (error.name === 'ZodError' || error instanceof Error && error.name === 'ZodError') {
      const errorList = error.errors || error.issues || [];
      const formattedErrors = Array.isArray(errorList)
        ? errorList.map((err) => ({
          path: err.path ? err.path.join('.') : 'unknown',
          message: err.message || 'Validation failed',
        }))
        : [];

      return next(new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', formattedErrors));
    }

    // Pass other errors to the global error handler
    next(error);
  }
};

export default validate;
