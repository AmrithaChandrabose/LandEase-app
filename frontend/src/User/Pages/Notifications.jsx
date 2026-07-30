import React, { useEffect, useState } from 'react';
import UserLayout from "../../Layouts/UserLayout";
import { apiFetch } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from 'flowbite-react';

function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/notifications', { token });
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT', token });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PUT', token });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      alert(err.message || 'Failed to mark all as read');
    }
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">Updates on your requests, leases, and payments.</p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={handleMarkAllAsRead}
              className="bg-lime-600 hover:bg-lime-700 text-white font-semibold"
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <p className="text-lime-600 text-center font-medium">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
              You don't have any notifications at the moment.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`relative flex items-start justify-between rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                  n.isRead ? 'border-gray-200 bg-white' : 'border-lime-300 bg-lime-50/50'
                }`}
              >
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold text-gray-900 ${!n.isRead && 'text-lime-800'}`}>
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="h-2.5 w-2.5 rounded-full bg-lime-500" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  <span className="mt-2 block text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n.isRead && (
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => handleMarkAsRead(n._id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;