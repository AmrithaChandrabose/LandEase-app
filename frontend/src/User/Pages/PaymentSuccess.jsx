import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Button } from 'flowbite-react';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = useUser();
  
  const sessionId = searchParams.get('session_id');
  const transactionId = searchParams.get('transactionId');
  
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const performVerification = async () => {
      if (!transactionId || !sessionId) {
        setStatus('error');
        setErrorMsg('Missing required session or transaction parameters.');
        return;
      }

      try {
        const response = await verifyPayment({
          transactionId,
          success: true,
          stripeSessionId: sessionId,
        });

        if (response && response.transaction && response.transaction.status === 'success') {
          setPaymentData(response.transaction);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(response?.message || 'Verification failed. Stripe session unpaid.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.message || 'An error occurred during verification.');
      }
    };

    performVerification();
  }, [transactionId, sessionId, verifyPayment]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lime-50 via-white to-emerald-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-md border border-lime-100 text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-lime-100 border-t-lime-600"></div>
            <h2 className="mt-6 text-xl font-bold text-gray-800">Verifying Payment</h2>
            <p className="mt-2 text-sm text-gray-500">Please wait while we secure your lease payment details...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 shadow-md shadow-emerald-100/50 animate-pulse">
              <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-gray-900 tracking-tight">Payment Successful!</h2>
            <p className="mt-2 text-sm text-lime-700 font-medium">Your lease rent has been paid successfully.</p>

            <div className="mt-6 w-full rounded-xl border border-gray-100 bg-gray-50/50 p-5 text-left text-sm text-gray-600 space-y-3">
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="font-medium text-gray-500">Land Title</span>
                <span className="font-semibold text-gray-800">{paymentData?.leaseId?.landId?.title || 'Land Listing'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="font-medium text-gray-500">Location</span>
                <span className="font-semibold text-gray-800">{paymentData?.leaseId?.landId?.location || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="font-medium text-gray-500">Amount Paid</span>
                <span className="font-bold text-lime-700 text-base">₹{paymentData?.amount?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="font-medium text-gray-500">Owner Name</span>
                <span className="font-semibold text-gray-800">{paymentData?.receiverId?.fullName || '-'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-medium text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs text-gray-400 select-all">{paymentData?._id}</span>
              </div>
            </div>

            <div className="mt-8 w-full">
              <Button
                onClick={() => navigate('/user/leases')}
                className="w-full bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-lime-200"
              >
                Go to Active Leases
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border border-red-200 shadow-md shadow-red-100/50">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-red-600 font-semibold">{errorMsg || 'We could not confirm your payment.'}</p>

            <p className="mt-4 text-xs text-gray-400 max-w-xs leading-relaxed">
              If you believe this was an error, please check your bank account or contact support with the transaction reference.
            </p>

            <div className="mt-8 w-full">
              <Button
                onClick={() => navigate('/user/leases')}
                color="light"
                className="w-full font-semibold border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back to Active Leases
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
