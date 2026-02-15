
import Payment from '../models/Payment.js';
import { ROLES } from '../utils/constants.js';
import { ApiError } from '../utils/errors.js';

export const getPaymentById = async (paymentId, userId, userRole) => {
  const payment = await Payment.findById(paymentId)


    .populate('productId', 'name price')
    .populate('vendorId')
    .lean();

  if (!payment) {
    throw new ApiError('Payment not found', 404);
  }

  const userIdStr = userId.toString();


  const customerIdStr = payment.customerId?.toString();
  console.log(payment,"payment");
  const vendorUserId = payment.vendorId?.userId?.toString?.();

  const canView =
    userRole === ROLES.ADMIN ||
    userIdStr === customerIdStr ||
    userIdStr === vendorUserId;

  if (!canView) {
    throw new ApiError('Access denied', 403);
  }

  return payment;
};
