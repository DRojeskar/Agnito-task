
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import Wallet from '../models/Wallet.js';

import { v4 as uuidv4 } from 'uuid';
import { VENDOR_STATUS } from '../utils/constants.js';
import { ApiError } from '../utils/errors.js';


export const getVendorByUserId = async (userId) => {
  const vendor = await Vendor.findOne({ userId });
  console.log(vendor,"vendor")
  if (!vendor) {
    throw new ApiError('Vendor not found', 404);
  }
  return vendor;
};


export const getVendorOnboardingStatus = async (userId) => {
  console.log("start")
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw new ApiError('Vendor not found', 404);
  }
  return {
    status: vendor.status,
    onboardingLink: vendor.onboardingLink || null,
  };
};


// export const startOrResumeOnboarding = async (userId) => {
//   const vendor = await Vendor.findOne({ userId });
//   if (!vendor) {
//     throw new ApiError('Vendor not found', 404);
//   }
//   const onboardingLink = `https://mock-gateway.com/connect/${uuidv4()}`;
//   if (vendor.status === VENDOR_STATUS.NOT_CONNECTED) {
//     vendor.status = VENDOR_STATUS.PENDING;
//     vendor.onboardingLink = onboardingLink;
//     await vendor.save();
//   } else if (vendor.status === VENDOR_STATUS.PENDING) {
//     vendor.onboardingLink = onboardingLink;
//     await vendor.save();
//   }
//   return {
//     status: vendor.status,
//     onboardingLink: vendor.onboardingLink,
//   };
// };

export const getVendorWallet = async (vendorId) => {
  const wallet = await Wallet.findOne({
    ownerId: vendorId,
    ownerType: 'vendor',
  });

  return {
    balance: wallet ? wallet.balance : 0,
    currency: wallet?.currency || 'USD',
  };
};

export const getVendorProducts = async (vendorId) => {
  return Product.find({ vendorId }).sort({ createdAt: -1 }).lean();
};



export const getVendorPayments = async (vendorId) => {
  return Payment.find({ vendorId })
    .populate('productId', 'name price')
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};



export const createProduct = async (vendorId, { name, price, description }) => {
  const vendor = await Vendor.findById(vendorId);
  console.log(vendor,"test")
  if (!vendor) {
    throw new ApiError('Vendor not found', 404);
  }
  if (vendor.status !== VENDOR_STATUS.ACTIVE) {
    throw new ApiError('Vendor must be active to create products', 400);
  }

  return Product.create({
    name,
    price: parseFloat(price),
    description: description || '',
    vendorId,
  });
};

export const updateProduct = async (productId, vendorId, updates) => {
  const product = await Product.findOne({ _id: productId, vendorId });
  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  if (updates.name !== undefined) product.name = updates.name;
  if (updates.price !== undefined) product.price = parseFloat(updates.price);
  if (updates.description !== undefined) product.description = updates.description;

  await product.save();
  return product;
};





export const completeVendorOnboarding = async (userId) => {
  const vendor = await Vendor.findOne({ userId });
  console.log(vendor)

  if (!vendor) {
    throw new ApiError('Vendor not found', 404);
  }

  
  if (vendor.status !== VENDOR_STATUS.PENDING) {
    throw new ApiError('Onboarding not in pending state', 400);
  }

  vendor.status = VENDOR_STATUS.ACTIVE;
  vendor.onboardingLink = null;

  await vendor.save();


  
  return {
    status: vendor.status
  };
};


// export const startOrResumeOnboarding = async (userId) => {
//   const vendor = await Vendor.findOne({ userId });
//   if (!vendor) {
//     throw new ApiError('Vendor not found', 404);
//   }

//   // FIRST TIME
//   if (vendor.status === VENDOR_STATUS.NOT_CONNECTED) {
//     const onboardingLink = `http://localhost:5173/vendor?onboarding=success`;

//     // const onboardingLink = `https://mock-gateway.com/connect/${uuidv4()}`;
//     vendor.status = VENDOR_STATUS.PENDING;
//     vendor.onboardingLink = onboardingLink;
//     await vendor.save();

//     return {
//       status: vendor.status,
//       onboardingLink,
//     };
//   }

//   // RESUME CLICK → COMPLETE
//   if (vendor.status === VENDOR_STATUS.PENDING) {
//     vendor.status = VENDOR_STATUS.ACTIVE;
//     vendor.onboardingLink = null;
//     await vendor.save();

//     return {
//       status: vendor.status,
//       message: 'Thank you! Your onboarding is completed successfully.',
//     };
//   }

//   return {
//     status: vendor.status,
//   };
// };





export const startOrResumeOnboarding = async (userId) => {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw new ApiError('Vendor not found', 404);
  }

  
  if (vendor.status === VENDOR_STATUS.NOT_CONNECTED) {
    const onboardingLink = `http://localhost:5173/vendor/onboarding`;

    vendor.status = VENDOR_STATUS.PENDING;
    vendor.onboardingLink = onboardingLink;
  let c8 =  await vendor.save();
  console.log(c8,"c8")

    return {status: vendor.status,onboardingLink };
  }

 
  if (vendor.status === VENDOR_STATUS.PENDING) {
    return { status: vendor.status, onboardingLink: vendor.onboardingLink,};
  }

  return {status: vendor.status,
  };
};


