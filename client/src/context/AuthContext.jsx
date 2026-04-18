import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { showLoginToast, showLogoutToast, showErrorToast } from '../utils/toastHelpers';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sadbhavna_user');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed;
  });

  const [token, setToken] = useState(() => localStorage.getItem('sadbhavna_token'));

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('sadbhavna_user', JSON.stringify(user));
      localStorage.setItem('sadbhavna_token', token);
    } else {
      localStorage.removeItem('sadbhavna_user');
      localStorage.removeItem('sadbhavna_token');
    }
  }, [user, token]);

  const sendOtp = async (email) => {
    try {
      const res = await fetch('https://sadbhavna-api.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      if (data.devOtp) {
        toast.success(`[DEV MODE] Your OTP is: ${data.devOtp}`, { duration: 60000, icon: '🚨' });
      }
      return true;
    } catch (error) {
      showErrorToast(error.message);
      throw error;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await fetch('https://sadbhavna-api.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP Verification failed');
      
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        wishlist: data.wishlist
      });
      showLoginToast(data.name);
      return data;
    } catch (error) {
      showErrorToast(error.message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch('https://sadbhavna-api.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      toast.success(data.message);
      if (data.devOtp) {
        toast.success(`[DEV MODE] Your OTP is: ${data.devOtp}`, { duration: 60000, icon: '🚨' });
      }
      return true;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const verifyRegister = async (email, otp) => {
    try {
      const res = await fetch('https://sadbhavna-api.onrender.com/api/auth/verify-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      
      setToken(data.token);
      setUser(data);
      showLoginToast(data.name || 'User');
      return data;
    } catch (error) {
      showErrorToast(error.message);
      throw error;
    }
  };

  const handleOAuthLogin = async (oauthToken) => {
    try {
      // In a real app we might fetch user details, 
      // but for simplicity we will just decode or assume token is enough to be logged in 
      // and let the next API call with the token hydrate the user context, 
      // or we can fetch a /me endpoint. Since we don't have a /me endpoint, 
      // I'll parse the JWT payload.
      const payload = JSON.parse(atob(oauthToken.split('.')[1]));
      
      setToken(oauthToken);
      setUser({
        _id: payload.id,
        role: payload.role,
        name: payload.name || 'User', // use real name from JWT
      });
      showLoginToast(payload.name || 'User');
      
      // Attempt to navigate or return
      return true;
    } catch (error) {
       showErrorToast('Google Auth Failed from token');
    }
  }

  const logout = () => {
    setUser(null);
    setToken(null);
    showLogoutToast();
  };

  return (
    <AuthContext.Provider value={{ user, token, register, verifyRegister, sendOtp, verifyOtp, handleOAuthLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
