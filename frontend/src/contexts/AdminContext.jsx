import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [lands, setLands] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [transactions, setTransactions] = useState({ data: [], total: 0, page: 1, totalPages: 1, totalSuccessAmount: 0 });
  const [settings, setSettings] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error state whenever the user session changes
  React.useEffect(() => {
    setError(null);
  }, [token, user]);

  const buildQuery = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return query.toString();
  };

  const fetchStats = useCallback(async () => {
    if (!isAdmin || !token) return;
    try {
      const data = await apiFetch('/api/admin/stats', { token });
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, [isAdmin, token]);

  const fetchDashboard = useCallback(async () => {
    if (!isAdmin || !token) return;
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/dashboard', { token });
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token]);

  const fetchUsers = useCallback(async (params = {}) => {
    if (!isAdmin || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/admin/users?${qs}`, { token });
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token]);

  const updateUserStatus = async (id, isActive) => {
    if (!isAdmin || !token) return;
    const data = await apiFetch(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      token,
      body: { isActive }
    });
    // Update local state
    setUsers(prev => ({
      ...prev,
      data: prev.data.map(u => u._id === id ? { ...u, isActive: data.isActive } : u)
    }));
    return data;
  };

  const fetchLands = useCallback(async (params = {}) => {
    if (!isAdmin || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/admin/lands?${qs}`, { token });
      setLands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token]);

  const updateLandStatus = async (id, status) => {
    if (!isAdmin || !token) return;
    const data = await apiFetch(`/api/admin/lands/${id}/status`, {
      method: 'PUT',
      token,
      body: { status }
    });
    setLands(prev => ({
      ...prev,
      data: prev.data.map(l => l._id === id ? { ...l, status: data.status } : l)
    }));
    return data;
  };

  const fetchTransactions = useCallback(async (params = {}) => {
    if (!isAdmin || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/admin/transactions?${qs}`, { token });
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token]);

  const fetchSettings = useCallback(async () => {
    if (!isAdmin || !token) return;
    try {
      const data = await apiFetch('/api/admin/settings', { token });
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  }, [isAdmin, token]);

  const updateSettings = async (updates) => {
    if (!isAdmin || !token) return;
    const data = await apiFetch('/api/admin/settings', {
      method: 'PUT',
      token,
      body: updates
    });
    setSettings(data);
    return data;
  };

  const value = {
    stats,
    dashboard,
    users,
    lands,
    transactions,
    settings,
    loading,
    error,
    fetchStats,
    fetchDashboard,
    fetchUsers,
    updateUserStatus,
    fetchLands,
    updateLandStatus,
    fetchTransactions,
    fetchSettings,
    updateSettings
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
