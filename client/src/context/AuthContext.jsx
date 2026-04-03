import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hrms_token');
    const savedUser = localStorage.getItem('hrms_user');
    const savedCompany = localStorage.getItem('hrms_company');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedCompany) setCompany(JSON.parse(savedCompany));
        // Refresh company info from server
        fetchProfile();
      } catch {
        localStorage.removeItem('hrms_token');
        localStorage.removeItem('hrms_user');
        localStorage.removeItem('hrms_company');
      }
    }
    setLoading(false);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.company) {
        setCompany(data.company);
        localStorage.setItem('hrms_company', JSON.stringify(data.company));
      }
    } catch {
      // silently fail — token might be expired
    }
  };

  const login = async (email, password, domain) => {
    const { data } = await authAPI.login({ email, password, domain });
    localStorage.setItem('hrms_token', data.token);
    localStorage.setItem('hrms_user', JSON.stringify(data.user));
    setUser(data.user);
    // Fetch company info after login
    await fetchProfile();
    return data;
  };

  const loginWithCompany = (userData, companyData, token) => {
    localStorage.setItem('hrms_token', token);
    localStorage.setItem('hrms_user', JSON.stringify(userData));
    localStorage.setItem('hrms_company', JSON.stringify(companyData));
    setUser(userData);
    setCompany(companyData);
  };

  const logout = () => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_company');
    setUser(null);
    setCompany(null);
  };

  const isAdmin = user?.role === 'admin';
  const isHR = user?.role === 'hr';
  const isEmployee = user?.role === 'employee';
  const canManage = isAdmin || isHR;

  return (
    <AuthContext.Provider value={{ user, company, loading, login, loginWithCompany, logout, isAdmin, isHR, isEmployee, canManage }}>
      {children}
    </AuthContext.Provider>
  );
};
