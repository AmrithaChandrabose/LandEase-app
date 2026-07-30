import React, { useEffect, useState } from 'react';
import UserLayout from "../../Layouts/UserLayout";
import { useUser } from '../../contexts/UserContext';
import { Button } from 'flowbite-react';

function PaymentHistory() {
  const { paymentsSummary, payments, fetchPaymentsSummary, fetchPayments, loading } = useUser();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPaymentsSummary();
  }, [fetchPaymentsSummary]);

  useEffect(() => {
    fetchPayments({ page, status, limit: 10 });
  }, [fetchPayments, page, status]);

  const handleStatusFilterChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">Payment History</h1>
            <p className="mt-1 text-sm text-gray-500">Every payment tied to your leases.</p>
          </div>
          <div className="rounded-xl border border-lime-200 bg-lime-100 px-4 py-2 text-right shadow-sm">
            <p className="text-[10px] font-semibold text-lime-800 uppercase">Total Spending</p>
            <p className="text-xl font-bold text-lime-700">
              ₹{paymentsSummary?.totalSpent?.toLocaleString() || 0}
            </p>
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

        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {loading && payments.data.length === 0 ? (
            <div className="py-10 text-center text-lime-600 font-medium">Loading payments ledger...</div>
          ) : payments.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No payment history found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Txn Reference</th>
                  <th className="px-4 py-3 font-semibold">Land Title</th>
                  <th className="px-4 py-3 font-semibold">Landowner</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.data.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{t.transactionReference}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.leaseId?.landId?.title || '-'}</td>
                    <td className="px-4 py-3">{t.receiverId?.fullName || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{t.amount}</td>
                    <td className="px-4 py-3 capitalize">{t.paymentMethod}</td>
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

export default PaymentHistory;