
import * as paymentService from '../services/paymentService.js';

import * as paymentQueryService from '../services/paymentQueryService.js';

const simulateWebhookAfterDelay = (paymentIntentId,delayMs = 3000) => {
  setTimeout(async () => {
    console.log("start")
    try {
      await paymentService.processWebhook(paymentIntentId);
      console.log(paymentService,"paymentService")

      console.log('[Simulated] Webhook processed for',paymentIntentId);
    } catch (err) {
      console.error('[Simulated] Webhook failed:', err);
    }
  }, delayMs);
};



export const createPayment = async (req, res) => {
  const { productId } = req.body;

  console.log(productId,"productId")

  const customerId = req.user.id;

  console.log(customerId,"customerId")

  const result = await paymentService.createPayment(productId, customerId);
  console.log(result,"result")
  simulateWebhookAfterDelay(result.paymentIntentId);


 return res.status(201).json({ success: true, ...result });
};



export const getPayment = async (req, res) => {
  const payment = await paymentQueryService.getPaymentById(req.params.id,req.user.id,req.user.role
  );
  console.log(payment,"payment")
 return res.json({ success: true,
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
