
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
  console.log("Received webhook:", req.body);
  const { eventType, paymentIntentId } = req.body;
  console.log(req.body,"test")

  if (!eventType || !paymentIntentId) {
    return res.status(400).json({success: false,error: 'eventType and paymentIntentId are required',});
  }

  if (eventType!== 'payment.success') {
    return res.status(200).json({ success: true, message: 'Event type ignored' });
  }

  const idempotencyKey = `payment.success:${paymentIntentId}`;
  console.log(idempotencyKey,"idempotencyKey")

  if (processedEvents.has(idempotencyKey)) {
    cleanupOldEvents();
    return res.status(200).json({ success: true, message: 'Already processed (idempotent)' });
  }

  const result = await paymentService.processWebhook(paymentIntentId);
  console.log(result,"result")
  processedEvents.set(idempotencyKey, Date.now());
  console.log(processedEvents,"processedEvents")

  return res.status(200).json({success: true,message: result.alreadyProcessed ? 'Already processed' : 'Webhook processed',paymentId: result.payment?._id,
    status: result.payment?.status,
  });
};
