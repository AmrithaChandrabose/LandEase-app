import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from 'flowbite-react';

function LandListingsManagement() {
  const { lands, loading, error, fetchLands, updateLandStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLands({ search, status, page, limit: 10 });
  }, [fetchLands, search, status, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await updateLandStatus(id, nextStatus);
    } catch (err) {
      alert(err.message || 'Failed to update land listing status');
    }
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-700">Land Listings Management</h1>
          <p className="text-sm text-gray-500">Moderate and manage all land listings on the platform.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search by title, location or description..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm sm:max-w-xs focus:border-lime-500 focus:outline-none"
          />
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="leased">Leased</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Listings Table */}
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {loading ? (
            <div className="py-10 text-center text-lime-600">Loading listings...</div>
          ) : lands.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No land listings found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lands.data.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{l.title}</td>
                    <td className="px-4 py-3">📍 {l.location}</td>
                    <td className="px-4 py-3">{l.area}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{l.price}/mo</td>
                    <td className="px-4 py-3">{l.ownerId?.fullName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        l.status === 'available' ? 'bg-green-100 text-green-800' :
                        l.status === 'leased' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status !== 'leased' && (
                        <Button
                          size="xs"
                          color={l.status === 'available' ? 'warning' : 'success'}
                          onClick={() => handleToggleStatus(l._id, l.status)}
                        >
                          {l.status === 'available' ? 'Make Unavailable' : 'Make Available'}
                        </Button>
                      )}
                      {l.status === 'leased' && (
                        <span className="text-xs text-gray-400">Cannot modify while leased</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && lands.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {lands.page} of {lands.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={lands.page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={lands.page === lands.totalPages}
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

export default LandListingsManagement;