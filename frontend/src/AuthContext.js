import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, getToken } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try { const { user } = await api.me(); setUser(user); }
        catch { setToken(null); }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password, role) => {
    const { token, user } = await api.login({ email, password, role });
    setToken(token); setUser(user); return user;
  }, []);

  const register = useCallback(async (payload) => {
    const { token, user } = await api.register(payload);
    setToken(token); setUser(user); return user;
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const refresh = useCallback(async () => {
    const { user } = await api.me(); setUser(user); return user;
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
