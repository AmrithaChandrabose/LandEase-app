import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from 'flowbite-react';

function Settings() {
  const { settings, fetchSettings, updateSettings, loading, error } = useAdmin();
  const [siteName, setSiteName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [commissionPercent, setCommissionPercent] = useState(0);
  const [emailEnabled, setEmailEnabled] = useState(true);
  
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.general?.siteName || '');
      setCurrencySymbol(settings.general?.currencySymbol || '');
      setMaintenanceMode(settings.general?.maintenanceMode || false);
      setAllowRegistration(settings.platform?.allowRegistration ?? true);
      setCommissionPercent(settings.platform?.commissionPercent || 0);
      setEmailEnabled(settings.notifications?.emailEnabled ?? true);
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    try {
      await updateSettings({
        general: { siteName, currencySymbol, maintenanceMode },
        platform: { allowRegistration, commissionPercent: Number(commissionPercent) },
        notifications: { emailEnabled }
      });
      setSuccessMsg('Settings updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-700">Platform Settings</h1>
          <p className="text-sm text-gray-500">Configure core branding, UI themes, commissions, and access guidelines.</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        {loading ? (
          <p className="text-lime-600 text-center font-medium">Loading settings...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900 border-b pb-2">General Config</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Site Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 text-sm font-medium text-gray-700">
                    Maintenance Mode
                  </label>
                </div>
              </div>
            </div>

            {/* Platform Settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900 border-b pb-2">Platform Controls</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    checked={allowRegistration}
                    onChange={(e) => setAllowRegistration(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                  />
                  <label htmlFor="allowRegistration" className="ml-2 text-sm font-medium text-gray-700">
                    Allow New Registrations
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Commission Percent (%)</label>
                  <input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notifications Settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900 border-b pb-2">Notifications</h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailEnabled"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                />
                <label htmlFor="emailEnabled" className="ml-2 text-sm font-medium text-gray-700">
                  Email Notifications Enabled
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={updating}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg py-2"
            >
              {updating ? 'Saving Settings...' : 'Save Settings'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Settings;