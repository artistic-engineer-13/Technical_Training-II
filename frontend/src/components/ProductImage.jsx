import React, { useState } from 'react';
import { RiShoppingBag2Line } from 'react-icons/ri';

const ProductImage = ({ src, alt, className = '', categoryName = '' }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback gradient colors based on product name length to add variety
  const getGradientClass = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-emerald-50 to-green-100 dark:from-emerald-950/20 dark:to-green-900/20',
      'from-orange-50 to-amber-100 dark:from-orange-950/20 dark:to-amber-900/20',
      'from-sky-50 to-blue-100 dark:from-sky-950/20 dark:to-blue-900/20',
      'from-rose-50 to-red-100 dark:from-rose-950/20 dark:to-red-900/20',
    ];
    return gradients[hash % gradients.length];
  };

  const gradientClass = getGradientClass(alt || categoryName || 'Grocery');

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradientClass} text-green-600 dark:text-green-400 ${className} select-none`}
        title={alt}
      >
        <RiShoppingBag2Line className="w-8 h-8 opacity-75 animate-bounce-slow" />
        <span className="text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mt-1 px-2 text-center truncate w-full">
          {alt || 'FreshCart'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-all duration-300 ${
          loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
};

export default ProductImage;
