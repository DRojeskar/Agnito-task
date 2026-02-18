
import * as paymentService from '../services/paymentService.js';
import * as paymentQueryService from '../services/paymentQueryService.js';

export const createPayment = async (req, res) => {
  const { productId } = req.body;
  const customerId = req.user.id;
  const result = await paymentService.createPayment(productId, customerId);
  return res.status(201).json({ success: true, ...result });
};

export const getClientSecret = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const result = await paymentService.getClientSecret(id, customerId);
  return res.json({ success: true, ...result });
};



export const getPayment = async (req, res) => {
  let payment = await paymentQueryService.getPaymentById(req.params.id, req.user.id, req.user.role);
  if (payment.status === 'pending' && payment.paymentIntentId) {
    await paymentService.syncPaymentStatusIfPending(payment.paymentIntentId);
    payment = await paymentQueryService.getPaymentById(req.params.id, req.user.id, req.user.role);
  }
  return res.json({
    success: true,
    payment: {
      id: payment._id,
      paymentIntentId: payment.paymentIntentId,
      status: payment.status,
      amount: payment.amount,
      product: payment.productId,
      createdAt: payment.createdAt,
    },
  });
};
