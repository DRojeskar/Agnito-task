
import User from '../models/User.js';
import bcrypt from 'bcryptjs';


import jwt from 'jsonwebtoken';
import { ROLES } from '../utils/constants.js';


import { ApiError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export const register = async ({ email, password, name }) => {
  console.log(email, password, name, "register");
  const existing = await User.findOne({ email });
  console.log(existing,"existing");
  if (existing) {
    throw new ApiError('Email already registered', 400);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashed,
    name,
    role: ROLES.CUSTOMER,
  });

  return buildAuthResponse(user);
};

export const login = async ({ email, password }) => {

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new ApiError('Invalid email or password', 401);
  }

  return buildAuthResponse(user);
};

export const getMe = async (userId) => {

  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  return user;
};

function buildAuthResponse(user) {
  
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const safeUser = user.toObject ? user.toObject() : user;
  delete safeUser.password;

  return {
    token,
    user: {
      id: safeUser._id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
    },
  };
}
