import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ForgotPassword = () => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await API.post('/auth/forgot-password', data);
      setSuccessMsg(response.data.message || 'Password reset link has been dispatched to your email.');
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Failed to dispatch reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
        Recover Password
      </h2>
      <p className="text-xs text-gray-500 text-center mb-8">
        Provide your registered email address and we'll transmit a password recovery link.
      </p>

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-950/15 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-lg mb-6">
          📧 {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-650 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          ⚠️ {errorMsg}
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Registered Email
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Registered email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold text-sm transition-all hover-scale flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send Recovery Link'
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

export default ForgotPassword;
