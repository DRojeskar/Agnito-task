import { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';


import { api } from '../api';



export default function PaymentStatus() {
  console.log("Rendering payment status");
  const { paymentId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    if (!paymentId) return;
    const fetchPayment = async () => {
      try {
        const res = await api.getPayment(paymentId);
        setPayment(res.payment);
        setError(null);
      } catch (e) {
        setError(e.message);
        setPayment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
    const interval = setInterval(fetchPayment, 2000);
    return () => clearInterval(interval);
  }, [paymentId]);

  if (loading && !payment) {
    return (
      <div style={styles.card}>
        <p style={styles.muted}>Loading payment status...</p>
      </div>
    );
  }



  if (error && !payment) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'var(--warning)', label: 'Pending' },
    success: { color: 'var(--success)', label: 'Success' },
    failed: { color: 'var(--error)', label: 'Failed' }
  };
  const config = statusConfig[payment?.status] || statusConfig.pending;


  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Payment Status</h1>
      <div style={styles.card}>
        <p style={styles.status}>
          Status: <strong style={{ color: config.color }}>{config.label}</strong>
        </p>
        {payment?.product && (
          <p style={styles.detail}>Product: {payment.product.name}</p>
        )}
        {payment?.amount != null && (
          <p style={styles.detail}>Amount: ${payment.amount?.toFixed(2)}</p>
        )}
        <p style={styles.muted}>Status is fetched from backend. Refreshing every 2s.</p>
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
    border: '1px solid var(--border)'
  },
  status: { fontSize: '1.25rem', marginBottom: '0.5rem' },
  detail: { marginBottom: '0.25rem' },
  muted: { color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' },
  error: {
    background: 'rgba(248,81,73,0.15)',
    color: 'var(--error)',
    padding: '1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--error)'
  }
};
