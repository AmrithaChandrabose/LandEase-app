import React, { useEffect } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { dashboard, loading, error, fetchDashboard } = useAdmin();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-lime-700 font-medium">Loading Dashboard Data...</p>
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

  const stats = dashboard?.stats || { totalUsers: 0, totalLands: 0, activeLeases: 0, revenue: 0 };
  const recent = dashboard?.recent || { users: [], lands: [], transactions: [] };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform overview and activity monitoring.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-50 text-lime-600 font-bold">👥</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Listings</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">🌳</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{stats.totalLands}</p>
          </div>

          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Leases</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">📄</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{stats.activeLeases}</p>
          </div>

          <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Platform Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">💰</div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-emerald-600">₹{stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-sm font-bold text-lime-600 hover:text-lime-700 hover:underline">View All →</Link>
            </div>
            <div className="flow-root">
              <ul className="divide-y divide-gray-100">
                {recent.users.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 font-medium bg-gray-50 rounded-xl">No recent users.</p>
                ) : (
                  recent.users.map((u) => (
                    <li key={u._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                        u.role === 'owner' ? 'bg-lime-100 text-lime-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Lands</h2>
              <Link to="/admin/listings" className="text-sm font-bold text-lime-600 hover:text-lime-700 hover:underline">View All →</Link>
            </div>
            <div className="flow-root">
              <ul className="divide-y divide-gray-100">
                {recent.lands.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 font-medium bg-gray-50 rounded-xl">No recent listings.</p>
                ) : (
                  recent.lands.map((l) => (
                    <li key={l._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{l.title}</p>
                        <p className="text-xs text-gray-500">📍 {l.location} · {l.area}</p>
                      </div>
                      <span className="text-sm font-extrabold text-lime-600">₹{l.price.toLocaleString()}/mo</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
              <Link to="/admin/transactions" className="text-sm font-bold text-lime-600 hover:text-lime-700 hover:underline">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-lime-50 text-xs uppercase text-lime-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Txn Ref</th>
                    <th className="px-4 py-3 font-semibold">Payer</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recent.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-sm text-gray-400 font-medium bg-gray-50">No recent transactions.</td>
                    </tr>
                  ) : (
                    recent.transactions.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-900">{t.transactionReference}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{t.payerId?.fullName || '-'}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{t.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            t.status === 'success' ? 'bg-green-100 text-green-800' :
                            t.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;