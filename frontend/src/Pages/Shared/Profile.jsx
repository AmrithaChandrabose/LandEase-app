import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from 'flowbite-react';

function Profile() {
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updates = { fullName, phone, profileImage };
      if (password) {
        updates.password = password;
      }
      await updateProfile(updates);
      setSuccessMsg('Profile updated successfully!');
      setPassword(''); // Clear password field
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-700">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your personal settings, contact details, and account security.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-lime-500 text-white flex items-center justify-center font-bold text-2xl uppercase shadow">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{user?.fullName || 'User'}</h3>
                <p className="text-xs text-gray-500 capitalize font-medium bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full inline-block mt-1">
                  Role: {user?.role}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email Address (Read Only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 p-2 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Profile Image URL</label>
                <input
                  type="url"
                  // placeholder="https://example.com/image.jpg"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Change Password</h3>
              <label className="mb-1 block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
              <input
                type="password"
                // placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
               
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg py-2 pt-3"
            >
              {loading ? 'Updating Profile...' : 'Save Profile Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;