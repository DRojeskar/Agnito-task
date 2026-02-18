
import * as paymentService from '../services/paymentService.js';

const processedEvents = new Map();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

const cleanupOldEvents = () => {
  const now = Date.now();
  for (const [key, time] of processedEvents.entries()) {
    if (now - time > IDEMPOTENCY_TTL_MS) processedEvents.delete(key);
  }
};

export const handleWebhook = async (req, res) => {
  const event = req.stripeEvent;
  if (!event) {
    return res.status(400).json({ success: false, error: 'Invalid webhook event' });
  }

  if (event.type !== 'payment_intent.succeeded') {
    return res.status(200).json({ success: true, message: 'Event type ignored' });
  }

  const paymentIntentId = event.data.object.id;
  const idempotencyKey = `payment_intent.succeeded:${paymentIntentId}`;

  if (processedEvents.has(idempotencyKey)) {
    cleanupOldEvents();
    return res.status(200).json({ success: true, message: 'Already processed (idempotent)' });
  }

  const result = await paymentService.processWebhook(paymentIntentId);
  processedEvents.set(idempotencyKey, Date.now());

  return res.status(200).json({
    success: true,
    message: result.alreadyProcessed ? 'Already processed' : 'Webhook processed',
    paymentId: result.payment?._id,
    status: result.payment?.status,
  });
};
