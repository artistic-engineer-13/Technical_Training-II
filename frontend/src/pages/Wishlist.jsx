import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { addToCart, removeFromCart } from '../redux/cartSlice';
import { RiHeartFill } from 'react-icons/ri';
import ProductCard from '../components/ProductCard';
import { showToast } from '../utils/toast';

const Wishlist = () => {
  const dispatch = useDispatch();

  const { items: cartItems } = useSelector((state) => state.cart);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await API.get('/wishlist');
      setWishlistItems(response.data.data.products || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await API.post(`/wishlist/${productId}`);
      // Filter out item locally to avoid full re-fetch
      setWishlistItems((prevItems) => prevItems.filter((item) => item._id !== productId));
      showToast('Item removed from wishlist', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update wishlist', 'error');
    }
  };

  const handleUpdateQuantity = async (productId, currentQty, stock, change) => {
    const newQty = currentQty + change;
    try {
      if (newQty <= 0) {
        await dispatch(removeFromCart(productId)).unwrap();
        showToast('Item removed from cart', 'success');
      } else if (newQty <= stock) {
        await dispatch(addToCart({ productId, quantity: newQty })).unwrap();
        showToast(currentQty === 0 ? 'Item added to cart!' : 'Cart updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err || 'Failed to update cart', 'error');
      throw err;
    }
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((ci) => (ci.productId._id || ci.productId) === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 mt-4">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
        <RiHeartFill className="text-rose-500 w-6 h-6 animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
          <span className="text-5xl block mb-4">❤️</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
            Tap the heart icon on products to save them for later checkouts.
          </p>
          <Link
            to="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover-scale inline-block shadow-sm"
          >
            Go to Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              qtyInCart={getCartQuantity(product._id)}
              onUpdateQuantity={handleUpdateQuantity}
              isWishlisted={true}
              onToggleWishlist={handleRemoveFromWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
