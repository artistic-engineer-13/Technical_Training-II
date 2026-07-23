import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { RiFileList3Line, RiShieldKeyholeLine, RiMapPinRangeLine, RiSmartphoneLine, RiMapPinLine } from 'react-icons/ri';

const DeliveryDashboard = () => {
  const { socket } = useSocket();

  const [partner, setPartner] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // GPS coordinates emulator state (Centered around Bangalore by default)
  const [simulatedLat, setSimulatedLat] = useState(12.971598);
  const [simulatedLng, setSimulatedLng] = useState(77.594562);

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      const response = await API.get('/delivery/tasks');
      setPartner(response.data.data.partner);
      setTasks(response.data.data.tasks);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch delivery logs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/delivery/tasks/${orderId}`, { status: newStatus });
      fetchDeliveryData(); // Refresh tasks
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleOtpVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length !== 6) {
      alert('Please enter a valid 6-digit OTP code');
      return;
    }

    setOtpLoading(true);
    try {
      await API.put(`/delivery/tasks/${selectedTask._id}`, {
        status: 'Delivered',
        otp: otpInput,
      });
      setShowOtpModal(false);
      setOtpInput('');
      fetchDeliveryData(); // Refresh tasks
    } catch (err) {
      alert(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleToggleDutyStatus = async () => {
    try {
      await API.put('/delivery/status', {
        isAvailable: !partner.isAvailable,
      });
      fetchDeliveryData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  // Broadcast GPS Coordinates Simulator over Websockets
  const handleSimulateGPSMove = (orderId, latOffset, lngOffset) => {
    const nextLat = Number((simulatedLat + latOffset).toFixed(6));
    const nextLng = Number((simulatedLng + lngOffset).toFixed(6));
    
    setSimulatedLat(nextLat);
    setSimulatedLng(nextLng);

    if (socket) {
      // Emit live coordinate update event to order room channel
      socket.emit('update_location', {
        orderId,
        latitude: nextLat,
        longitude: nextLng,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 mt-4 animate-pulse">Loading rider console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header and Duty Status details */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-950 dark:text-white">Rider Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, {partner?.userId?.name || 'Rider'}</p>
        </div>

        {/* Availability Toggle */}
        <button
          onClick={handleToggleDutyStatus}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all hover-scale ${
            partner?.isAvailable
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          Duty Status: {partner?.isAvailable ? '🟢 Online (Available)' : '🔴 Offline (Busy)'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 2. Tasks Catalog */}
      <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <RiFileList3Line className="text-primary-500" /> Active Shipments ({tasks.length})
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl transition-colors text-sm">
          <span className="text-5xl block mb-4">🚴🛌</span>
          <h3 className="font-bold text-gray-900 dark:text-white">No deliveries assigned</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Check back when you toggle duty to Available!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200 p-6 space-y-6"
            >
              
              {/* Task Header info */}
              <div className="flex justify-between items-start border-b border-gray-50 dark:border-gray-850 pb-4 flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400">Order Reference</span>
                  <p className="font-bold font-mono text-gray-800 dark:text-gray-200 mt-0.5">{task.orderId}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block text-right">Payment</span>
                  <p className="font-semibold text-right text-xs">
                    {task.paymentMethod} (Rs. {task.totalAmount})
                  </p>
                  <span className={`text-[9px] font-bold block text-right uppercase ${
                    task.paymentStatus === 'Completed' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {task.paymentStatus}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block text-right">Order Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 bg-yellow-50 text-yellow-700 border-yellow-200">
                    {task.orderStatus}
                  </span>
                </div>
              </div>

              {/* Shipping address details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-sm">
                <div className="space-y-3">
                  <span className="block font-bold text-xs text-gray-400 uppercase tracking-wider">Recipient Details</span>
                  <div className="space-y-1 bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl leading-relaxed">
                    <p className="font-bold text-gray-850 dark:text-gray-150">{task.shippingAddress?.name}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {task.shippingAddress?.streetAddress}, {task.shippingAddress?.city}, {task.shippingAddress?.state} - {task.shippingAddress?.pincode}
                    </p>
                    <p className="text-xs text-primary-500 font-semibold flex items-center gap-1 mt-2.5">
                      <RiSmartphoneLine /> Call Customer: {task.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* State changes & GPS Emulator */}
                <div className="space-y-4">
                  <span className="block font-bold text-xs text-gray-400 uppercase tracking-wider"> RIDER ACTIONS</span>
                  
                  {/* Status transitions */}
                  {task.orderStatus === 'Dispatched' && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, 'Out for Delivery')}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-bold transition-all hover-scale"
                    >
                      🚲 Start Delivery Route (Mark Out for Delivery)
                    </button>
                  )}

                  {task.orderStatus === 'Out for Delivery' && (
                    <div className="space-y-3">
                      
                      {/* Secure OTP Input Trigger */}
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowOtpModal(true);
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all hover-scale flex justify-center items-center gap-2 shadow-sm"
                      >
                        <RiShieldKeyholeLine className="w-5 h-5" /> Arrived - Verify OTP to Finalize
                      </button>

                      {/* Interactive coordinates emulator panel */}
                      <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 space-y-3 text-xs">
                        <span className="font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1">
                          <RiMapPinRangeLine /> GPS Location Simulator
                        </span>
                        <p className="text-gray-500 leading-relaxed">
                          Simulate riding movement by modifying coordinate offsets. This streams updates dynamically to the client tracking interface.
                        </p>
                        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border font-mono">
                          <span>Lat: {simulatedLat}</span>
                          <span>Lng: {simulatedLng}</span>
                        </div>
                        {/* Simulation directional offsets buttons grid */}
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => handleSimulateGPSMove(task._id, 0.0005, 0)}
                            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 hover:bg-indigo-200 py-1 rounded font-bold"
                          >
                            North (↑)
                          </button>
                          <button
                            onClick={() => handleSimulateGPSMove(task._id, -0.0005, 0)}
                            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 hover:bg-indigo-200 py-1 rounded font-bold"
                          >
                            South (↓)
                          </button>
                          <button
                            onClick={() => handleSimulateGPSMove(task._id, 0, 0.0005)}
                            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 hover:bg-indigo-200 py-1 rounded font-bold"
                          >
                            East (→)
                          </button>
                          <button
                            onClick={() => handleSimulateGPSMove(task._id, 0, -0.0005)}
                            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 hover:bg-indigo-200 py-1 rounded font-bold"
                          >
                            West (←)
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {task.orderStatus === 'Delivered' && (
                    <span className="block text-center font-bold text-green-500 bg-green-50 py-2 rounded-xl text-xs">
                      ✔ Order successfully delivered.
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ================= OTP VERIFICATION MODAL ================= */}
      {showOtpModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
                <RiShieldKeyholeLine className="text-primary-500" /> Verify Handover OTP
              </h3>
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-gray-400 hover:text-gray-950 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOtpVerifySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Enter 6-digit Customer OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center text-2xl tracking-widest font-extrabold px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-5 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all hover-scale"
                >
                  {otpLoading ? 'Verifying...' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryDashboard;
