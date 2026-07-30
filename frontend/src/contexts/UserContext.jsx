import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const { token, user } = useAuth();
  const isSeeker = user?.role === 'user';

  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [lands, setLands] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 });
  const [landDetails, setLandDetails] = useState(null);
  const [requests, setRequests] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 });
  const [leases, setLeases] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 });
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [payments, setPayments] = useState({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 });

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
    if (!isSeeker || !token) return;
    try {
      const data = await apiFetch('/api/user/dashboard/stats', { token });
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, [isSeeker, token]);

  const fetchDashboard = useCallback(async () => {
    if (!isSeeker || !token) return;
    setLoading(true);
    try {
      const data = await apiFetch('/api/user/dashboard', { token });
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSeeker, token]);

  const fetchLands = useCallback(async (params = {}) => {
    if (!isSeeker || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/user/lands?${qs}`, { token });
      setLands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSeeker, token]);

  const fetchLandDetails = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/user/lands/${id}`, { token });
      setLandDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchRequests = useCallback(async (params = {}) => {
    if (!isSeeker || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/user/requests?${qs}`, { token });
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSeeker, token]);

  const createRequest = async (requestData) => {
    if (!isSeeker || !token) return;
    const data = await apiFetch('/api/user/requests', {
      method: 'POST',
      token,
      body: requestData
    });
    return data;
  };

  const cancelRequest = async (id) => {
    if (!isSeeker || !token) return;
    const data = await apiFetch(`/api/user/requests/${id}`, {
      method: 'DELETE',
      token
    });
    return data;
  };

  const fetchLeases = useCallback(async (params = {}) => {
    if (!isSeeker || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/user/leases?${qs}`, { token });
      setLeases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSeeker, token]);

  const fetchPaymentsSummary = useCallback(async () => {
    if (!isSeeker || !token) return;
    try {
      const data = await apiFetch('/api/user/payments/summary', { token });
      setPaymentsSummary(data);
    } catch (err) {
      console.error(err);
    }
  }, [isSeeker, token]);

  const fetchPayments = useCallback(async (params = {}) => {
    if (!isSeeker || !token) return;
    setLoading(true);
    try {
      const qs = buildQuery(params);
      const data = await apiFetch(`/api/user/payments?${qs}`, { token });
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSeeker, token]);

  const createPaymentIntent = async (leaseId) => {
    if (!isSeeker || !token) return;
    const data = await apiFetch('/api/user/payments/create-intent', {
      method: 'POST',
      token,
      body: { leaseId }
    });
    return data;
  };

  const verifyPayment = async (payload) => {
    if (!isSeeker || !token) return;
    const data = await apiFetch('/api/user/payments/verify', {
      method: 'POST',
      token,
      body: payload
    });
    return data;
  };

  const value = {
    stats,
    dashboard,
    lands,
    landDetails,
    requests,
    leases,
    paymentsSummary,
    payments,
    loading,
    error,
    fetchStats,
    fetchDashboard,
    fetchLands,
    fetchLandDetails,
    fetchRequests,
    createRequest,
    cancelRequest,
    fetchLeases,
    fetchPaymentsSummary,
    fetchPayments,
    createPaymentIntent,
    verifyPayment
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
