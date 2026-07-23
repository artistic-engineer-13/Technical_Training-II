import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { RiFileListLine, RiDownloadCloudLine, RiMapPinRangeLine, RiCloseCircleLine } from 'react-icons/ri';

const OrdersHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This will restore catalog inventory.')) {
      try {
        await API.put(`/orders/${orderId}/cancel`);
        // Refresh orders list
        fetchOrderHistory();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to cancel order');
      }
    }
  };

  const handleDownloadInvoice = (orderId, filename) => {
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}/invoice`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `invoice-${filename}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Dispatched':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Out for Delivery':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 mt-4">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
        <RiFileListLine className="text-primary-500 w-6 h-6" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders History</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No orders placed yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
            You haven't placed any orders in our store. Browse items and checkout your first basket!
          </p>
          <Link
            to="/"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover-scale"
          >
            Go to Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200"
            >
              {/* Header card info */}
              <div className="bg-gray-50 dark:bg-gray-850 p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 dark:border-gray-800 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Order Placed</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Total Bill</span>
                  <p className="font-bold text-primary-500">Rs. {order.totalAmount.toFixed(2)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Status</span>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400 block sm:text-right">Reference</span>
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-150 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {order.orderId}
                  </span>
                </div>
              </div>

              {/* Items details list */}
              <div className="p-4 sm:px-6 divide-y divide-gray-50 dark:divide-gray-850">
                {order.items.map((item) => (
                  <div key={item._id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                      <span className="text-xs text-gray-400 ml-2">x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">Rs. {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons row */}
              <div className="bg-gray-50/50 dark:bg-gray-850/50 p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center flex-wrap gap-3">
                
                {/* Download PDF receipt link */}
                <button
                  onClick={() => handleDownloadInvoice(order._id, order.orderId)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-500 font-semibold"
                >
                  <RiDownloadCloudLine className="w-4 h-4" /> Download PDF Invoice
                </button>

                <div className="flex gap-2">
                  {/* Cancellation Action (only shown in initial phases) */}
                  {(order.orderStatus === 'Received' || order.orderStatus === 'Processing') && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-200 dark:border-red-800/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <RiCloseCircleLine /> Cancel Order
                    </button>
                  )}

                  {/* Dynamic tracking status page */}
                  <Link
                    to={`/order-success?orderId=${order._id}`}
                    className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all hover-scale"
                  >
                    <RiMapPinRangeLine /> Track Order
                  </Link>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;
