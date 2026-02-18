import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../api';

function CheckoutForm({ clientSecret, paymentId, amount, stripePromise }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/${paymentId}`,
          receipt_email: undefined,
        },
      });
      if (submitError) {
        setError(submitError.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <PaymentElement />
      {error && <div style={styles.error}>{error}</div>}
      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        style={{ ...styles.btn, opacity: processing ? 0.7 : 1 }}
      >
        {processing ? 'Processing...' : `Pay $${amount?.toFixed(2) ?? '0.00'}`}
      </button>
      <p style={styles.muted}>
        Use test card: 4242 4242 4242 4242 | Any future expiry | Any CVC
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateSecret = location.state?.clientSecret;
  const stateAmount = location.state?.amount;
  const [clientSecret, setClientSecret] = useState(stateSecret);
  const [amount, setAmount] = useState(stateAmount);
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const config = await api.getConfig();
        if (config.stripePublishableKey) {
          setStripePromise(loadStripe(config.stripePublishableKey));
        }
      } catch (e) {
        console.error('Failed to load Stripe config:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!paymentId) {
      navigate('/products');
      return;
    }
    if (stateSecret) {
      setClientSecret(stateSecret);
      setAmount(stateAmount);
    } else {
      api.getPaymentClientSecret(paymentId)
        .then((r) => {
          setClientSecret(r.clientSecret);
        })
        .catch(() => navigate('/products'));
    }
  }, [paymentId, stateSecret, stateAmount, navigate]);

  if (loading) {
    return <div style={styles.muted}>Loading checkout...</div>;
  }

  if (!paymentId || !clientSecret) {
    return (
      <div style={styles.container}>
        <p style={styles.muted}>Loading payment details...</p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Stripe is not configured. Add STRIPE_PUBLISHABLE_KEY to backend .env</div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: { colorPrimary: '#6366f1' },
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Complete Payment</h1>
      <div style={styles.card}>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            clientSecret={clientSecret}
            paymentId={paymentId}
            amount={amount}
            stripePromise={stripePromise}
          />
        </Elements>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { marginBottom: '0.5rem', fontSize: '1.75rem' },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    border: '1px solid var(--border)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  btn: {
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    fontSize: '1rem',
  },
  error: {
    background: 'rgba(248,81,73,0.15)',
    color: 'var(--error)',
    padding: '1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--error)',
  },
  muted: { color: 'var(--text-muted)', fontSize: '0.9rem' },
};
