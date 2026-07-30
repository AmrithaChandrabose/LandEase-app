import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from 'flowbite-react';

function UsersManagement({ role = 'user' }) {
  const { users, loading, error, fetchUsers, updateUserStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers({ role, search, status, page, limit: 10 });
  }, [fetchUsers, role, search, status, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset page on search
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1); // Reset page on filter
  };

  const handleToggleStatus = async (id, currentActive) => {
    try {
      await updateUserStatus(id, !currentActive);
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700 capitalize">
              {role === 'user' ? 'Seeker Management' : 'Owner Management'}
            </h1>
            <p className="text-sm text-gray-500">
              View and manage {role === 'user' ? 'seekers' : 'landowners'} registered on the platform.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
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
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {loading ? (
            <div className="py-10 text-center text-lime-600">Loading user accounts...</div>
          ) : users.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No users found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Registered On</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.data.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{u.fullName}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="xs"
                        color={u.isActive ? 'failure' : 'success'}
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Block' : 'Unblock'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && users.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {users.page} of {users.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={users.page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={users.page === users.totalPages}
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

export default UsersManagement;