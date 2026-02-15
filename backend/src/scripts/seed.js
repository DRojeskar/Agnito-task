
import 'dotenv/config';
import mongoose from 'mongoose';


import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Vendor from '../models/Vendor.js';


import Product from '../models/Product.js';

import Wallet from '../models/Wallet.js';
import { ROLES, VENDOR_STATUS } from '../utils/constants.js';


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace_payment';
const HASHED_PASSWORD = await bcrypt.hash('password123', 10);

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const admin = await User.findOneAndUpdate(
    { email: 'admin@test.com' },
    { email: 'admin@test.com', password: HASHED_PASSWORD, name: 'Admin', role: ROLES.ADMIN },
    { upsert: true, new: true }
  );

  const customer = await User.findOneAndUpdate(
    { email: 'customer@test.com' },
    { email: 'customer@test.com', password: HASHED_PASSWORD, name: 'Customer', role: ROLES.CUSTOMER },
    { upsert: true, new: true }
  );

  const vendorUser = await User.findOneAndUpdate(
    { email: 'vendor@test.com' },
    { email: 'vendor@test.com', password: HASHED_PASSWORD, name: 'Vendor', role: ROLES.VENDOR },
    { upsert: true, new: true }
  );

  let vendor = await Vendor.findOne({ userId: vendorUser._id });
  console.log(vendor,"vendor")
  if (!vendor) {
    vendor = await Vendor.create({
      userId: vendorUser._id,
      status: VENDOR_STATUS.ACTIVE,
    });
  } else {
    vendor.status = VENDOR_STATUS.ACTIVE;
    await vendor.save();
  }

  const product = await Product.findOneAndUpdate(
    { name: 'Test Product' },
    { name: 'Test Product', price: 99.99, vendorId: vendor._id },
    { upsert: true, new: true }
  );



  await Wallet.findOneAndUpdate(
    { ownerId: 'platform', ownerType: 'platform' },
    { ownerId: 'platform', ownerType: 'platform', balance: 0 },
    { upsert: true }
  );

  console.log('Seed complete:');


  console.log('  admin@test.com (ADMIN)');
  console.log('  customer@test.com (CUSTOMER)');
  console.log('  vendor@test.com (VENDOR)');
  console.log('  Password: password123');

  await mongoose.disconnect();

  console.log('Disconnected from MongoDB');
}

seed().catch(console.error);
