import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { RiDeleteBin5Line, RiAddCircleLine, RiRefreshLine, RiCoupon2Line } from 'react-icons/ri';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Creation modal states
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      minOrderValue: 0,
      usageLimit: 100,
    },
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await API.get('/coupons');
      setCoupons(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to remove this coupon campaign?')) {
      try {
        await API.delete(`/coupons/${couponId}`);
        fetchCoupons(); // Refresh table
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to remove coupon');
      }
    }
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    try {
      await API.post('/coupons', {
        ...data,
        code: data.code.toUpperCase(),
      });
      setShowModal(false);
      reset();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create coupon campaign');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <RiCoupon2Line className="text-primary-500 w-7 h-7" /> Manage Coupons
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchCoupons}
            className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500"
            title="Refresh Coupons"
          >
            <RiRefreshLine />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all hover-scale"
          >
            <RiAddCircleLine /> Add Coupon
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 animate-pulse">Loading coupon list...</p>
        </div>
      ) : coupons.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-20 bg-white rounded-3xl border">No coupon campaigns configured.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 text-gray-400 text-xs font-bold uppercase">
                  <th className="p-4">Coupon Code</th>
                  <th>Discount Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Expiry Date</th>
                  <th>Usage (Used/Limit)</th>
                  <th>Active</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {coupons.map((c) => {
                  const isExpired = new Date() > new Date(c.expiryDate);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                      <td className="p-4 font-mono font-bold text-gray-800 dark:text-gray-200">
                        {c.code}
                      </td>
                      <td>{c.discountType}</td>
                      <td className="font-bold">
                        {c.discountType === 'Percentage' ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}
                      </td>
                      <td>Rs. {c.minOrderValue}</td>
                      <td>
                        <span className={`text-xs ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                          {new Date(c.expiryDate).toLocaleDateString()} {isExpired && '(Expired)'}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold">{c.usedCount}</span> / {c.usageLimit}
                      </td>
                      <td>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.isActive && !isExpired ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {c.isActive && !isExpired ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="p-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete Coupon"
                        >
                          <RiDeleteBin5Line />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= CREATE NEW COUPON MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create Coupon Campaign</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-950 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Coupon Code</label>
                <input
                  type="text"
                  {...register('code', { required: 'Coupon code is required' })}
                  placeholder="PROMO50"
                  className="w-full uppercase px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm font-semibold"
                />
                {errors.code && <p className="text-red-500 text-[10px] mt-0.5">{errors.code.message}</p>}
              </div>

              {/* Discount type and value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Type</label>
                  <select
                    {...register('discountType', { required: 'Type is required' })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm cursor-pointer"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="FixedAmount">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Value</label>
                  <input
                    type="number"
                    {...register('discountValue', { required: 'Value is required', min: 1 })}
                    placeholder="15"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Min Order (Rs.)</label>
                  <input
                    type="number"
                    {...register('minOrderValue', { min: 0 })}
                    placeholder="299"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Max Discount (Rs.)</label>
                  <input
                    type="number"
                    {...register('maxDiscountAmount')}
                    placeholder="100"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Expiry Date and Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input
                    type="date"
                    {...register('expiryDate', { required: 'Expiry is required' })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Usage Limit</label>
                  <input
                    type="number"
                    {...register('usageLimit', { required: 'Usage limit is required', min: 1 })}
                    placeholder="100"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-5 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all hover-scale"
                >
                  {modalLoading ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCoupons;
