import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await apiFetch('/api/auth/me', { token });
        setUser(userData);
      } catch (err) {
        console.error("Failed to load user:", err);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    setToken(data.token);
    localStorage.setItem('token', data.token);
    
    // The response also contains user data
    const { token: _token, ...userData } = data;
    setUser(userData);
    return userData;
  };

  const register = async (userDataInput) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: userDataInput,
    });

    setToken(data.token);
    localStorage.setItem('token', data.token);

    const { token: _token, ...userData } = data;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (updates) => {
    const data = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: updates,
      token,
    });
    setUser(data);
    return data;
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
