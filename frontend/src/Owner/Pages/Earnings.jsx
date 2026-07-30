import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useOwner } from '../../contexts/OwnerContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from 'flowbite-react';

function Earnings() {
  const { token } = useAuth();
  const { paymentsSummary, payments, fetchPaymentsSummary, fetchPayments } = useOwner();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPaymentsSummary();
  }, [fetchPaymentsSummary]);

  useEffect(() => {
    fetchPayments({ page, status, limit: 10 });
  }, [fetchPayments, page, status]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/owner/payments/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-earnings.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message || 'Export failed');
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">My Earnings</h1>
            <p className="text-sm text-gray-500">Track all received payments and payout summaries from seekers.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleExportCSV}
              className="rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700 transition"
            >
              Export Statement (CSV)
            </button>
            <div className="rounded-xl border border-lime-200 bg-lime-100 px-4 py-2 text-right shadow-sm">
              <p className="text-[10px] font-semibold text-lime-800 uppercase">Total Revenue</p>
              <p className="text-xl font-bold text-lime-700">
                ₹{paymentsSummary?.totalEarnings?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={status}
            onChange={handleStatusFilterChange}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Transactions list */}
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {payments.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No earnings received yet.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Txn Reference</th>
                  <th className="px-4 py-3 font-semibold">Payer (Seeker)</th>
                  <th className="px-4 py-3 font-semibold">Land Title</th>
                  <th className="px-4 py-3 font-semibold">Gross Rent</th>
                  <th className="px-4 py-3 font-semibold">Platform Fee</th>
                  <th className="px-4 py-3 font-semibold">Net Earnings</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.data.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{t.transactionReference}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.payerId?.fullName || '-'}</td>
                    <td className="px-4 py-3">{t.leaseId?.landId?.title || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">₹{t.amount}</td>
                    <td className="px-4 py-3 text-red-500">-₹{t.commissionAmount || 0} ({t.commissionPercent || 0}%)</td>
                    <td className="px-4 py-3 font-bold text-lime-600">+₹{t.netOwnerAmount != null ? t.netOwnerAmount : t.amount}</td>
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
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {payments.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {payments.page} of {payments.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={payments.page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={payments.page === payments.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Earnings;