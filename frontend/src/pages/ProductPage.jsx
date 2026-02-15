import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProductPage() {
  console.log("test function");
  const { user } = useAuth();
  const customerId = user?.id;
  const { productId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (productId) {
          const res = await api.getProduct(productId);
          setProduct(res.product);
          setProducts([]);
        } else {
          const res = await api.getProducts();
          setProducts(res.products || []);
          setProduct(null);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handlePay = async (id) => {
    if (paying || !customerId || user?.role !== 'customer') return;
    const p = product || products.find((x) => x.id === id);
    if (!p) return;
    if (p.vendorStatus !== 'active') {
      setError('Vendor is not active. Payment is disabled.');
      return;
    }
    setPaying(true);
    setError(null);
    try {
      const res = await api.createPayment(p.id);
      navigate(`/payment/${res.paymentId}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div style={styles.muted}>Loading products...</div>;
  }


  console.log("Rendering product details");
  if (productId && product) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>{product.name}</h1>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.card}>
          <p style={styles.price}>${product.price?.toFixed(2)}</p>
          <p style={styles.vendor}>Vendor: {product.vendorName}</p>
          <button
            onClick={() => handlePay(product.id)}
            disabled={paying || product.vendorStatus !== 'active' || !user || user?.role !== 'customer'}
            style={styles.btn}
          >
            {paying ? 'Processing...' : 'Pay Now'}
          </button>
          {!user && (
            <p style={styles.disabled}>Login to purchase.</p>
          )}
          {user && user?.role !== 'customer' && (
            <p style={styles.disabled}>Only customers can purchase.</p>
          )}
          {user?.role === 'customer' && product.vendorStatus !== 'active' && (
            <p style={styles.disabled}>Payment disabled: vendor not active</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Products</h1>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.grid}>
        {products.map((p) => (
          <div key={p.id} style={styles.card}>
            <h3 style={styles.productName}>{p.name}</h3>
            <p style={styles.price}>${p.price?.toFixed(2)}</p>
            <p style={styles.vendor}>Vendor: {p.vendorName}</p>
            <button
              onClick={() => handlePay(p.id)}
              disabled={paying || p.vendorStatus !== 'active' || !user || user?.role !== 'customer'}
              style={styles.btn}
            >
              {paying ? 'Processing...' : 'Pay Now'}
            </button>
            {!user && <p style={styles.disabled}>Login to purchase.</p>}
            {user && user?.role !== 'customer' && (
              <p style={styles.disabled}>Only customers can purchase.</p>
            )}
            {user?.role === 'customer' && p.vendorStatus !== 'active' && (
              <p style={styles.disabled}>Payment disabled: vendor not active</p>
            )}
          </div>
        ))}
      </div>
      {products.length === 0 && !loading && (
        <p style={styles.muted}>No products. Run seed script first.</p>
      )}
    </div>
  );
}




const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { marginBottom: '0.5rem', fontSize: '1.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    border: '1px solid var(--border)'
  },
  productName: { marginBottom: '0.5rem', fontSize: '1.1rem' },
  price: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' },
  vendor: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' },
  btn: {
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    width: '100%'
  },
  disabled: { marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--warning)' },
  error: {
    background: 'rgba(248,81,73,0.15)',
    color: 'var(--error)',
    padding: '1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--error)'
  },
  muted: { color: 'var(--text-muted)' }
};
