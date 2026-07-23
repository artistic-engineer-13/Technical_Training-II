import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { RiCheckboxCircleFill, RiMapPinRangeLine, RiShieldKeyholeLine, RiDownloadCloudLine } from 'react-icons/ri';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time GPS rider location state
  const [riderLocation, setRiderLocation] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Handle Socket.io listening for rider location updates
  useEffect(() => {
    if (socket && orderId) {
      // Join the room for this order
      socket.emit('join_order_tracking', orderId);

      // Listen for coordinates update event
      socket.on('location_update', (locationData) => {
        setRiderLocation(locationData);
      });
    }

    return () => {
      if (socket) {
        socket.off('location_update');
      }
    };
  }, [socket, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!orderId) return;
    
    // Download directly from API endpoint
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}/invoice`;
    
    // Create temp anchor to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `invoice-${order?.orderId || 'order'}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 mt-4">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Something went wrong</h2>
        <p className="text-sm text-gray-500 mt-2">{error || 'Unable to load order details.'}</p>
        <Link to="/" className="text-primary-500 font-semibold hover:underline mt-4 inline-block">Return to Home</Link>
      </div>
    );
  }

  // Stepper calculations
  const steps = ['Received', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* 1. Success Message Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-center transition-all duration-200">
        <RiCheckboxCircleFill className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">Order Confirmed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Thank you for shopping with FreshCart. Your order has been registered and is being prepared.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg font-bold">
            Order ID: {order.orderId}
          </span>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600 font-bold"
          >
            <RiDownloadCloudLine className="w-4 h-4" /> Get PDF Invoice
          </button>
        </div>
      </div>

      {/* 2. OTP Verification Display (OTP delivery confirmation flag) */}
      {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
        <div className="bg-primary-50 dark:bg-primary-950/15 border border-primary-100 dark:border-primary-900/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RiShieldKeyholeLine className="w-8 h-8 text-primary-500 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold text-primary-800 dark:text-primary-400">Secure Handover OTP</span>
              <p className="text-xs text-primary-600 dark:text-primary-500/80 mt-0.5">
                Share this 6-digit passcode with the delivery partner upon arrival to confirm delivery.
              </p>
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-widest text-primary-500 px-6 py-2 border border-dashed border-primary-400 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
            {order.deliveryOTP}
          </span>
        </div>
      )}

      {/* 3. Live Order Tracking Status Stepper */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200">
        <h3 className="text-sm font-bold text-gray-950 dark:text-white mb-6">Delivery Tracking</h3>
        
        {order.orderStatus === 'Cancelled' ? (
          <div className="text-red-500 font-bold text-sm bg-red-50 dark:bg-red-950/15 p-4 rounded-xl text-center">
            ❌ This order was Cancelled.
          </div>
        ) : (
          <div className="relative">
            {/* Horizontal Line path */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-gray-100 dark:bg-gray-800 -z-10 rounded">
              <div
                className="h-full bg-primary-500 rounded transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* Steps Row */}
            <div className="flex justify-between items-center text-center">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-950/40'
                        : isCompleted
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-semibold mt-2.5 ${
                      isActive ? 'text-primary-500 font-bold' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Real-time GPS Tracker Panel */}
      {order.orderStatus === 'Out for Delivery' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-4">
          <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
            <RiMapPinRangeLine className="text-primary-500 w-5 h-5" /> Live GPS Tracker
          </h3>
          
          <div className="border border-primary-100 bg-primary-50/10 rounded-2xl p-4 flex items-center gap-4 text-sm">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
              🚴
            </div>
            <div>
              {riderLocation ? (
                <>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Rider is en route to your address</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Live GPS coordinates: {riderLocation.latitude.toFixed(6)}, {riderLocation.longitude.toFixed(6)}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Waiting for live location stream...</p>
                  <p className="text-xs text-gray-400 mt-0.5">Live tracking will begin once your rider shares GPS coordinates.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Summary invoice detail list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 text-sm space-y-4">
        <h3 className="font-bold text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Order Details</h3>
        
        {/* Items mapping */}
        <div className="divide-y divide-gray-50 dark:divide-gray-850">
          {order.items.map((item) => (
            <div key={item._id} className="py-2.5 flex justify-between">
              <div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                <span className="text-gray-400 text-xs ml-1.5">x {item.quantity}</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Rs. {item.subtotal}</span>
            </div>
          ))}
        </div>

        {/* Pricing Summary list */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2.5 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {order.subtotal.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-500 font-semibold">
              <span>Promo Discount</span>
              <span>- Rs. {order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>Rs. {order.deliveryCharges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST Tax (5%)</span>
            <span>Rs. {order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-sm font-bold text-gray-950 dark:text-white">
            <span>Grand Total Paid</span>
            <span className="text-primary-500">Rs. {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover-scale"
        >
          Return to Storefront
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
