import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addAddress, deleteAddress, updateProfile, clearErrors } from '../redux/authSlice';
import { useForm } from 'react-hook-form';
import { RiUserLine, RiMapPinLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri';

const Profile = () => {
  const dispatch = useDispatch();

  const { user, addresses, loading, error } = useSelector((state) => state.auth);

  // Address adding modal toggle
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Profile Form React Hook Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Address Form React Hook Form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { errors: addressErrors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(clearErrors());
  }, [dispatch]);

  const onProfileUpdate = (data) => {
    dispatch(updateProfile(data));
  };

  const onAddAddress = (data) => {
    dispatch(addAddress(data));
    setShowAddressForm(false);
    resetAddressForm();
  };

  const onDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
      dispatch(deleteAddress(addressId));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      
      {/* 1. Edit Profile Information */}
      <div className="md:col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-6">
        <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-gray-850 pb-3">
          <RiUserLine className="text-primary-500" /> Account Settings
        </h3>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              {...registerProfile('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm transition-all"
            />
            {profileErrors.name && (
              <p className="text-red-500 text-[10px] mt-1">{profileErrors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
            <input
              type="tel"
              {...registerProfile('phone', { required: 'Phone is required' })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm transition-all"
            />
            {profileErrors.phone && (
              <p className="text-red-500 text-[10px] mt-1">{profileErrors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email (Read Only)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 rounded-lg text-sm select-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-semibold text-sm transition-all hover-scale"
          >
            {loading ? 'Saving...' : 'Update Details'}
          </button>
        </form>
      </div>

      {/* 2. Addresses Management */}
      <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-850 pb-3">
          <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
            <RiMapPinLine className="text-primary-500" /> Saved Addresses
          </h3>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="text-xs bg-primary-100 dark:bg-primary-700/10 text-primary-500 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-primary-200 transition-colors"
          >
            <RiAddLine /> Add Address
          </button>
        </div>

        {/* Address Inline input form */}
        {showAddressForm && (
          <form onSubmit={handleAddressSubmit(onAddAddress)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 border border-gray-100 dark:border-gray-750 rounded-2xl">
            <div className="sm:col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider">New Shipping Details</div>
            
            {/* Label name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Label (e.g., Home, Office)</label>
              <input
                type="text"
                {...registerAddress('name', { required: 'Label is required' })}
                placeholder="Home"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs"
              />
              {addressErrors.name && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.name.message}</p>}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contact Phone</label>
              <input
                type="tel"
                {...registerAddress('phone', { required: 'Phone is required' })}
                placeholder="9876543210"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs"
              />
              {addressErrors.phone && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.phone.message}</p>}
            </div>

            {/* Street Address */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Street Address</label>
              <input
                type="text"
                {...registerAddress('streetAddress', { required: 'Street Address is required' })}
                placeholder="Apartment, Street Name, Landmark"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs"
              />
              {addressErrors.streetAddress && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.streetAddress.message}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City</label>
              <input
                type="text"
                {...registerAddress('city', { required: 'City is required' })}
                placeholder="Bangalore"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs"
              />
              {addressErrors.city && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.city.message}</p>}
            </div>

            {/* State */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">State</label>
              <input
                type="text"
                {...registerAddress('state', { required: 'State is required' })}
                placeholder="Karnataka"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs"
              />
              {addressErrors.state && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.state.message}</p>}
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pincode</label>
              <input
                type="text"
                {...registerAddress('pincode', { required: 'Pincode is required' })}
                placeholder="560001"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-xs"
              />
              {addressErrors.pincode && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.pincode.message}</p>}
            </div>

            {/* Default marker Checkbox */}
            <div className="flex items-center gap-2 mt-4 select-none">
              <input
                type="checkbox"
                id="isDefault"
                {...registerAddress('isDefault')}
                className="text-primary-500 focus:ring-primary-500 rounded border-gray-200 cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer font-semibold">
                Set as Default Address
              </label>
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Saved Addresses list */}
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500">No addresses saved. Please add an address to support checkouts.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex flex-col justify-between"
              >
                <div className="text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    📍 {addr.name}{' '}
                    {addr.isDefault && (
                      <span className="text-[9px] bg-primary-100 text-primary-800 font-bold px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </span>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {addr.streetAddress}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Phone: {addr.phone}</p>
                </div>
                
                <div className="flex justify-end pt-3 border-t border-gray-50 dark:border-gray-850 mt-3">
                  <button
                    onClick={() => onDeleteAddress(addr._id)}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5"
                  >
                    <RiDeleteBinLine /> Remove Address
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
