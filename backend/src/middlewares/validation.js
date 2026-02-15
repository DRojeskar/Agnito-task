
import { ApiError } from '../utils/errors.js';

export const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter((f) => !req.body[f]);
  if (missing.length > 0) {
    throw new ApiError(`Missing required fields: ${missing.join(', ')}`, 400);
  }
  next();
};
