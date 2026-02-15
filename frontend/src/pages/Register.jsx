import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  console.log("Rendering registration form");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            style={styles.input}
            placeholder="Name"
          />
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={styles.input}
            placeholder="Email"
          />
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            style={styles.input}
            placeholder="Password"
          />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={styles.hint}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
  },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '2rem',
    width: '100%',
    maxWidth: 400,
    border: '1px solid var(--border)',
  },
  title: { marginBottom: '1.5rem', fontSize: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { fontSize: '0.9rem', fontWeight: 500 },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '1rem',
  },
  btn: {
    marginTop: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    fontSize: '1rem',
  },
  error: {
    background: 'rgba(248,81,73,0.15)',
    color: 'var(--error)',
    padding: '0.75rem',
    borderRadius: 'var(--radius)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  hint: {
    marginTop: '1.5rem',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
};
