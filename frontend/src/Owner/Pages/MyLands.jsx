import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useOwner } from '../../contexts/OwnerContext';
import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';

function MyLands() {
  const { lands, loading, error, fetchLands, deleteLand } = useOwner();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLands({ page, limit: 9 });
  }, [fetchLands, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteLand(id);
        fetchLands({ page, limit: 9 });
      } catch (err) {
        alert(err.message || 'Failed to delete listing');
      }
    }
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">My Lands</h1>
            <p className="text-sm text-gray-500">Manage your listed lands and see their current status.</p>
          </div>
          <Link to="/owner/lands/new">
            <Button className="bg-lime-600 hover:bg-lime-700 text-white font-semibold">
              + Add New Listing
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-lime-600 font-medium">Loading your listings...</div>
        ) : lands.data.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">You haven't listed any lands yet.</p>
            <Link to="/owner/lands/new" className="mt-4 inline-block">
              <Button size="sm" className="bg-lime-600 text-white hover:bg-lime-700">
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lands.data.map((land) => (
                <div
                  key={land._id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <img
                    src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'}
                    alt={land.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{land.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">📍 {land.location}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {land.area}
                      </span>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {land.minLeaseDuration}
                      </span>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        ₹{land.price}/mo
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        land.status === 'available' ? 'bg-green-100 text-green-800' :
                        land.status === 'leased' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {land.status}
                      </span>

                      <div className="flex gap-2">
                        <Link to={`/owner/lands/${land._id}/edit`}>
                          <Button size="xs" color="gray">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="xs"
                          color="failure"
                          disabled={land.status === 'leased'}
                          onClick={() => handleDelete(land._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            {lands.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Page {lands.page} of {lands.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={lands.page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    disabled={lands.page === lands.totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyLands;