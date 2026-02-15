import { ApiError } from '../utils/errors.js';

const MOCK_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_mock_secret_12345';
console.log(MOCK_WEBHOOK_SECRET,"testing")

export const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['stripe-signature'] || req.headers['x-webhook-signature'];
  console.log(signature,"signature")

  if (!signature) {
    throw new ApiError('Missing webhook signature', 401);
  }

  if (signature !== MOCK_WEBHOOK_SECRET) {
    throw new ApiError('Invalid webhook signature', 401);
  }

  next();
};
