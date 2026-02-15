
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import Wallet from '../models/Wallet.js';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { PLATFORM_FEE_PERCENT, VENDOR_STATUS } from '../utils/constants.js';
import { ApiError } from '../utils/errors.js';


export const createPayment = async (productId, customerId) => {
  const product = await Product.findById(productId).populate('vendorId');
  console.log(product,"llllll")
  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  const vendor = product.vendorId?._id
    ? await Vendor.findById(product.vendorId._id)
    : await Vendor.findById(product.vendorId);

  if (!vendor) {
    throw new ApiError('Vendor not found', 404);
  }

  if (vendor.status !== VENDOR_STATUS.ACTIVE) {
    throw new ApiError('Vendor is not active. Payment cannot be processed.', 400);
  }

  const amount = product.price;
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT) / 100;
  const vendorAmount = amount - platformFee;

  const paymentIntentId = `pi_${uuidv4().replace(/-/g, '')}`;

  const payment = await Payment.create({
    paymentIntentId,
    productId,
    customerId,
    vendorId: vendor._id,
    amount,
    platformFee,
    vendorAmount,
    status: 'pending',
  });

  return {
    paymentId: payment._id,
    paymentIntentId,
    amount,
    status: 'pending',
  };
};




export const processWebhook = async (paymentIntentId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({ paymentIntentId }).session(session);

    if (!payment) {
      await session.abortTransaction();
      throw new ApiError('Payment not found', 404);
    }

    if (payment.status === 'success') {
      await session.abortTransaction();
      return { alreadyProcessed: true, payment };
    }

    payment.status = 'success';
    payment.webhookProcessedAt = new Date();
    await payment.save({ session });

    const vendorWallet = await Wallet.findOne({
      ownerId: payment.vendorId,
      ownerType: 'vendor',
    }).session(session);

    if (vendorWallet) {
      await Wallet.updateOne(
        { _id: vendorWallet._id },
        { $inc: { balance: payment.vendorAmount }, $set: { updatedAt: new Date() } },
        { session }
      );
    } else {
      await Wallet.create(
        [
          {
            ownerId: payment.vendorId,
            ownerType: 'vendor',
            balance: payment.vendorAmount,
          },
        ],
        { session }
      );
    }

    const platformWallet = await Wallet.findOne({
      ownerId: 'platform',
      ownerType: 'platform',
    }).session(session);

    if (platformWallet) {
      await Wallet.updateOne(
        { _id: platformWallet._id },
        { $inc: { balance: payment.platformFee }, $set: { updatedAt: new Date() } },
        { session }
      );
    } else {
      await Wallet.create(
        [
          {
            ownerId: 'platform',
            ownerType: 'platform',
            balance: payment.platformFee,
          },
        ],
        { session }
      );
    }
    await session.commitTransaction();
    return { payment, processed: true };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
