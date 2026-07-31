import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../Layouts/UserLayout";
import { useUser } from "../../contexts/UserContext";
import { Button } from "flowbite-react";
import { resolveImageUrl } from "../../services/api";


function Dashboard() {
  const { dashboard, lands, loading, error, fetchDashboard, fetchLands } = useUser();
const [user, setUser] = useState(null); 

  useEffect(() => {
    fetchDashboard();
    fetchLands({ limit: 3 });
  }, [fetchDashboard, fetchLands]);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-lime-700 font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="mx-auto max-w-7xl p-6">
          <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || { pendingRequests: 0, activeLeases: 0, unpaidLeases: 0, totalSpent: 0 };
  const recent = dashboard?.recent || { requests: [], leases: [], transactions: [] };
  const recommendedLands = lands?.data || [];

  return (
    <>
      <div className="bg-lime-50 min-h-screen">
        <UserLayout />
        <div className="mx-auto max-w-7xl p-6">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                Welcome back, <span className="bg-gradient-to-r from-lime-600 to-emerald-500 bg-clip-text text-transparent">{user?.fullName || 'Seeker'}</span>
              </h1>
              <p className="mt-1 text-sm text-gray-500">Manage your plots, payments, and incoming leases here.</p>
            </div>
            <Link to="/user/browse">
              <Button className="bg-gradient-to-r from-lime-600 to-emerald-500 text-white font-semibold hover:opacity-90 shadow-md">
                Browse New Lands
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Leases</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-50 text-lime-600 font-bold">📄</div>
              </div>
              <h3 className="mt-4 text-3xl font-extrabold text-gray-900">{stats.activeLeases}</h3>
            </div>

            <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending Requests</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">⏳</div>
              </div>
              <h3 className="mt-4 text-3xl font-extrabold text-amber-600">{stats.pendingRequests}</h3>
            </div>

            <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Spent</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">💰</div>
              </div>
              <h3 className="mt-4 text-3xl font-extrabold text-emerald-600">
                ₹{stats.totalSpent.toLocaleString()}
              </h3>
            </div>

            <div className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Unpaid Leases</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-bold">⚠️</div>
              </div>
              <h3 className="mt-4 text-3xl font-extrabold text-rose-600">
                {stats.unpaidLeases}
              </h3>
            </div>
          </div>

          {/* Recommended Section */}
          <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Recommended Lands</h2>
                <p className="text-sm text-gray-500">Premium lands available for lease near you</p>
              </div>

              <Link to="/user/browse" className="text-sm font-bold text-lime-600 hover:text-lime-700 hover:underline">
                View all lands →
              </Link>
            </div>

            {/* Recommended grid */}
            {recommendedLands.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 py-10 text-center text-gray-500 font-medium">No recommended lands listed on the platform currently.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedLands.map((land) => (
                  <div
                    key={land._id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-100/30"
                  >
                    <img
                      src={resolveImageUrl(land.images?.[0])}
                      alt={land.title}
                      className="h-52 w-full object-cover"
                    />

                    <div className="flex flex-col p-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-lime-600">Land Listing</span>
                      <h3 className="mt-1 text-lg font-bold text-gray-900 line-clamp-1">{land.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">📍 {land.location}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-lime-50 px-2.5 py-1 text-xs font-semibold text-lime-700">
                          {land.area}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {land.minLeaseDuration}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          ₹{land.price.toLocaleString()}/mo
                        </span>
                      </div>

                      <Link to={`/lands/${land._id}`} className="mt-6">
                        <Button className="w-full bg-lime-500 text-white hover:bg-lime-600 font-bold rounded-xl py-2 shadow shadow-lime-100">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;