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
    // Use the single logo URL
    return siteSettings.logoUrl || null;
  };

  if (loadingSettings) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--color-primary, #5243E9)' }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Floating Elements */}
      <div 
        className="absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
        style={{ backgroundColor: `color-mix(in srgb, var(--color-primary, #5243E9) 20%, white)` }}
      ></div>
      <div 
        className="absolute top-40 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"
        style={{ backgroundColor: `color-mix(in srgb, var(--color-accent, #06B6D4) 20%, white)` }}
      ></div>
      <div 
        className="absolute -bottom-8 left-40 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"
        style={{ backgroundColor: `color-mix(in srgb, var(--color-primary, #5243E9) 15%, white)` }}
      ></div>

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
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary, #5243E9) 0%, var(--color-accent, #06B6D4) 100%)`
                  }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  {siteSettings.footerCompanyName || 'Your Company'}
                </span>
              </div>
            )}
          </div>
          
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary, #1F2937)' }}
          >
            {isResetMode ? 'Reset Password' : 'Sign In'}
          </h1>
          
          <p 
            className="text-sm max-w-sm mx-auto"
            style={{ color: 'var(--color-text-secondary, #6B7280)' }}
          >
            {isResetMode 
              ? 'Enter your email to receive a secure password reset link'
              : 'Secure access to your website administration'
            }
          </p>
        </div>

        {/* Form Container */}
        <div 
          className="rounded-2xl shadow-xl p-8"
          style={{ 
            backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
            borderColor: 'var(--color-border-light, #E5E7EB)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          {isResetMode ? (
            // Password Reset Form
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              {error && (
                <div 
                  className="p-4 text-sm rounded-lg"
                  style={{
                    color: 'var(--color-error, #EF4444)',
                    borderColor: `color-mix(in srgb, var(--color-error, #EF4444) 30%, white)`,
                    backgroundColor: `color-mix(in srgb, var(--color-error, #EF4444) 10%, white)`,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {error}
                </div>
              )}
              
              {success && (
                <div 
                  className="p-4 text-sm rounded-lg"
                  style={{
                    color: 'var(--color-success, #10B981)',
                    borderColor: `color-mix(in srgb, var(--color-success, #10B981) 30%, white)`,
                    backgroundColor: `color-mix(in srgb, var(--color-success, #10B981) 10%, white)`,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {success}
                </div>
              )}
              
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div 
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary, #F9FAFB)',
                      borderColor: 'var(--color-border-light, #E5E7EB)',
                      color: 'var(--color-text-primary, #1F2937)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                  style={{
                    borderColor: 'var(--color-border-light, #E5E7EB)',
                    color: 'var(--color-text-primary, #1F2937)',
                    backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    '--tw-ring-color': 'var(--color-primary, #5243E9)'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary, #F9FAFB)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-primary, #FFFFFF)';
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg login-cta-button"
                  style={{
                    '--tw-ring-color': 'var(--color-primary, #5243E9)'
                  } as React.CSSProperties}
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
                <div 
                  className="p-4 text-sm rounded-lg"
                  style={{
                    color: 'var(--color-error, #EF4444)',
                    borderColor: `color-mix(in srgb, var(--color-error, #EF4444) 30%, white)`,
                    backgroundColor: `color-mix(in srgb, var(--color-error, #EF4444) 10%, white)`,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {error}
                </div>
              )}
              
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Username
                </label>
                <div className="relative">
                  <div 
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="block w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary, #F9FAFB)',
                      borderColor: 'var(--color-border-light, #E5E7EB)',
                      color: 'var(--color-text-primary, #1F2937)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      '--tw-ring-color': 'var(--color-primary, #5243E9)'
                    } as React.CSSProperties}
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <div 
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full pl-12 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary, #F9FAFB)',
                      borderColor: 'var(--color-border-light, #E5E7EB)',
                      color: 'var(--color-text-primary, #1F2937)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      '--tw-ring-color': 'var(--color-primary, #5243E9)'
                    } as React.CSSProperties}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                    style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary, #6B7280)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted, #9CA3AF)'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm transition-colors"
                  style={{ 
                    color: 'var(--color-primary, #5243E9)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-dark, #4338CA)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary, #5243E9)'}
                >
                  Forgot your password?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg login-cta-button"
                  style={{
                    '--tw-ring-color': 'var(--color-primary, #5243E9)'
                  } as React.CSSProperties}
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
          <p 
            className="text-xs"
            style={{ color: 'var(--color-text-secondary, #6B7280)' }}
          >
            {siteSettings.footerCompanyName || 'Your Company'}. {(siteSettings.footerCopyrightMessage || 'All rights reserved.').replace('{year}', new Date().getFullYear().toString())}
          </p>
          {siteSettings.footerCompanyDescription && (
            <p 
              className="text-xs mt-1 max-w-sm mx-auto"
              style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
            >
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
          .login-cta-button {
            background: var(--color-primary, #5243E9);
          }
          .login-cta-button:not(:disabled):hover {
            background: color-mix(in srgb, var(--color-primary, #5243E9) 85%, black);
          }
          .login-cta-button:disabled {
            background: var(--color-primary, #5243E9);
          }
        `
      }} />
    </div>
  );
} 