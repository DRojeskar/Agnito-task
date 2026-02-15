
import { ApiError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({success: false,error: err.message,});
  }


  if (err.name === 'ValidationError') {
    return res.status(400).json({success: false,error: Object.values(err.errors).map((e) => e.message).join(', '),
    });
  }


  if (err.code === 11000) {
    return res.status(409).json({success: false,error: 'Resource already exists',
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({success: false,error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
