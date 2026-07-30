import React, { useEffect } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useOwner } from '../../contexts/OwnerContext';
import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { dashboard, loading, error, fetchDashboard } = useOwner();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-lime-700 font-medium">Loading Owner Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="mx-auto max-w-7xl p-6">
          <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || { totalLands: 0, leasedLands: 0, pendingRequests: 0, activeLeases: 0, earnings: 0 };
  const recent = dashboard?.recent || { requests: [], leases: [], transactions: [] };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Owner Dashboard
            </h1>
            <p className="text-sm text-gray-500">Overview of your listed lands, lease agreements, and earnings.</p>
          </div>
          <Link to="/owner/lands/new">
            <Button className="bg-gradient-to-r from-lime-600 to-emerald-500 text-white font-bold rounded-xl py-2 shadow-md hover:opacity-90">
              + List New Land
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">My Lands</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-50 text-lime-600 font-bold">🌳</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{stats.totalLands}</p>
          </div>

          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Leases</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">📄</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{stats.activeLeases}</p>
          </div>

          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Leased Listings</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">🤝</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{stats.leasedLands}</p>
          </div>

          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending Requests</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">⏳</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-600">{stats.pendingRequests}</p>
          </div>
        </div>

        {/* Quick Actions & Recent Listings */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Land Leases */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Leases</h2>
              <Link to="/owner/leases" className="text-sm font-bold text-lime-600 hover:text-lime-700 hover:underline">Manage All →</Link>
            </div>
            <div className="flow-root">
              <ul className="divide-y divide-gray-100">
                {recent.leases.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 font-medium bg-gray-50 rounded-xl">No active leases.</p>
                ) : (
                  recent.leases.map((l) => (
                    <li key={l._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 hover:text-lime-700 transition-colors">{l.landId?.title || 'Land'}</p>
                        <p className="text-xs text-gray-500">Seeker: <span className="font-semibold text-gray-700">{l.seekerId?.fullName}</span> · Start: {new Date(l.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          l.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'
                        }`}>
                          {l.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className="text-sm font-extrabold text-gray-900">₹{l.rentAmount.toLocaleString()}/mo</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Pending Requests Sidebar */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Action Required</h2>
              <Link to="/owner/requests" className="text-sm font-bold text-lime-600 hover:text-lime-700 hover:underline">View All →</Link>
            </div>
            <div className="flow-root">
              <ul className="divide-y divide-gray-100">
                {recent.requests.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 font-medium bg-gray-50 rounded-xl">No pending requests requiring your review.</p>
                ) : (
                  recent.requests.map((r) => (
                    <li key={r._id} className="py-3.5 hover:bg-lime-50/20 px-2 rounded-xl transition-all">
                      <p className="text-sm font-bold text-gray-900">
                        {r.seekerId?.fullName || 'A Seeker'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Requested <span className="font-semibold text-lime-700">{r.landId?.title || 'your land'}</span> for <span className="font-semibold text-gray-700">{r.requestedDuration}</span>
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;