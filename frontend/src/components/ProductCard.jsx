import React from 'react';
import { Link } from 'react-router-dom';
import { RiStarFill, RiHeartLine, RiHeartFill, RiTimeLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';

const ProductCard = ({
  product,
  qtyInCart,
  onUpdateQuantity,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Calculate discount percentage based on mrp and price
  const mrp = product.mrp || product.price;
  const price = product.price;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleUpdate = async (e, currentQty, change) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdateQuantity(product._id, currentQty, product.stock, change);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-950/60 rounded-2xl p-3.5 transition-all shadow-sm hover:shadow-lg relative overflow-hidden"
    >
      {/* 1. Veg/Non-Veg Badge & Discount Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <span
          className={`w-5 h-5 flex items-center justify-center border rounded bg-white/90 backdrop-blur-sm ${
            product.isVeg ? 'border-green-500' : 'border-red-500'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${product.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </span>
        {discountPercent > 0 && (
          <span className="bg-green-600 dark:bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
            {discountPercent}% Off
          </span>
        )}
      </div>

      {/* 2. Wishlist Toggle Button */}
      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product._id);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-400 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-500 transition-colors"
        >
          {isWishlisted ? (
            <RiHeartFill className="w-5 h-5 text-rose-500" />
          ) : (
            <RiHeartLine className="w-5 h-5" />
          )}
        </button>
      )}

      {/* 3. Product Image Links */}
      <Link
        to={`/products/${product._id}`}
        className="w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-850 p-2 mb-3 cursor-pointer"
      >
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          categoryName={product.category?.name}
          className="max-h-full max-w-full object-contain"
        />
      </Link>

      {/* 4. Product Meta Details */}
      <div className="flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          {product.brand && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {product.brand}
            </span>
          )}
          <Link
            to={`/products/${product._id}`}
            className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 hover:text-green-600 dark:hover:text-green-400 leading-snug block"
          >
            {product.name}
          </Link>
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-0.5">
            <span>{product.unit}</span>
            <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-850 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              <RiTimeLine className="w-3 h-3 text-green-500" /> {product.deliveryTime || '10 mins'}
            </span>
          </div>
        </div>

        {/* Ratings details */}
        {product.ratingsQuantity > 0 ? (
          <div className="flex items-center gap-1 mt-2 text-amber-500 font-bold text-xs">
            <RiStarFill className="w-3.5 h-3.5" />
            <span>{product.ratingsAverage}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">
              ({product.ratingsQuantity} reviews)
            </span>
          </div>
        ) : (
          <div className="h-5"></div>
        )}

        {/* Pricing and Add to Cart Button Block */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col">
            {mrp > price ? (
              <>
                <span className="text-base font-extrabold text-gray-900 dark:text-white leading-none">
                  Rs. {price}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through mt-0.5">
                  MRP Rs. {mrp}
                </span>
              </>
            ) : (
              <span className="text-base font-extrabold text-gray-900 dark:text-white leading-none">
                Rs. {price}
              </span>
            )}
          </div>

          {/* Add-to-cart operations */}
          {product.stock <= 0 ? (
            <span className="text-xs font-bold text-red-500 px-3 py-1.5 bg-red-50 dark:bg-red-950/15 rounded-lg select-none">
              Out of stock
            </span>
          ) : qtyInCart > 0 ? (
            <div className="flex items-center bg-green-600 text-white rounded-lg overflow-hidden font-bold text-sm shadow-sm transition-all">
              <button
                disabled={isUpdating}
                onClick={(e) => handleUpdate(e, qtyInCart, -1)}
                className="px-2.5 py-1.5 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="px-1.5 select-none">{qtyInCart}</span>
              <button
                disabled={isUpdating}
                onClick={(e) => handleUpdate(e, qtyInCart, 1)}
                className="px-2.5 py-1.5 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          ) : (
            <button
              disabled={isUpdating}
              onClick={(e) => handleUpdate(e, 0, 1)}
              className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow hover-scale uppercase disabled:scale-100 disabled:cursor-not-allowed min-w-[70px] text-center"
            >
              {isUpdating ? '...' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
