import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchCategories, fetchProducts } from '../redux/productSlice';
import { addToCart, removeFromCart } from '../redux/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiFilter3Line,
  RiStarFill,
  RiLeafLine,
  RiArrowUpDownLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSendPlaneFill,
  RiShieldCheckLine,
  RiRefund2Line,
  RiTruckLine
} from 'react-icons/ri';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { showToast } from '../utils/toast';

const Home = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state selectors
  const { categories, products, loading, categoriesLoading } = useSelector((state) => state.products);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isVegOnly, setIsVegOnly] = useState(searchParams.get('isVeg') === 'true');
  const [isOrganicOnly, setIsOrganicOnly] = useState(searchParams.get('isOrganic') === 'true');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Carousel State
  const [activeBanner, setActiveBanner] = useState(0);

  // Wishlist Cache State
  const [wishlistIds, setWishlistIds] = useState([]);

  const searchKeyword = searchParams.get('search') || '';
  const isBrowsingOrSearching = !!(selectedCategory || searchKeyword || isVegOnly || isOrganicOnly || priceMin || priceMax || selectedBrand);

  const banners = [
    {
      title: 'Get 50% Off on Fresh Veggies!',
      description: 'Handpicked organic green vegetables direct from local farms.',
      code: 'VEG50',
      gradient: 'from-emerald-500 to-green-600',
      tag: '10 Mins Delivery'
    },
    {
      title: 'Chilled Beverages Flash Sale',
      description: 'Beat the heat with chilled sodas, juices and energy drinks.',
      code: 'COLD40',
      gradient: 'from-orange-500 to-amber-600',
      tag: 'Extra 40% Off'
    },
    {
      title: 'Pure Dairy & Organic Ghee',
      description: 'Certified A2 cow milk, organic butter, paneer, and local ghee.',
      code: 'DAIRY15',
      gradient: 'from-sky-500 to-blue-600',
      tag: 'Fresh Daily'
    }
  ];

  // Fetch categories and products
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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

  // Fetch products
  useEffect(() => {
    const params = {
      page: 1,
      limit: isBrowsingOrSearching ? 40 : 150, // Fetch a large batch if homepage, smaller paginated if searching
    };

    if (selectedCategory) params.category = selectedCategory;
    if (searchKeyword) params.search = searchKeyword;
    if (isVegOnly) params.isVeg = true;
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    if (sortOption) params.sort = sortOption;

    dispatch(fetchProducts(params));
  }, [selectedCategory, searchKeyword, isVegOnly, isOrganicOnly, priceMin, priceMax, sortOption, dispatch]);

  // Category select handler
  const handleCategorySelect = (categorySlug) => {
    const newCat = selectedCategory === categorySlug ? '' : categorySlug;
    setSelectedCategory(newCat);
    
    const newParams = new URLSearchParams(searchParams);
    if (newCat) {
      newParams.set('category', newCat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleToggleVeg = () => {
    const newVeg = !isVegOnly;
    setIsVegOnly(newVeg);
    const newParams = new URLSearchParams(searchParams);
    if (newVeg) {
      newParams.set('isVeg', 'true');
    } else {
      newParams.delete('isVeg');
    }
    setSearchParams(newParams);
  };

  const handleToggleOrganic = () => {
    const newOrg = !isOrganicOnly;
    setIsOrganicOnly(newOrg);
    const newParams = new URLSearchParams(searchParams);
    if (newOrg) {
      newParams.set('isOrganic', 'true');
    } else {
      newParams.delete('isOrganic');
    }
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSelectedCategory('');
    setIsVegOnly(false);
    setIsOrganicOnly(false);
    setPriceMin('');
    setPriceMax('');
    setSelectedBrand('');
    setSortOption('newest');
    setSearchParams(new URLSearchParams());
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((ci) => (ci.productId._id || ci.productId) === productId);
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

  // Auto-scrolling banner carousel
  useEffect(() => {
    if (isBrowsingOrSearching) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isBrowsingOrSearching]);

  // Filtering products client-side for dynamic homepage sections
  const flashDeals = products.filter((p) => p.mrp > p.price).slice(0, 10);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 10);
  const trendingItems = products.filter((p) => p.isTrending).slice(0, 10);
  const organicCollection = products.filter((p) => p.isOrganic).slice(0, 10);

  // Helper row filters for category-specific sections
  const freshFruits = products.filter((p) => p.category?.name === 'Fresh Fruits').slice(0, 8);
  const freshVegetables = products.filter((p) => p.category?.name === 'Fresh Vegetables').slice(0, 8);
  const dairyMilk = products.filter((p) => p.category?.name === 'Dairy & Milk').slice(0, 8);
  
  // Extract distinct brand list
  const brandList = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).slice(0, 8);

  // Horizontal scroll hook helpers
  const ScrollRow = ({ title, items, subtitle = '' }) => {
    const rowRef = useRef(null);
    if (!items || items.length === 0) return null;

    const scroll = (direction) => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth } = rowRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
        rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    return (
      <div className="relative group/row py-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 border border-gray-100 dark:border-gray-700"
            >
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 border border-gray-100 dark:border-gray-700"
            >
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((prod) => (
            <div key={prod._id} className="w-[185px] sm:w-[210px] flex-shrink-0 snap-start">
              <ProductCard
                product={prod}
                qtyInCart={getCartQuantity(prod._id)}
                onUpdateQuantity={handleUpdateQuantity}
                isWishlisted={wishlistIds.includes(prod._id)}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-16">
      {/* ================= IF BROWSING OR SEARCHING (CATALOG VIEW) ================= */}
      {isBrowsingOrSearching ? (
        <div className="space-y-6">
          {/* Filters & Sort Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleVeg}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                  isVegOnly
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
              >
                <RiLeafLine /> Veg Only
              </button>
              <button
                onClick={handleToggleOrganic}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                  isOrganicOnly
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
              >
                🌿 Organic
              </button>
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all"
              >
                <RiFilter3Line /> Price Range {(priceMin || priceMax) && '●'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <RiArrowUpDownLine className="text-gray-400 w-4 h-4" />
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('sort', e.target.value);
                  setSearchParams(newParams);
                }}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg py-1.5 px-3 text-xs font-semibold cursor-pointer focus:outline-none"
              >
                <option value="newest">Newest Additions</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Expanded filters panel */}
          {showFiltersPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-wrap items-end gap-6 text-sm"
            >
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Price Limits (Rs.)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Min"
                    className="w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Max"
                    className="w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    if (priceMin) newParams.set('priceMin', priceMin);
                    else newParams.delete('priceMin');
                    if (priceMax) newParams.set('priceMax', priceMax);
                    else newParams.delete('priceMax');
                    setSearchParams(newParams);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                >
                  Apply
                </button>
                <button
                  onClick={resetAllFilters}
                  className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}

          {/* Search Result Title */}
          {searchKeyword && (
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-850 p-4 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Found products matching "<span className="font-semibold text-gray-900 dark:text-white">{searchKeyword}</span>"
              </p>
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                className="text-xs font-bold text-green-600 hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4 animate-pulse">
                  <div className="w-full h-36 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
              <span className="text-6xl mb-4 block">🔍🛒</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                No items match your active filters or search terms. Try refining your spelling or clearing filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover-scale"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  qtyInCart={getCartQuantity(product._id)}
                  onUpdateQuantity={handleUpdateQuantity}
                  isWishlisted={wishlistIds.includes(product._id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // ================= HOMEPAGE DASHBOARD LAYOUT =================
        <div className="space-y-12">
          {/* 1. Hero Promo Banner Slider */}
          <div className="relative h-44 sm:h-56 rounded-3xl overflow-hidden shadow-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBanner}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 bg-gradient-to-r ${banners[activeBanner].gradient} p-6 sm:p-10 flex flex-col justify-center text-white`}
              >
                <div className="max-w-md space-y-2">
                  <span className="inline-block bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {banners[activeBanner].tag}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
                    {banners[activeBanner].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                    {banners[activeBanner].description}
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
                    <span>Use Code: <span className="bg-black/25 px-2 py-1 rounded font-mono text-yellow-300">{banners[activeBanner].code}</span></span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots navigation */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeBanner === idx ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 2. Visual Categories Grid */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
              Shop by Category
            </h2>
            {categoriesLoading ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="flex flex-col items-center bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-2.5 rounded-2xl transition-all hover:shadow-md hover:border-green-200 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-2 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center w-full truncate leading-tight group-hover:text-green-600">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Product sliders */}
          <div className="space-y-6">
            <ScrollRow title="⚡ Flash Deals" subtitle="Super savings on daily items" items={flashDeals} />
            <ScrollRow title="🔥 Best Sellers" subtitle="Most ordered on FreshCart" items={bestSellers} />
            <ScrollRow title="📈 Trending Products" subtitle="Top trending choices this week" items={trendingItems} />
            <ScrollRow title="🌿 Organic Collection" subtitle="Chemical-free health favorites" items={organicCollection} />
            <ScrollRow title="🍎 Fresh Fruits" subtitle="Sweet farm-fresh imports" items={freshFruits} />
            <ScrollRow title="🥦 Vegetables Garden" subtitle="Handpicked crisp veggies" items={freshVegetables} />
            <ScrollRow title="🥛 Dairy & Milk Favorites" subtitle="Fresh dairy and spreads" items={dairyMilk} />
          </div>

          {/* 4. Popular Brands */}
          <div className="py-6 border-t border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Popular Brands</h3>
            <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
              {brandList.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    const newParams = new URLSearchParams();
                    newParams.set('search', brand);
                    setSearchParams(newParams);
                  }}
                  className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:shadow hover:border-green-400 dark:hover:border-green-600 transition-all hover-scale"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Customer Testimonials */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-8">What Our Customers Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Rohan Sharma', text: 'Amazing 10 minute delivery. The organic apples and milk were fresh and high quality. Highly recommended!', rating: 5 },
                { name: 'Priya Iyer', text: 'FreshCart has become my go-to for daily groceries. The UI is super smooth and quantity selectors on cards make it so easy.', rating: 5 },
                { name: 'Arjun Mehta', text: 'Saves me so much time. The customer support is fast, and refunds for payment issues are instant.', rating: 5 }
              ].map((rev, idx) => (
                <div key={idx} className="bg-gray-50/50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-850 space-y-3">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => <RiStarFill key={i} className="w-4 h-4" />)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{rev.text}"</p>
                  <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200 text-right">- {rev.name}</h5>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Newsletter Subscription */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-extrabold">Join the FreshCart Newsletter</h3>
              <p className="text-sm text-white/80 max-w-md">Subscribe to receive notifications for flash sales, exclusive promo coupons, and recipes.</p>
            </div>
            <div className="w-full md:w-auto flex items-center bg-white rounded-xl overflow-hidden p-1 shadow-sm">
              <input
                type="email"
                placeholder="Enter email address"
                className="px-4 py-2 bg-transparent text-gray-800 text-sm focus:outline-none w-full md:w-64"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center">
                <RiSendPlaneFill className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7. Corporate Trust Badges Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-gray-100 dark:border-gray-800 pt-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center text-xl">
                <RiTruckLine />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Superfast Delivery</h4>
              <p className="text-xs text-gray-400">Groceries at your doorstep within 10-15 minutes.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center text-xl">
                <RiShieldCheckLine />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Secure Transactions</h4>
              <p className="text-xs text-gray-400">Dual integration with Razorpay and Stripe gateways.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center text-xl">
                <RiRefund2Line />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Quality Guarantee</h4>
              <p className="text-xs text-gray-400">100% replacement or refund for unsatisfactory quality.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
