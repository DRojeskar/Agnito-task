import { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../api';

const AuthContext = createContext(null);


const TOKEN_KEY = 'marketplace_token';
console.log("start auth context");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  const fetchMe = async (token) => {
    const saved = token ?? localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setLoading(false);
      setAuthToken(null);
      return;
    }

    console.log("Fetching user data");
    try {
      const data = await api.getMe(saved);
      setUser(data.user);
      setAuthToken(saved);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchMe();
  }, []);




  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setUser(data.user);
    return data;
  };



  const register = async (email, password, name) => {
    const data = await api.register(email, password, name);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  };



  const token = user ? localStorage.getItem(TOKEN_KEY) : null;


  console.log("auth");

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token, refreshUser: () => fetchMe() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
