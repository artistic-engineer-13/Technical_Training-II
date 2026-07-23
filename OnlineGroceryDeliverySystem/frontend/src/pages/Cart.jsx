import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart, clearCart } from '../redux/cartSlice';
import { RiDeleteBinLine, RiArrowRightLine, RiShoppingBagLine } from 'react-icons/ri';
import { showToast } from '../utils/toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: cartItems, subtotal, totalQuantity, loading } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);

  const handleUpdateQuantity = async (productId, currentQty, stock, change) => {
    const newQty = currentQty + change;
    try {
      if (newQty <= 0) {
        await dispatch(removeFromCart(productId)).unwrap();
        showToast('Item removed from cart', 'success');
      } else if (newQty <= stock) {
        await dispatch(addToCart({ productId, quantity: newQty })).unwrap();
        showToast('Cart updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err || 'Failed to update cart', 'error');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      showToast('Item removed from cart', 'success');
    } catch (err) {
      showToast(err || 'Failed to remove item', 'error');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to empty your shopping cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        showToast('Cart cleared successfully', 'success');
      } catch (err) {
        showToast(err || 'Failed to clear cart', 'error');
      }
    }
  };

  // Fees and Charges calculations
  const discount = 0; // Coupons are evaluated at checkout
  const deliveryCharge = subtotal > 500 ? 0 : subtotal > 0 ? 40 : 0;
  const gstTax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + deliveryCharge + gstTax;

  if (totalQuantity === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl transition-colors duration-200">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
          Looks like you haven't added anything to your cart yet. Browse our selection and stock up on fresh groceries today!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover-scale"
        >
          <RiShoppingBagLine className="w-5 h-5" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart ({totalQuantity} items)</h1>
        <button
          onClick={handleClearCart}
          className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5"
        >
          <RiDeleteBinLine /> Empty Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = item.productId;
            if (!product) return null;

            return (
              <div
                key={item._id || product._id}
                className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors duration-200"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-950 p-2 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Info and Titles */}
                <div className="flex-grow min-w-0">
                  <Link
                    to={`/products/${product._id}`}
                    className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-primary-500 truncate block"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">Unit: {product.unit}</p>
                  
                  {/* Inline Price */}
                  <span className="text-xs text-gray-500 font-medium block mt-1">
                    Rs. {item.price} each
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden font-bold text-xs select-none">
                  <button
                    onClick={() => handleUpdateQuantity(product._id, item.quantity, product.stock, -1)}
                    className="px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-2 text-gray-700 dark:text-gray-300">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(product._id, item.quantity, product.stock, 1)}
                    className="px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal and Remove Column */}
                <div className="text-right min-w-[70px]">
                  <span className="text-sm font-bold text-gray-950 dark:text-white block">
                    Rs. {item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(product._id)}
                    className="text-gray-400 hover:text-red-500 mt-1"
                    title="Remove item"
                  >
                    <RiDeleteBinLine className="w-4 h-4 inline" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right Side: Order summary */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Bill Details</h3>
          
          <div className="space-y-3.5 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">Rs. {subtotal}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              {deliveryCharge === 0 ? (
                <span className="text-green-500 font-bold">FREE</span>
              ) : (
                <span className="font-semibold text-gray-800 dark:text-gray-200">Rs. {deliveryCharge}</span>
              )}
            </div>

            <div className="flex justify-between">
              <span>GST & Taxes (5%)</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">Rs. {gstTax}</span>
            </div>

            {deliveryCharge > 0 && (
              <p className="text-[10px] bg-primary-50 dark:bg-primary-950/10 text-primary-600 dark:text-primary-400 p-2 rounded-lg leading-relaxed">
                💡 Add products worth <b>Rs. {500 - subtotal}</b> more to get free delivery!
              </p>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between text-base font-bold text-gray-950 dark:text-white">
              <span>Grand Total</span>
              <span className="text-primary-500">Rs. {grandTotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(token ? '/checkout' : '/login')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all hover-scale flex justify-center items-center gap-2"
          >
            Proceed to Checkout <RiArrowRightLine className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Cart;
