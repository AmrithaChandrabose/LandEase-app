import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useOwner } from '../../contexts/OwnerContext';
import { Button } from 'flowbite-react';

function OwnerRequests() {
  const { requests, loading, error, fetchRequests, updateRequestStatus } = useOwner();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchRequests({ page, status, limit: 10 });
  }, [fetchRequests, page, status]);

  const handleUpdateStatus = async (id, statusVal) => {
    try {
      await updateRequestStatus(id, { status: statusVal });
      alert(`Request successfully ${statusVal}!`);
      fetchRequests({ page, status, limit: 10 });
    } catch (err) {
      alert(err.message || 'Failed to update request status');
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
          <h1 className="text-3xl font-bold text-lime-700">Incoming Lease Requests</h1>
          <p className="text-sm text-gray-500">Review requests from seekers who want to lease your land.</p>
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

        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {loading ? (
            <div className="py-10 text-center text-lime-600 font-medium">Loading incoming requests...</div>
          ) : requests.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No incoming lease requests found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Seeker Name</th>
                  <th className="px-4 py-3 font-semibold">Land Title</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold">Requested On</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.data.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {req.seekerId?.fullName || 'Seeker'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{req.landId?.title || 'Land'}</td>
                    <td className="px-4 py-3">{req.requestedDuration}</td>
                    <td className="px-4 py-3 text-gray-600 italic">
                      "{req.message || 'No message provided'}"
                    </td>
                    <td className="px-4 py-3">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        req.status === 'approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <Button
                            size="xs"
                            className="bg-lime-600 hover:bg-lime-700 text-white"
                            onClick={() => handleUpdateStatus(req._id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleUpdateStatus(req._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 capitalize">Processed</span>
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
  );
}

export default OwnerRequests;