
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

import Payment from '../models/Payment.js';

import Wallet from '../models/Wallet.js';
import bcrypt from 'bcryptjs';


import { ROLES, VENDOR_STATUS } from '../utils/constants.js';

import { ApiError } from '../utils/errors.js';

export const createVendor = async (data) => {
  console.log(data,"start create vendor");
  const { email, password, name } = data;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError('Email already registered', 400);
  }
  console.log(createVendor,"sksksks");
  const hashed = await bcrypt.hash(password, 10);
  console.log(hashed,"hashed");

  const user = await User.create({
    email,
    password: hashed,
    name,
    role: ROLES.VENDOR,
  });
  console.log(user,"user");

  const vendor = await Vendor.create({
    userId: user._id,
    status: VENDOR_STATUS.NOT_CONNECTED,
  });


  console.log(vendor,"vendor");
  return { vendor, user };
};



export const listVendors = async () => {

  return Vendor.find().populate('userId', 'email name').sort({ createdAt: -1 }).lean();
};



export const updateVendorStatus = async (vendorId, status) => {

  const vendor = await Vendor.findById(vendorId).populate('userId', 'email name');
  if (!vendor) {
    throw new ApiError('Vendor not found', 404);
  }

  const allowed = [VENDOR_STATUS.ACTIVE, VENDOR_STATUS.SUSPENDED];

  if (!allowed.includes(status)) {
    throw new ApiError('Admin can only set status to active or suspended.', 400);
  }

  vendor.status = status;
  await vendor.save();

  return vendor;
};

export const listAllPayments = async () => {

  return Payment.find()
    .populate('productId', 'name price')
    .populate('customerId', 'name email')
    .populate({ path: 'vendorId', populate: { path: 'userId', select: 'name email' } })
    .sort({ createdAt: -1 })
    .lean();
};

export const getPlatformWallet = async () => {

  const wallet = await Wallet.findOne({
    ownerId: 'platform',
    ownerType: 'platform',
  });

  return {
    balance: wallet ? wallet.balance : 0,
    currency: wallet?.currency || 'USD',
  };
};
