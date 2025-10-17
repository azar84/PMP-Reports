'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { 
  LayoutDashboard, 
  Users, 
  Settings,
  Menu,
  X,
  FolderOpen,
  Palette,
  Layers,
  LogOut,
  Clock,
  Search,
  Home,
  BarChart3,
  FileText,
  Activity,
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import SiteSettingsManager from './components/SiteSettingsManager';
import DesignSystemManager from './components/DesignSystemManager';
import MediaLibraryManager from './components/MediaLibraryManager';
import UserManagement from './components/UserManagement';
import SchedulerManager from './components/SchedulerManager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Section = 'dashboard' | 'media-library' | 'users' | 'scheduler' | 'site-settings' | 'design-system';

// Navigation items with design system colors
const getNavigationItems = (designSystem: any) => {
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  return [
    { id: 'dashboard', name: 'Home', icon: Home, color: colors.primary },
    { id: 'media-library', name: 'Media Library', icon: FolderOpen, color: colors.primary },
    { id: 'users', name: 'Users', icon: Users, color: colors.error },
    { id: 'scheduler', name: 'Scheduler', icon: Clock, color: colors.warning },
    { id: 'design-system', name: 'Design System', icon: Layers, color: colors.primary },
    { id: 'site-settings', name: 'Settings', icon: Settings, color: colors.textSecondary },
  ];
};

interface SiteSettings {
  id?: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  footerCompanyName: string | null;
  footerCompanyDescription: string | null;
  
  // Sidebar Configuration
  sidebarBackgroundColor?: string | null;
  sidebarTextColor?: string | null;
  sidebarSelectedColor?: string | null;
  sidebarHoverColor?: string | null;
  
  // ... other fields
}

export default function AdminPanel() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { designSystem } = useDesignSystem();
  const { get } = useAdminApi();
  
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        const target = event.target as Element;
        if (!target.closest('.notification-container')) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>>([
    {
      id: 1,
      title: 'New user registered',
      message: 'John Doe has registered for an account',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false
    },
    {
      id: 2,
      title: 'Media upload completed',
      message: 'Your image upload has been processed successfully',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false
    },
    {
      id: 3,
      title: 'System maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: true
    }
  ]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    mediaFiles: 0,
    scheduledJobs: 0,
    activeSettings: 0
  });

  useEffect(() => {
    console.log('🔍 Admin Panel: Checking user authentication...');
    console.log('🔍 Admin Panel: User:', user);
    console.log('🔍 Admin Panel: isLoading:', isLoading);
    
    // Don't redirect while still loading
    if (isLoading) {
      console.log('⏳ Admin Panel: Still loading authentication...');
      return;
    }
    
    if (!user) {
      console.log('❌ Admin Panel: No user, redirecting to login...');
      router.push('/admin-panel/login');
      return;
    }

    console.log('✅ Admin Panel: User authenticated, fetching data...');

    const fetchData = async () => {
      try {
        console.log('🔍 Admin Panel: Fetching site settings...');
        // Fetch site settings
        const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
        console.log('🔍 Admin Panel: Site settings response:', settingsResponse);
        if (settingsResponse.success) {
          setSiteSettings(settingsResponse.data);
        }

        console.log('🔍 Admin Panel: Fetching dashboard stats...');
        // Fetch dashboard stats
        const statsResponse = await get<{ success: boolean; data: any }>('/api/admin/dashboard-stats');
        console.log('🔍 Admin Panel: Dashboard stats response:', statsResponse);
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
        setLoadingStats(false);
      } catch (error) {
        console.error('❌ Admin Panel: Error fetching data:', error);
        setLoadingStats(false);
      }
    };

    fetchData();

    // Set up polling for updates
    const checkForUpdates = () => {
      const refreshSettings = async () => {
        try {
          const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
          if (settingsResponse.success) {
            setSiteSettings(settingsResponse.data);
          }
        } catch (error) {
          console.error('Error refreshing settings:', error);
        }
      };

      refreshSettings();
    };

    const interval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user, router, get, isLoading]);

  const handleLogout = () => {
    logout();
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show loading state if no user (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'media-library':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <MediaLibraryManager designSystem={designSystem || undefined} onClose={() => setActiveSection('dashboard')} />
          </div>
        );
      case 'users':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <UserManagement />
          </div>
        );
      case 'scheduler':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <SchedulerManager />
          </div>
        );
      case 'site-settings':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <SiteSettingsManager />
          </div>
        );
      case 'design-system':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <DesignSystemManager />
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >

            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="p-6 rounded-xl"
                style={{ 
                  backgroundColor: colors.backgroundSecondary,
                  border: 'none'
                }}
              >
                <div className="flex flex-col">
                  <p 
                    className="text-3xl font-bold mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    ${dashboardStats.totalUsers * 125000 || 0}
                  </p>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    Revenue
                  </p>
                </div>
              </Card>

              <Card 
                className="p-6 rounded-xl"
                style={{ 
                  backgroundColor: colors.backgroundSecondary,
                  border: 'none'
                }}
              >
                <div className="flex flex-col">
                  <p 
                    className="text-3xl font-bold mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {loadingStats ? '...' : dashboardStats.mediaFiles}
                  </p>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    Active Projects
                  </p>
                </div>
              </Card>

              <Card 
                className="p-6 rounded-xl"
                style={{ 
                  backgroundColor: colors.backgroundSecondary,
                  border: 'none'
                }}
              >
                <div className="flex flex-col">
                  <p 
                    className="text-3xl font-bold mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {loadingStats ? '...' : dashboardStats.scheduledJobs + 24}
                  </p>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    Pending Tasks
                  </p>
                </div>
              </Card>

              <Card 
                className="p-6 rounded-xl"
                style={{ 
                  backgroundColor: colors.backgroundSecondary,
                  border: 'none'
                }}
              >
                <div className="flex flex-col">
                  <p 
                    className="text-3xl font-bold mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {loadingStats ? '...' : dashboardStats.activeSettings + 2}
                  </p>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    New Inquiries
                  </p>
                </div>
              </Card>
            </div>

          </div>
        );
    }
  };

  const navigationItems = getNavigationItems(designSystem);

  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        backgroundColor: colors.backgroundDark,
        color: colors.textPrimary
      }}
    >
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:static lg:inset-0`}
        style={{ 
          backgroundColor: colors.backgroundDark,
          borderRight: `1px solid ${colors.grayDark}`
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div 
            className="flex items-center justify-between p-6 sticky top-0 z-10"
            style={{ 
              borderBottom: `1px solid ${colors.grayDark}`,
              height: '80px', // Match header exactly
              backgroundColor: colors.backgroundSecondary
            }}
          >
            <div className="flex items-center space-x-3">
              {siteSettings?.logoUrl ? (
                <img 
                  src={siteSettings.logoUrl} 
                  alt="Logo" 
                  className="h-8 w-auto"
                />
              ) : (
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <span 
                            className="font-bold text-sm"
                            style={{ color: colors.textPrimary }}
                          >
                            A
                          </span>
                        </div>
              )}
              <span 
                className="font-bold text-lg"
                style={{ color: colors.textPrimary }}
              >
                {siteSettings?.footerCompanyName || 'Company Name'}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg"
              style={{ 
                color: colors.textSecondary
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as Section);
                  setSidebarOpen(false);
                }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative"
                        style={{ 
                          backgroundColor: activeSection === item.id 
                            ? colors.grayMedium
                            : 'transparent',
                          color: colors.textPrimary
                        }}
              >
                {activeSection === item.id && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                    style={{ 
                      backgroundColor: colors.primary
                    }}
                  />
                )}
                <item.icon 
                  className="w-5 h-5" 
                  style={{ 
                    color: activeSection === item.id 
                      ? colors.primary
                      : colors.textPrimary
                  }}
                />
                <span 
                  className={activeSection === item.id ? 'font-medium' : ''}
                >
                  {item.name}
                </span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div 
            className="p-4"
            style={{ 
              borderTop: `1px solid ${colors.grayDark}`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <span 
                    className="font-medium text-sm"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.email}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Administrator
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg"
                style={{ color: colors.textSecondary }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header 
          className="border-b p-6 lg:hidden sticky top-0 z-20"
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.grayDark,
            height: '80px' // Match sidebar logo section exactly
          }}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.grayLight,
                  color: colors.textPrimary
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.grayLight;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header 
          className="hidden lg:flex items-center justify-between px-6 py-6 border-b sticky top-0 z-20"
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.grayDark,
            height: '80px' // Match sidebar logo section exactly
          }}
        >
          <div className="flex items-center space-x-3">
            <h1 
              className="text-lg font-bold uppercase"
              style={{ color: colors.textPrimary }}
            >
              {activeSection === 'dashboard' ? 'DASHBOARD' : activeSection.toUpperCase().replace('-', ' ')}
            </h1>
          </div>
          
          {/* Centered Search */}
          <div className="flex-1 flex justify-center px-8">
            <div className="relative w-full" style={{ width: '70%' }}>
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.grayLight,
                  color: colors.textPrimary
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.grayLight;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative notification-container">
              <button
                className="p-2 rounded-lg transition-colors relative"
                style={{ 
                  color: colors.textSecondary,
                  backgroundColor: 'transparent'
                }}
                onClick={() => setShowNotifications(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Bell className="w-5 h-5" />
                {/* Notification badge */}
                <span 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ 
                    backgroundColor: colors.error,
                    color: colors.backgroundPrimary
                  }}
                >
                  {notifications.filter(n => !n.read).length}
                </span>
              </button>
              
              {/* Notification Manager */}
              {showNotifications && (
                <NotificationManager
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  onMarkAsRead={(id) => {
                    setNotifications(prev => 
                      prev.map(notif => 
                        notif.id === id ? { ...notif, read: true } : notif
                      )
                    );
                  }}
                  onMarkAllAsRead={() => {
                    setNotifications(prev => 
                      prev.map(notif => ({ ...notif, read: true }))
                    );
                  }}
                  colors={colors}
                />
              )}
            </div>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ 
                backgroundColor: colors.info,
                color: colors.textPrimary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.info;
              }}
            >
              <span 
                className="font-medium text-sm"
                style={{ color: colors.textPrimary }}
              >
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main 
          className="flex-1 overflow-auto"
          style={{ 
            backgroundColor: colors.backgroundDark
          }}
        >
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </div>
  );
}

// Notification Manager Component
const NotificationManager: React.FC<{
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  colors: any;
}> = ({ notifications, onClose, onMarkAsRead, onMarkAllAsRead, colors }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />;
      case 'warning': return <AlertCircle className="w-5 h-5" style={{ color: colors.warning }} />;
      case 'error': return <AlertCircle className="w-5 h-5" style={{ color: colors.error }} />;
      default: return <Info className="w-5 h-5" style={{ color: colors.info }} />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div 
      className="absolute top-full right-0 mt-2 rounded-xl shadow-2xl w-80 max-h-[80vh] overflow-hidden z-[70]"
      style={{ 
        backgroundColor: colors.backgroundSecondary,
        border: `0.5px solid ${colors.grayLight}50`
      }}
      onClick={(e) => e.stopPropagation()}
    >
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ 
            borderBottom: `0.5px solid ${colors.grayLight}30`
          }}
        >
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" style={{ color: colors.textPrimary }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-bold"
                style={{ 
                  backgroundColor: colors.error,
                  color: colors.backgroundPrimary
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ 
                  color: colors.textSecondary,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded transition-colors"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellOff className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
              <p style={{ color: colors.textSecondary }}>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors cursor-pointer ${
                  !notification.read ? 'opacity-100' : 'opacity-70'
                }`}
                style={{ 
                  borderBottom: `0.5px solid ${colors.grayLight}20`,
                  backgroundColor: notification.read ? 'transparent' : `${colors.backgroundPrimary}20`
                }}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 
                        className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}
                        style={{ color: colors.textPrimary }}
                      >
                        {notification.title}
                      </h4>
                      <span 
                        className="text-xs"
                        style={{ color: colors.textMuted }}
                      >
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p 
                      className="text-sm mt-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
};