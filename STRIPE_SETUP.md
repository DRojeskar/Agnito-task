# Stripe Payment Integration (Test Mode)

This project uses Stripe for payments in **test/sandbox mode**.

## 1. Get Stripe Test Keys

1. Create a [Stripe account](https://dashboard.stripe.com/register) (free).
2. Go to [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys).
3. Copy the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`).

## 2. Configure Backend

Add these to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 3. Webhook (for Payment Confirmation)

Stripe sends `payment_intent.succeeded` to update your DB when a payment completes.

### Option A: Stripe CLI (recommended for local dev)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:5000/api/webhook
```

The CLI will print a `whsec_...` value — use that as `STRIPE_WEBHOOK_SECRET`.

### Option B: ngrok (for remote testing)

1. Run `ngrok http 5000`
2. Create a webhook in [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
3. Endpoint URL: `https://your-ngrok-url/api/webhook`
4. Event: `payment_intent.succeeded`
5. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## 4. Test Cards (Stripe Test Mode)

| Card Number           | Description     |
|-----------------------|-----------------|
| 4242 4242 4242 4242   | Success         |
| 4000 0000 0000 0002   | Declined        |
| 4000 0000 0000 3220   | 3D Secure       |

- Expiry: any future date (e.g. 12/34)
- CVC: any 3 digits (e.g. 123)
- ZIP: any valid format

## 5. Run the App

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Stripe webhook (optional, for status updates)
stripe listen --forward-to localhost:5000/api/webhook

# Terminal 3 - Frontend
cd frontend && npm run dev
```

> **Note:** The frontend proxy targets port 6000 by default. Ensure the backend runs on the same port, or update `frontend/vite.config.js` to proxy to `http://localhost:5000` if your backend uses port 5000.
