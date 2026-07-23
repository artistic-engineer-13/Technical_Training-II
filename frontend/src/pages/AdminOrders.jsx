import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { RiUserSharedLine, RiEyeLine, RiRefreshLine } from 'react-icons/ri';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals and selections states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders registry');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await API.get('/admin/delivery-partners');
      setPartners(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAssignModalClick = (order) => {
    setSelectedOrder(order);
    setSelectedPartnerId(order.deliveryPartnerId?._id || '');
    setShowAssignModal(true);
  };

  const handleAssignPartnerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      alert('Please select a delivery partner');
      return;
    }

    setAssignLoading(true);
    try {
      await API.put(`/orders/${selectedOrder._id}/assign-partner`, {
        deliveryPartnerId: selectedPartnerId,
      });
      setShowAssignModal(false);
      fetchOrders(); // Refresh table
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign partner');
    } finally {
      setAssignLoading(false);
    }
  };

  const openDetailsModalClick = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Processing':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Dispatched':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Out for Delivery':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Delivered':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Orders</h1>
        <button
          onClick={fetchOrders}
          className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500"
          title="Refresh Orders"
        >
          <RiRefreshLine />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 animate-pulse">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-20 bg-white rounded-3xl border">No orders placed.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 text-gray-400 text-xs font-bold uppercase">
                  <th className="p-4">Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Rider</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                    <td className="p-4 font-mono font-semibold text-xs">{ord.orderId}</td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="font-bold block">{ord.userId?.name || 'N/A'}</span>
                      <span className="text-[10px] text-gray-400">Phone: {ord.userId?.phone || 'N/A'}</span>
                    </td>
                    <td className="font-bold text-primary-500">Rs. {ord.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className="font-semibold block text-xs">{ord.paymentMethod}</span>
                      <span className={`text-[9px] font-bold uppercase ${ord.paymentStatus === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusClass(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td>
                      {ord.deliveryPartnerId ? (
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          🚴 {ord.deliveryPartnerId.name || 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openDetailsModalClick(ord)}
                          className="p-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-500 transition-colors"
                          title="View Details"
                        >
                          <RiEyeLine />
                        </button>
                        {ord.orderStatus !== 'Delivered' && ord.orderStatus !== 'Cancelled' && (
                          <button
                            onClick={() => openAssignModalClick(ord)}
                            className="p-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-indigo-500 transition-colors"
                            title="Assign Delivery Partner"
                          >
                            <RiUserSharedLine />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ASSIGN PARTNER MODAL ================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Assign Delivery Rider</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-950 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignPartnerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Select Delivery Partner</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm cursor-pointer"
                >
                  <option value="">Choose Rider</option>
                  {partners.map((partner) => (
                    <option key={partner._id} value={partner.userId._id}>
                      🚴 {partner.userId.name} ({partner.vehicleType} - {partner.isAvailable ? 'Available' : 'Busy'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-5 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all hover-scale"
                >
                  {assignLoading ? 'Assigning...' : 'Assign Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW DETAILS MODAL ================= */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl w-full max-w-lg shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Order Invoice Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-950 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Reference */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>Order Reference: <b>{selectedOrder.orderId}</b></span>
                <span>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Client Info */}
              <div className="border-t border-b border-gray-100 dark:border-gray-800 py-3 text-xs space-y-1">
                <span className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Info</span>
                <p>Name: {selectedOrder.userId?.name || 'N/A'}</p>
                <p>Email: {selectedOrder.userId?.email || 'N/A'}</p>
                <p>Phone: {selectedOrder.userId?.phone || 'N/A'}</p>
              </div>

              {/* Items details list */}
              <div className="space-y-2">
                <span className="block font-bold text-xs text-gray-400 uppercase tracking-wider">Line Items</span>
                {selectedOrder.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-medium text-gray-750 dark:text-gray-300">{item.name}</span>
                      <span className="text-gray-400 ml-1.5">x {item.quantity}</span>
                    </div>
                    <span className="font-bold">Rs. {item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount Code Applied</span>
                    <span>- Rs. {selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>Rs. {selectedOrder.deliveryCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (5%)</span>
                  <span>Rs. {selectedOrder.taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-sm">
                  <span>Grand Total Paid</span>
                  <span className="text-primary-500">Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping address details */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 text-xs leading-relaxed">
                <span className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Destination</span>
                <p className="font-semibold">{selectedOrder.shippingAddress?.name}</p>
                <p className="text-gray-500">{selectedOrder.shippingAddress?.streetAddress}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                <p className="text-gray-400 mt-1">Contact Phone: {selectedOrder.shippingAddress?.phone}</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
