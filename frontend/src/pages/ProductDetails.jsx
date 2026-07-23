import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchProductDetails, clearProductDetails } from '../redux/productSlice';
import { addToCart, removeFromCart } from '../redux/cartSlice';
import API from '../services/api';
import {
  RiStarFill,
  RiLeafLine,
  RiChat3Line,
  RiShieldCheckLine,
  RiHeartLine,
  RiHeartFill,
  RiTimeLine
} from 'react-icons/ri';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import { showToast } from '../utils/toast';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { productDetails: product, loading } = useSelector((state) => state.products);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { token, user } = useSelector((state) => state.auth);

  // Local state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Fetch product Details
  useEffect(() => {
    dispatch(fetchProductDetails(id));

    return () => {
      dispatch(clearProductDetails());
    };
  }, [id, dispatch]);

  // Sync wishlist IDs if logged in
  useEffect(() => {
    if (token) {
      API.get('/wishlist')
        .then((res) => {
          const list = res.data.data.products || [];
          setWishlistIds(list.map((p) => p._id));
        })
        .catch((err) => console.log('Wishlist fetch error:', err));
    }
  }, [token]);

  // Fetch reviews and related products once details load
  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchRelated();
    }
  }, [product]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await API.get(`/reviews/${id}`);
      setReviews(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchRelated = async () => {
    try {
      const response = await API.get(`/products/related/${product.category._id}?currentId=${id}`);
      setRelatedProducts(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    try {
      await API.post(`/wishlist/${productId}`);
      setWishlistIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleDetailsUpdate = async (currentQty, change) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await handleUpdateQuantity(product._id, currentQty, product.stock, change);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCartQuantity = (productId) => {
    const searchId = productId || (product ? product._id : null);
    if (!searchId) return 0;
    const item = cartItems.find((ci) => (ci.productId._id || ci.productId) === searchId);
    return item ? item.quantity : 0;
  };

  const handleUpdateQuantity = async (productId, currentQty, stock, change) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
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

  // Handle Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSubmitLoading(true);
    try {
      await API.post('/reviews', {
        productId: product._id,
        rating: ratingInput,
        comment: commentInput,
      });

      setCommentInput('');
      fetchReviews();
      dispatch(fetchProductDetails(id));
    } catch (error) {
      setReviewError(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 mt-4 animate-pulse">Loading product details...</p>
      </div>
    );
  }

  const qtyInCart = getCartQuantity(product._id);
  const mrp = product.mrp || product.price;
  const price = product.price;
  const isProductWishlisted = wishlistIds.includes(product._id);

  return (
    <div className="space-y-12">
      
      {/* ================= PRODUCT CORE INFO ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 rounded-3xl transition-colors duration-200">
        
        {/* Left Column: Image wrapper */}
        <div className="flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-950 rounded-2xl h-80 sm:h-[450px]">
          <ProductImage
            src={product.images?.[0]}
            alt={product.name}
            categoryName={product.category?.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Right Column: Details wrapper */}
        <div className="flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-4">
            {/* Diet & Brand Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                product.isVeg 
                  ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                  : 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
              }`}>
                <RiLeafLine /> {product.isVeg ? 'Veg' : 'Non-Veg'}
              </span>
              
              {product.isOrganic && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border border-green-200 bg-emerald-50 text-emerald-700 dark:bg-green-950/20 dark:text-green-400">
                  🌿 Organic
                </span>
              )}

              {product.brand && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-semibold">
                  Brand: {product.brand}
                </span>
              )}
            </div>

            {/* Title & Unit details */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>Pack Size: <span className="font-bold text-gray-600 dark:text-gray-300">{product.unit}</span></span>
                <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-850 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  <RiTimeLine className="w-3.5 h-3.5 text-green-500" /> {product.deliveryTime || '10 mins'}
                </span>
              </div>
            </div>

            {/* Ratings summary */}
            {product.ratingsQuantity > 0 && (
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                <RiStarFill className="w-4 h-4" />
                <span>{product.ratingsAverage} / 5</span>
                <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">({product.ratingsQuantity} ratings)</span>
              </div>
            )}

            {/* Price section with MRP discounts */}
            <div className="flex items-center gap-3 pt-2">
              {mrp > price ? (
                <>
                  <span className="text-3xl font-black text-gray-950 dark:text-white">
                    Rs. {price}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                    MRP Rs. {mrp}
                  </span>
                  <span className="bg-green-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    Save Rs. {mrp - price}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-gray-950 dark:text-white">
                  Rs. {price}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-gray-50 dark:border-gray-850">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Product Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Buy actions */}
          <div className="border-t border-gray-100 dark:border-gray-850 pt-6 flex items-center gap-4">
            {product.stock <= 0 ? (
              <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/15 px-4 py-2.5 rounded-xl block w-full text-center">
                Out of Stock
              </span>
            ) : qtyInCart > 0 ? (
              <div className="flex items-center bg-green-600 text-white rounded-xl overflow-hidden font-bold text-base shadow-sm">
                <button
                  disabled={isUpdating}
                  onClick={() => handleDetailsUpdate(qtyInCart, -1)}
                  className="px-4 py-2.5 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  -
                </button>
                <span className="px-3 select-none">{qtyInCart}</span>
                <button
                  disabled={isUpdating}
                  onClick={() => handleDetailsUpdate(qtyInCart, 1)}
                  className="px-4 py-2.5 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                disabled={isUpdating}
                onClick={() => handleDetailsUpdate(0, 1)}
                className="flex-grow bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all hover-scale text-center disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
            )}

            {/* Wishlist toggle in Details */}
            <button
              onClick={() => handleToggleWishlist(product._id)}
              className={`p-3 rounded-xl border shadow-sm transition-all hover-scale ${
                isProductWishlisted
                  ? 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-950/20 dark:bg-rose-950/20'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-500 dark:text-gray-500'
              }`}
              title="Add to Wishlist"
            >
              {isProductWishlisted ? (
                <RiHeartFill className="w-5 h-5" />
              ) : (
                <RiHeartLine className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* ================= REVIEWS & RATINGS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane: reviews statistics and new review submission */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
              <RiChat3Line className="text-green-500 w-5 h-5" /> Product Reviews
            </h3>

            {/* Overall rating indicators */}
            <div className="flex items-center gap-4 py-2">
              <span className="text-4xl font-black text-gray-900 dark:text-white">{product.ratingsAverage}</span>
              <div>
                <div className="flex text-amber-500 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <RiStarFill
                      key={i}
                      className={i < Math.round(product.ratingsAverage) ? 'text-amber-500' : 'text-gray-200 dark:text-gray-700'}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-0.5">
                  {product.ratingsQuantity} Total Ratings
                </span>
              </div>
            </div>
          </div>

          {/* Add a Review Form */}
          {token && (
            <div className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 rounded-3xl space-y-4">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Write a Customer Review</h4>
              {reviewError && <p className="text-xs text-red-500 font-semibold">{reviewError}</p>}
              
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Rating</label>
                  <select
                    value={ratingInput}
                    onChange={(e) => setRatingInput(Number(e.target.value))}
                    className="w-full border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Very Bad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Feedback Comment</label>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    required
                    placeholder="Describe your shopping experience..."
                    rows={3}
                    className="w-full border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-lg transition-all hover-scale"
                >
                  {reviewSubmitLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right pane: list of reviews */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 rounded-3xl h-[420px] overflow-y-auto">
          {reviewsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-150 dark:bg-gray-850 rounded-xl w-full" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <span className="text-4xl block mb-2">💬</span>
              <p className="text-xs">No reviews submitted yet for this product. Be the first to leave feedback!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="border-b border-gray-100 dark:border-gray-850 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-850 dark:text-white">{rev.userId?.name || 'Customer'}</span>
                    <span className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-500 text-[10px] mt-1">
                    {[...Array(5)].map((_, i) => (
                      <RiStarFill
                        key={i}
                        className={i < rev.rating ? 'text-amber-500' : 'text-gray-200 dark:text-gray-700'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ================= RELATED PRODUCTS SECTION ================= */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Frequently Bought Together
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Explore popular items matching this category</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard
                key={rel._id}
                product={rel}
                qtyInCart={getCartQuantity(rel._id)}
                onUpdateQuantity={handleUpdateQuantity}
                isWishlisted={wishlistIds.includes(rel._id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
