import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const OwnerContext = createContext();

export function useOwner() {
  return useContext(OwnerContext);
}

export function OwnerProvider({ children }) {
  const { token, user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [lands, setLands] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 });
  const [requests, setRequests] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 });
  const [leases, setLeases] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 });
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [payments, setPayments] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1, totalSuccessAmount: 0 });

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
    if (!isOwner || !token) return;
    try {
      const data = await apiFetch('/api/owner/dashboard/stats', { token });
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, [isOwner, token]);

  const fetchDashboard = useCallback(async () => {
    if (!isOwner || !token) return;
    setLoading(true);
    try {
      const data = await apiFetch('/api/owner/dashboard', { token });
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isOwner, token]);

  const fetchLands = useCallback(async (params = {}) => {
    if (!isOwner || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/owner/lands?${qs}`, { token });
      setLands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isOwner, token]);

  const createLand = async (landData) => {
    if (!isOwner || !token) return;
    const data = await apiFetch('/api/owner/lands', {
      method: 'POST',
      token,
      body: landData
    });
    return data;
  };

  const updateLand = async (id, landData) => {
    if (!isOwner || !token) return;
    const data = await apiFetch(`/api/owner/lands/${id}`, {
      method: 'PUT',
      token,
      body: landData
    });
    return data;
  };

  const updateLandAvailability = async (id, status) => {
    if (!isOwner || !token) return;
    const data = await apiFetch(`/api/owner/lands/${id}/status`, {
      method: 'PUT',
      token,
      body: { status }
    });
    return data;
  };

  const deleteLand = async (id) => {
    if (!isOwner || !token) return;
    await apiFetch(`/api/owner/lands/${id}`, {
      method: 'DELETE',
      token
    });
  };

  const fetchRequests = useCallback(async (params = {}) => {
    if (!isOwner || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/owner/requests?${qs}`, { token });
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isOwner, token]);

  const updateRequestStatus = async (id, statusData) => {
    if (!isOwner || !token) return;
    const data = await apiFetch(`/api/owner/requests/${id}/status`, {
      method: 'PUT',
      token,
      body: statusData
    });
    return data;
  };

  const fetchLeases = useCallback(async (params = {}) => {
    if (!isOwner || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/owner/leases?${qs}`, { token });
      setLeases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isOwner, token]);

  const updateLeaseStatus = async (id, status) => {
    if (!isOwner || !token) return;
    const data = await apiFetch(`/api/owner/leases/${id}/status`, {
      method: 'PUT',
      token,
      body: { status }
    });
    return data;
  };

  const fetchPaymentsSummary = useCallback(async () => {
    if (!isOwner || !token) return;
    try {
      const data = await apiFetch('/api/owner/payments/summary', { token });
      setPaymentsSummary(data);
    } catch (err) {
      console.error(err);
    }
  }, [isOwner, token]);

  const fetchPayments = useCallback(async (params = {}) => {
    if (!isOwner || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/owner/payments?${qs}`, { token });
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isOwner, token]);

  const value = {
    stats,
    dashboard,
    lands,
    requests,
    leases,
    paymentsSummary,
    payments,
    loading,
    error,
    fetchStats,
    fetchDashboard,
    fetchLands,
    createLand,
    updateLand,
    updateLandAvailability,
    deleteLand,
    fetchRequests,
    updateRequestStatus,
    fetchLeases,
    updateLeaseStatus,
    fetchPaymentsSummary,
    fetchPayments
  };

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}
