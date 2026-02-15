
import jwt from 'jsonwebtoken';
import { ROLES } from '../utils/constants.js';
import { ApiError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';


export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  console.log(token,"token")

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded,"decoded")
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    throw new ApiError('Invalid or expired token', 401);
  }
};


export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }
  next();
};
