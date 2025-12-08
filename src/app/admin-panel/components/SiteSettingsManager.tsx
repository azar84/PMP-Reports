'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import MediaSelector from '@/components/ui/MediaSelector';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { 
  Save, 
  RotateCcw, 
  Upload, 
  X, 
  Image, 
  Settings, 
  Phone, 
  Mail, 
  Send, 
  Shield,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  CheckCircle,
  Loader,
  Palette,
  Monitor,
  Eye,
  EyeOff,
  Building2,
  DollarSign,
  Briefcase,
  Coins
} from 'lucide-react';

interface MediaItem {
  id: number;
  filename: string;
  title?: string;
  description?: string;
  alt?: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  publicUrl: string;
  thumbnailUrl?: string;
}

interface SiteSettings {
  id?: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  
  // Email Configuration
  smtpEnabled?: boolean;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUsername?: string | null;
  smtpPassword?: string | null;
  smtpFromEmail?: string | null;
  smtpFromName?: string | null;
  smtpReplyTo?: string | null;
  
  // Email Templates Configuration
  emailSignature?: string | null;
  emailFooterText?: string | null;
  emailBrandingEnabled?: boolean;
  
  // Email Notification Settings
  adminNotificationEmail?: string | null;
  emailLoggingEnabled?: boolean;
  emailRateLimitPerHour?: number | null;
  
  // Company Contact Information
  companyPhone?: string | null;
  companyEmail?: string | null;
  companyAddress?: string | null;
  
  // Social Media Links
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialLinkedin?: string | null;
  socialInstagram?: string | null;
  socialYoutube?: string | null;
  
  // Footer Configuration
  footerNewsletterFormId?: number | null;
  footerCopyrightMessage?: string | null;
  footerMenuIds?: string | null;
  footerShowContactInfo?: boolean;
  footerShowSocialLinks?: boolean;
  footerCompanyName?: string | null;
  footerCompanyDescription?: string | null;
  footerBackgroundColor?: string | null;
  footerTextColor?: string | null;
  
  // Base URL
  baseUrl?: string | null;
  
  // Cloudinary Configuration
  cloudinaryEnabled?: boolean;
  cloudinaryCloudName?: string | null;
  cloudinaryApiKey?: string | null;
  cloudinaryApiSecret?: string | null;
  
  // Sidebar Configuration
  sidebarBackgroundColor?: string | null;
  sidebarTextColor?: string | null;
  sidebarSelectedColor?: string | null;
  sidebarHoverColor?: string | null;
  currencySymbol?: string | null;
  vatPercent?: number | null;
  
  createdAt?: string;
  updatedAt?: string;
}

// Utility function to determine if a color is light or dark
const isLightColor = (hexColor: string): boolean => {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
};

export default function SiteSettingsManager() {
  const { designSystem } = useDesignSystem();
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: null,
    logoLightUrl: null,
    logoDarkUrl: null,
    faviconUrl: null,
    faviconLightUrl: null,
    faviconDarkUrl: null,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'company' | 'email' | 'cloudinary' | 'sidebar'>('general');
  
  // File upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  
  // Email test states
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<any>(null);
  
  // File input refs
  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/site-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data || {
          logoUrl: null,
          logoLightUrl: null,
          logoDarkUrl: null,
          faviconUrl: null,
          faviconLightUrl: null,
          faviconDarkUrl: null,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: string | number | null) => {
    // Convert numeric fields
    if (field === 'vatPercent' || field === 'smtpPort' || field === 'emailRateLimitPerHour') {
      const numValue = value === '' || value === null ? null : (typeof value === 'number' ? value : parseFloat(value));
      setSettings(prev => ({ ...prev, [field]: numValue }));
      debounceFieldUpdate(field, numValue);
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
      debounceFieldUpdate(field, value);
    }
  };

  // Debounced individual field update
  const debounceFieldUpdate = useMemo(() => {
    const timeouts: { [key: string]: NodeJS.Timeout } = {};
    
    return (field: keyof SiteSettings, value: any) => {
      // Clear existing timeout for this field
      if (timeouts[field]) {
        clearTimeout(timeouts[field]);
      }
      
      // Set new timeout
      timeouts[field] = setTimeout(async () => {
        try {
          const response = await fetch('/api/admin/site-settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [field]: value }),
          });

          const result = await response.json();
          
          if (result.success) {
            setMessage({ type: 'success', text: `${field} updated successfully!` });
            // Auto-clear success message after 2 seconds
            setTimeout(() => setMessage(null), 2000);
          } else {
            setMessage({ type: 'error', text: result.error || `Failed to update ${field}` });
          }
        } catch (error) {
          console.error(`Error updating ${field}:`, error);
          setMessage({ type: 'error', text: `Failed to update ${field}. Please try again.` });
        }
      }, 1000); // Wait 1 second after user stops typing
    };
  }, []);

  const handleMediaSelect = (field: keyof SiteSettings, media: MediaItem | MediaItem[] | null) => {
    if (media && !Array.isArray(media)) {
      setSettings(prev => ({ ...prev, [field]: media.publicUrl }));
      setMessage({ type: 'success', text: 'Media selected successfully!' });
    } else if (media === null) {
      setSettings(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    const setUploading = {
      logo: setUploadingLogo,
      favicon: setUploadingFavicon,
    }[type];

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'media');

      const response = await fetch('/api/admin/media-library', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const fieldMap = {
          logo: 'logoUrl',
          favicon: 'faviconUrl',
        } as const;
        
        handleInputChange(fieldMap[type], result.data.publicUrl);
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const removeImage = (type: 'logo' | 'favicon') => {
    const fieldMap = {
      logo: 'logoUrl',
      favicon: 'faviconUrl',
    } as const;
    
    handleInputChange(fieldMap[type], '');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setSettings(result.data);
        // Trigger a refresh in the admin panel by setting a timestamp
        localStorage.setItem('siteSettingsUpdated', Date.now().toString());
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage(null);
  };

  const handleEmailSettingChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // Auto-save individual field after a short delay
    debounceFieldUpdate(field, value);
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    try {
      setTestingEmail(true);
      setEmailTestResult(null);
      
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          testEmail,
          settings 
        }),
      });

      const result = await response.json();
      setEmailTestResult(result);
      
    } catch (error) {
      console.error('Test email error:', error);
      setEmailTestResult({
        success: false,
        error: 'Failed to send test email. Please check your connection.',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 rounded w-1/3 mb-6" style={{ backgroundColor: 'var(--color-border-light)' }}></div>
          <div className="space-y-4">
            <div className="h-32 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}></div>
            <div className="h-32 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style jsx>{`
        input::placeholder,
        textarea::placeholder {
          color: var(--color-text-muted) !important;
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Site Settings</h1>
          <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Manage your website configuration and email settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            style={{ 
              color: 'var(--color-text-secondary)', 
              borderColor: 'var(--color-border-light)',
              backgroundColor: 'var(--color-bg-primary)'
            }}
          >
            <RotateCcw className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            <span>Reset</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}
          >
            <Save className="w-4 h-4" style={{ color: 'var(--color-bg-primary)' }} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="p-4 rounded-lg" style={{
          backgroundColor: message.type === 'success' ? 'var(--color-success-light)' : 'var(--color-error-light)',
          color: message.type === 'success' ? 'var(--color-success-dark)' : 'var(--color-error-dark)',
          borderColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--color-border-light)' }}>
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            style={{
              borderColor: activeTab === 'general' 
                ? 'var(--color-primary)' 
                : 'transparent',
              color: activeTab === 'general' 
                ? 'var(--color-primary)' 
                : 'var(--color-text-secondary)'
            }}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" style={{
                color: activeTab === 'general' 
                  ? 'var(--color-primary)' 
                  : 'var(--color-text-secondary)'
              }} />
              <span>General Settings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            style={{
              borderColor: activeTab === 'company' 
                ? 'var(--color-primary)' 
                : 'transparent',
              color: activeTab === 'company' 
                ? 'var(--color-primary)' 
                : 'var(--color-text-secondary)'
            }}
          >
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" style={{
                color: activeTab === 'company' 
                  ? 'var(--color-primary)' 
                  : 'var(--color-text-secondary)'
              }} />
              <span>Company Information</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            style={{
              borderColor: activeTab === 'email' 
                ? 'var(--color-primary)' 
                : 'transparent',
              color: activeTab === 'email' 
                ? 'var(--color-primary)' 
                : 'var(--color-text-secondary)'
            }}
          >
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" style={{
                color: activeTab === 'email' 
                  ? 'var(--color-primary)' 
                  : 'var(--color-text-secondary)'
              }} />
              <span>Email Settings</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('cloudinary')}
            className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            style={{
              borderColor: activeTab === 'cloudinary' 
                ? 'var(--color-primary)' 
                : 'transparent',
              color: activeTab === 'cloudinary' 
                ? 'var(--color-primary)' 
                : 'var(--color-text-secondary)'
            }}
          >
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4" style={{
                color: activeTab === 'cloudinary' 
                  ? 'var(--color-primary)' 
                  : 'var(--color-text-secondary)'
              }} />
              <span>Cloudinary</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('sidebar')}
            className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            style={{
              borderColor: activeTab === 'sidebar' 
                ? 'var(--color-primary)' 
                : 'transparent',
              color: activeTab === 'sidebar' 
                ? 'var(--color-primary)' 
                : 'var(--color-text-secondary)'
            }}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" style={{
                color: activeTab === 'sidebar' 
                  ? 'var(--color-primary)' 
                  : 'var(--color-text-secondary)'
              }} />
              <span>Company Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Base URL Section - Separate row with reduced height */}
          <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-info-light)' }}>
                <Globe className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Base URL</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>The absolute base URL for server-side API calls</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Base URL
              </label>
              <Input
                type="url"
                placeholder="https://mysite.com"
                value={settings.baseUrl || ''}
                onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                className="h-10"
                style={{ 
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-light)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Used for server-side API calls. Leave blank to use environment default.
              </p>
            </div>
          </Card>

          {/* Logo Settings */}
          <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
            <div className="flex items-center space-x-2 mb-4">
              <Image className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Site Logo</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Used for sidebar and login page</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Logo URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={settings.logoUrl || ''}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  className="h-10"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
              </div>

              {/* Media Selector */}
              <MediaSelector
                value={settings.logoUrl ? {
                  id: 0,
                  filename: 'Selected Logo',
                  fileType: 'image' as const,
                  mimeType: 'image/*',
                  fileSize: 0,
                  publicUrl: settings.logoUrl
                } : null}
                onChange={(media) => handleMediaSelect('logoUrl', media)}
                acceptedTypes={['image/*']}
                label="Select from media library"
                placeholder="Choose from uploaded images..."
                className="mb-3"
              />

              {/* Logo Preview */}
              {settings.logoUrl && (
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--color-border-light)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Preview:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage('logo')}
                      className="h-6 w-6 p-0"
                      style={{ color: 'var(--color-error)', borderColor: 'var(--color-border-light)' }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center rounded p-2" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)' }}>
                    <img
                      src={settings.logoUrl}
                      alt="Logo Preview"
                      className="max-h-12 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer"
                style={{ borderColor: 'var(--color-border-light)' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'logo')}
                onClick={() => logoFileRef.current?.click()}
              >
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'logo')}
                  className="hidden"
                />
                {uploadingLogo ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--color-info)' }}></div>
                    <span className="ml-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PNG, JPG, SVG up to 2MB</p>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Favicon Settings */}
          <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Site Favicon</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Small icon displayed in browser tabs</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Favicon URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/favicon.ico"
                  value={settings.faviconUrl || ''}
                  onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                  className="h-10"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
              </div>

              <MediaSelector
                value={settings.faviconUrl ? {
                  id: 0,
                  filename: 'Selected Favicon',
                  fileType: 'image' as const,
                  mimeType: 'image/*',
                  fileSize: 0,
                  publicUrl: settings.faviconUrl
                } : null}
                onChange={(media) => handleMediaSelect('faviconUrl', media)}
                acceptedTypes={['image/*']}
                label="Select from media library"
                placeholder="Choose from uploaded images..."
                className="mb-3"
              />

              {settings.faviconUrl && (
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--color-border-light)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Preview:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage('favicon')}
                      className="h-6 w-6 p-0"
                      style={{ color: 'var(--color-error)', borderColor: 'var(--color-border-light)' }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="rounded p-2 text-center" style={{ border: '1px solid var(--color-border-light)', backgroundColor: 'var(--color-bg-secondary)' }}>
                    <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 mx-auto" />
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer"
                style={{ borderColor: 'var(--color-border-light)' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'favicon')}
                onClick={() => faviconFileRef.current?.click()}
              >
                <input
                  ref={faviconFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'favicon')}
                  className="hidden"
                />
                {uploadingFavicon ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--color-info)' }}></div>
                    <span className="ml-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PNG, JPG, SVG, ICO up to 2MB</p>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Contact Information Tab */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Branding */}
            <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Company Branding</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Company information displayed across the site</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Company Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your Company Name"
                    value={settings.footerCompanyName || ''}
                    onChange={(e) => handleEmailSettingChange('footerCompanyName', e.target.value)}
                    className="h-10"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Company name shown in footer and other locations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Company Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of your company..."
                    value={settings.footerCompanyDescription || ''}
                    onChange={(e) => handleEmailSettingChange('footerCompanyDescription', e.target.value)}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-light)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-border-strong)';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border-light)';
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Short description displayed under company name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Copyright Message
                  </label>
                  <Input
                    type="text"
                    placeholder="© {year} Your Company. All rights reserved."
                    value={settings.footerCopyrightMessage || ''}
                    onChange={(e) => handleEmailSettingChange('footerCopyrightMessage', e.target.value)}
                    className="h-10"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Use {'{year}'} for dynamic year. If empty, uses default format.
                  </p>
                </div>
              </div>
            </Card>

            {/* Company Contact Information */}
            <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
              <div className="flex items-center space-x-2 mb-4">
                <Phone className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Contact Information</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Basic company contact details</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Company Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={settings.companyPhone || ''}
                    onChange={(e) => handleEmailSettingChange('companyPhone', e.target.value)}
                    className="h-10"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Company Email
                  </label>
                  <Input
                    type="email"
                    placeholder="contact@company.com"
                    value={settings.companyEmail || ''}
                    onChange={(e) => handleEmailSettingChange('companyEmail', e.target.value)}
                    className="h-10"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Company Address
                  </label>
                  <textarea
                    rows={3}
                    placeholder="123 Business St, City, State 12345"
                    value={settings.companyAddress || ''}
                    onChange={(e) => handleEmailSettingChange('companyAddress', e.target.value)}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-light)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-border-strong)';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border-light)';
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Social Media Links */}
          <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
                          <div className="flex items-center space-x-2 mb-4">
                <Facebook className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Social Media</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Social media profile links</p>
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  <Facebook className="w-3 h-3 inline mr-1" style={{ color: 'var(--color-text-primary)' }} />
                  Facebook
                </label>
                <Input
                  type="url"
                  placeholder="https://facebook.com/yourcompany"
                  value={settings.socialFacebook || ''}
                  onChange={(e) => handleEmailSettingChange('socialFacebook', e.target.value)}
                  className="h-10"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  <Twitter className="w-3 h-3 inline mr-1" style={{ color: 'var(--color-text-primary)' }} />
                  Twitter
                </label>
                <Input
                  type="url"
                  placeholder="https://twitter.com/yourcompany"
                  value={settings.socialTwitter || ''}
                  onChange={(e) => handleEmailSettingChange('socialTwitter', e.target.value)}
                  className="h-10"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  <Linkedin className="w-3 h-3 inline mr-1" style={{ color: 'var(--color-text-primary)' }} />
                  LinkedIn
                </label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/company/yourcompany"
                  value={settings.socialLinkedin || ''}
                  onChange={(e) => handleEmailSettingChange('socialLinkedin', e.target.value)}
                  className="h-10"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  <Instagram className="w-3 h-3 inline mr-1" style={{ color: 'var(--color-text-primary)' }} />
                  Instagram
                </label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/yourcompany"
                  value={settings.socialInstagram || ''}
                  onChange={(e) => handleEmailSettingChange('socialInstagram', e.target.value)}
                  className="h-10"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  <Youtube className="w-3 h-3 inline mr-1" style={{ color: 'var(--color-text-primary)' }} />
                  YouTube
                </label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/yourcompany"
                  value={settings.socialYoutube || ''}
                  onChange={(e) => handleEmailSettingChange('socialYoutube', e.target.value)}
                  className="h-10"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
              </div>
            </div>
          </Card>


        </div>
      )}

      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SMTP Configuration */}
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>SMTP Configuration</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Configure email sending settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <Checkbox
                  id="smtpEnabled"
                  checked={settings.smtpEnabled || false}
                  onChange={(e) => handleEmailSettingChange('smtpEnabled', e.target.checked)}
                  variant="primary"
                  label="Enable SMTP Email Sending"
                />

                {settings.smtpEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        SMTP Host
                      </label>
                      <Input
                        type="text"
                        placeholder="smtp.gmail.com"
                        value={settings.smtpHost || ''}
                        onChange={(e) => handleEmailSettingChange('smtpHost', e.target.value)}
                        style={{ 
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderColor: 'var(--color-border-light)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        SMTP Port
                      </label>
                      <Input
                        type="number"
                        placeholder="587"
                        value={settings.smtpPort || ''}
                        onChange={(e) => handleEmailSettingChange('smtpPort', parseInt(e.target.value) || null)}
                        style={{ 
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderColor: 'var(--color-border-light)'
                        }}
                      />
                    </div>

                    <Checkbox
                      id="smtpSecure"
                      checked={settings.smtpSecure || false}
                      onChange={(e) => handleEmailSettingChange('smtpSecure', e.target.checked)}
                      variant="primary"
                      label="Use SSL/TLS"
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        SMTP Username
                      </label>
                      <Input
                        type="text"
                        placeholder="your-email@gmail.com"
                        value={settings.smtpUsername || ''}
                        onChange={(e) => handleEmailSettingChange('smtpUsername', e.target.value)}
                        style={{ 
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderColor: 'var(--color-border-light)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        SMTP Password
                      </label>
                      <Input
                        type="password"
                        placeholder="your-app-password"
                        value={settings.smtpPassword || ''}
                        onChange={(e) => handleEmailSettingChange('smtpPassword', e.target.value)}
                        style={{ 
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderColor: 'var(--color-border-light)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        From Email
                      </label>
                      <Input
                        type="email"
                        placeholder="noreply@yourcompany.com"
                        value={settings.smtpFromEmail || ''}
                        onChange={(e) => handleEmailSettingChange('smtpFromEmail', e.target.value)}
                        style={{ 
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderColor: 'var(--color-border-light)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        From Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Your Company"
                        value={settings.smtpFromName || ''}
                        onChange={(e) => handleEmailSettingChange('smtpFromName', e.target.value)}
                        style={{ 
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderColor: 'var(--color-border-light)'
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Test Email */}
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Send className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Test Email</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Send a test email to verify settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Test Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    style={{ 
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                </div>

                <Button
                  onClick={handleTestEmail}
                  disabled={testingEmail || !settings.smtpEnabled || !testEmail}
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}
                >
                  {testingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>

                {!settings.smtpEnabled && (
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Please enable SMTP and configure your settings before testing.
                  </p>
                )}

                {/* Test Results */}
                {emailTestResult && (
                  <div className="mt-4 p-4 rounded-lg" style={{
                    backgroundColor: emailTestResult.success 
                      ? 'var(--color-success-light)' 
                      : 'var(--color-error-light)',
                    border: `1px solid ${emailTestResult.success ? 'var(--color-success)' : 'var(--color-error)'}`
                  }}>
                    <h4 className="text-sm font-semibold mb-2" style={{
                      color: emailTestResult.success ? 'var(--color-success-dark)' : 'var(--color-error-dark)'
                    }}>
                      {emailTestResult.success ? '✅ Email Test Successful!' : '❌ Email Test Failed'}
                    </h4>
                    <p className="text-sm" style={{
                      color: emailTestResult.success ? 'var(--color-success-dark)' : 'var(--color-error-dark)'
                    }}>
                      {emailTestResult.success 
                        ? 'Your email configuration is working correctly!'
                        : emailTestResult.error || 'Unknown error occurred'
                      }
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Cloudinary Settings Tab */}
      {activeTab === 'cloudinary' && (
        <div className="space-y-6">
          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
                          <div className="flex items-center space-x-3 mb-6">
                <Upload className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Cloudinary Configuration</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Configure Cloudinary for media uploads and management</p>
                </div>
              </div>

            <div className="space-y-4">
              <Checkbox
                id="cloudinaryEnabled"
                checked={settings.cloudinaryEnabled || false}
                onChange={(e) => handleEmailSettingChange('cloudinaryEnabled', e.target.checked)}
                variant="primary"
                label="Enable Cloudinary Media Management"
              />

              {settings.cloudinaryEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Cloud Name
                    </label>
                    <Input
                      type="text"
                      placeholder="your-cloud-name"
                      value={settings.cloudinaryCloudName || ''}
                      onChange={(e) => handleEmailSettingChange('cloudinaryCloudName', e.target.value)}
                      style={{ 
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border-light)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Your Cloudinary cloud name (found in your dashboard)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      API Key
                    </label>
                    <Input
                      type="text"
                      placeholder="123456789012345"
                      value={settings.cloudinaryApiKey || ''}
                      onChange={(e) => handleEmailSettingChange('cloudinaryApiKey', e.target.value)}
                      style={{ 
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border-light)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Your Cloudinary API key
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      API Secret
                    </label>
                    <Input
                      type="password"
                      placeholder="your-api-secret"
                      value={settings.cloudinaryApiSecret || ''}
                      onChange={(e) => handleEmailSettingChange('cloudinaryApiSecret', e.target.value)}
                      style={{ 
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border-light)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Your Cloudinary API secret (keep this secure)
                    </p>
                  </div>

                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-info)' }}>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-info-dark)' }}>ℹ️ Cloudinary Setup Instructions</h4>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--color-info-dark)' }}>
                      <li>• Sign up for a free account at <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--color-info)' }}>cloudinary.com</a></li>
                      <li>• Get your credentials from the Dashboard → Settings → Access Keys</li>
                      <li>• Cloudinary will be used for all media uploads and image transformations</li>
                      <li>• Files will be stored in the "yourcompany" folder by default</li>
                    </ul>
                  </div>
                </>
              )}

              {!settings.cloudinaryEnabled && (
                <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-warning-light)', borderColor: 'var(--color-warning)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-warning-dark)' }}>⚠️ Cloudinary Disabled</h4>
                  <p className="text-sm" style={{ color: 'var(--color-warning-dark)' }}>
                    Media uploads will not work without Cloudinary configuration. Enable Cloudinary and configure your credentials to use the media library.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Sidebar Settings Tab */}
      {activeTab === 'sidebar' && (
        <div className="space-y-6">
          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-light)' }}>
            <div className="flex items-center space-x-3 mb-6">
              <Briefcase className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              <div>
                <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Company Settings</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Configure company-wide application settings</p>
              </div>
            </div>

            <div className="max-w-md">
              {/* Currency Symbol */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Currency Symbol
                </label>
                <Input
                  type="text"
                  placeholder="Currency symbol"
                  value={settings.currencySymbol || '$'}
                  onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                  className="w-full"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Currency symbol used throughout the application (e.g., $, €, £, ¥)
                </p>
              </div>

              {/* VAT Percentage */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  VAT Percentage
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="5"
                  value={settings.vatPercent ?? 5}
                  onChange={(e) => handleInputChange('vatPercent', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  VAT percentage used for calculations throughout the application (e.g., 5 for 5%)
                </p>
              </div>
            </div>

          </Card>
        </div>
      )}
    </div>
  );
} 
