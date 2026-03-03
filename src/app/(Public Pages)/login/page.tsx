'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { loginUser } from './api/login';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();

  // Clear errors when user starts typing
  useEffect(() => {
    if (touched.email && email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.password && password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  }, [password, touched.password]);

  // Email validation
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, validateEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setErrors({ general: undefined });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await loginUser(email.trim(), password);
      // Success - redirect to home page
      router.push('/');
    } catch (err: any) {
      // Handle different types of errors from the improved API
      let errorMessage = 'Login failed. Please try again.';

      // Check if it's the new error structure
      if (err.status !== undefined || err.isNetworkError !== undefined) {
        const status = err.status;
        const message = err.message;

        if (err.isNetworkError) {
          errorMessage = message || 'Network error. Please check your internet connection and ensure the backend server is running.';
        } else {
          switch (status) {
            case 401:
              errorMessage = 'Invalid email or password. Please check your credentials.';
              break;
            case 403:
              errorMessage = 'Access denied. Please contact your administrator.';
              break;
            case 404:
              errorMessage = 'Service not found. Please contact support.';
              break;
            case 422:
              errorMessage = message || 'Invalid input. Please check your email and password.';
              break;
            case 429:
              errorMessage = 'Too many login attempts. Please try again later.';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = message || errorMessage;
          }
        }
      } else {
        // Fallback for any other error format
        errorMessage = err.message || errorMessage;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email' && email && !validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
    } else if (field === 'password' && password && password.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }));
    }
  };

  const clearError = () => {
    setErrors({ general: undefined });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BookNGo</h1>
          <p className="text-gray-600">Welcome back! Please login to continue.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between animate-fade-in">
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{errors.general}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                aria-label="Dismiss error"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.email && touched.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={isLoading}
                aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
              />
              {errors.email && touched.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600 animate-fade-in" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password && touched.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={errors.password && touched.password ? 'true' : 'false'}
                  aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600 animate-fade-in" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Log in'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help? Contact your administrator
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
