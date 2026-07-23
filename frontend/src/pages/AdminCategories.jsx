import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { RiEdit2Line, RiDeleteBin5Line, RiAddCircleLine, RiRefreshLine } from 'react-icons/ri';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal triggers
  const [showModal, setShowModal] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await API.get('/categories');
      setCategories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All associated products may become uncategorized.')) {
      try {
        await API.delete(`/categories/${categoryId}`);
        fetchCategories(); // Refresh list
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const handleEditCategoryClick = (category) => {
    setEditCategoryId(category._id);
    setValue('name', category.name);
    setValue('description', category.description);
    setImageFile(null);
    setShowModal(true);
  };

  const handleAddCategoryClick = () => {
    setEditCategoryId(null);
    reset({
      name: '',
      description: '',
    });
    setImageFile(null);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    
    // Create multipart FormData to handle file uploads
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editCategoryId) {
        // Edit Category
        await API.put(`/categories/${editCategoryId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Create Category
        if (!imageFile) {
          alert('Please select a category image');
          setModalLoading(false);
          return;
        }
        await API.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowModal(false);
      reset();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save category details');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Categories</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500"
            title="Refresh Categories"
          >
            <RiRefreshLine />
          </button>
          <button
            onClick={handleAddCategoryClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all hover-scale"
          >
            <RiAddCircleLine /> Add Category
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
          <p className="text-sm text-gray-500 animate-pulse">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-20 bg-white rounded-3xl border">No categories loaded.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="w-full h-32 bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="font-bold text-gray-950 dark:text-white text-base">{cat.name}</h3>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 font-mono px-2 py-0.5 rounded mt-1 inline-block">
                  slug: {cat.slug}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 dark:border-gray-850 mt-4">
                <button
                  onClick={() => handleEditCategoryClick(cat)}
                  className="px-3 py-1.5 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-500 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RiEdit2Line /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="px-3 py-1.5 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RiDeleteBin5Line /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= ADD/EDIT CATEGORY MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl w-full max-w-md shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editCategoryId ? 'Edit Category Details' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-950 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Category name is required' })}
                  placeholder="Fruits & Vegetables"
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Description</label>
                <textarea
                  {...register('description')}
                  rows="3"
                  placeholder="Fresh organic farm produce..."
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                ></textarea>
              </div>

              {/* Category Image upload */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Upload Image Icon</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 cursor-pointer"
                />
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
                  {modalLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
