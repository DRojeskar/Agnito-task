import Stripe from 'stripe';
import { ApiError } from '../utils/errors.js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const verifyWebhookSignature = (req, res, next) => {
  if (!webhookSecret) {
    throw new ApiError('STRIPE_WEBHOOK_SECRET is not configured', 500);
  }
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    throw new ApiError('Missing Stripe signature', 401);
  }
  try {
    const event = Stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    req.stripeEvent = event;
    next();
  } catch (err) {
    throw new ApiError(`Webhook signature verification failed: ${err.message}`, 401);
  }
};
