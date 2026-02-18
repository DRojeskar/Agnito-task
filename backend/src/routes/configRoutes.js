import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  });
});

export default router;
