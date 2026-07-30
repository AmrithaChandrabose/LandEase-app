import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function Reports() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [landsBreakdown, setLandsBreakdown] = useState(null);
  const [topOwners, setTopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [sumData, landsData, ownersData] = await Promise.all([
          apiFetch('/api/admin/reports/summary', { token }),
          apiFetch('/api/admin/reports/lands', { token }),
          apiFetch('/api/admin/reports/top-owners', { token })
        ]);
        setSummary(sumData);
        setLandsBreakdown(landsData);
        setTopOwners(ownersData?.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadReports();
    }
  }, [token]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/reports/export/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message || 'Export failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-lime-700 font-medium">Loading reports and analytics...</p>
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

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">Platform Reports</h1>
            <p className="text-sm text-gray-500">View performance indicators and system diagnostics.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700 transition"
          >
            Export Transactions (CSV)
          </button>
        </div>

        {/* Section 1: KPI Panels */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Users</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.users?.total || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              {summary?.users?.owners || 0} Owners · {summary?.users?.seekers || 0} Seekers
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Lands Listing</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.lands?.total || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              {summary?.lands?.available || 0} Available · {summary?.lands?.leased || 0} Leased
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Active Leases</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.leases?.active || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              Completed leases: {summary?.leases?.completed || 0}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Gross Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-lime-600">₹{summary?.payments?.revenue?.toLocaleString() || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              {summary?.payments?.successfulPayments || 0} successful transfers
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Breakdowns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lands by Location */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Lands by Location</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Total Listings</th>
                    <th className="px-4 py-2">Average Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {landsBreakdown?.byLocation?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-sm">No locations mapped.</td>
                    </tr>
                  ) : (
                    landsBreakdown?.byLocation?.map((loc, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-900 font-medium">📍 {loc.location}</td>
                        <td className="px-4 py-2">{loc.count} listings</td>
                        <td className="px-4 py-2 font-semibold">₹{loc.avgPrice?.toLocaleString()}/mo</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Owners */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Top Earning Landowners</h2>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {topOwners.length === 0 ? (
                  <p className="py-4 text-sm text-gray-500">No earnings logged.</p>
                ) : (
                  topOwners.map((owner) => (
                    <li key={owner.ownerId} className="py-3 flex justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{owner.fullName}</p>
                        <p className="text-xs text-gray-500">{owner.email} · {owner.payments} payouts</p>
                      </div>
                      <span className="text-sm font-bold text-lime-600">₹{owner.earnings?.toLocaleString()}</span>
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

export default Reports;