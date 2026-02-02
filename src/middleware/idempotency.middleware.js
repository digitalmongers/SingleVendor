import redisClient from '../config/redis.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants.js';
import Logger from '../utils/logger.js';

/**
 * Enterprise-grade Request Locking Middleware
 * Prevents race conditions and duplicate writes using Redis.
 * @param {number} ttl - Lock expiration time in seconds (default 5s)
 */
const lockRequest = (ttl = 5) => {
    return async (req, res, next) => {
        // Determine unique identifier for the request (User ID or Admin ID + Path)
        const userId = req.user?.id || req.admin?.id || req.employee?.id || req.ip;
        const lockKey = `lock:${userId}:${req.method}:${req.originalUrl}`;

        try {
            // SETNX (Set if Not eXists) with expiry
            const result = await redisClient.set(lockKey, 'locked', 'EX', ttl, 'NX');

            if (!result) {
                Logger.warning(`🚫 Request Locked: Duplicate request detected for ${lockKey}`);
                throw new AppError(
                    'Processing your previous request. Please wait.',
                    HTTP_STATUS.TOO_MANY_REQUESTS,
                    'REQUEST_LOCKED'
                );
            }

            // Ensure lock is released after request finishes (success or failure)
            const releaseLock = async () => {
                try {
                    await redisClient.del(lockKey);
                    Logger.debug(`🔓 Lock Released: ${lockKey}`);
                } catch (err) {
                    Logger.error(`Failed to release lock: ${lockKey}`, { error: err.message });
                }
            };

            res.on('finish', releaseLock);
            res.on('close', releaseLock);

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default lockRequest;
