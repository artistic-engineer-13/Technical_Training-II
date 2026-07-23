import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { RiCloseCircleFill, RiArrowLeftRightLine, RiShoppingBagLine } from 'react-icons/ri';

const OrderFailed = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-center transition-all duration-200">
        <RiCloseCircleFill className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-950 dark:text-white">Payment Failed</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Unfortunately, we couldn't process your transaction. No funds were debited from your account.
        </p>

        {orderId && (
          <div className="mt-4 inline-block bg-red-50 dark:bg-red-950/15 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs px-3 py-1.5 rounded-lg font-bold">
            Order Reference: {orderId}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Link
            to="/cart"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all hover-scale flex items-center justify-center gap-2"
          >
            <RiArrowLeftRightLine /> Review Cart & Retry
          </Link>
          
          <Link
            to="/"
            className="w-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <RiShoppingBagLine /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderFailed;
