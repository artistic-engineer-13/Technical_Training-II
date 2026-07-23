import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearErrors } from '../redux/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Watch password field to validate match confirmation
  const password = watch('password', '');

  // Redirect automatically if registration yields token response (immediate login session start)
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'DeliveryPartner') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/');
      }
    }
    dispatch(clearErrors());
  }, [user, navigate, dispatch]);

  const onSubmit = (data) => {
    // Delete confirmPassword before payload send
    const { confirmPassword, ...signupData } = data;
    dispatch(registerUser(signupData));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        Create an Account
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            {...register('name', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email address',
              },
            })}
            placeholder="name@example.com"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^[0-9]{10,12}$/,
                message: 'Please enter a valid 10-12 digit phone number',
              },
            })}
            placeholder="9876543210"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
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
            Confirm Password
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

        {/* User Role Selection Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            I want to Register as:
          </label>
          <select
            {...register('role')}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all cursor-pointer"
          >
            <option value="Customer">Customer (Buy groceries)</option>
            <option value="DeliveryPartner">Delivery Rider (Deliver orders)</option>
          </select>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-all hover-scale flex justify-center items-center gap-2 mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
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

export default Register;
