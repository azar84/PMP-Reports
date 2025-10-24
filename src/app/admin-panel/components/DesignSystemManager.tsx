'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { 
  Palette, 
  Type, 
  Ruler, 
  Settings, 
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
  Monitor,
  Sun,
  Moon
} from 'lucide-react';

interface DesignSystem {
  id?: number;
  // Brand Colors
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColor: string;
  accentColor: string;
  // Semantic Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  // Neutral Colors
  borderLight: string;
  borderStrong: string;
  // Background Colors
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDark: string;
  headerBackgroundColor: string;
  sidebarHeaderBackgroundColor: string;
  sidebarBackgroundColor: string;
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headerTextColor: string;
  sidebarTextColor: string;
  sidebarHeaderColor: string;
  // Typography
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  lineHeightBase: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  // Spacing Scale
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  // Border Radius
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  borderRadiusXl: string;
  borderRadiusFull: string;
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  // Animation Durations
  animationFast: string;
  animationNormal: string;
  animationSlow: string;
  // Breakpoints
  breakpointSm: string;
  breakpointMd: string;
  breakpointLg: string;
  breakpointXl: string;
  breakpoint2xl: string;
  // Theme Mode
  themeMode: string;
  // Custom Variables
  customVariables?: string;
  // System Fields
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
  colors: any;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, description, colors }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div
          className="w-12 h-12 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="px-3"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </div>
      {description && (
        <p className="text-xs" style={{ color: colors.textMuted }}>{description}</p>
      )}
    </div>
  );
};

const DesignSystemManager: React.FC = () => {
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'effects' | 'breakpoints' | 'preview'>('colors');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    fetchDesignSystem();
  }, []);

  // Apply design system whenever it changes
  useEffect(() => {
    if (designSystem) {
      try {
        applyDesignSystemToRoot(designSystem);
      } catch (error) {
        console.error('Error applying design system in useEffect:', error);
      }
    }
  }, [designSystem]);

  const fetchDesignSystem = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/design-system');
      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
        // Apply design system to document root when loading
        try {
          applyDesignSystemToRoot(result.data);
        } catch (error) {
          console.error('Error applying design system to root on load:', error);
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to load design system' });
      }
    } catch (error) {
      console.error('Failed to fetch design system:', error);
      setMessage({ type: 'error', text: 'Failed to load design system' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!designSystem) return;

    try {
      setSaving(true);
      setMessage(null);

      console.log('Saving design system data:', designSystem);

      // Always use POST to create/update - let the API handle the logic
      const response = await fetch('/api/admin/design-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designSystem),
      });

      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
        setMessage({ type: 'success', text: 'Design system saved successfully!' });
        
        // Apply design system to document root for preview
        try {
          applyDesignSystemToRoot(result.data);
        } catch (error) {
          console.error('Error applying design system to root:', error);
          // Don't show error to user as the save was successful
        }
      } else {
        console.error('Design system save failed:', result);
        if (result.detailedErrors) {
          console.error('Detailed validation errors:', result.detailedErrors);
        }
        let errorMessage = result.message || 'Failed to save design system';
        if (result.detailedErrors && result.detailedErrors.length > 0) {
          errorMessage += '. Check console for details.';
        }
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Failed to save design system:', error);
      setMessage({ type: 'error', text: 'Failed to save design system' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/admin/design-system', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
        setMessage({ type: 'success', text: 'Design system reset to defaults!' });
        
        // Apply design system to document root
        applyDesignSystemToRoot(result.data);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to reset design system' });
      }
    } catch (error) {
      console.error('Failed to reset design system:', error);
      setMessage({ type: 'error', text: 'Failed to reset design system' });
    } finally {
      setSaving(false);
    }
  };

  const applyDesignSystemToRoot = (ds: DesignSystem) => {
    if (!ds) {
      console.warn('Design system is null or undefined');
      return;
    }
    
    const root = document.documentElement;
    if (!root) {
      console.warn('Document root element not found');
      return;
    }
    
    try {
      // Apply CSS custom properties to the root element
      root.style.setProperty('--color-primary', ds.primaryColor);
      root.style.setProperty('--color-primary-light', ds.primaryColorLight);
      root.style.setProperty('--color-primary-dark', ds.primaryColorDark);
      root.style.setProperty('--color-secondary', ds.secondaryColor);
      root.style.setProperty('--color-accent', ds.accentColor);
      
      root.style.setProperty('--color-success', ds.successColor);
      root.style.setProperty('--color-warning', ds.warningColor);
      root.style.setProperty('--color-error', ds.errorColor);
      root.style.setProperty('--color-info', ds.infoColor);
      
      root.style.setProperty('--color-border-light', ds.borderLight);
      root.style.setProperty('--color-border-strong', ds.borderStrong);
      
      root.style.setProperty('--color-bg-primary', ds.backgroundPrimary);
      root.style.setProperty('--color-bg-secondary', ds.backgroundSecondary);
      root.style.setProperty('--color-bg-dark', ds.backgroundDark);
      
      // Header and sidebar background colors (with fallbacks)
      root.style.setProperty('--color-header-bg', ds.headerBackgroundColor || ds.primaryColor);
      root.style.setProperty('--color-sidebar-header-bg', ds.sidebarHeaderBackgroundColor || ds.primaryColor);
      root.style.setProperty('--color-sidebar-bg', ds.sidebarBackgroundColor || ds.backgroundSecondary);
      
      root.style.setProperty('--color-text-primary', ds.textPrimary);
      root.style.setProperty('--color-text-secondary', ds.textSecondary);
      root.style.setProperty('--color-text-muted', ds.textMuted);
      
      // Header and sidebar text colors (with fallbacks)
      root.style.setProperty('--color-header-text-color', ds.headerTextColor || ds.textPrimary);
      root.style.setProperty('--color-sidebar-text-color', ds.sidebarTextColor || ds.textPrimary);
      root.style.setProperty('--color-sidebar-header-color', ds.sidebarHeaderColor || ds.textPrimary);
      
      root.style.setProperty('--font-family-sans', ds.fontFamily);
      root.style.setProperty('--font-family-mono', ds.fontFamilyMono);
      root.style.setProperty('--font-size-base', ds.fontSizeBase);
      root.style.setProperty('--line-height-base', ds.lineHeightBase);
      root.style.setProperty('--font-weight-normal', ds.fontWeightNormal);
      root.style.setProperty('--font-weight-medium', ds.fontWeightMedium);
      root.style.setProperty('--font-weight-bold', ds.fontWeightBold);
      
      root.style.setProperty('--spacing-xs', ds.spacingXs);
      root.style.setProperty('--spacing-sm', ds.spacingSm);
      root.style.setProperty('--spacing-md', ds.spacingMd);
      root.style.setProperty('--spacing-lg', ds.spacingLg);
      root.style.setProperty('--spacing-xl', ds.spacingXl);
      root.style.setProperty('--spacing-2xl', ds.spacing2xl);
      
      root.style.setProperty('--border-radius-sm', ds.borderRadiusSm);
      root.style.setProperty('--border-radius-md', ds.borderRadiusMd);
      root.style.setProperty('--border-radius-lg', ds.borderRadiusLg);
      root.style.setProperty('--border-radius-xl', ds.borderRadiusXl);
      root.style.setProperty('--border-radius-full', ds.borderRadiusFull);
      
      root.style.setProperty('--shadow-sm', ds.shadowSm);
      root.style.setProperty('--shadow-md', ds.shadowMd);
      root.style.setProperty('--shadow-lg', ds.shadowLg);
      root.style.setProperty('--shadow-xl', ds.shadowXl);
      
      root.style.setProperty('--animation-fast', ds.animationFast);
      root.style.setProperty('--animation-normal', ds.animationNormal);
      root.style.setProperty('--animation-slow', ds.animationSlow);
    } catch (error) {
      console.error('Error setting CSS properties:', error);
      throw error; // Re-throw to be caught by calling functions
    }
  };

  const updateDesignSystem = (field: keyof DesignSystem, value: string | boolean) => {
    if (!designSystem) return;
    
    setDesignSystem(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const exportDesignSystem = () => {
    if (!designSystem) return;
    
    const dataStr = JSON.stringify(designSystem, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'design-system.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importDesignSystem = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (validateDesignSystemData(jsonData)) {
          // Apply fallbacks for missing properties
          const designSystemWithFallbacks = {
            ...jsonData,
            headerBackgroundColor: jsonData.headerBackgroundColor || jsonData.primaryColor,
            sidebarHeaderBackgroundColor: jsonData.sidebarHeaderBackgroundColor || jsonData.primaryColor,
            sidebarBackgroundColor: jsonData.sidebarBackgroundColor || jsonData.backgroundSecondary,
            headerTextColor: jsonData.headerTextColor || jsonData.textPrimary,
            sidebarTextColor: jsonData.sidebarTextColor || jsonData.textPrimary,
            sidebarHeaderColor: jsonData.sidebarHeaderColor || jsonData.textPrimary,
          };
          
          setDesignSystem(designSystemWithFallbacks);
          setMessage({ type: 'success', text: 'Design system imported successfully!' });
          
          // Apply the imported design system
          try {
            applyDesignSystemToRoot(designSystemWithFallbacks);
          } catch (error) {
            console.error('Error applying imported design system:', error);
          }
        } else {
          setMessage({ type: 'error', text: 'Invalid design system file format' });
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        setMessage({ type: 'error', text: 'Failed to parse JSON file' });
      }
    };
    
    reader.readAsText(file);
    
    // Reset the input value so the same file can be imported again
    event.target.value = '';
  };

  const validateDesignSystemData = (data: any): data is DesignSystem => {
    // Check for required fields
    const requiredFields = [
      'primaryColor', 'secondaryColor', 'accentColor',
      'successColor', 'warningColor', 'errorColor', 'infoColor',
      'borderLight', 'borderStrong',
      'backgroundPrimary', 'backgroundSecondary', 'backgroundDark',
      'textPrimary', 'textSecondary', 'textMuted',
      'fontFamily', 'fontSizeBase', 'lineHeightBase',
      'themeMode'
    ];
    
    // Optional fields that have fallbacks
    const optionalFields = [
      'headerBackgroundColor', 'sidebarHeaderBackgroundColor', 'sidebarBackgroundColor',
      'headerTextColor', 'sidebarTextColor', 'sidebarHeaderColor'
    ];
    
    const hasRequiredFields = requiredFields.every(field => 
      typeof data[field] === 'string' && data[field].trim() !== ''
    );
    
    const hasValidOptionalFields = optionalFields.every(field => 
      !data[field] || (typeof data[field] === 'string' && data[field].trim() !== '')
    );
    
    return hasRequiredFields && hasValidOptionalFields;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 rounded w-1/3 mb-6" style={{ backgroundColor: 'var(--color-border-light)' }}></div>
          <div className="space-y-4">
            <div className="h-32 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}></div>
            <div className="h-32 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}></div>
            <div className="h-32 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!designSystem) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Design System Not Found</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Unable to load the design system settings.</p>
          <Button onClick={fetchDesignSystem}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'spacing', name: 'Spacing & Layout', icon: Ruler },
    { id: 'effects', name: 'Effects & Animations', icon: Zap },
    { id: 'breakpoints', name: 'Breakpoints', icon: Monitor },
    { id: 'preview', name: 'Live Preview', icon: Eye },
  ];

  return (
    <div 
      className="space-y-8"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Design System</h1>
          <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Manage your website's visual identity and design tokens</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={importDesignSystem}
            style={{ display: 'none' }}
            id="import-design-system"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-design-system')?.click()}
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </Button>
          <Button
            variant="outline"
            onClick={exportDesignSystem}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg`} style={{
          backgroundColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          color: 'var(--color-bg-primary)',
          borderColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'var(--color-border-light)' }}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                style={{
                  borderColor: isActive 
                    ? 'var(--color-primary)' 
                    : 'transparent',
                  color: isActive 
                    ? 'var(--color-primary)' 
                    : 'var(--color-text-secondary)'
                }}
              >
                <Icon className="w-4 h-4 mr-2" style={{
                  color: isActive 
                    ? 'var(--color-primary)' 
                    : 'var(--color-text-secondary)'
                }} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'colors' && (
          <div className="space-y-8">
            {/* Brand Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: colors.textPrimary }}>
                <Palette className="w-5 h-5 mr-2" />
                Brand Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={designSystem.primaryColor}
                  onChange={(value) => updateDesignSystem('primaryColor', value)}
                  description="Main brand color used for primary actions"
                  colors={colors}
                />
                <ColorPicker
                  label="Primary Light"
                  value={designSystem.primaryColorLight}
                  onChange={(value) => updateDesignSystem('primaryColorLight', value)}
                  description="Lighter variant for hover states"
                  colors={colors}
                />
                <ColorPicker
                  label="Primary Dark"
                  value={designSystem.primaryColorDark}
                  onChange={(value) => updateDesignSystem('primaryColorDark', value)}
                  description="Darker variant for active states"
                  colors={colors}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={designSystem.secondaryColor}
                  onChange={(value) => updateDesignSystem('secondaryColor', value)}
                  description="Secondary brand color"
                  colors={colors}
                />
                <ColorPicker
                  label="Accent Color"
                  value={designSystem.accentColor}
                  onChange={(value) => updateDesignSystem('accentColor', value)}
                  description="Accent color for highlights"
                  colors={colors}
                />
              </div>
            </Card>

            {/* Semantic Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Semantic Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ColorPicker
                  label="Success"
                  value={designSystem.successColor}
                  onChange={(value) => updateDesignSystem('successColor', value)}
                  description="Success states and positive actions"
                  colors={colors}
                />
                <ColorPicker
                  label="Warning"
                  value={designSystem.warningColor}
                  onChange={(value) => updateDesignSystem('warningColor', value)}
                  description="Warning states and caution"
                  colors={colors}
                />
                <ColorPicker
                  label="Error"
                  value={designSystem.errorColor}
                  onChange={(value) => updateDesignSystem('errorColor', value)}
                  description="Error states and destructive actions"
                  colors={colors}
                />
                <ColorPicker
                  label="Info"
                  value={designSystem.infoColor}
                  onChange={(value) => updateDesignSystem('infoColor', value)}
                  description="Informational messages"
                  colors={colors}
                />
              </div>
            </Card>

            {/* Border Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Border Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Border Light"
                  value={designSystem.borderLight}
                  onChange={(value) => updateDesignSystem('borderLight', value)}
                  description="Light border color for subtle elements"
                  colors={colors}
                />
                <ColorPicker
                  label="Border Strong"
                  value={designSystem.borderStrong}
                  onChange={(value) => updateDesignSystem('borderStrong', value)}
                  description="Strong border color for emphasis"
                  colors={colors}
                />
              </div>
            </Card>

            {/* Background Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Background Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ColorPicker
                  label="Primary Background"
                  value={designSystem.backgroundPrimary}
                  onChange={(value) => updateDesignSystem('backgroundPrimary', value)}
                  description="Main page background"
                  colors={colors}
                />
                <ColorPicker
                  label="Secondary Background"
                  value={designSystem.backgroundSecondary}
                  onChange={(value) => updateDesignSystem('backgroundSecondary', value)}
                  description="Card and section backgrounds"
                  colors={colors}
                />
                <ColorPicker
                  label="Dark Background"
                  value={designSystem.backgroundDark}
                  onChange={(value) => updateDesignSystem('backgroundDark', value)}
                  description="Dark theme background"
                  colors={colors}
                />
                <ColorPicker
                  label="Header Background"
                  value={designSystem.headerBackgroundColor}
                  onChange={(value) => updateDesignSystem('headerBackgroundColor', value)}
                  description="Background color for main headers"
                  colors={colors}
                />
                <ColorPicker
                  label="Sidebar Header Background"
                  value={designSystem.sidebarHeaderBackgroundColor}
                  onChange={(value) => updateDesignSystem('sidebarHeaderBackgroundColor', value)}
                  description="Background color for sidebar header (logo area)"
                  colors={colors}
                />
                <ColorPicker
                  label="Sidebar Background"
                  value={designSystem.sidebarBackgroundColor}
                  onChange={(value) => updateDesignSystem('sidebarBackgroundColor', value)}
                  description="Background color for sidebar navigation"
                  colors={colors}
                />
              </div>
            </Card>

            {/* Text Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Text Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ColorPicker
                  label="Primary Text"
                  value={designSystem.textPrimary}
                  onChange={(value) => updateDesignSystem('textPrimary', value)}
                  description="Main text color"
                  colors={colors}
                />
                <ColorPicker
                  label="Secondary Text"
                  value={designSystem.textSecondary}
                  onChange={(value) => updateDesignSystem('textSecondary', value)}
                  description="Secondary text color"
                  colors={colors}
                />
                <ColorPicker
                  label="Muted Text"
                  value={designSystem.textMuted}
                  onChange={(value) => updateDesignSystem('textMuted', value)}
                  description="Muted text for captions"
                  colors={colors}
                />
                <ColorPicker
                  label="Header Text"
                  value={designSystem.headerTextColor}
                  onChange={(value) => updateDesignSystem('headerTextColor', value)}
                  description="Text color for headers and navigation"
                  colors={colors}
                />
                <ColorPicker
                  label="Sidebar Text"
                  value={designSystem.sidebarTextColor}
                  onChange={(value) => updateDesignSystem('sidebarTextColor', value)}
                  description="Text color for sidebar menu items"
                  colors={colors}
                />
                <ColorPicker
                  label="Sidebar Header"
                  value={designSystem.sidebarHeaderColor}
                  onChange={(value) => updateDesignSystem('sidebarHeaderColor', value)}
                  description="Text color for sidebar header (logo area)"
                  colors={colors}
                />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-8">
            {/* Font Families */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: colors.textPrimary }}>
                <Type className="w-5 h-5 mr-2" />
                Font Families
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Primary Font Family
                  </label>
                  <Input
                    value={designSystem.fontFamily}
                    onChange={(e) => updateDesignSystem('fontFamily', e.target.value)}
                    placeholder="Manrope, Inter, system-ui"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Used for headings and body text</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Monospace Font Family
                  </label>
                  <Input
                    value={designSystem.fontFamilyMono}
                    onChange={(e) => updateDesignSystem('fontFamilyMono', e.target.value)}
                    placeholder="ui-monospace, SF Mono, Monaco"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Used for code and technical content</p>
                </div>
              </div>
            </Card>

            {/* Font Sizes & Weights */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Font Sizes & Weights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Base Font Size
                  </label>
                  <Input
                    value={designSystem.fontSizeBase}
                    onChange={(e) => updateDesignSystem('fontSizeBase', e.target.value)}
                    placeholder="16px"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Base font size for body text</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Base Line Height
                  </label>
                  <Input
                    value={designSystem.lineHeightBase}
                    onChange={(e) => updateDesignSystem('lineHeightBase', e.target.value)}
                    placeholder="1.5"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Line height ratio for readability</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Normal Weight
                  </label>
                  <Input
                    value={designSystem.fontWeightNormal}
                    onChange={(e) => updateDesignSystem('fontWeightNormal', e.target.value)}
                    placeholder="400"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Regular text weight</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Medium Weight
                  </label>
                  <Input
                    value={designSystem.fontWeightMedium}
                    onChange={(e) => updateDesignSystem('fontWeightMedium', e.target.value)}
                    placeholder="500"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Semi-bold text weight</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Bold Weight
                  </label>
                  <Input
                    value={designSystem.fontWeightBold}
                    onChange={(e) => updateDesignSystem('fontWeightBold', e.target.value)}
                    placeholder="700"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Bold text weight</p>
                </div>
              </div>
            </Card>

            {/* Typography Preview */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Typography Preview
              </h3>
              <div className="space-y-4" style={{ fontFamily: designSystem.fontFamily }}>
                <div>
                  <h1 className="text-4xl font-bold" style={{ color: designSystem.textPrimary }}>
                    Heading 1 - Large Title
                  </h1>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold" style={{ color: designSystem.textPrimary }}>
                    Heading 2 - Section Title
                  </h2>
                </div>
                <div>
                  <h3 className="text-2xl font-medium" style={{ color: designSystem.textPrimary }}>
                    Heading 3 - Subsection
                  </h3>
                </div>
                <div>
                  <p className="text-lg" style={{ 
                    color: designSystem.textPrimary,
                    fontSize: designSystem.fontSizeBase,
                    lineHeight: designSystem.lineHeightBase 
                  }}>
                    Body text - This is how your regular paragraph text will appear on the website. 
                    It should be comfortable to read and have good contrast against the background.
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: designSystem.textSecondary }}>
                    Secondary text - Used for captions, metadata, and supporting information.
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: designSystem.textMuted }}>
                    Muted text - Used for less important information and subtle details.
                  </p>
                </div>
                <div>
                  <code 
                    className="px-2 py-1 rounded text-sm"
                    style={{ 
                      fontFamily: designSystem.fontFamilyMono,
                      backgroundColor: colors.backgroundSecondary
                    }}
                  >
                    Monospace text - for code snippets
                  </code>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-8">
            {/* Spacing Scale */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: colors.textPrimary }}>
                <Ruler className="w-5 h-5 mr-2" />
                Spacing Scale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Extra Small (XS)
                  </label>
                  <Input
                    value={designSystem.spacingXs}
                    onChange={(e) => updateDesignSystem('spacingXs', e.target.value)}
                    placeholder="4px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 rounded" style={{ width: designSystem.spacingXs, backgroundColor: 'var(--color-info-light, #DBEAFE)' }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Small (SM)
                  </label>
                  <Input
                    value={designSystem.spacingSm}
                    onChange={(e) => updateDesignSystem('spacingSm', e.target.value)}
                    placeholder="8px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 rounded" style={{ width: designSystem.spacingSm, backgroundColor: 'var(--color-info-light, #DBEAFE)' }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Medium (MD)
                  </label>
                  <Input
                    value={designSystem.spacingMd}
                    onChange={(e) => updateDesignSystem('spacingMd', e.target.value)}
                    placeholder="16px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 rounded" style={{ width: designSystem.spacingMd, backgroundColor: 'var(--color-info-light, #DBEAFE)' }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Large (LG)
                  </label>
                  <Input
                    value={designSystem.spacingLg}
                    onChange={(e) => updateDesignSystem('spacingLg', e.target.value)}
                    placeholder="24px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 rounded" style={{ width: designSystem.spacingLg, backgroundColor: 'var(--color-info-light, #DBEAFE)' }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Extra Large (XL)
                  </label>
                  <Input
                    value={designSystem.spacingXl}
                    onChange={(e) => updateDesignSystem('spacingXl', e.target.value)}
                    placeholder="32px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 rounded" style={{ width: designSystem.spacingXl, backgroundColor: 'var(--color-info-light, #DBEAFE)' }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    2X Large (2XL)
                  </label>
                  <Input
                    value={designSystem.spacing2xl}
                    onChange={(e) => updateDesignSystem('spacing2xl', e.target.value)}
                    placeholder="48px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 rounded" style={{ width: designSystem.spacing2xl, backgroundColor: 'var(--color-info-light, #DBEAFE)' }}></div>
                </div>
              </div>
            </Card>

            {/* Border Radius */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Border Radius
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Small Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusSm}
                    onChange={(e) => updateDesignSystem('borderRadiusSm', e.target.value)}
                    placeholder="4px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16" 
                    style={{ 
                      borderRadius: designSystem.borderRadiusSm,
                      backgroundColor: 'var(--color-info-light, #DBEAFE)'
                    }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Medium Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusMd}
                    onChange={(e) => updateDesignSystem('borderRadiusMd', e.target.value)}
                    placeholder="8px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16" 
                    style={{ 
                      borderRadius: designSystem.borderRadiusMd,
                      backgroundColor: 'var(--color-info-light, #DBEAFE)'
                    }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Large Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusLg}
                    onChange={(e) => updateDesignSystem('borderRadiusLg', e.target.value)}
                    placeholder="12px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16" 
                    style={{ 
                      borderRadius: designSystem.borderRadiusLg,
                      backgroundColor: 'var(--color-info-light, #DBEAFE)'
                    }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Extra Large Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusXl}
                    onChange={(e) => updateDesignSystem('borderRadiusXl', e.target.value)}
                    placeholder="16px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16" 
                    style={{ 
                      borderRadius: designSystem.borderRadiusXl,
                      backgroundColor: 'var(--color-info-light, #DBEAFE)'
                    }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Full Radius (Pills)
                  </label>
                  <Input
                    value={designSystem.borderRadiusFull}
                    onChange={(e) => updateDesignSystem('borderRadiusFull', e.target.value)}
                    placeholder="9999px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-24 h-16" 
                    style={{ 
                      borderRadius: designSystem.borderRadiusFull,
                      backgroundColor: 'var(--color-info-light, #DBEAFE)'
                    }}
                  ></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-8">
            {/* Shadows */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: colors.textPrimary }}>
                <Zap className="w-5 h-5 mr-2" />
                Box Shadows
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Small Shadow
                  </label>
                  <Input
                    value={designSystem.shadowSm}
                    onChange={(e) => updateDesignSystem('shadowSm', e.target.value)}
                    placeholder="0 1px 2px 0 rgb(0 0 0 / 0.05)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 rounded-lg" 
                    style={{ 
                      boxShadow: designSystem.shadowSm,
                      backgroundColor: colors.backgroundSecondary
                    }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Medium Shadow
                  </label>
                  <Input
                    value={designSystem.shadowMd}
                    onChange={(e) => updateDesignSystem('shadowMd', e.target.value)}
                    placeholder="0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 rounded-lg" 
                    style={{ 
                      boxShadow: designSystem.shadowMd,
                      backgroundColor: colors.backgroundSecondary
                    }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Large Shadow
                  </label>
                  <Input
                    value={designSystem.shadowLg}
                    onChange={(e) => updateDesignSystem('shadowLg', e.target.value)}
                    placeholder="0 10px 15px -3px rgb(0 0 0 / 0.1)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 rounded-lg" 
                    style={{ 
                      boxShadow: designSystem.shadowLg,
                      backgroundColor: colors.backgroundSecondary
                    }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Extra Large Shadow
                  </label>
                  <Input
                    value={designSystem.shadowXl}
                    onChange={(e) => updateDesignSystem('shadowXl', e.target.value)}
                    placeholder="0 20px 25px -5px rgb(0 0 0 / 0.1)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 rounded-lg" 
                    style={{ 
                      boxShadow: designSystem.shadowXl,
                      backgroundColor: colors.backgroundSecondary
                    }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Animation Durations */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: colors.textPrimary }}>
                Animation Durations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Fast Animation
                  </label>
                  <Input
                    value={designSystem.animationFast}
                    onChange={(e) => updateDesignSystem('animationFast', e.target.value)}
                    placeholder="150ms"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Quick interactions and micro-animations</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Normal Animation
                  </label>
                  <Input
                    value={designSystem.animationNormal}
                    onChange={(e) => updateDesignSystem('animationNormal', e.target.value)}
                    placeholder="300ms"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Standard transitions and state changes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Slow Animation
                  </label>
                  <Input
                    value={designSystem.animationSlow}
                    onChange={(e) => updateDesignSystem('animationSlow', e.target.value)}
                    placeholder="500ms"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Complex animations and page transitions</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'breakpoints' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: colors.textPrimary }}>
                <Monitor className="w-5 h-5 mr-2" />
                Responsive Breakpoints
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Small (SM)
                  </label>
                  <Input
                    value={designSystem.breakpointSm}
                    onChange={(e) => updateDesignSystem('breakpointSm', e.target.value)}
                    placeholder="640px"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Mobile landscape and small tablets</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Medium (MD)
                  </label>
                  <Input
                    value={designSystem.breakpointMd}
                    onChange={(e) => updateDesignSystem('breakpointMd', e.target.value)}
                    placeholder="768px"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Tablets</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Large (LG)
                  </label>
                  <Input
                    value={designSystem.breakpointLg}
                    onChange={(e) => updateDesignSystem('breakpointLg', e.target.value)}
                    placeholder="1024px"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Small laptops</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Extra Large (XL)
                  </label>
                  <Input
                    value={designSystem.breakpointXl}
                    onChange={(e) => updateDesignSystem('breakpointXl', e.target.value)}
                    placeholder="1280px"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Laptops and desktops</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    2X Large (2XL)
                  </label>
                  <Input
                    value={designSystem.breakpoint2xl}
                    onChange={(e) => updateDesignSystem('breakpoint2xl', e.target.value)}
                    placeholder="1536px"
                    className="font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Large desktops and monitors</p>
                </div>
              </div>

              {/* Breakpoint Visualization */}
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4" style={{ color: colors.textPrimary }}>Breakpoint Visualization</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm" style={{ color: colors.textSecondary }}>Mobile</div>
                    <div className="flex-1 h-4 rounded" style={{ maxWidth: '320px', backgroundColor: 'var(--color-error-light, #FEE2E2)' }}></div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>0px - {designSystem.breakpointSm}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm" style={{ color: colors.textSecondary }}>SM</div>
                    <div className="flex-1 h-4 rounded" style={{ maxWidth: '400px', backgroundColor: 'var(--color-warning-light, #FEF3C7)' }}></div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{designSystem.breakpointSm} - {designSystem.breakpointMd}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm" style={{ color: colors.textSecondary }}>MD</div>
                    <div className="flex-1 h-4 rounded" style={{ maxWidth: '500px', backgroundColor: 'var(--color-warning-light, #FEF3C7)' }}></div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{designSystem.breakpointMd} - {designSystem.breakpointLg}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm" style={{ color: colors.textSecondary }}>LG</div>
                    <div className="flex-1 h-4 rounded" style={{ maxWidth: '600px', backgroundColor: 'var(--color-success-light, #D1FAE5)' }}></div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{designSystem.breakpointLg} - {designSystem.breakpointXl}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm" style={{ color: colors.textSecondary }}>XL</div>
                    <div className="flex-1 h-4 rounded" style={{ maxWidth: '700px', backgroundColor: 'var(--color-info-light, #DBEAFE)' }}></div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{designSystem.breakpointXl} - {designSystem.breakpoint2xl}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm" style={{ color: colors.textSecondary }}>2XL</div>
                    <div className="flex-1 h-4 rounded" style={{ maxWidth: '800px', backgroundColor: 'var(--color-primary-light, #E0E7FF)' }}></div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{designSystem.breakpoint2xl}+</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center" style={{ color: colors.textPrimary }}>
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Preview Mode:</span>
                  <button
                    onClick={() => setPreviewMode(previewMode === 'light' ? 'dark' : 'light')}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg border border-gray-200/10"
                    style={{ 
                      borderColor: colors.grayLight,
                      backgroundColor: colors.backgroundSecondary
                    }}
                  >
                    {previewMode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span className="capitalize">{previewMode}</span>
                  </button>
                </div>
              </div>

              {/* Component Preview */}
              <div 
                className="p-8 rounded-lg border border-gray-200/10"
                style={{
                  backgroundColor: previewMode === 'light' ? designSystem.backgroundPrimary : designSystem.backgroundDark,
                  color: previewMode === 'light' ? designSystem.textPrimary : designSystem.backgroundPrimary,
                  fontFamily: designSystem.fontFamily
                }}
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                      Design System Preview
                    </h1>
                    <p className="text-lg" style={{ color: designSystem.textSecondary }}>
                      See how your design tokens look in practice
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-4">
                    <button
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        borderRadius: designSystem.borderRadiusMd,
                        boxShadow: designSystem.shadowMd,
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-secondary)',
                        color: '#FFFFFF',
                        borderRadius: designSystem.borderRadiusMd,
                        boxShadow: designSystem.shadowMd,
                        border: '1px solid var(--color-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-secondary-dark)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        backgroundColor: previewMode === 'light' ? designSystem.backgroundSecondary : designSystem.borderStrong,
                        borderRadius: designSystem.borderRadiusLg,
                        boxShadow: designSystem.shadowSm
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">Card Title</h3>
                      <p style={{ color: designSystem.textSecondary }}>
                        This is a sample card showing how your design system applies to content containers.
                      </p>
                      <div className="mt-4 flex items-center space-x-2">
                        <span
                          className="px-3 py-1 text-sm rounded-full transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: 'var(--color-success)',
                            color: '#FFFFFF',
                            borderRadius: designSystem.borderRadiusFull
                          }}
                        >
                          Success
                        </span>
                        <span
                          className="px-3 py-1 text-sm rounded-full transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: 'var(--color-warning)',
                            color: '#FFFFFF',
                            borderRadius: designSystem.borderRadiusFull
                          }}
                        >
                          Warning
                        </span>
                      </div>
                    </div>

                    <div
                      className="p-6 rounded-lg"
                      style={{
                        backgroundColor: previewMode === 'light' ? designSystem.backgroundSecondary : designSystem.borderStrong,
                        borderRadius: designSystem.borderRadiusLg,
                        boxShadow: designSystem.shadowSm
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">Typography Scale</h3>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">Large heading</p>
                        <p className="text-lg font-medium">Medium heading</p>
                        <p style={{ fontSize: designSystem.fontSizeBase }}>Body text</p>
                        <p className="text-sm" style={{ color: designSystem.textMuted }}>
                          Small text
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                      {[
                        { name: 'Primary', color: designSystem.primaryColor, cssVar: 'var(--color-primary)' },
                        { name: 'Secondary', color: designSystem.secondaryColor, cssVar: 'var(--color-secondary)' },
                        { name: 'Accent', color: designSystem.accentColor, cssVar: 'var(--color-accent)' },
                        { name: 'Success', color: designSystem.successColor, cssVar: 'var(--color-success)' },
                        { name: 'Warning', color: designSystem.warningColor, cssVar: 'var(--color-warning)' },
                        { name: 'Error', color: designSystem.errorColor, cssVar: 'var(--color-error)' },
                        { name: 'Info', color: designSystem.infoColor, cssVar: 'var(--color-info)' },
                        { name: 'Border', color: designSystem.borderStrong, cssVar: designSystem.borderStrong },
                      ].map((item) => (
                        <div key={item.name} className="text-center">
                          <div
                            className="w-full h-16 rounded-lg mb-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                              backgroundColor: item.cssVar,
                              borderRadius: designSystem.borderRadiusMd,
                              boxShadow: designSystem.shadowSm
                            }}
                            onClick={() => navigator.clipboard?.writeText(item.color)}
                          ></div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs font-mono" style={{ color: designSystem.textMuted }}>
                            {item.color}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignSystemManager; 
