import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onboarding, setOnboarding] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.getVendorStatus();
      setOnboardingStatus({ status: res.status, onboardingLink: res.onboardingLink });
      setError(null);
    } catch (e) {
      setError(e.message);
      setOnboardingStatus({ status: 'not_connected', onboardingLink: null });
    }
  };

  const fetchData = async () => {
    try {
      const [wRes, pRes, payRes] = await Promise.all([
        api.getVendorWallet(),
        api.getVendorProducts(),
        api.getVendorPayments(),
      ]);
      setWallet(wRes);
      setProducts(pRes.products || []);
      setPayments(payRes.payments || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  fetchStatus();
  fetchData();
}, []);


//  const handleOnboard = async () => {
//   setOnboarding(true);
//   setError(null);

//   try {
//     const res = await api.onboardVendor();

//     setOnboardingStatus({
//       status: res.status,
//       onboardingLink: res.onboardingLink || null,
//     });

//     // RESUME → completed: refetch status so redirect/fresh load always sees active
//     if (res.status === 'active') {
//       await fetchStatus();
//     }

//     // FIRST TIME → open link
//     if (res.onboardingLink) {
//       window.open(res.onboardingLink, '_blank');
//     }

//     // RESUME → show thank you
//     if (res.message) {
//       alert(res.message);
//     }

//   } catch (e) {
//     setError(e.message);
//   } finally {
//     setOnboarding(false);
//   }
// };



const handleOnboard = async () => {
  setOnboarding(true);
  setError(null);

  try {
    const res = await api.onboardVendor();

    setOnboardingStatus({
      status: res.status,
      onboardingLink: res.onboardingLink || null,
    });

    if (res.onboardingLink) {
      window.location.href = res.onboardingLink; 
    }

  } catch (e) {
    setError(e.message);
  } finally {
    setOnboarding(false);
  }
};



  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productName || !productPrice || creating) return;
    setCreating(true);
    setError(null);
    try {
      await api.createProduct(productName, parseFloat(productPrice), productDesc);
      setProductName('');
      setProductPrice('');
      setProductDesc('');
      fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  if (user?.role !== 'vendor') {
    return (
      <div style={styles.card}>
        <p style={styles.error}>Access denied. Vendor dashboard is for vendor accounts only.</p>
      </div>
    );
  }

  if (loading && !onboardingStatus) {
    return <div style={styles.muted}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Vendor Dashboard</h1>
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Onboarding Status</h2>
        <p style={styles.status}>
          Status: <strong style={statusStyle(onboardingStatus?.status)}>{onboardingStatus?.status || '—'}</strong>
        </p>
        {(onboardingStatus?.status === 'not_connected' || onboardingStatus?.status === 'pending') && (
          <button
            onClick={handleOnboard}
            disabled={onboarding}
            style={styles.btn}
          >
            {onboardingStatus?.status === 'not_connected' ? 'Start Onboarding' : 'Resume Onboarding'}
          </button>
        )}
      </div>

      {wallet && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Wallet Balance</h2>
          <p style={styles.balance}>
            {wallet.balance?.toFixed(2)} {wallet.currency}
          </p>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Create Product</h2>
        {onboardingStatus?.status !== 'active' && (
          <p style={styles.muted}>Complete onboarding and get approved (status: active) to create products.</p>
        )}
        <form onSubmit={handleCreateProduct} style={styles.form}>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Product name"
            required
            style={styles.input}
            disabled={onboardingStatus?.status !== 'active'}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            placeholder="Price"
            required
            style={styles.input}
            disabled={onboardingStatus?.status !== 'active'}
          />
          <input
            type="text"
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            placeholder="Description (optional)"
            style={styles.input}
            disabled={onboardingStatus?.status !== 'active'}
          />
          <button type="submit" disabled={creating || onboardingStatus?.status !== 'active'} style={styles.btn}>
            {creating ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>

      {products.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>My Products</h2>
          <ul style={styles.productList}>
            {products.map((p) => (
              <li key={p.id} style={styles.productItem}>
                {p.name} — ${p.price?.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {payments.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Payment History</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Paid By</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>
                    <span style={p.status === 'success' ? { color: 'var(--success)' } : {}}>
                      {p.status}
                    </span>
                  </td>
                  <td style={styles.td}>${p.amount?.toFixed(2)}</td>
                  <td style={styles.td}>{p.product?.name || '-'}</td>
                  <td style={styles.td}>{p.customer?.name || p.customer?.email || '-'}</td>
                  <td style={styles.td}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusStyle(status) {
  if (status === 'active') return { color: 'var(--success)' };
  if (status === 'pending') return { color: 'var(--warning)' };
  return { color: 'var(--text-muted)' };
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { marginBottom: '0.5rem', fontSize: '1.75rem' },
  status: { marginBottom: '1rem' },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    border: '1px solid var(--border)',
  },
  cardTitle: { marginBottom: '1rem', fontSize: '1.1rem' },
  balance: { fontSize: '1.5rem', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '0.95rem',
  },
  btn: {
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
  },
  productList: { listStyle: 'none' },
  productItem: { padding: '0.5rem 0', borderBottom: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' },
  td: { padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' },
  error: { color: 'var(--error)' },
  errorBox: {
    background: 'rgba(248,81,73,0.15)',
    color: 'var(--error)',
    padding: '1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--error)',
  },
  muted: { color: 'var(--text-muted)' },
};
