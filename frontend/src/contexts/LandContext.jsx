import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const LandContext = createContext();

export function useLands() {
  return useContext(LandContext);
}

export function LandProvider({ children }) {
  const { token } = useAuth();
  
  const [lands, setLands] = useState([]);
  const [myLands, setMyLands] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLands = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/lands?${queryString}` : '/api/lands';
      
      const response = await apiFetch(endpoint);
      setLands(response.data || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch lands:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyLands = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/lands/owner/my-lands', { token });
      setMyLands(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch my lands:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createLand = async (landData) => {
    const data = await apiFetch('/api/lands', {
      method: 'POST',
      body: landData,
      token,
    });
    setMyLands(prev => [data, ...prev]);
    return data;
  };

  const updateLand = async (id, landData) => {
    const data = await apiFetch(`/api/lands/${id}`, {
      method: 'PUT',
      body: landData,
      token,
    });
    setMyLands(prev => prev.map(land => land._id === id ? data : land));
    return data;
  };

  const deleteLand = async (id) => {
    await apiFetch(`/api/lands/${id}`, {
      method: 'DELETE',
      token,
    });
    setMyLands(prev => prev.filter(land => land._id !== id));
  };

  const value = {
    lands,
    myLands,
    pagination,
    loading,
    error,
    fetchLands,
    fetchMyLands,
    createLand,
    updateLand,
    deleteLand,
  };

  return <LandContext.Provider value={value}>{children}</LandContext.Provider>;
}
