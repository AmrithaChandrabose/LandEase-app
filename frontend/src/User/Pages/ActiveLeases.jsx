import React, { useEffect, useState } from 'react';
import UserLayout from "../../Layouts/UserLayout";
import { useUser } from '../../contexts/UserContext';
import { Button } from 'flowbite-react';

function ActiveLeases() {
  const { leases, loading, error, fetchLeases, createPaymentIntent, verifyPayment } = useUser();
  const [payingLeaseId, setPayingLeaseId] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchLeases({ page, status, limit: 10 });
  }, [fetchLeases, page, status]);

  const handlePayLease = async (leaseId) => {
    setPayingLeaseId(leaseId);
    try {
      // Step 1: Create Stripe Checkout Session
      const intent = await createPaymentIntent(leaseId);

      if (intent && intent.order && intent.order.url) {
        // Step 2: Redirect user to Stripe Checkout hosting
        window.location.href = intent.order.url;
      } else {
        throw new Error('Could not retrieve payment checkout URL.');
      }
    } catch (err) {
      alert(err.message || 'Payment initiation failed');
      setPayingLeaseId(null);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-700">Active Leases</h1>
          <p className="mt-1 text-sm text-gray-500">Lands you are currently leasing.</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <select
            value={status}
            onChange={handleStatusFilterChange}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {loading ? (
            <div className="py-10 text-center text-lime-600 font-medium">Loading active leases...</div>
          ) : leases.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">You do not have any active leases.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Land Title</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Rent Rate</th>
                  <th className="px-4 py-3 font-semibold">Months Paid</th>
                  <th className="px-4 py-3 font-semibold">Next Due Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leases.data.map((lease) => {
                  const isOverdue = lease.nextPaymentDueDate ? new Date() > new Date(lease.nextPaymentDueDate) : true;
                  const isFullyPaid = lease.nextPaymentDueDate ? new Date(lease.nextPaymentDueDate) >= new Date(lease.endDate) : false;

                  return (
                    <tr key={lease._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {lease.landId?.title || 'Land'}
                      </td>
                      <td className="px-4 py-3">📍 {lease.landId?.location || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">₹{lease.rentAmount}/mo</td>
                      <td className="px-4 py-3 font-bold text-gray-700">{lease.paidMonthsCount || 0} Months</td>
                      <td className="px-4 py-3 text-xs">
                        {isFullyPaid ? (
                          <span className="text-gray-400 font-semibold italic">Fully Paid</span>
                        ) : lease.nextPaymentDueDate ? (
                          new Date(lease.nextPaymentDueDate).toLocaleDateString()
                        ) : (
                          new Date(lease.startDate).toLocaleDateString()
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isFullyPaid ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                            Completed
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 animate-pulse">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                            Paid Up
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isFullyPaid ? (
                          <span className="text-xs text-gray-400 font-medium">Term Agreement Met</span>
                        ) : (
                          <Button
                            size="xs"
                            className={`${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-lime-600 hover:bg-lime-700'} text-white font-semibold`}
                            disabled={payingLeaseId === lease._id}
                            onClick={() => handlePayLease(lease._id)}
                          >
                            {payingLeaseId === lease._id ? 'Paying...' : isOverdue ? 'Pay Due Rent' : 'Pay Next Month'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && leases.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {leases.page} of {leases.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={leases.page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={leases.page === leases.totalPages}
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

export default ActiveLeases;