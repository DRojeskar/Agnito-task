import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import VendorDashboard from './pages/VendorDashboard';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';
import PaymentStatus from './pages/PaymentStatus';
import CheckoutPage from './pages/CheckoutPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorOnboarding from './pages/VendorOnboarding';
import VendorLayout from './pages/VendorLayout';


function App() {
  const { user, logout } = useAuth();

  return (
    <div style={styles.layout}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>Marketplace</Link>
        <div style={styles.navLinks}>
        {user?.role === 'vendor' && (
         <Link to="/vendor">Vendor Dashboard</Link>
)}

          {/* <Link to="/vendor">Vendor Dashboard</Link> */}
          <Link to="/products">Products</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user ? (
            <>
              <span style={styles.userName}>{user.name} ({user.role})</span>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main style={styles.main}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/'} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/" element={<ProductPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route
          path="/vendor"
             element={
        <ProtectedRoute role="vendor">
         <VendorDashboard />
         </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute role="admin">
      <AdminPage />
    </ProtectedRoute>
  }
/>


<Route
  path="/vendor"
  element={
    <ProtectedRoute role="vendor">
      <VendorLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<VendorDashboard />} />
  <Route path="dashboard" element={<VendorDashboard />} />
  <Route path="onboarding" element={<VendorOnboarding />} />
</Route>

<Route path="/vendor/onboarding" element={<VendorOnboarding />} />


          {/* <Route path="/vendor" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} /> */}

          {/* <Route path="/vendor" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} /> */}
          {/* <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} /> */}
          <Route path="/checkout/:paymentId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/payment/:paymentId" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)'
  },
  logo: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: 'var(--text)'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  userName: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem'
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: 800,
    margin: '0 auto',
    width: '100%'
  }
};

export default App;
