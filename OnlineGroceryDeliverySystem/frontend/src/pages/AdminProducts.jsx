import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { RiEdit2Line, RiDeleteBin5Line, RiAddCircleLine, RiRefreshLine } from 'react-icons/ri';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/Edit product states
  const [showModal, setShowModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Load products (page 1, limit 100 to show full inventory)
      const response = await API.get('/products', { params: { limit: 100 } });
      setProducts(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? (It will be soft-deleted and hidden from catalog)')) {
      try {
        await API.delete(`/products/${productId}`);
        fetchProducts(); // Refresh list
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  // Open modal in edit mode and pre-populate fields
  const handleEditProductClick = (product) => {
    setEditProductId(product._id);
    setValue('name', product.name);
    setValue('brand', product.brand);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('discountPrice', product.discountPrice);
    setValue('stock', product.stock);
    setValue('unit', product.unit);
    setValue('category', product.category._id || product.category);
    setValue('isVeg', product.isVeg);
    setShowModal(true);
  };

  // Open modal in creation mode
  const handleAddProductClick = () => {
    setEditProductId(null);
    reset({
      name: '',
      brand: '',
      description: '',
      price: '',
      discountPrice: 0,
      stock: '',
      unit: '',
      isVeg: true,
    });
    setImageFiles([]);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    
    // Create multipart FormData to support image files uploads
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('brand', data.brand || '');
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('discountPrice', data.discountPrice || 0);
    formData.append('stock', data.stock);
    formData.append('unit', data.unit);
    formData.append('category', data.category);
    formData.append('isVeg', data.isVeg);

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        formData.append('images', file);
      }
    }

    try {
      if (editProductId) {
        // Update product
        await API.put(`/products/${editProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Create new product
        if (imageFiles.length === 0) {
          alert('Please select at least one product image');
          setModalLoading(false);
          return;
        }
        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      setShowModal(false);
      reset();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save product details');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500"
            title="Refresh Inventory"
          >
            <RiRefreshLine />
          </button>
          <button
            onClick={handleAddProductClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all hover-scale"
          >
            <RiAddCircleLine /> Add Product
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
          <p className="text-sm text-gray-500 animate-pulse">Loading catalog inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-20 bg-white rounded-3xl border">No products loaded.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 text-gray-400 text-xs font-bold uppercase">
                  <th className="p-4">Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Count</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                    <td className="p-4 flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-950 p-1.5 rounded-xl flex items-center justify-center overflow-hidden">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-gray-800 dark:text-gray-200 block">{p.name}</span>
                      <span className="text-[10px] text-gray-400">Unit: {p.unit} | Brand: {p.brand || 'N/A'}</span>
                    </td>
                    <td>{p.category?.name || 'N/A'}</td>
                    <td>
                      <span className="font-bold">Rs. {p.discountPrice > 0 ? p.discountPrice : p.price}</span>
                      {p.discountPrice > 0 && <span className="text-[10px] text-gray-400 line-through ml-1.5">Rs. {p.price}</span>}
                    </td>
                    <td>
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-500 transition-colors"
                          title="Edit product"
                        >
                          <RiEdit2Line />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete product"
                        >
                          <RiDeleteBin5Line />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ADD/EDIT PRODUCT MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editProductId ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-950 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Apples"
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name.message}</p>}
              </div>

              {/* Brand and category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Brand Name</label>
                  <input
                    type="text"
                    {...register('brand')}
                    placeholder="Amul"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-[10px] mt-0.5">{errors.category.message}</p>}
                </div>
              </div>

              {/* Price and discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Standard Price (Rs.)</label>
                  <input
                    type="number"
                    {...register('price', { required: 'Price is required', min: 0 })}
                    placeholder="100"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Price (Rs.)</label>
                  <input
                    type="number"
                    {...register('discountPrice', { min: 0 })}
                    placeholder="90"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Stock and unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    {...register('stock', { required: 'Stock count is required', min: 0 })}
                    placeholder="100"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pack Size Unit</label>
                  <input
                    type="text"
                    {...register('unit', { required: 'Unit is required' })}
                    placeholder="1 kg"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows="3"
                  placeholder="Provide product features, ingredients..."
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                ></textarea>
              </div>

              {/* File upload images & Veg option */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Veg Option</label>
                  <select
                    {...register('isVeg')}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    <option value="true">🌱 Vegetarian (Veg)</option>
                    <option value="false">🥩 Non-Vegetarian (Non-Veg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Select Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    className="w-full text-xs text-gray-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit panel */}
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
                  {modalLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
