import React, { useEffect, useState } from 'react'
import UserLayout from '../../Layouts/UserLayout'
import LandSearchFilter from "../../Components/common/LandSearchFilter";
import { Button } from 'flowbite-react';
import { useUser } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../services/api';

function BrowseLands() {
  const { lands, loading, error, fetchLands } = useUser();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchLands({ page, limit: 9, ...filters });
  }, [fetchLands, page, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset page on filter change
  };

  return (
    <div className="bg-lime-50 min-h-screen">
      <UserLayout />

      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-700">Browse Lands</h1>
          <LandSearchFilter onFilter={handleFilterChange} />
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-lime-600 font-medium">Loading lands...</div>
        ) : (
          <>
            {lands.data.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No lands available at the moment.</div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {lands.data.map((land) => (
                  <div
                    key={land._id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <img
                      src={resolveImageUrl(land.images?.[0]) || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'}
                      alt={land.title}
                      className="h-48 w-full object-cover"
                    />

                    <div className="flex flex-col p-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {land.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        📍 {land.location}
                      </p>

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

                      <Link to={`/lands/${land._id}`}>
                        <Button
                          size="sm"
                          className="mt-5 w-full bg-lime-500 px-5 py-2 text-white hover:bg-lime-600"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
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
  )
}

export default BrowseLands;