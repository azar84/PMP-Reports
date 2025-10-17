'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, Shield, Eye, EyeOff, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface SiteSettings {
  footerCompanyName?: string;
  footerCompanyDescription?: string;
  footerCopyrightMessage?: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  faviconUrl?: string | null;
}

export default function AdminLogin() {
  const [isResetMode, setIsResetMode] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const router = useRouter();
  const { login } = useAuth();

  // Fetch site settings for branding
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const data = await response.json();
          setSiteSettings(data.data || {});
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSiteSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await login(credentials.username, credentials.password);
      
      if (success) {
        router.push('/admin-panel');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset link has been sent to your email. Please check your inbox.');
        setResetEmail('');
      } else {
        setError(data.error || 'Failed to send password reset email.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsResetMode(!isResetMode);
    setError('');
    setSuccess('');
  };

  const getAppropriateLogoUrl = () => {
    // For login page with white background, we'll use the dark logo
    if (siteSettings.logoDarkUrl) {
      return siteSettings.logoDarkUrl;
    }
    if (siteSettings.logoUrl) {
      return siteSettings.logoUrl;
    }
    return null;
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {getAppropriateLogoUrl() ? (
              <div className="relative">
                <Image
                  src={getAppropriateLogoUrl()!}
                  alt={siteSettings.footerCompanyName || 'Your Company'}
                  width={200}
                  height={60}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {siteSettings.footerCompanyName || 'Your Company'}
                </span>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isResetMode ? 'Reset Password' : 'Sign In'}
          </h1>
          
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            {isResetMode 
              ? 'Enter your email to receive a secure password reset link'
              : 'Secure access to your website administration'
            }
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {isResetMode ? (
            // Password Reset Form
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              {error && (
                <div className="p-4 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-4 text-sm text-green-800 border border-green-200 rounded-lg bg-green-50">
                  {success}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Login Form
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            {siteSettings.footerCompanyName || 'Your Company'}. {(siteSettings.footerCopyrightMessage || 'All rights reserved.').replace('{year}', new Date().getFullYear().toString())}
          </p>
          {siteSettings.footerCompanyDescription && (
            <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
              {siteSettings.footerCompanyDescription}
            </p>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `
      }} />
    </div>
  );
} 