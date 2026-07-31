import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { apiFetch } from '../../services/api';
import ThemeToggle from '../../Components/common/ThemeToggle.jsx';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });
      setSuccessMsg(res.message || 'Reset token generated');
      if (res.resetToken) {
        setResetToken(res.resetToken); // Store token directly since it is demo mode
      }
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: { resetToken, password: newPassword }
      });
      alert('Password reset successful! Redirecting to login...');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* Left Banner */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=70"
          alt="Land"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-3xl font-semibold">Security first. Simple access.</h2>
          <p className="mt-2 max-w-sm">Easily restore your LandEase password through our secure verification system.</p>
        </div>
      </div>

      {/* Right Content Form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-semibold text-lime-500">Reset Password</h1>
          <p className="mb-6 text-sm text-gray-500">
            {step === 1 ? 'Enter your registered email to request a reset token.' : 'Provide the verification token and your new password.'}
          </p>

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

          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleRequestToken}>
              <div>
                <label className="mb-2 block text-sm font-medium text-lime-700">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border p-2 text-sm focus:border-lime-500 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-lg bg-lime-500 py-2 text-white hover:bg-lime-700">
                {loading ? 'Requesting...' : 'Request Reset Token'}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label className="mb-2 block text-sm font-medium text-lime-700">Reset Token (Demo Mode)</label>
                <input
                  type="text"
                  placeholder="Paste or enter token"
                  className="w-full rounded-lg border p-2 text-sm focus:border-lime-500 focus:outline-none"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-lime-700">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border p-2 text-sm focus:border-lime-500 focus:outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  // minLength={6}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-lg bg-lime-500 py-2 text-white hover:bg-lime-700">
                {loading ? 'Resetting Password...' : 'Change Password'}
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-2 block w-full text-center text-xs text-lime-600 hover:underline"
              >
                Back to Request Token
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-lime-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;