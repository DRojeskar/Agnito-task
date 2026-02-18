
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import Wallet from '../models/Wallet.js';
import mongoose from 'mongoose';
import { PLATFORM_FEE_PERCENT, VENDOR_STATUS } from '../utils/constants.js';
import { ApiError } from '../utils/errors.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const createPayment = async (productId, customerId) => {
  const product = await Product.findById(productId).populate('vendorId');
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

  let paymentIntentId;
  let clientSecret = null;

  if (stripe) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        productId: productId.toString(),
        customerId: customerId.toString(),
        vendorId: vendor._id.toString(),
      },
    });
    paymentIntentId = paymentIntent.id;
    clientSecret = paymentIntent.client_secret;
  } else {
    throw new ApiError('Stripe is not configured. Set STRIPE_SECRET_KEY in .env', 500);
  }

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
    clientSecret,
    amount,
    status: 'pending',
  };
};

export const getClientSecret = async (paymentId, customerId) => {
  const payment = await Payment.findOne({ _id: paymentId, customerId });
  if (!payment) {
    throw new ApiError('Payment not found', 404);
  }
  if (payment.status !== 'pending') {
    throw new ApiError('Payment is not pending', 400);
  }
  if (!stripe) {
    throw new ApiError('Stripe is not configured', 500);
  }
  const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentIntentId);
  return { clientSecret: paymentIntent.client_secret };
};




/** Sync payment status from Stripe when webhook hasn't fired (e.g. local dev without Stripe CLI) */
export const syncPaymentStatusIfPending = async (paymentIntentId) => {
  if (!stripe) return;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      await processWebhook(paymentIntentId);
    }
  } catch (err) {
    console.error('[syncPaymentStatus]', err.message);
  }
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
