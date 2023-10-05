// @ts-nocheck
const rateLimit = require('express-rate-limit');
const HTTP_STATUS_CODES = require('../constants/ServerCode');

const customRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
    message: 'Too many requests from this IP, please try again in a minute.',
  });

  // Create a custom middleware function
function customMiddleware(req, res, next) {
    // Use the custom rate limiter
    customRateLimiter(req, res, (err) => {
      if (err) {
        // Handle rate limit exceeded error, e.g., send an error response
        return res.status(HTTP_STATUS_CODES.CONFLICT_DUPLICATE).json({ message: 'Rate limit exceeded' });
      }
      
      // If rate limit is not exceeded, continue to the next middleware or route
      next();
    });
  }
  
  module.exports = customMiddleware;