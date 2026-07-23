import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.put(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      setSuccessMsg('Your password has been successfully updated. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Failed to reset password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
        Reset Password
      </h2>
      <p className="text-xs text-gray-500 text-center mb-8">
        Input your new login password credentials below.
      </p>

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-950/15 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-lg mb-6">
          ✔ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-650 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          ⚠️ {errorMsg}
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-all hover-scale flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Return to{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-500 hover:text-primary-600 underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
