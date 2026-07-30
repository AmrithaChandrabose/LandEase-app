import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Button } from 'flowbite-react';

function PaymentError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = useUser();
  const transactionId = searchParams.get('transactionId');
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;

    if (transactionId) {
      verifyPayment({
        transactionId,
        success: false
      }).catch(err => console.error('Failed to cancel transaction:', err));
    }
  }, [transactionId, verifyPayment]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-md border border-red-100 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border border-red-200 shadow-md shadow-red-100/50 mx-auto">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Payment Cancelled</h2>
        <p className="mt-2 text-sm text-gray-500">Your transaction has been cancelled. No charges were made.</p>

        <p className="mt-4 text-xs text-gray-400 max-w-xs leading-relaxed mx-auto">
          You can try paying again from your leases dashboard. If you encountered an issue on Stripe Checkout, please try a different payment method.
        </p>

        <div className="mt-8 w-full">
          <Button
            onClick={() => navigate('/user/leases')}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-red-200"
          >
            Return to Active Leases
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentError;
