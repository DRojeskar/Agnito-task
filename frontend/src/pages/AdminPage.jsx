import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';


export default function AdminPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);




  const fetchData = async () => {
    try {
      const [vRes, pRes, wRes] = await Promise.all([
        api.getAdminVendors(),
        api.getAdminPayments(),
        api.getAdminWallet(),
      ]);
      setVendors(vRes.vendors || []);
      setPayments(pRes.payments || []);
      setWallet(wRes);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchData();
  }, []);




  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || creating) return;
    setCreating(true);
    setError(null);
    try {
      await api.createVendor(email, password, name);
      setEmail('');
      setPassword('');
      setName('');
      fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };




  const handleStatusChange = async (vendorId, newStatus) => {
    if (newStatus !== 'active' && newStatus !== 'suspended') return;
    try {
      await api.updateVendorStatus(vendorId, newStatus);
      fetchData();
    } catch (e) {
      setError(e.message);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={styles.card}>
        <p style={styles.error}>Access denied. Admin page is for administrators only.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={styles.muted}>Loading vendors...</div>;
  }


  console.log("Rendering admin dashboard");
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      {error && <div style={styles.errorBox}>{error}</div>}

      {wallet && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Platform Wallet</h2>
          <p style={styles.balance}>
            {wallet.balance?.toFixed(2)} {wallet.currency}
          </p>
        </div>
      )}



      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Create Vendor</h2>
        <form onSubmit={handleCreateVendor} style={styles.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            style={styles.input}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={styles.input}
          />
          <button type="submit" disabled={creating} style={styles.btn}>
            {creating ? 'Creating...' : 'Create Vendor'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Vendors</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td style={styles.td}>{v.name}</td>
                <td style={styles.td}>{v.email}</td>
                <td style={styles.td}>
                  <span style={statusStyle(v.status)}>{v.status}</span>
                </td>
                <td style={styles.td}>
                  <select
                    value={v.status}
                    onChange={(e) => handleStatusChange(v.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="not_connected">not_connected</option>
                    <option value="pending">pending</option>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && <p style={styles.muted}>No vendors yet.</p>}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>All Payments</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Paid By</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td style={styles.td}>{p.id?.slice(-8)}</td>
                <td style={styles.td}>
                  <span style={statusStyle(p.status)}>{p.status}</span>
                </td>
                <td style={styles.td}>${p.amount?.toFixed(2)}</td>
                <td style={styles.td}>{p.customer?.name || p.customer?.email || '-'}</td>
                <td style={styles.td}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p style={styles.muted}>No payments yet.</p>}
      </div>
    </div>
  );
}



function statusStyle(status) {
  if (status === 'active' || status === 'success') return { color: 'var(--success)' };
  if (status === 'pending') return { color: 'var(--warning)' };
  return { color: 'var(--text-muted)' };
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
    padding: '0.6rem 1rem',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' },
  td: { padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' },
  select: {
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
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
