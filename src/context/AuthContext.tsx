import React, { createContext, useContext, useState, useEffect } from 'react';
// import api from '../services/api';
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: any;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType>(null!);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sivi_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) logout();
        else setUser(decoded);
      } catch (e) { logout(); }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('sivi_token', token);
    setUser(jwtDecode(token));
  };
  const logout = () => {
    localStorage.removeItem('sivi_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
