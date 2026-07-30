import React, { useEffect, useState } from 'react'
import UserLayout from '../../Layouts/UserLayout'
import { useUser } from '../../contexts/UserContext';
import { Button } from 'flowbite-react';

function LeaseRequests() {
  const { requests, loading, error, fetchRequests, cancelRequest } = useUser();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchRequests({ page, status, limit: 10 });
  }, [fetchRequests, page, status]);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pending lease request?')) {
      try {
        await cancelRequest(id);
        alert('Request cancelled successfully.');
        fetchRequests({ page, status, limit: 10 });
      } catch (err) {
        alert(err.message || 'Failed to cancel request');
      }
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'approved':
        return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Approved</span>;
      case 'rejected':
        return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Rejected</span>;
      default:
        return <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">Pending</span>;
    }
  };

  return (
    <div>
      <div className="bg-lime-50 min-h-screen">
        <UserLayout />
        <div className="mx-auto max-w-7xl p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-lime-700">
              My Lease Requests
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's an overview of your land leasing activities.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <select
              value={status}
              onChange={handleStatusFilterChange}
              className="rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* request table */}
          <div className="overflow-x-auto rounded-xl bg-white shadow-xl">
            {loading ? (
              <div className="py-10 text-center text-lime-600 font-medium">Loading requests...</div>
            ) : requests.data.length === 0 ? (
              <div className="py-10 text-center text-gray-500">You haven't made any lease requests yet.</div>
            ) : (
              <table className="w-full text-left text-sm ">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 font-semibold text-lime-700">Land</th>
                    <th className="px-4 py-3 font-semibold text-lime-700">Location</th>
                    <th className="px-4 py-3 font-semibold text-lime-700">Duration</th>
                    <th className="px-4 py-3 font-semibold text-lime-700">Owner</th>
                    <th className="px-4 py-3 font-semibold text-lime-700">Requested On</th>
                    <th className="px-4 py-3 font-semibold text-lime-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-lime-700">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.data.map((req) => (
                    <tr key={req._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{req.landId?.title || 'Unknown Land'}</td>
                      <td className="px-4 py-3">{req.landId?.location || '-'}</td>
                      <td className="px-4 py-3">{req.requestedDuration}</td>
                      <td className="px-4 py-3">{req.ownerId?.fullName || '-'}</td>
                      <td className="px-4 py-3">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-4 py-3">
                        {req.status === 'pending' ? (
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleCancel(req._id)}
                          >
                            Cancel
                          </Button>
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
          {!loading && requests.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Page {requests.page} of {requests.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={requests.page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  disabled={requests.page === requests.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default LeaseRequests;