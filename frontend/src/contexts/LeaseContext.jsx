import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const LeaseContext = createContext();

export function useLeases() {
  return useContext(LeaseContext);
}

export function LeaseProvider({ children }) {
  const { token, user } = useAuth();
  
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeLeases, setActiveLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      if (user.role === 'user') {
        const data = await apiFetch('/api/requests/seeker', { token });
        setMyRequests(data || []);
      } else if (user.role === 'owner') {
        const data = await apiFetch('/api/requests/owner', { token });
        setIncomingRequests(data || []);
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchActiveLeases = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      if (user.role === 'user') {
        const data = await apiFetch('/api/leases/seeker', { token });
        setActiveLeases(data || []);
      } else if (user.role === 'owner') {
        const data = await apiFetch('/api/leases/owner', { token });
        setActiveLeases(data || []);
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch active leases:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const createRequest = async (requestData) => {
    const data = await apiFetch('/api/requests', {
      method: 'POST',
      body: requestData,
      token,
    });
    setMyRequests(prev => [data, ...prev]);
    return data;
  };

  const updateRequestStatus = async (id, statusData) => {
    const data = await apiFetch(`/api/requests/${id}/status`, {
      method: 'PUT',
      body: statusData,
      token,
    });
    // Update incoming requests locally
    setIncomingRequests(prev => prev.map(req => req._id === id ? data.request : req));
    // If approved, an active lease is returned, so we could update activeLeases
    if (data.activeLease) {
      setActiveLeases(prev => [data.activeLease, ...prev]);
    }
    return data;
  };

  const value = {
    myRequests,
    incomingRequests,
    activeLeases,
    loading,
    error,
    fetchRequests,
    fetchActiveLeases,
    createRequest,
    updateRequestStatus,
  };

  return <LeaseContext.Provider value={value}>{children}</LeaseContext.Provider>;
}
