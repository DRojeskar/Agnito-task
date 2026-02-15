
import { isValidObjectId } from '../utils/validators.js';
import { ApiError } from '../utils/errors.js';

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  console.log(id,"id")
  if (!isValidObjectId(id)) {
    throw new ApiError(`Invalid ${paramName}`, 400);
  }
  next();
};
