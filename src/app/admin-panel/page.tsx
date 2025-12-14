'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
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
  Info,
  Building2,
  User,
  Briefcase,
  HardHat,
  Shield,
  Factory,
  FileBarChart,
  ArrowRight,
  Truck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import SiteSettingsManager from './components/SiteSettingsManager';
import DesignSystemManager from './components/DesignSystemManager';
import UserManagement from './components/UserManagement';
import SchedulerManager from './components/SchedulerManager';
import ProjectManager from './components/ProjectManager';
import ReportsManager from './components/ReportsManager';
import ClientManager from './components/ClientManager';
import ConsultantManager from './components/ConsultantManager';
import CompanyStaffManager from './components/CompanyStaffManager';
import LabourManager from './components/LabourManager';
import PlantManager from './components/PlantManager';
import ContactManager from './components/ContactManager';
import SupplierManager from './components/SupplierManager';
import RolesManager from './components/RolesManager';
import MainDashboard from './components/MainDashboard';
import type { PermissionKey } from '@/lib/permissionsCatalog';
import { PERMISSIONS } from '@/lib/permissionsCatalog';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  | 'users'
  | 'roles'
  | 'scheduler'
  | 'site-settings'
  | 'design-system';

interface NavigationItem {
  id: Section | 'settings' | 'people' | 'contacts';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  permission?: PermissionKey | null;
  children?: NavigationItem[];
}

// Navigation items with design system colors
const getNavigationItems = (designSystem: any): NavigationItem[] => {
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  return [
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: colors.primary, permission: null },
    { id: 'reports', name: 'Reports', icon: FileBarChart, color: colors.primary, permission: 'reports.view' },
    { id: 'projects', name: 'Projects', icon: FileText, color: colors.primary, permission: 'projects.view' },
    { 
      id: 'people', 
      name: 'People', 
      icon: Users, 
      color: colors.primary, 
      permission: null,
      children: [
        { id: 'company-staff', name: 'Staff', icon: User, color: colors.warning, permission: 'staff.view' },
        { id: 'labours', name: 'Labours', icon: HardHat, color: colors.accent, permission: 'labours.view' },
      ]
    },
    { id: 'suppliers', name: 'Vendors', icon: Briefcase, color: colors.info, permission: 'suppliers.view' },
    { id: 'plants', name: 'Plant', icon: Truck, color: colors.success, permission: 'projects.view' },
    { 
      id: 'contacts', 
      name: 'Contacts', 
      icon: Users, 
      color: colors.info, 
      permission: null,
      children: [
        { id: 'contacts', name: 'All Contacts', icon: Users, color: colors.info, permission: 'contacts.view' },
        { id: 'consultants', name: 'Consultants', icon: Users, color: colors.success, permission: 'consultants.view' },
        { id: 'clients', name: 'Clients', icon: Building2, color: colors.info, permission: 'clients.view' },
      ]
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings, 
      color: colors.textSecondary, 
      permission: null,
      children: [
        { id: 'users', name: 'Users', icon: Users, color: colors.error, permission: 'users.view' },
        { id: 'roles', name: 'Roles', icon: Shield, color: colors.success, permission: 'roles.view' },
        { id: 'scheduler', name: 'Scheduler', icon: Clock, color: colors.warning, permission: 'scheduler.view' },
        { id: 'design-system', name: 'Design System', icon: Layers, color: colors.primary, permission: 'design-system.view' },
        { id: 'site-settings', name: 'Site Settings', icon: Settings, color: colors.textSecondary, permission: 'settings.view' },
      ]
    },
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
  const { permissions: grantedPermissions, isLoading: userPermissionsLoading } = useUserPermissions();

  // Immediate redirect if not authenticated - don't render anything
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/admin-panel/login');
    }
  }, [user, isLoading, router]);
  
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [peopleMenuOpen, setPeopleMenuOpen] = useState(false);
  const [contactsMenuOpen, setContactsMenuOpen] = useState(false);
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
    activeSettings: 0,
    totalProjects: 0,
    ongoingProjects: 0,
    totalClients: 0,
    totalConsultants: 0,
    totalStaff: 0,
    totalLabours: 0,
    totalSuppliers: 0,
    totalPlants: 0
  });

  const navigationItems = useMemo(() => getNavigationItems(designSystem), [designSystem]);
  const visibleNavigationItems = useMemo(() => {
    if (userPermissionsLoading) {
      return navigationItems;
    }
    return navigationItems.filter((item) => {
      if (item.children) {
        // For parent items with children, check if any child has permission
        return item.children.some(child => !child.permission || hasPermission(grantedPermissions, child.permission));
      }
      return !item.permission || hasPermission(grantedPermissions, item.permission);
    });
  }, [navigationItems, grantedPermissions, userPermissionsLoading]);
  
  // Flatten navigation items for active section checking
  const allNavigationItems = useMemo(() => {
    const items: NavigationItem[] = [];
    navigationItems.forEach(item => {
      if (item.children) {
        items.push(...item.children);
      } else {
        items.push(item);
      }
    });
    return items;
  }, [navigationItems]);

  useEffect(() => {
    if (visibleNavigationItems.length === 0) {
      return;
    }

    const hasActiveSection = allNavigationItems.some((item) => item.id === activeSection);
    if (!hasActiveSection && allNavigationItems.length > 0) {
      setActiveSection(allNavigationItems[0].id as Section);
    }
    
    // Auto-expand settings menu if a settings child is active
    const settingsItem = navigationItems.find(item => item.id === 'settings');
    if (settingsItem?.children?.some(child => child.id === activeSection)) {
      setSettingsMenuOpen(true);
    }
    
    // Auto-expand people menu if a people child is active
    const peopleItem = navigationItems.find(item => item.id === 'people');
    if (peopleItem?.children?.some(child => child.id === activeSection)) {
      setPeopleMenuOpen(true);
    }
    
    // Auto-expand contacts menu if a contacts child is active
    const contactsItem = navigationItems.find(item => item.id === 'contacts');
    if (contactsItem?.children?.some(child => child.id === activeSection)) {
      setContactsMenuOpen(true);
    }
  }, [allNavigationItems, activeSection, navigationItems]);

  useEffect(() => {
    // Don't fetch data while still loading or if no user
    if (isLoading || !user) {
      if (!isLoading && !user) {
        router.replace('/admin-panel/login');
      }
      return;
    }
    
    const fetchData = async () => {
      // Double-check user exists before making API calls
    if (!user) {
      return;
    }

      try {
        console.log('🔍 Admin Panel: Fetching site settings...');
        // Fetch site settings
        const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
        if (settingsResponse.success) {
          setSiteSettings(settingsResponse.data);
        }

        console.log('🔍 Admin Panel: Fetching dashboard stats...');
        // Fetch dashboard stats and project data
        const [statsResponse, projectsRes, clientsRes, consultantsRes, staffRes, laboursRes, suppliersRes, plantsRes] = await Promise.all([
          get<{ success: boolean; data: any }>('/api/admin/dashboard-stats'),
          get<{ success: boolean; data: any[] }>('/api/admin/projects'),
          get<{ success: boolean; data: any[] }>('/api/admin/clients'),
          get<{ success: boolean; data: any[] }>('/api/admin/consultants'),
          get<{ success: boolean; data: any[] }>('/api/admin/company-staff'),
          get<{ success: boolean; data: any[] }>('/api/admin/labours'),
          get<{ success: boolean; data: { suppliers: any[] } }>('/api/admin/suppliers'),
          get<{ success: boolean; data: any[] }>('/api/admin/plants'),
        ]);
        
        console.log('🔍 Admin Panel: Dashboard stats response:', statsResponse);
        if (statsResponse.success) {
          const projects = projectsRes.success ? projectsRes.data : [];
          const ongoingProjects = projects.filter((p: any) => p.status === 'ongoing').length;
          
          setDashboardStats({
            ...statsResponse.data,
            totalProjects: projects.length,
            ongoingProjects: ongoingProjects,
            totalClients: clientsRes.success ? clientsRes.data.length : 0,
            totalConsultants: consultantsRes.success ? consultantsRes.data.length : 0,
            totalStaff: staffRes.success ? staffRes.data.length : 0,
            totalLabours: laboursRes.success ? laboursRes.data.length : 0,
            totalSuppliers: suppliersRes.success ? (suppliersRes.data.suppliers?.length || 0) : 0,
            totalPlants: plantsRes.success ? plantsRes.data.length : 0,
          });
        }
        setLoadingStats(false);
      } catch (error: any) {
        // Silently handle 401 errors - redirect will happen via auth guards
        if (error?.status === 401) {
          setLoadingStats(false);
          return;
        }
        console.error('❌ Admin Panel: Error fetching data:', error);
        setLoadingStats(false);
      }
    };

    // Only fetch data if user is authenticated
    fetchData();

    // Set up polling for updates
    const checkForUpdates = () => {
      // Don't poll if user is not authenticated
      if (!user) {
        return;
      }

      const refreshSettings = async () => {
        try {
          const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
          if (settingsResponse.success) {
            setSiteSettings(settingsResponse.data);
          }
        } catch (error: any) {
          // Silently handle 401 errors
          if (error?.status === 401) {
            return;
          }
          console.error('Error refreshing settings:', error);
        }
      };

      refreshSettings();
    };

    const interval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
    
    // Listen for site settings updates from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'siteSettingsUpdated') {
        checkForUpdates();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates from same-window updates
    const checkLocalStorage = setInterval(() => {
      const updated = localStorage.getItem('siteSettingsUpdated');
      if (updated) {
        checkForUpdates();
        localStorage.removeItem('siteSettingsUpdated');
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(checkLocalStorage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, router, get, isLoading]);

  const handleLogout = () => {
    logout();
  };

  // Block ALL rendering until authenticated - simple and effective
  // If session expired, redirect happens in useEffect above
  if (isLoading || !user) {
    return null; // Don't render anything - redirect will happen
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'projects':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <ProjectManager />
          </div>
        );
      case 'reports':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <ReportsManager />
          </div>
        );
      case 'clients':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <ClientManager />
          </div>
        );
      case 'consultants':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <ConsultantManager />
          </div>
        );
      case 'company-staff':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <CompanyStaffManager />
          </div>
        );
      case 'labours':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <LabourManager />
          </div>
        );
      case 'suppliers':
        return (
          <div
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <SupplierManager />
          </div>
        );
      case 'plants':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <PlantManager />
          </div>
        );
      case 'contacts':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <ContactManager />
          </div>
        );
      case 'roles':
        return (
          <div
            className="p-8 space-y-8"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <RolesManager />
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
            {/* Main Dashboard */}
            {hasPermission(grantedPermissions, 'projects.view') && (
              <MainDashboard />
            )}

          </div>
        );
    }
  };

  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
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
              height: '80px', // Match header exactly
              backgroundColor: 'var(--color-sidebar-header-bg)'
            }}
          >
            {sidebarOpen ? (
              <div className="flex flex-col items-center w-full flex-1 min-w-0">
                {(() => {
                  // Use the single logo URL
                  const logoUrl = siteSettings?.logoUrl;
                  
                  if (logoUrl) {
                    return (
                      <img 
                        src={logoUrl} 
                        alt="Company Logo" 
                        className="w-full h-auto object-contain max-h-12"
                        onError={(e) => {
                          console.error('❌ Failed to load logo image:', logoUrl);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                />
                    );
                  }
                  
                  // If no logo, show icon and company name
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
            {visibleNavigationItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isSettingsItem = item.id === 'settings';
              const isPeopleItem = item.id === 'people';
              const isContactsItem = item.id === 'contacts';
              const isActive = hasChildren 
                ? item.children?.some(child => child.id === activeSection)
                : activeSection === item.id;
              const isExpanded = isSettingsItem ? settingsMenuOpen : (isPeopleItem ? peopleMenuOpen : (isContactsItem ? contactsMenuOpen : false));
              
              // Filter children by permissions
              const visibleChildren = hasChildren ? item.children?.filter(child => 
                !child.permission || hasPermission(grantedPermissions, child.permission)
              ) : [];
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        if (isSettingsItem) {
                          setSettingsMenuOpen(!settingsMenuOpen);
                        } else if (isPeopleItem) {
                          setPeopleMenuOpen(!peopleMenuOpen);
                        } else if (isContactsItem) {
                          setContactsMenuOpen(!contactsMenuOpen);
                        }
                      } else {
                        setActiveSection(item.id as Section);
                        // Only close on mobile (check if window is available)
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }
                    }}
                    className={`w-full flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg text-left transition-colors relative group`}
                    style={{ 
                      backgroundColor: isActive && !hasChildren
                        ? colors.borderStrong
                        : 'transparent',
                      color: 'var(--color-sidebar-text-color)'
                    }}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    {isActive && !hasChildren && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        style={{ 
                          backgroundColor: colors.primary
                        }}
                      />
                    )}
                    <div style={{ 
                        color: isActive 
                          ? colors.primary
                          : 'var(--color-sidebar-text-color)'
                      }}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    {sidebarOpen && (
                      <>
                        <span 
                          className={`${isActive ? 'font-medium' : ''} whitespace-nowrap flex-1`}
                        >
                          {item.name}
                        </span>
                        {hasChildren && (
                          <div style={{ color: 'var(--color-sidebar-text-color)' }}>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {/* Tooltip for collapsed state */}
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
                  
                  {/* Nested children */}
                  {hasChildren && isExpanded && sidebarOpen && visibleChildren && visibleChildren.length > 0 && (
                    <div className="ml-4 space-y-1 mt-1">
                      {visibleChildren.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveSection(child.id as Section);
                            // Only close on mobile (check if window is available)
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors relative group"
                          style={{ 
                            backgroundColor: activeSection === child.id 
                              ? colors.borderStrong
                              : 'transparent',
                            color: 'var(--color-sidebar-text-color)'
                          }}
                        >
                          {activeSection === child.id && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                              style={{ 
                                backgroundColor: colors.primary
                              }}
                            />
                          )}
                          <div style={{ 
                              color: activeSection === child.id 
                                ? colors.primary
                                : 'var(--color-sidebar-text-color)'
                            }}>
                            <child.icon className="w-4 h-4 flex-shrink-0" />
                          </div>
                          <span 
                            className={`${activeSection === child.id ? 'font-medium' : ''} whitespace-nowrap text-sm`}
                          >
                            {child.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Info */}
          <div 
            className="p-4"
            style={{ 
              borderTop: `0.5px solid ${colors.borderStrong}`
            }}
          >
            {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                  <div className="min-w-0">
                  <p 
                      className="text-sm font-medium truncate"
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
                  className="p-2 rounded-lg transition-colors flex-shrink-0"
                style={{ color: colors.textSecondary }}
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
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.textSecondary }}
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
        {/* Header */}
        <header 
          className="p-6 lg:hidden sticky top-0 z-20"
          style={{ 
            backgroundColor: 'var(--color-header-bg)',
            borderBottom: '0.5px solid var(--color-border-light)',
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
            height: '80px' // Match sidebar logo section exactly
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
            <div className="relative notification-container">
              <button
                className="p-2 rounded-lg transition-colors relative"
                style={{ 
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'transparent'
                }}
                onClick={() => setShowNotifications(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-dark)';
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