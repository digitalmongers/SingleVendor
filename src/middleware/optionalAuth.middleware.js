import jwt from 'jsonwebtoken';
import CustomerRepository from '../repositories/customer.repository.js';
import env from '../config/env.js';
import Logger from '../utils/logger.js';

/**
 * Optional Auth Middleware
 * If token is present, it populates req.user. If not, it just continues.
 * Useful for Cart where user can be Guest or Logged In.
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const customer = await CustomerRepository.findById(decoded.id);

    if (customer && customer.isActive && decoded.version === customer.tokenVersion) {
      req.user = customer;
      req.customer = customer;
    }
  } catch (err) {
    // Silent fail for optional auth - just proceed as guest
    Logger.debug('Optional auth failed, proceeding as guest');
  }

  next();
};
