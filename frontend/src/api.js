
const API_BASE = '/api';
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(url, { ...options, headers, cache: options.cache ?? 'default' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register: (email, password, name) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: (token) => {
    const prev = authToken;
    authToken = token;
    return request('/auth/me').finally(() => {
      authToken = prev;
    });
  },

  
  getAdminVendors: () => request('/admin/vendors'),
  createVendor: (email, password, name) =>
    request('/admin/vendor', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  updateVendorStatus: (vendorId, status) =>
    request(`/admin/vendor/${vendorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getAdminPayments: () => request('/admin/payments'),
  getAdminWallet: () => request('/admin/wallet'),

  
  getVendorStatus: () => request('/vendor/status', ),
  onboardVendor: () =>
    request('/vendor/onboard', {
      method: 'POST',
      body: JSON.stringify({}),
    }),


completeOnboarding: () =>
  request('/vendor/complete-onboarding', {
    method: 'POST',
    body: JSON.stringify({}),
  }),



  getVendorWallet: () => request('/vendor/wallet'),
  getVendorProducts: () => request('/vendor/products'),
  createProduct: (name, price, description) =>
    request('/vendor/product', {
      method: 'POST',
      body: JSON.stringify({ name, price, description }),
    }),
  updateProduct: (id, data) =>
    request(`/vendor/product/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getVendorPayments: () => request('/vendor/payments'),


  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),


  createPayment: (productId) =>
    request('/payment/create-payment', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  getPayment: (id) => request(`/payment/${id}`),
};
