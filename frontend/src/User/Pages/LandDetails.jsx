import React, { useEffect, useState } from 'react';
import UserLayout from "../../Layouts/UserLayout";
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from 'flowbite-react';

function LandDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { landDetails, loading, error, fetchLandDetails, createRequest } = useUser();
  const navigate = useNavigate();

  const [requestedDuration, setRequestedDuration] = useState('12 Months');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLandDetails(id);
    }
  }, [id, fetchLandDetails]);

  const handleRequestLease = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      await createRequest({
        landId: landDetails.land._id,
        requestedDuration,
        message
      });
      setSubmitSuccess(true);
      setMessage('');
      fetchLandDetails(id); // Reload state to update request state
    } catch (err) {
      alert(err.message || 'Failed to submit lease request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !landDetails) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-lime-700 font-medium">Loading Land Details...</p>
        </div>
      </div>
    );
  }

  if (error || !landDetails) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="mx-auto max-w-7xl p-6">
          <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error || 'Land not found'}
          </div>
        </div>
      </div>
    );
  }

  const { land, myRequest } = landDetails;

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-5xl p-6">
        
        {/* Land Banner */}
        <div className="relative mb-8 h-96 overflow-hidden rounded-2xl shadow-md">
          <img
            src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'}
            alt={land.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-6 left-6 text-white">
            <span className="inline-flex rounded-full bg-lime-500 px-3 py-1 text-xs font-semibold uppercase text-white">
              {land.status}
            </span>
            <h1 className="mt-2 text-3xl font-bold">{land.title}</h1>
            <p className="mt-1 text-sm">📍 {land.location}</p>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">About this land</h2>
              <p className="text-gray-600 leading-relaxed">{land.description || 'No description provided.'}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase">Area Size</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{land.area}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase">Min Lease</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{land.minLeaseDuration}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase">Rate</p>
                <p className="mt-1 text-lg font-bold text-lime-600">₹{land.price}/mo</p>
              </div>
            </div>

            {land.ownerId && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Owner Contact Details</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold text-gray-800">Name:</span> {land.ownerId.fullName}</p>
                  <p><span className="font-semibold text-gray-800">Email:</span> {land.ownerId.email}</p>
                  <p><span className="font-semibold text-gray-800">Phone:</span> {land.ownerId.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lease Request Panel */}
          <div>
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Lease Request Form</h2>
              
              {land.status !== 'available' ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  This land is currently unavailable or already leased.
                </p>
              ) : user?.role === 'owner' ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Owners cannot request leases on lands.
                </p>
              ) : myRequest ? (
                <div className="text-center py-4">
                  <p className="text-sm font-semibold text-lime-700 mb-2">Request already submitted!</p>
                  <p className="text-xs text-gray-500">Current request status: <span className="font-bold capitalize">{myRequest.status}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Submitted on {new Date(myRequest.createdAt).toLocaleDateString()}</p>
                </div>
              ) : submitSuccess ? (
                <div className="text-center py-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">Request Submitted!</p>
                  <p className="text-xs text-gray-500">Wait for the owner to review and approve your proposal.</p>
                </div>
              ) : (
                <form onSubmit={handleRequestLease} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Lease Duration</label>
                    <select
                      value={requestedDuration}
                      onChange={(e) => setRequestedDuration(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                    >
                      <option value="6 Months">6 Months</option>
                      <option value="12 Months">12 Months</option>
                      <option value="24 Months">24 Months</option>
                      <option value="36 Months">36 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Propose Message</label>
                    <textarea
                      placeholder="Hi, I am interested in leasing your land for organic farming..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                      rows="4"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg py-2"
                  >
                    {submitting ? 'Submitting Request...' : token ? 'Request Lease' : 'Login to Request'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LandDetails;