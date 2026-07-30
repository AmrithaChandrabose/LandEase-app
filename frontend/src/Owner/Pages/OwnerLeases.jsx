import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useOwner } from '../../contexts/OwnerContext';
import { Button } from 'flowbite-react';

function OwnerLeases() {
  const { leases, loading, error, fetchLeases, updateLeaseStatus } = useOwner();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchLeases({ page, status, limit: 10 });
  }, [fetchLeases, page, status]);

  const handleUpdateStatus = async (id, nextStatus) => {
    if (window.confirm(`Are you sure you want to mark this lease as ${nextStatus}? This will make the land available again.`)) {
      try {
        await updateLeaseStatus(id, nextStatus);
        alert(`Lease successfully ${nextStatus}!`);
        fetchLeases({ page, status, limit: 10 });
      } catch (err) {
        alert(err.message || 'Failed to update lease status');
      }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-700">Active Leases</h1>
          <p className="text-sm text-gray-500">View current lease contracts and payment statuses for your lands.</p>
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
            <div className="py-10 text-center text-gray-500">No active leases found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Land Title</th>
                  <th className="px-4 py-3 font-semibold">Seeker Name</th>
                  <th className="px-4 py-3 font-semibold">Start Date</th>
                  <th className="px-4 py-3 font-semibold">End Date</th>
                  <th className="px-4 py-3 font-semibold">Rent Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment Status</th>
                  <th className="px-4 py-3 font-semibold">Lease Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leases.data.map((lease) => (
                  <tr key={lease._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {lease.landId?.title || 'Land'}
                    </td>
                    <td className="px-4 py-3">{lease.seekerId?.fullName || '-'}</td>
                    <td className="px-4 py-3">{new Date(lease.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(lease.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{lease.rentAmount}/mo</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        lease.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {lease.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        lease.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        lease.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {lease.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {lease.status === 'active' ? (
                        <>
                          <Button
                            size="xs"
                            className="bg-lime-600 hover:bg-lime-700 text-white"
                            onClick={() => handleUpdateStatus(lease._id, 'completed')}
                          >
                            Complete
                          </Button>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleUpdateStatus(lease._id, 'terminated')}
                          >
                            Terminate
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 capitalize">Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
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

export default OwnerLeases;