import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAddresses } from '../redux/authSlice';
import { clearCartLocal } from '../redux/cartSlice';
import API from '../services/api';
import { RiMapPinLine, RiTicketLine, RiSecurePaymentLine, RiBankCardLine, RiTruckLine } from 'react-icons/ri';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addresses } = useSelector((state) => state.auth);
  const { items: cartItems, subtotal } = useSelector((state) => state.cart);

  // Address and Payment Selection states
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Coupon states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // General checkout states
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // 1. Fetch addresses on load
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // 2. Set default address as selected initially
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else {
        setSelectedAddressId(addresses[0]._id);
      }
    }
  }, [addresses]);

  // Load Razorpay SDK Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setAppliedCoupon(null);
    
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    try {
      const response = await API.post('/coupons/validate', {
        code: couponCodeInput,
        totalAmount: subtotal,
      });
      setAppliedCoupon(response.data.data);
    } catch (error) {
      setCouponError(error.response?.data?.error || 'Coupon code invalid');
    } finally {
      setCouponLoading(false);
    }
  };

  // Billing calculation logic
  const getBillingDetails = () => {
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'Percentage') {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
        if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
          discount = appliedCoupon.maxDiscountAmount;
        }
      } else {
        discount = appliedCoupon.discountValue;
      }
    }

    const deliveryCharge = subtotal - discount > 500 ? 0 : 40;
    const gstTax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
    const finalAmount = subtotal - discount + deliveryCharge + gstTax;

    return {
      discount,
      deliveryCharge,
      gstTax,
      finalAmount,
    };
  };

  const { discount, deliveryCharge, gstTax, finalAmount } = getBillingDetails();

  const handlePlaceOrder = async () => {
    setCheckoutError('');
    
    if (!selectedAddressId) {
      setCheckoutError('Please select a delivery address');
      return;
    }

    const targetAddress = addresses.find((addr) => addr._id === selectedAddressId);
    if (!targetAddress) {
      setCheckoutError('Selected address details invalid');
      return;
    }

    // Format items schema for order placement
    const orderItems = cartItems.map((item) => ({
      productId: item.productId._id || item.productId,
      quantity: item.quantity,
    }));

    setCheckoutLoading(true);

    try {
      // 1. Initialize Order in DB
      const orderResponse = await API.post('/orders', {
        items: orderItems,
        shippingAddress: {
          name: targetAddress.name,
          phone: targetAddress.phone,
          streetAddress: targetAddress.streetAddress,
          city: targetAddress.city,
          state: targetAddress.state,
          pincode: targetAddress.pincode,
          country: targetAddress.country,
        },
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      const orderData = orderResponse.data.data;

      // 2. Route based on selected payment gateway
      if (paymentMethod === 'COD') {
        // Cash on delivery - direct success route
        dispatch(clearCartLocal());
        navigate(`/order-success?orderId=${orderData._id}`);
        
      } else if (paymentMethod === 'Stripe') {
        // Stripe integration checkout redirection
        const stripeResponse = await API.post('/payments/stripe/checkout', {
          orderId: orderData._id,
        });
        const { sessionUrl } = stripeResponse.data.data;
        // Redirect browser to Stripe Hosted session
        window.location.href = sessionUrl;

      } else if (paymentMethod === 'Razorpay') {
        // Razorpay SDK execution
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
          setCheckoutError('Razorpay payment gateway failed to load. Please try again.');
          setCheckoutLoading(false);
          return;
        }

        // Generate Razorpay Order
        const rzpResponse = await API.post('/payments/razorpay/order', {
          orderId: orderData._id,
        });
        const rzpData = rzpResponse.data.data;

        // Razorpay client option settings
        const options = {
          key: rzpData.key,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'FreshCart Grocery Store',
          description: 'Payment for E-Grocery Order',
          order_id: rzpData.razorpayOrderId,
          handler: async (response) => {
            try {
              // Verify signature payment capture on backend
              const verification = await API.post('/payments/razorpay/verify', {
                orderId: rzpData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verification.data.success) {
                dispatch(clearCartLocal());
                navigate(`/order-success?orderId=${rzpData.orderId}`);
              }
            } catch (err) {
              setCheckoutError(err.response?.data?.error || 'Razorpay payment verification failed');
            }
          },
          prefill: {
            name: targetAddress.name,
            contact: targetAddress.phone,
          },
          theme: {
            color: '#2e7d32', // Green brand color
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setCheckoutLoading(false);
      }
    } catch (error) {
      setCheckoutError(error.response?.data?.error || 'Failed to place order');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Secure Checkout</h1>

      {checkoutError && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          ⚠️ {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Address and Payment configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200">
            <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-4">
              <RiMapPinLine className="text-primary-500" /> Delivery Address
            </h3>

            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-4">No saved addresses found. Please add an address to continue.</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg text-xs font-semibold"
                >
                  Manage Addresses
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/5'
                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 text-primary-500 focus:ring-primary-500 cursor-pointer"
                    />
                    <div className="text-sm">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {addr.name} {addr.isDefault && <span className="text-[10px] bg-primary-100 text-primary-800 font-semibold px-2 py-0.5 rounded ml-1.5">Default</span>}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200">
            <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-4">
              <RiSecurePaymentLine className="text-primary-500" /> Choose Payment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* COD */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/5'
                    : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <div className="text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <RiTruckLine /> COD
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Cash On Delivery</p>
                </div>
              </label>

              {/* Razorpay */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/5'
                    : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <div className="text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    💳 Razorpay
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Cards / UPI / NetBanking</p>
                </div>
              </label>

              {/* Stripe */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'Stripe'
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/5'
                    : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Stripe'}
                  onChange={() => setPaymentMethod('Stripe')}
                  className="text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <div className="text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <RiBankCardLine /> Stripe
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">International Payments</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Checkout Invoice summary */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Coupon inputs card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-3">
              <RiTicketLine /> Use Promo Code
            </h3>
            
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                placeholder="PROMO50"
                disabled={appliedCoupon}
                className="flex-grow uppercase px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs font-semibold disabled:opacity-50"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCodeInput('');
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              )}
            </form>

            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-green-500 text-xs mt-2 font-semibold">
                ✔ Coupon "{appliedCoupon.code}" applied! Save Rs. {discount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Checkout billing details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Bill Details</h3>
            
            <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Rs. {subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-500 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- Rs. {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                {deliveryCharge === 0 ? (
                  <span className="text-green-500 font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Rs. {deliveryCharge.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between">
                <span>GST & Taxes (5%)</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Rs. {gstTax.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-sm font-bold text-gray-950 dark:text-white">
                <span>Total Amount</span>
                <span className="text-primary-500">Rs. {finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || cartItems.length === 0}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover-scale flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {checkoutLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Place Order (Rs. {finalAmount.toFixed(2)})</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
