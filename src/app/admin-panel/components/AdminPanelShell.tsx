'use client';

import { useState, useEffect, useMemo, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import {
  Menu,
  ChevronLeft,
  Search,
  Home,
  BarChart3,
  FileText,
  Bell,
  LogOut,
  Building2,
  Users,
  User,
  Briefcase,
  HardHat,
  Factory,
  FolderOpen,
  Shield,
  Clock,
  Layers,
  Settings,
  FileBarChart
} from 'lucide-react';

type Section =
  | 'dashboard'
  | 'projects'
  | 'reports'
  | 'clients'
  | 'consultants'
  | 'company-staff'
  | 'labours'
  | 'suppliers'
  | 'plants'
  | 'contacts'
  | 'media-library'
  | 'users'
  | 'roles'
  | 'scheduler'
  | 'design-system'
  | 'site-settings';

interface NavigationItem {
  id: Section;
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  permission: string | null;
}

interface SiteSettings {
  id?: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  footerCompanyName: string | null;
  sidebarBackgroundColor?: string | null;
  sidebarTextColor?: string | null;
  sidebarSelectedColor?: string | null;
  sidebarHoverColor?: string | null;
}

const getNavigationItems = (designSystem: any): NavigationItem[] => {
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  return [
    { id: 'dashboard', name: 'Home', icon: Home, color: colors.primary, permission: null },
    { id: 'reports', name: 'Reports', icon: FileBarChart, color: colors.primary, permission: 'projects.view' },
    { id: 'projects', name: 'Projects', icon: FileText, color: colors.primary, permission: 'projects.view' },
    { id: 'clients', name: 'Clients', icon: Building2, color: colors.info, permission: 'clients.view' },
    { id: 'consultants', name: 'Consultants', icon: Users, color: colors.success, permission: 'consultants.view' },
    { id: 'company-staff', name: 'Staff', icon: User, color: colors.warning, permission: 'staff.view' },
    { id: 'labours', name: 'Labours', icon: HardHat, color: colors.accent, permission: 'labours.view' },
    { id: 'suppliers', name: 'Vendors', icon: Briefcase, color: colors.info, permission: 'vendors.view' },
    { id: 'plants', name: 'Plants', icon: Factory, color: colors.success, permission: 'projects.view' },
    { id: 'contacts', name: 'Contacts', icon: Users, color: colors.info, permission: 'contacts.view' },
    { id: 'media-library', name: 'Media Library', icon: FolderOpen, color: colors.primary, permission: 'media-library.view' },
    { id: 'users', name: 'Users', icon: Users, color: colors.error, permission: 'users.view' },
    { id: 'roles', name: 'Roles', icon: Shield, color: colors.success, permission: 'roles.view' },
    { id: 'scheduler', name: 'Scheduler', icon: Clock, color: colors.warning, permission: 'scheduler.view' },
    { id: 'design-system', name: 'Design System', icon: Layers, color: colors.primary, permission: 'design-system.view' },
    { id: 'site-settings', name: 'Settings', icon: Settings, color: colors.textSecondary, permission: 'settings.view' },
  ];
};

interface AdminPanelShellProps {
  children: ReactNode;
  activeSection?: Section;
}

export default function AdminPanelShell({ children, activeSection: propActiveSection }: AdminPanelShellProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { designSystem } = useDesignSystem();
  const { get } = useAdminApi();
  const { permissions: grantedPermissions, isLoading: userPermissionsLoading } = useUserPermissions();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [activeSection, setActiveSection] = useState<Section>(propActiveSection || 'projects');

  const navigationItems = useMemo(() => getNavigationItems(designSystem), [designSystem]);
  const visibleNavigationItems = useMemo(() => {
    if (userPermissionsLoading) {
      return navigationItems;
    }
    return navigationItems.filter((item) => !item.permission || hasPermission(grantedPermissions, item.permission));
  }, [navigationItems, grantedPermissions, userPermissionsLoading]);

  useEffect(() => {
    if (isLoading || !user) return;

    const fetchSettings = async () => {
      try {
        const response = await get<{ success: boolean; data?: SiteSettings }>('/api/admin/site-settings');
        if (response.success && response.data) {
          setSiteSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
      }
    };

    fetchSettings();
  }, [user, isLoading, get]);

  const handleNavigation = (section: Section) => {
    setActiveSection(section);
    if (section === 'dashboard') {
      router.push('/admin-panel');
    } else {
      router.push(`/admin-panel?section=${section}`);
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4" style={{ color: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/admin-panel/login');
    return null;
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        backgroundColor: 'var(--color-bg-dark)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-16'
        } lg:relative lg:static lg:inset-0`}
        style={{ 
          backgroundColor: 'var(--color-sidebar-bg)',
          borderRight: '0.5px solid var(--color-border-strong)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div 
            className="flex items-center justify-between p-6 sticky top-0 z-10"
            style={{ 
              borderBottom: '0.5px solid var(--color-border-light)',
              height: '80px',
              backgroundColor: 'var(--color-sidebar-header-bg)'
            }}
          >
            {sidebarOpen ? (
              <div className="flex flex-col items-center w-full flex-1 min-w-0">
                {(() => {
                  const logoUrl = siteSettings?.logoUrl;
                  
                  if (logoUrl) {
                    return (
                      <img 
                        src={logoUrl} 
                        alt="Company Logo" 
                        className="w-full h-auto object-contain max-h-12"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    );
                  }
                  
                  return (
                    <div className="flex items-center space-x-3 w-full">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        <Building2 
                          className="w-5 h-5"
                          style={{ color: colors.textPrimary }}
                        />
                      </div>
                      <span 
                        className="font-bold text-sm break-words"
                        style={{ color: 'var(--color-sidebar-header-color)' }}
                      >
                        {siteSettings?.footerCompanyName || 'Company Name'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            ) : null}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: 'var(--color-sidebar-header-color)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {visibleNavigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg text-left transition-colors relative group`}
                style={{ 
                  backgroundColor: activeSection === item.id 
                    ? colors.borderStrong
                    : 'transparent',
                  color: 'var(--color-sidebar-text-color)'
                }}
                title={!sidebarOpen ? item.name : undefined}
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
                  className="w-5 h-5 flex-shrink-0" 
                  style={{ 
                    color: activeSection === item.id 
                      ? colors.primary
                      : 'var(--color-sidebar-text-color)'
                  }}
                />
                {sidebarOpen && (
                  <span 
                    className={`${activeSection === item.id ? 'font-medium' : ''} whitespace-nowrap`}
                  >
                    {item.name}
                  </span>
                )}
                {!sidebarOpen && (
                  <div 
                    className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{
                      backgroundColor: colors.backgroundDark,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    {item.name}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div 
            className="p-4 border-t"
            style={{ 
              borderColor: 'var(--color-border-light)',
              backgroundColor: 'var(--color-sidebar-footer-bg)'
            }}
          >
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.secondary }}
                  >
                    <span 
                      className="font-medium text-sm"
                      style={{ color: colors.textPrimary }}
                    >
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--color-sidebar-text-color)' }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: 'var(--color-sidebar-text-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.secondary }}
                >
                  <span 
                    className="font-medium text-sm"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-sidebar-text-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header 
          className="p-6 lg:hidden sticky top-0 z-20"
          style={{ 
            backgroundColor: 'var(--color-header-bg)',
            borderBottom: '0.5px solid var(--color-border-light)',
            height: '80px'
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200/10 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header 
          className="hidden lg:flex items-center justify-between px-6 py-6 sticky top-0 z-20"
          style={{ 
            backgroundColor: 'var(--color-header-bg)',
            borderBottom: '0.5px solid var(--color-border-light)',
            height: '80px'
          }}
        >
          <div className="flex items-center space-x-3">
            <h1 
              className="text-lg font-bold uppercase"
              style={{ color: 'var(--color-header-text-color)' }}
            >
              {activeSection === 'dashboard' ? 'DASHBOARD' : activeSection.toUpperCase().replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ 
                backgroundColor: colors.secondary,
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
            >
              <span 
                className="font-medium text-sm"
                style={{ color: 'var(--color-text-primary)' }}
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
          {children}
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

