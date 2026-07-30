import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from 'flowbite-react';

function Transactions() {
  const { transactions, loading, error, fetchTransactions } = useAdmin();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions({ status, page, limit: 10 });
  }, [fetchTransactions, status, page]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">Transactions Ledger</h1>
            <p className="text-sm text-gray-500">Monitor all transactions and revenue processed on the platform.</p>
          </div>
          <div className="rounded-xl border border-lime-200 bg-lime-100 p-4 text-right shadow-sm">
            <p className="text-xs font-semibold text-lime-800 uppercase">Total Revenue (Filtered)</p>
            <p className="text-2xl font-bold text-lime-700">₹{transactions.totalSuccessAmount?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {loading ? (
            <div className="py-10 text-center text-lime-600">Loading transactions...</div>
          ) : transactions.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No transactions found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Txn Reference</th>
                  <th className="px-4 py-3 font-semibold">Gateway Order ID</th>
                  <th className="px-4 py-3 font-semibold">Gross Amount</th>
                  <th className="px-4 py-3 font-semibold">Platform Cut (Rev)</th>
                  <th className="px-4 py-3 font-semibold">Owner Payout</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.data.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{t.transactionReference}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.gatewayOrderId}</td>
                    <td className="px-4 py-3 text-gray-600">₹{t.amount}</td>
                    <td className="px-4 py-3 font-bold text-lime-600">₹{t.commissionAmount || 0} ({t.commissionPercent || 0}%)</td>
                    <td className="px-4 py-3 font-medium text-gray-900">₹{t.netOwnerAmount != null ? t.netOwnerAmount : t.amount}</td>
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
        {!loading && transactions.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {transactions.page} of {transactions.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={transactions.page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={transactions.page === transactions.totalPages}
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

export default Transactions;