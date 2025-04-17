import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          setCurrentUser(null);
        } else {
          verifyToken(token);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    }
    
    setLoading(false);
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/verify`, {
        headers: { 'x-auth-token': token }
      });
      
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const login = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/discord`);
      window.location.href = response.data.url;
    } catch (error) {
      setError('Не удалось получить URL авторизации Discord');
      console.error('Error getting Discord auth URL:', error);
    }
  };

  const handleAuthCallback = async (code) => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/discord/callback`, { code });
      
      localStorage.setItem('token', response.data.token);
      await verifyToken(response.data.token);
      
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка авторизации');
      console.error('Auth callback error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
	setCurrentUser,
    handleAuthCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};