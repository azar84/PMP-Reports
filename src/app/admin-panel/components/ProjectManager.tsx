'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { formatCurrency } from '@/lib/currency';
import { formatDateForInput } from '@/lib/dateUtils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ProjectChecklist from './ProjectChecklist';
import ProjectStaff from './ProjectStaff';
import ProjectLabours from './ProjectLabours';
import ProjectLabourSupply from './ProjectLabourSupply';
import ProjectPlanning from './ProjectPlanning';
import ProjectQuality from './ProjectQuality';
import ProjectIPC from './ProjectIPC';
import ProjectPlants from './ProjectPlants';
import ProjectHSE from './ProjectHSE';
import ProjectRisks from './ProjectRisks';
import ProjectAreaOfConcerns from './ProjectAreaOfConcerns';
import ProjectClientFeedback from './ProjectClientFeedback';
import ProjectAssets from './ProjectAssets';
import ProjectPictures from './ProjectPictures';
import ProjectCloseOut from './ProjectCloseOut';
import ProjectCommercial from './ProjectCommercial';
import ProjectSuppliers from './ProjectSuppliers';
import SupplierDetailView from './SupplierDetailView';
import ProjectSubcontractors from './ProjectSubcontractors';
import SubcontractorDetailView from './SubcontractorDetailView';
import StaffMovementConfirmationDialog from './StaffMovementConfirmationDialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Building2, 
  User, 
  Users, 
  Search,
  X,
  Save,
  ArrowLeft,
  HardHat,
  DraftingCompass,
  Calculator,
  Eye,
  FileText,
  ClipboardList,
  UserCheck,
  Wrench,
  ShieldCheck,
  Receipt,
  Bus,
  LifeBuoy,
  AlertTriangle,
  Package,
  Camera,
  ClipboardCheck,
  MessageSquare,
  Download,
  Truck,
  FileBarChart,
  Hammer,
  UserCog
} from 'lucide-react';

interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  projectDescription?: string;
  clientId?: number;
  client?: { id: number; name: string };
  projectManagementConsultantId?: number;
  projectManagementConsultant?: { id: number; name: string };
  designConsultantId?: number;
  designConsultant?: { id: number; name: string };
  supervisionConsultantId?: number;
  supervisionConsultant?: { id: number; name: string };
  costConsultantId?: number;
  costConsultant?: { id: number; name: string };
  projectDirectorId?: number; // For project creation
  projectManagerId?: number; // For project creation
  projectStaff?: Array<{
    id: number;
    designation: string;
    utilization: number;
    status: string;
    staff: {
      id: number;
      staffName: string;
      position?: string;
    } | null;
  }>;
  startDate?: string;
  endDate?: string;
  duration?: string;
  eot?: string;
  projectValue?: number;
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: number;
  name: string;
  officeAddress?: string;
  phone?: string;
  email?: string;
}

interface Consultant {
  id: number;
  name: string;
  types?: Array<{ id: number; type: string }>;
  ConsultantToConsultantType?: Array<{
    consultant_types: { id: number; type: string };
  }>;
}

// Helper function to get consultant types
const getConsultantTypes = (consultant: Consultant): Array<{ id: number; type: string }> => {
  if (consultant.ConsultantToConsultantType) {
    return consultant.ConsultantToConsultantType.map(item => item.consultant_types);
  }
  return consultant.types || [];
};

interface CompanyStaff {
  id: number;
  staffName: string;
  position?: string;
  email?: string;
  phone?: string;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  notes?: string;
  isPrimary: boolean;
  isActive: boolean;
  entityType: string;
  entityId: number;
}

export default function ProjectManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();
  const { permissions } = useUserPermissions();

  // Permission checks
  const canCreateClients = hasPermission(permissions, 'clients.create');
  const canCreateConsultants = hasPermission(permissions, 'consultants.create');
  const canCreateStaff = hasPermission(permissions, 'staff.create');
  const canCreateLabours = hasPermission(permissions, 'labours.create');
  const canCreateContacts = hasPermission(permissions, 'contacts.create');

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [consultantTypes, setConsultantTypes] = useState<Array<{ id: number; type: string }>>([]);
  const [staff, setStaff] = useState<CompanyStaff[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'planning'
    | 'quality'
    | 'risks'
    | 'hse'
    | 'checklist'
    | 'staff'
    | 'labours'
    | 'labourSupply'
    | 'plants'
    | 'assets'
    | 'pictures'
    | 'closeOut'
    | 'clientFeedback'
    | 'commercial'
    | 'suppliers'
    | 'subcontractors'
  >('overview');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<number | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [projectContacts, setProjectContacts] = useState<any[]>([]);
  const [pendingContacts, setPendingContacts] = useState<{contactId: number, entityType: string, entityId: number, consultantType?: string, isPrimary: boolean}[]>([]);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [pmcContactSearchTerm, setPMCContactSearchTerm] = useState('');
  const [designContactSearchTerm, setDesignContactSearchTerm] = useState('');
  const [costContactSearchTerm, setCostContactSearchTerm] = useState('');
  const [supervisionContactSearchTerm, setSupervisionContactSearchTerm] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showPMCContactDropdown, setShowPMCContactDropdown] = useState(false);
  const [showDesignContactDropdown, setShowDesignContactDropdown] = useState(false);
  const [showCostContactDropdown, setShowCostContactDropdown] = useState(false);
  const [showSupervisionContactDropdown, setShowSupervisionContactDropdown] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [staffMovementConflict, setStaffMovementConflict] = useState<any>(null);
  const [pendingProjectData, setPendingProjectData] = useState<any>(null);
  const [showConsultantForm, setShowConsultantForm] = useState(false);
  const [showClientContactForm, setShowClientContactForm] = useState(false);
  const [showConsultantContactForm, setShowConsultantContactForm] = useState(false);
  const [showPMCContactForm, setShowPMCContactForm] = useState(false);
  const [showDesignContactForm, setShowDesignContactForm] = useState(false);
  const [showCostContactForm, setShowCostContactForm] = useState(false);
  const [showSupervisionContactForm, setShowSupervisionContactForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showDirectorDropdown, setShowDirectorDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [directorSearchTerm, setDirectorSearchTerm] = useState('');
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [companyPositions, setCompanyPositions] = useState<Array<{ id: number; name: string }>>([]);
  const [showPositionDropdownInStaffForm, setShowPositionDropdownInStaffForm] = useState(false);
  const [positionSearchTermInStaffForm, setPositionSearchTermInStaffForm] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalData, setContactModalData] = useState<{
    consultantType: string;
    consultantName: string;
    consultantId: number;
  } | null>(null);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [availablePictures, setAvailablePictures] = useState<any[]>([]);
  const [selectedPictureIds, setSelectedPictureIds] = useState<Set<number>>(new Set());
  const [isLoadingPictures, setIsLoadingPictures] = useState(false);
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [clientContactFormData, setClientContactFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
    isPrimary: false,
    isActive: true,
    entityType: 'client',
    entityId: undefined,
  });
  const [consultantContactFormData, setConsultantContactFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
    isPrimary: false,
    isActive: true,
    entityType: 'consultant',
    entityId: undefined,
  });
  const [pmcContactFormData, setPMCContactFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
    isPrimary: false,
    isActive: true,
    entityType: 'consultant',
    entityId: undefined,
  });
  const [designContactFormData, setDesignContactFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
    isPrimary: false,
    isActive: true,
    entityType: 'consultant',
    entityId: undefined,
  });
  const [costContactFormData, setCostContactFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
    isPrimary: false,
    isActive: true,
    entityType: 'consultant',
    entityId: undefined,
  });
  const [supervisionContactFormData, setSupervisionContactFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
    isPrimary: false,
    isActive: true,
    entityType: 'consultant',
    entityId: undefined,
  });
  const [modalContactFormData, setModalContactFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    notes: '',
    isPrimary: false,
    isActive: true, // Always active when created
    entityType: 'consultant',
    entityId: undefined,
  });
  const [staffFormData, setStaffFormData] = useState<Partial<CompanyStaff & { positionId?: number }>>({
    staffName: '',
    position: '',
    positionId: undefined,
    email: '',
    phone: '',
  });
  const [additionalStaffPositions, setAdditionalStaffPositions] = useState<Array<{
    designation: string;
    utilization: number;
    startDate: string;
    endDate: string;
    status: string;
    notes: string;
  }>>([]);
  const [clientFormData, setClientFormData] = useState<Partial<Client>>({
    name: '',
    officeAddress: '',
    phone: '',
    email: '',
    isActive: true,
  });
  const [consultantFormData, setConsultantFormData] = useState<Partial<Consultant & { selectedTypes: number[] }>>({
    name: '',
    officeAddress: '',
    phone: '',
    email: '',
    isActive: true,
    selectedTypes: [],
  });
  const [formData, setFormData] = useState<Partial<Project>>({
    projectCode: '',
    projectName: '',
    projectDescription: '',
    clientId: undefined,
    projectManagementConsultantId: undefined,
    designConsultantId: undefined,
    supervisionConsultantId: undefined,
    costConsultantId: undefined,
    projectDirectorId: undefined,
    projectManagerId: undefined,
    startDate: '',
    endDate: '',
    duration: '',
    eot: '',
    projectValue: undefined,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate duration when form data changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const calculatedDuration = calculateDuration(formData.startDate, formData.endDate);
      setFormData(prev => {
        if (prev.duration !== calculatedDuration) {
          return { ...prev, duration: calculatedDuration };
        }
        return prev;
      });
    } else {
      setFormData(prev => {
        if (prev.duration !== '') {
          return { ...prev, duration: '' };
        }
        return prev;
      });
    }
  }, [formData.startDate, formData.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, clientsRes, consultantsRes, consultantTypesRes, staffRes, contactsRes, positionsRes] = await Promise.all([
        get<{ success: boolean; data: Project[] }>('/api/admin/projects'),
        get<{ success: boolean; data: Client[] }>('/api/admin/clients'),
        get<{ success: boolean; data: Consultant[] }>('/api/admin/consultants'),
        get<{ success: boolean; data: Array<{ id: number; type: string }> }>('/api/admin/consultant-types'),
        get<{ success: boolean; data: CompanyStaff[] }>('/api/admin/company-staff'),
        get<{ success: boolean; data: Contact[] }>('/api/admin/contacts'),
        get<{ success: boolean; data: Array<{ id: number; name: string }> }>('/api/admin/positions'),
      ]);

      if (projectsRes.success) setProjects(projectsRes.data);
      if (clientsRes.success) setClients(clientsRes.data);
      if (consultantsRes.success) setConsultants(consultantsRes.data);
      if (consultantTypesRes.success) setConsultantTypes(consultantTypesRes.data);
      if (staffRes.success) setStaff(staffRes.data);
      if (contactsRes.success) setContacts(contactsRes.data);
      if (positionsRes.success) setCompanyPositions(positionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get client contacts
  const getClientContacts = (clientId?: number) => {
    if (!clientId) return [];
    return contacts.filter(contact => 
      contact.entityType === 'client' && 
      contact.entityId === clientId && 
      contact.isActive
    );
  };

  // Get consultant contacts
  const getConsultantContacts = (consultantId?: number) => {
    if (!consultantId) return [];
    return contacts.filter(contact => 
      contact.entityType === 'consultant' && 
      contact.entityId === consultantId && 
      contact.isActive
    );
  };

  // Filter contacts based on search term
  const getFilteredContacts = (clientId?: number) => {
    const clientContacts = getClientContacts(clientId);
    if (!contactSearchTerm) return clientContacts;
    
    return clientContacts.filter(contact =>
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.position?.toLowerCase().includes(contactSearchTerm.toLowerCase())
    );
  };

  // Filter consultant contacts based on search term
  const getFilteredConsultantContacts = (consultantId?: number, searchTerm?: string) => {
    const consultantContacts = getConsultantContacts(consultantId);
    if (!searchTerm) return consultantContacts;
    
    return consultantContacts.filter(contact =>
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Remove selected contacts
  const handleRemoveContact = (contactId: number) => {
    setSelectedContacts(prev => prev.filter(id => id !== contactId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.contact-dropdown-container')) {
        setShowContactDropdown(false);
      }
      if (!target.closest('.pmc-contact-dropdown-container')) {
        setShowPMCContactDropdown(false);
      }
      if (!target.closest('.design-contact-dropdown-container')) {
        setShowDesignContactDropdown(false);
      }
      if (!target.closest('.cost-contact-dropdown-container')) {
        setShowCostContactDropdown(false);
      }
      if (!target.closest('.supervision-contact-dropdown-container')) {
        setShowSupervisionContactDropdown(false);
      }
    };

    const hasOpenDropdown = showContactDropdown || showPMCContactDropdown || showDesignContactDropdown || showCostContactDropdown || showSupervisionContactDropdown;
    
    if (hasOpenDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContactDropdown, showPMCContactDropdown, showDesignContactDropdown, showCostContactDropdown, showSupervisionContactDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        // Include contacts for new projects (with consultant type)
        contacts: editingProject ? undefined : pendingContacts.map(pc => ({
          contactId: pc.contactId,
          isPrimary: pc.isPrimary,
          consultantType: pc.consultantType,
        })),
      };

      if (editingProject) {
        const response = await put<{ 
          success: boolean; 
          data?: Project;
          requiresConfirmation?: boolean;
          conflict?: any;
        }>(`/api/admin/projects/${editingProject.id}`, projectData);
        
        // Check if confirmation is required
        if (response.requiresConfirmation && response.conflict) {
          setStaffMovementConflict(response.conflict);
          setPendingProjectData({ projectId: editingProject.id, projectData });
          return; // Don't close the form yet
        }
        
        if (response.success && response.data) {
          setProjects(projects.map(p => p.id === editingProject.id ? response.data! : p));
        }
      } else {
        const response = await post<{ success: boolean; data: Project }>('/api/admin/projects', projectData);
        if (response.success) {
          setProjects([response.data, ...projects]);
        }
      }

      setShowForm(false);
      setEditingProject(null);
      setSelectedContacts([]);
      setProjectContacts([]);
      setPendingContacts([]);
      setContactSearchTerm('');
      setPMCContactSearchTerm('');
      setDesignContactSearchTerm('');
      setCostContactSearchTerm('');
      setSupervisionContactSearchTerm('');
      setShowContactDropdown(false);
      setShowPMCContactDropdown(false);
      setShowDesignContactDropdown(false);
      setShowCostContactDropdown(false);
      setShowSupervisionContactDropdown(false);
      setFormData({
        projectCode: '',
        projectName: '',
        projectDescription: '',
        clientId: undefined,
        projectManagementConsultantId: undefined,
        designConsultantId: undefined,
        supervisionConsultantId: undefined,
        costConsultantId: undefined,
        projectDirectorId: undefined,
        projectManagerId: undefined,
        startDate: '',
        endDate: '',
        duration: '',
        eot: '',
      });
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleConfirmStaffMovement = async () => {
    if (!pendingProjectData || !staffMovementConflict) return;

    try {
      const response = await post<{ success: boolean; data: Project }>(
        `/api/admin/projects/${pendingProjectData.projectId}/confirm-staff-movement`,
        {
          ...pendingProjectData.projectData,
          conflict: staffMovementConflict,
        }
      );

      if (response.success && response.data) {
        setProjects(projects.map(p => p.id === pendingProjectData.projectId ? response.data! : p));
        setStaffMovementConflict(null);
        setPendingProjectData(null);
        
        // Close form and reset
        setShowForm(false);
        setEditingProject(null);
        setSelectedContacts([]);
        setProjectContacts([]);
        setPendingContacts([]);
        setContactSearchTerm('');
        setPMCContactSearchTerm('');
        setDesignContactSearchTerm('');
        setCostContactSearchTerm('');
        setSupervisionContactSearchTerm('');
        setShowContactDropdown(false);
        setShowPMCContactDropdown(false);
        setShowDesignContactDropdown(false);
        setShowCostContactDropdown(false);
        setShowSupervisionContactDropdown(false);
        setFormData({
          projectCode: '',
          projectName: '',
          projectDescription: '',
          clientId: undefined,
          projectManagementConsultantId: undefined,
          designConsultantId: undefined,
          supervisionConsultantId: undefined,
          costConsultantId: undefined,
          projectDirectorId: undefined,
          projectManagerId: undefined,
          startDate: '',
          endDate: '',
          duration: '',
          eot: '',
        });
      } else {
        alert('Failed to confirm staff movement. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming staff movement:', error);
      alert('Failed to confirm staff movement. Please try again.');
    }
  };

  const handleCancelStaffMovement = () => {
    setStaffMovementConflict(null);
    setPendingProjectData(null);
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return `${diffDays} days`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '';
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Calculate duration if both dates are provided
    const startDate = field === 'startDate' ? value : newFormData.startDate;
    const endDate = field === 'endDate' ? value : newFormData.endDate;
    
    console.log('Date change:', { field, value, startDate, endDate });
    
    if (startDate && endDate) {
      const calculatedDuration = calculateDuration(startDate, endDate);
      console.log('Calculated duration:', calculatedDuration);
      newFormData.duration = calculatedDuration;
    } else {
      newFormData.duration = '';
    }
    
    setFormData(newFormData);
  };

  const fetchProjectContacts = async (projectId: number) => {
    try {
      const response = await get<{ success: boolean; data: any[] }>(`/api/admin/project-contacts?projectId=${projectId}`);
      if (response.success) {
        setProjectContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching project contacts:', error);
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailView(true);
    setActiveTab('overview');
    // Fetch project contacts for this project
    fetchProjectContacts(project.id);
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedProject(null);
    setProjectContacts([]);
  };

  // Collect all project data from all tabs
  const collectProjectData = async (reportMonth?: number, reportYear?: number): Promise<any> => {
    if (!selectedProject) return null;

    // Ensure we have full project data with all relationships
    // Fetch the complete project data to ensure we have all full objects, not just IDs
    let fullProjectData = selectedProject;
    if (!selectedProject.projectDirector || !selectedProject.projectManager || 
        !selectedProject.client || !selectedProject.projectManagementConsultant) {
      try {
        const projectRes = await get<{ success: boolean; data: Project }>(`/api/admin/projects/${selectedProject.id}`);
        if (projectRes.success) {
          fullProjectData = projectRes.data;
        }
      } catch (error) {
        console.error('Error fetching full project data:', error);
      }
    }

    const reportData: any = {
      project: {
        id: fullProjectData.id,
        projectCode: fullProjectData.projectCode,
        projectName: fullProjectData.projectName,
        projectDescription: fullProjectData.projectDescription,
        // Store full client object, not just ID
        client: fullProjectData.client ? {
          id: fullProjectData.client.id,
          name: fullProjectData.client.name,
          officeAddress: fullProjectData.client.officeAddress,
          phone: fullProjectData.client.phone,
          email: fullProjectData.client.email,
          isActive: fullProjectData.client.isActive,
        } : null,
        // Store full consultant objects, not just IDs
        consultants: {
          projectManagement: fullProjectData.projectManagementConsultant ? {
            id: fullProjectData.projectManagementConsultant.id,
            name: fullProjectData.projectManagementConsultant.name,
            officeAddress: fullProjectData.projectManagementConsultant.officeAddress,
            phone: fullProjectData.projectManagementConsultant.phone,
            email: fullProjectData.projectManagementConsultant.email,
            isActive: fullProjectData.projectManagementConsultant.isActive,
          } : null,
          design: fullProjectData.designConsultant ? {
            id: fullProjectData.designConsultant.id,
            name: fullProjectData.designConsultant.name,
            officeAddress: fullProjectData.designConsultant.officeAddress,
            phone: fullProjectData.designConsultant.phone,
            email: fullProjectData.designConsultant.email,
            isActive: fullProjectData.designConsultant.isActive,
          } : null,
          supervision: fullProjectData.supervisionConsultant ? {
            id: fullProjectData.supervisionConsultant.id,
            name: fullProjectData.supervisionConsultant.name,
            officeAddress: fullProjectData.supervisionConsultant.officeAddress,
            phone: fullProjectData.supervisionConsultant.phone,
            email: fullProjectData.supervisionConsultant.email,
            isActive: fullProjectData.supervisionConsultant.isActive,
          } : null,
          cost: fullProjectData.costConsultant ? {
            id: fullProjectData.costConsultant.id,
            name: fullProjectData.costConsultant.name,
            officeAddress: fullProjectData.costConsultant.officeAddress,
            phone: fullProjectData.costConsultant.phone,
            email: fullProjectData.costConsultant.email,
            isActive: fullProjectData.costConsultant.isActive,
          } : null,
        },
        // Store full project director object, not just ID
        projectDirector: fullProjectData.projectDirector ? {
          id: fullProjectData.projectDirector.id,
          staffName: fullProjectData.projectDirector.staffName,
          employeeNumber: fullProjectData.projectDirector.employeeNumber,
          position: fullProjectData.projectDirector.position,
          email: fullProjectData.projectDirector.email,
          phone: fullProjectData.projectDirector.phone,
          isActive: fullProjectData.projectDirector.isActive,
        } : null,
        // Store full project manager object, not just ID
        projectManager: fullProjectData.projectManager ? {
          id: fullProjectData.projectManager.id,
          staffName: fullProjectData.projectManager.staffName,
          employeeNumber: fullProjectData.projectManager.employeeNumber,
          position: fullProjectData.projectManager.position,
          email: fullProjectData.projectManager.email,
          phone: fullProjectData.projectManager.phone,
          isActive: fullProjectData.projectManager.isActive,
        } : null,
        startDate: fullProjectData.startDate,
        endDate: fullProjectData.endDate,
        duration: fullProjectData.duration,
        eot: fullProjectData.eot,
        projectValue: fullProjectData.projectValue ? fullProjectData.projectValue.toString() : null,
      },
      // Store full contact data with all contact details
      contacts: projectContacts.map((pc: any) => ({
        id: pc.id,
        contactId: pc.contactId,
        isPrimary: pc.isPrimary,
        consultantType: pc.consultantType,
        // Store full contact object
        contact: pc.contact ? {
          id: pc.contact.id,
          firstName: pc.contact.firstName,
          lastName: pc.contact.lastName,
          email: pc.contact.email,
          phone: pc.contact.phone,
          position: pc.contact.position,
          notes: pc.contact.notes,
          isPrimary: pc.contact.isPrimary,
          isActive: pc.contact.isActive,
          entityType: pc.contact.entityType,
          entityId: pc.contact.entityId,
        } : null,
      })),
      generatedAt: new Date().toISOString(),
    };

    // Fetch data from all tabs
    try {
      // Planning
      const planningRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/planning`);
      if (planningRes.success) {
        reportData.planning = planningRes.data;
      }

      // Quality
      const qualityRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/quality`);
      if (qualityRes.success) {
        // Calculate elapsed time percentage at end of report month
        // Formula: (end of report month - project start date) / (project end date - project start date) * 100
        let elapsedTimePercentage = 0;
        if (reportMonth && reportYear && fullProjectData.startDate && fullProjectData.endDate) {
          try {
            const startDate = new Date(fullProjectData.startDate);
            const endDate = new Date(fullProjectData.endDate);
            // End of report month (last day of the month)
            // reportMonth is 1-12 (1=January, 12=December)
            // JavaScript Date uses 0-11 (0=January, 11=December)
            // To get last day of reportMonth: convert to 0-11, then use (month + 1, 0)
            // Example: December (12) -> jsMonth = 11 -> new Date(year, 12, 0) = Dec 31
            const jsMonth = reportMonth - 1; // Convert 1-12 to 0-11
            const reportEndDate = new Date(reportYear, jsMonth + 1, 0); // Last day of report month
            
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && !isNaN(reportEndDate.getTime())) {
              // Calculate duration in days
              const totalDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const elapsedDurationDays = Math.ceil((reportEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (totalDurationDays > 0) {
                elapsedTimePercentage = (elapsedDurationDays / totalDurationDays) * 100;
                elapsedTimePercentage = Math.max(0, Math.min(100, elapsedTimePercentage)); // Clamp between 0 and 100
              }
            }
          } catch (error) {
            console.error('Error calculating elapsed time percentage:', error);
          }
        }
        
        reportData.quality = {
          ...qualityRes.data,
          elapsedTimePercentage: elapsedTimePercentage
        };
      }

      // Risks
      const risksRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/risks`);
      if (risksRes.success) {
        reportData.risks = risksRes.data;
      }

      // Area of Concerns
      const areaOfConcernsRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/area-of-concerns`);
      if (areaOfConcernsRes.success) {
        reportData.areaOfConcerns = areaOfConcernsRes.data;
      }

      // HSE
      const hseRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/hse`);
      if (hseRes.success) {
        reportData.hse = hseRes.data;
      }

      // Checklist
      const checklistRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/checklist`);
      if (checklistRes.success) {
        reportData.checklist = checklistRes.data;
      }

      // Staff
      const staffRes = await get<{ success: boolean; data: any }>(`/api/admin/project-staff?projectId=${selectedProject.id}`);
      if (staffRes.success) {
        reportData.staff = staffRes.data;
      }

      // Labours
      const laboursRes = await get<{ success: boolean; data: any }>(`/api/admin/project-labours?projectId=${selectedProject.id}`);
      if (laboursRes.success) {
        reportData.labours = laboursRes.data;
      }

      // Project Trades (needed to show trades with no assignments)
      const projectTradesRes = await get<{ success: boolean; data: any }>(`/api/admin/project-trades?projectId=${selectedProject.id}`);
      if (projectTradesRes.success) {
        reportData.projectTrades = projectTradesRes.data;
      }

      // Labour Supply
      const labourSupplyRes = await get<{ success: boolean; data: any }>(`/api/admin/project-labour-supplies?projectId=${selectedProject.id}`);
      if (labourSupplyRes.success) {
        reportData.labourSupply = labourSupplyRes.data;
      }

      // Plants
      const plantsRes = await get<{ success: boolean; data: any }>(`/api/admin/project-plants?projectId=${selectedProject.id}`);
      if (plantsRes.success) {
        reportData.plants = plantsRes.data;
      }

      // Plant Requirements
      const plantRequirementsRes = await get<{ success: boolean; data: any }>(`/api/admin/project-plant-requirements?projectId=${selectedProject.id}`);
      if (plantRequirementsRes.success) {
        reportData.plantRequirements = plantRequirementsRes.data;
      }

      // Assets
      const assetsRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/assets`);
      if (assetsRes.success) {
        reportData.assets = assetsRes.data;
      }

      // Pictures - include selected pictures for the report
      if (selectedPictureIds.size > 0 && availablePictures.length > 0) {
        const selectedPictures = availablePictures.filter(pic => selectedPictureIds.has(pic.id));
        reportData.pictures = {
          pictures: selectedPictures
        };
      } else {
        reportData.pictures = { pictures: [] };
      }

      // All Project Pictures - fetch all pictures to find featured one for cover
      const allPicturesRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/pictures`);
      if (allPicturesRes.success && allPicturesRes.data?.pictures) {
        reportData.allProjectPictures = {
          pictures: allPicturesRes.data.pictures
        };
      } else {
        reportData.allProjectPictures = { pictures: [] };
      }

      // Close Out
      const closeOutRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/close-out`);
      if (closeOutRes.success) {
        reportData.closeOut = closeOutRes.data;
      }

      // Client Feedback
      const clientFeedbackRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/client-feedback`);
      if (clientFeedbackRes.success) {
        reportData.clientFeedback = clientFeedbackRes.data;
      }

      // Commercial
      const commercialRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/commercial`);
      if (commercialRes.success) {
        reportData.commercial = commercialRes.data;
      }

      // Commercial Checklist
      const commercialChecklistRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/commercial/checklist`);
      if (commercialChecklistRes.success) {
        reportData.commercialChecklist = commercialChecklistRes.data;
      }

      // IPC (Payment Certificates)
      const ipcRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/ipc`);
      if (ipcRes.success && ipcRes.data) {
        // API returns entries, need to convert to rows format for calculations
        const ipcEntries = ipcRes.data.entries || [];
        if (ipcEntries.length > 0) {
        // Convert entries to rows format (similar to ProjectIPC component)
        const ipcRows = ipcEntries.map((entry: any) => ({
          invoiceNumber: entry.invoiceNumber || '',
          paymentType: entry.paymentType || '',
          grossValueCertified: entry.grossValueCertified?.toString() || '0',
          receivedPayment: entry.receivedPayment?.toString() || '0',
          netPayable: entry.netPayable?.toString() || '0',
          retention: entry.retention?.toString() || '0',
          advancePaymentRecovery: entry.advancePaymentRecovery?.toString() || '0',
          paymentStatus: entry.paymentStatus || '',
          paymentDueDate: entry.paymentDueDate ? new Date(entry.paymentDueDate).toISOString().split('T')[0] : '',
          grossValueSubmitted: entry.grossValueSubmitted?.toString() || '0',
          dateSubmitted: entry.dateSubmitted ? new Date(entry.dateSubmitted).toISOString() : null,
          certifiedDate: entry.certifiedDate ? new Date(entry.certifiedDate).toISOString() : null,
        }));
        const stats = {
          totalSubmitted: 0,
          totalCertified: 0,
          totalReceived: 0,
          duePayments: 0,
          duePaymentsCount: 0,
          receivables: 0,
          receivablesCount: 0,
          totalRetentionHeld: 0,
          balanceAdvancePaymentRecovery: 0,
          advancePaymentAmount: 0,
          totalAdvanceRecoveries: 0,
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        ipcRows.forEach((row: any) => {
          const certified = parseFloat(row.grossValueCertified) || 0;
          const received = parseFloat(row.receivedPayment) || 0;
          const netPayable = parseFloat(row.netPayable) || 0;
          const retention = parseFloat(row.retention) || 0;
          const advanceRecovery = parseFloat(row.advancePaymentRecovery) || 0;

          // Find advance payment amount
          if (row.paymentType === 'Adv' && certified > 0) {
            stats.advancePaymentAmount = certified;
          }

          // Total Retention Held
          if (
            row.paymentType === 'Progress' &&
            certified > 0 &&
            (row.paymentStatus === 'In Process' || row.paymentStatus === 'Received')
          ) {
            stats.totalRetentionHeld += retention;
          }

          // Total Advance Recoveries
          if (
            row.paymentType === 'Progress' &&
            certified > 0 &&
            (row.paymentStatus === 'In Process' || row.paymentStatus === 'Received')
          ) {
            stats.totalAdvanceRecoveries += advanceRecovery;
          }

          // Total Certified
          if (
            certified > 0 && 
            row.paymentType === 'Progress' &&
            (row.paymentStatus === 'In Process' || row.paymentStatus === 'Received')
          ) {
            stats.totalCertified += certified;
          }

          // Total Submitted
          if (row.paymentType === 'Progress') {
            if (
              certified > 0 && 
              (row.paymentStatus === 'In Process' || row.paymentStatus === 'Received')
            ) {
              stats.totalSubmitted += certified;
            } else if (
              certified > 0 && 
              row.paymentStatus === 'Under-Certification'
            ) {
              stats.totalSubmitted += certified;
            }
          }
          
          stats.totalReceived += received;

          // Check if payment is "In Process"
          if (row.paymentStatus === 'In Process') {
            let calculatedDueDays = 0;
            if (row.paymentDueDate) {
              const dueDate = new Date(row.paymentDueDate);
              dueDate.setHours(0, 0, 0, 0);
              calculatedDueDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            }

            stats.receivables += netPayable;
            stats.receivablesCount++;

            if (calculatedDueDays < 0) {
              stats.duePayments += netPayable;
              stats.duePaymentsCount++;
            }
          }
        });

        stats.balanceAdvancePaymentRecovery = stats.advancePaymentAmount - stats.totalAdvanceRecoveries;

        reportData.paymentCertificate = {
          rows: ipcRows,
          summary: stats
        };
        } else {
          // No IPC rows, but still add empty summary
          reportData.paymentCertificate = {
            rows: [],
            summary: {
              totalSubmitted: 0,
              totalCertified: 0,
              totalReceived: 0,
              duePayments: 0,
              duePaymentsCount: 0,
              receivables: 0,
              receivablesCount: 0,
              totalRetentionHeld: 0,
              balanceAdvancePaymentRecovery: 0,
              advancePaymentAmount: 0,
              totalAdvanceRecoveries: 0
            }
          };
        }
      } else {
        // IPC API call failed or no data, add empty summary
        reportData.paymentCertificate = {
          rows: [],
          summary: {
            totalSubmitted: 0,
            totalCertified: 0,
            totalReceived: 0,
            duePayments: 0,
            duePaymentsCount: 0,
            receivables: 0,
            receivablesCount: 0,
            totalRetentionHeld: 0,
            balanceAdvancePaymentRecovery: 0,
            advancePaymentAmount: 0,
            totalAdvanceRecoveries: 0
          }
        };
      }
    } catch (error) {
      console.error('Error collecting project data:', error);
    }

    return reportData;
  };

  const handleGenerateReport = async () => {
    if (!selectedProject) return;

    setIsGeneratingReport(true);
    try {
      const reportData = await collectProjectData(reportMonth, reportYear);
      
      const response = await post<{ success: boolean; data: any; error?: string }>('/api/admin/reports', {
        projectId: selectedProject.id,
        reportMonth,
        reportYear,
        reportData,
      });

      if (response.success) {
        alert(`Report generated successfully for ${new Date(reportYear, reportMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`);
        setShowGenerateReportModal(false);
      } else {
        alert(response.error || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(error.message || 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Helper function to check if a contact is primary for a specific consultant type
  const isPrimaryForConsultantType = (projectContact: any, consultantId: number, consultantType: string) => {
    // Get all contacts for this specific consultant and consultant type
    const consultantContacts = projectContacts.filter(pc => 
      pc.contact.entityType === 'consultant' && 
      pc.contact.entityId === consultantId &&
      pc.consultantType === consultantType
    );
    
    // Find the primary contact for this consultant and consultant type
    const primaryContact = consultantContacts.find(pc => pc.isPrimary);
    
    // Return true if this contact is the primary one for this consultant and consultant type
    return primaryContact && primaryContact.id === projectContact.id;
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setSelectedContacts([]);
    setProjectContacts([]);
    setContactSearchTerm('');
    setShowContactDropdown(false);
    
    // Fetch project contacts for this project
    fetchProjectContacts(project.id);
    
    const newFormData = {
      projectCode: project.projectCode,
      projectName: project.projectName,
      projectDescription: project.projectDescription || '',
      clientId: project.clientId ?? undefined,
      projectManagementConsultantId: project.projectManagementConsultantId ?? undefined,
      designConsultantId: project.designConsultantId ?? undefined,
      supervisionConsultantId: project.supervisionConsultantId ?? undefined,
      costConsultantId: project.costConsultantId ?? undefined,
      projectDirectorId: project.projectDirectorId ?? undefined,
      projectManagerId: project.projectManagerId ?? undefined,
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      duration: project.duration || '',
      eot: project.eot || '',
      projectValue: project.projectValue ?? undefined,
    };
    
    setFormData(newFormData);
    setShowForm(true);
  };

  const handleTogglePrimaryContact = async (projectContactId: number, isPrimary: boolean) => {
    try {
      const response = await put(`/api/admin/project-contacts`, {
        id: projectContactId,
        isPrimary: !isPrimary,
      });
      
      if (response.success) {
        // Refresh project contacts
        if (editingProject?.id) {
          fetchProjectContacts(editingProject.id);
        }
      }
    } catch (error) {
      console.error('Error updating primary contact:', error);
    }
  };

  const handleRemoveProjectContact = async (projectContactId: number) => {
    try {
      const response = await del(`/api/admin/project-contacts?id=${projectContactId}`);
      
      if (response.success) {
        // Refresh project contacts
        if (editingProject?.id) {
          fetchProjectContacts(editingProject.id);
        }
      }
    } catch (error) {
      console.error('Error removing project contact:', error);
    }
  };

  const handleAddExistingContactToProject = async (contactId: number, isPrimary: boolean = false, entityType: string, entityId: number, consultantType?: string) => {
    if (editingProject?.id) {
      // For existing projects, create the relationship immediately
      try {
        const response = await post('/api/admin/project-contacts', {
          projectId: editingProject.id,
          contactId: contactId,
          isPrimary: isPrimary,
          consultantType: consultantType,
        });
        
        if (response.success) {
          // Refresh project contacts
          fetchProjectContacts(editingProject.id);
        }
      } catch (error) {
        console.error('Error adding contact to project:', error);
      }
    } else {
      // For new projects, store in pending contacts
      setPendingContacts(prev => {
        const existing = prev.find(pc => pc.contactId === contactId && pc.entityType === entityType && pc.entityId === entityId && pc.consultantType === consultantType);
        if (existing) {
          // Remove if already exists
          return prev.filter(pc => !(pc.contactId === contactId && pc.entityType === entityType && pc.entityId === entityId && pc.consultantType === consultantType));
        } else {
          // Add new pending contact
          return [...prev, { contactId, entityType, entityId, consultantType, isPrimary }];
        }
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await del(`/api/admin/projects/${id}`) as { success: boolean };
        if (response.success) {
          setProjects(projects.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  // Handle client creation
  const handleClientSubmit = async () => {
    try {
      const clientData = {
        ...clientFormData,
        email: clientFormData.email || undefined,
        phone: clientFormData.phone || undefined,
        officeAddress: clientFormData.officeAddress || undefined,
      };

      const response = await post<{ success: boolean; data: Client }>('/api/admin/clients', clientData);
      if (response.success) {
        setClients([response.data, ...clients]);
        setFormData({ ...formData, clientId: response.data.id });
        setShowClientForm(false);
        setClientFormData({
          name: '',
          officeAddress: '',
          phone: '',
          email: '',
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  // Handle consultant creation
  const handleConsultantSubmit = async () => {
    try {
      const consultantData = {
        name: consultantFormData.name,
        officeAddress: consultantFormData.officeAddress || undefined,
        phone: consultantFormData.phone || undefined,
        email: consultantFormData.email || undefined,
        isActive: consultantFormData.isActive,
        types: consultantFormData.selectedTypes || [],
      };

      const response = await post<{ success: boolean; data: Consultant }>('/api/admin/consultants', consultantData);
      if (response.success) {
        setConsultants([response.data, ...consultants]);
        setShowConsultantForm(false);
        setShowConsultantModal(false);
        setConsultantFormData({
          name: '',
          officeAddress: '',
          phone: '',
          email: '',
          isActive: true,
          selectedTypes: [],
        });
      }
    } catch (error) {
      console.error('Error creating consultant:', error);
    }
  };

  // Handle consultant type toggle
  const handleConsultantTypeToggle = (typeId: number) => {
    setConsultantFormData(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes?.includes(typeId)
        ? prev.selectedTypes.filter(id => id !== typeId)
        : [...(prev.selectedTypes || []), typeId]
    }));
  };

  // Handle client contact creation
  const handleClientContactSubmit = async () => {
    try {
      const contactData = {
        ...clientContactFormData,
        email: clientContactFormData.email || undefined,
        phone: clientContactFormData.phone || undefined,
        position: clientContactFormData.position || undefined,
        notes: clientContactFormData.notes || undefined,
        isActive: true, // Always active when created
        entityId: formData.clientId,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        
        // Create project contact relationship
        if (editingProject?.id) {
          const projectContactData = {
            projectId: editingProject.id,
            contactId: response.data.id,
            isPrimary: false, // Always false when creating - can be set later via radio buttons
          };
          
          await post('/api/admin/project-contacts', projectContactData);
          
          // Refresh project contacts
          fetchProjectContacts(editingProject.id);
        }
        
        setShowClientContactForm(false);
        setClientContactFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          notes: '',
          isPrimary: false,
          isActive: true,
          entityType: 'client',
          entityId: undefined,
        });
      }
    } catch (error) {
      console.error('Error creating client contact:', error);
    }
  };

  // Handle consultant contact creation
  const handleConsultantContactSubmit = async () => {
    try {
      const contactData = {
        ...consultantContactFormData,
        email: consultantContactFormData.email || undefined,
        phone: consultantContactFormData.phone || undefined,
        position: consultantContactFormData.position || undefined,
        notes: consultantContactFormData.notes || undefined,
        entityId: consultantContactFormData.entityId,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        setShowConsultantContactForm(false);
        setConsultantContactFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          notes: '',
          isPrimary: false,
          isActive: true,
          entityType: 'consultant',
          entityId: undefined,
        });
      }
    } catch (error) {
      console.error('Error creating consultant contact:', error);
    }
  };

  // Handle PMC contact creation
  const handlePMCContactSubmit = async () => {
    try {
      const contactData = {
        ...pmcContactFormData,
        email: pmcContactFormData.email || undefined,
        phone: pmcContactFormData.phone || undefined,
        position: pmcContactFormData.position || undefined,
        notes: pmcContactFormData.notes || undefined,
        entityId: pmcContactFormData.entityId,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        setShowPMCContactForm(false);
        setPMCContactFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          notes: '',
          isPrimary: false,
          isActive: true,
          entityType: 'consultant',
          entityId: undefined,
        });
      }
    } catch (error) {
      console.error('Error creating PMC contact:', error);
    }
  };

  // Handle Design contact creation
  const handleDesignContactSubmit = async () => {
    try {
      const contactData = {
        ...designContactFormData,
        email: designContactFormData.email || undefined,
        phone: designContactFormData.phone || undefined,
        position: designContactFormData.position || undefined,
        notes: designContactFormData.notes || undefined,
        entityId: designContactFormData.entityId,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        setShowDesignContactForm(false);
        setDesignContactFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          notes: '',
          isPrimary: false,
          isActive: true,
          entityType: 'consultant',
          entityId: undefined,
        });
      }
    } catch (error) {
      console.error('Error creating Design contact:', error);
    }
  };

  // Handle Cost contact creation
  const handleCostContactSubmit = async () => {
    try {
      const contactData = {
        ...costContactFormData,
        email: costContactFormData.email || undefined,
        phone: costContactFormData.phone || undefined,
        position: costContactFormData.position || undefined,
        notes: costContactFormData.notes || undefined,
        entityId: costContactFormData.entityId,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        setShowCostContactForm(false);
        setCostContactFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          notes: '',
          isPrimary: false,
          isActive: true,
          entityType: 'consultant',
          entityId: undefined,
        });
      }
    } catch (error) {
      console.error('Error creating Cost contact:', error);
    }
  };

  // Handle Supervision contact creation
  const handleSupervisionContactSubmit = async () => {
    try {
      const contactData = {
        ...supervisionContactFormData,
        email: supervisionContactFormData.email || undefined,
        phone: supervisionContactFormData.phone || undefined,
        position: supervisionContactFormData.position || undefined,
        notes: supervisionContactFormData.notes || undefined,
        entityId: supervisionContactFormData.entityId,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        setShowSupervisionContactForm(false);
        setSupervisionContactFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          notes: '',
          isPrimary: false,
          isActive: true,
          entityType: 'consultant',
          entityId: undefined,
        });
      }
    } catch (error) {
      console.error('Error creating Supervision contact:', error);
    }
  };

  // Handle modal contact creation
  const handleModalContactSubmit = async () => {
    try {
      const contactData = {
        ...modalContactFormData,
        email: modalContactFormData.email || undefined,
        phone: modalContactFormData.phone || undefined,
        position: modalContactFormData.position || undefined,
        notes: modalContactFormData.notes || undefined,
        isActive: true, // Always active when created
        entityId: modalContactFormData.entityId,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        
        // Create project contact relationship
        if (editingProject?.id && contactModalData) {
          // Determine consultant type based on contactModalData
          let consultantType = null;
          if (contactModalData.consultantType === 'Project Management Consultant') {
            consultantType = 'pmc';
          } else if (contactModalData.consultantType === 'Design Consultant') {
            consultantType = 'design';
          } else if (contactModalData.consultantType === 'Cost Consultant') {
            consultantType = 'cost';
          } else if (contactModalData.consultantType === 'Supervision Consultant') {
            consultantType = 'supervision';
          }
          
          const projectContactData = {
            projectId: editingProject.id,
            contactId: response.data.id,
            isPrimary: false, // Always false when creating - can be set later via radio buttons
            consultantType: consultantType,
          };
          
          await post('/api/admin/project-contacts', projectContactData);
          
          // Refresh project contacts
          fetchProjectContacts(editingProject.id);
        }
        
        setShowContactModal(false);
        setContactModalData(null);
        setModalContactFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          notes: '',
          isPrimary: false,
          isActive: true, // Always active when created
          entityType: 'consultant',
          entityId: undefined,
        });
      }
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  // Handle staff creation
  const handleStaffSubmit = async () => {
    try {
      // Get the position name from the selected positionId
      const selectedPosition = companyPositions.find(p => p.id === staffFormData.positionId);
      
      const staffData = {
        ...staffFormData,
        email: staffFormData.email || undefined,
        phone: staffFormData.phone || undefined,
        position: selectedPosition?.name || staffFormData.position || undefined,
      };

      // Remove positionId from the payload since the API expects position as string
      const { positionId, ...payloadWithoutPositionId } = staffData;
      const finalPayload = payloadWithoutPositionId;

      const response = await post<{ success: boolean; data: CompanyStaff }>('/api/admin/company-staff', finalPayload);
      if (response.success) {
        setStaff([response.data, ...staff]);
        setShowStaffForm(false);
        setShowPositionDropdownInStaffForm(false);
        setPositionSearchTermInStaffForm('');
        setStaffFormData({
          staffName: '',
          position: '',
          positionId: undefined,
          email: '',
          phone: '',
        });
      }
    } catch (error) {
      console.error('Error creating staff:', error);
    }
  };

  // Handle adding staff position
  const addStaffPosition = () => {
    const newPosition = {
      designation: '',
      utilization: 100,
      startDate: '',
      endDate: '',
      status: 'Active',
      notes: '',
    };
    setAdditionalStaffPositions([...additionalStaffPositions, newPosition]);
  };

  // Handle removing staff position
  const removeStaffPosition = (index: number) => {
    setAdditionalStaffPositions(additionalStaffPositions.filter((_, i) => i !== index));
  };

  // Handle updating staff position
  const updateStaffPosition = (index: number, field: string, value: any) => {
    setAdditionalStaffPositions(additionalStaffPositions.map((position, i) => 
      i === index ? { ...position, [field]: value } : position
    ));
  };

  const filteredProjects = projects.filter(project =>
    project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  return (
    <>
      {staffMovementConflict && (
        <StaffMovementConfirmationDialog
          conflict={staffMovementConflict}
          onConfirm={handleConfirmStaffMovement}
          onCancel={handleCancelStaffMovement}
        />
      )}
    <div className="space-y-6">
      {showDetailView && selectedProject ? (
        // Project Detail View
        <div>
          {/* Detail View Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackToList}
                variant="ghost"
                className="p-2"
                style={{ color: colors.textMuted }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  {selectedProject.projectName}
                </h1>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  Project Code: {selectedProject.projectCode}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={async () => {
                  setShowGenerateReportModal(true);
                  // Fetch pictures when opening modal
                  if (selectedProject) {
                    setIsLoadingPictures(true);
                    try {
                      const picturesRes = await get<{ success: boolean; data: any }>(`/api/admin/projects/${selectedProject.id}/pictures`);
                      if (picturesRes.success && picturesRes.data?.pictures) {
                        // Sort by createdAt descending (most recent first)
                        const sortedPictures = [...picturesRes.data.pictures].sort((a: any, b: any) => {
                          const dateA = new Date(a.createdAt || a.media?.createdAt || 0).getTime();
                          const dateB = new Date(b.createdAt || b.media?.createdAt || 0).getTime();
                          return dateB - dateA; // Descending order (newest first)
                        });
                        setAvailablePictures(sortedPictures);
                        // Select latest 10 images by default (already sorted by most recent first)
                        const latest10 = sortedPictures.slice(0, 10);
                        setSelectedPictureIds(new Set(latest10.map((pic: any) => pic.id)));
                      } else {
                        setAvailablePictures([]);
                        setSelectedPictureIds(new Set());
                      }
                    } catch (error) {
                      console.error('Error fetching pictures:', error);
                      setAvailablePictures([]);
                      setSelectedPictureIds(new Set());
                    } finally {
                      setIsLoadingPictures(false);
                    }
                  }
                }}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <FileBarChart className="w-4 h-4" />
                <span>Generate Report</span>
              </Button>
            <Button
              onClick={() => {
                setShowDetailView(false);
                handleEdit(selectedProject);
              }}
              className="flex items-center space-x-2"
              style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
            >
              <Edit className="w-4 h-4" />
              <span>Edit Project</span>
            </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 mb-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'overview' 
                  ? 'border-current active' 
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{ 
                color: activeTab === 'overview' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'overview' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'overview' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'overview' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'overview' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'overview' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'overview' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Project Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'checklist' 
                  ? 'border-current active' 
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'checklist') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'checklist') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{ 
                color: activeTab === 'checklist' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'checklist' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'checklist' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'checklist' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'checklist' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'checklist' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'checklist' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-4 h-4" />
                <span>Checklist</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'staff' 
                  ? 'border-current active' 
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'staff') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'staff') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{ 
                color: activeTab === 'staff' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'staff' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'staff' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'staff' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'staff' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'staff' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'staff' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Staff</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('labours')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'labours' 
                  ? 'border-current active' 
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'labours') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'labours') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{ 
                color: activeTab === 'labours' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'labours' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'labours' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'labours' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'labours' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'labours' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'labours' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Hammer className="w-4 h-4" />
                <span>Labours</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('labourSupply')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'labourSupply' 
                  ? 'border-current active' 
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'labourSupply') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'labourSupply') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{ 
                color: activeTab === 'labourSupply' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'labourSupply' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'labourSupply' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'labourSupply' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'labourSupply' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'labourSupply' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'labourSupply' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <UserCog className="w-4 h-4" />
                <span>Labour Supply</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('plants')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'plants'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'plants') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'plants') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'plants' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'plants' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'plants' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'plants' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'plants' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'plants' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'plants' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Bus className="w-4 h-4" />
                <span>Plant</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'assets'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'assets') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'assets') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'assets' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'assets' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'assets' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'assets' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'assets' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'assets' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'assets' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Assets</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('planning')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'planning'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'planning') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'planning') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'planning' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'planning' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'planning' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'planning' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'planning' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'planning' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'planning' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <DraftingCompass className="w-4 h-4" />
                <span>Planning</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'quality'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'quality') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'quality') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'quality' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'quality' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'quality' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'quality' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'quality' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'quality' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'quality' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Quality</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'risks'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'risks') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'risks') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'risks' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'risks' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'risks' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'risks' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'risks' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'risks' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'risks' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Risks</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('hse')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'hse'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'hse') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'hse') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'hse' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'hse' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'hse' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'hse' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'hse' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'hse' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'hse' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <LifeBuoy className="w-4 h-4" />
                <span>HSE</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pictures')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'pictures'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'pictures') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'pictures') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'pictures' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'pictures' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'pictures' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'pictures' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'pictures' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'pictures' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'pictures' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Pictures</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('commercial')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'commercial'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'commercial') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'commercial') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'commercial' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'commercial' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'commercial' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'commercial' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'commercial' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'commercial' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'commercial' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Commercial</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ipc')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'ipc'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'ipc') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'ipc') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'ipc' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'ipc' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'ipc' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'ipc' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'ipc' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'ipc' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'ipc' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4" />
                <span>IPC</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'suppliers'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'suppliers') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'suppliers') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'suppliers' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'suppliers' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'suppliers' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'suppliers' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'suppliers' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'suppliers' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'suppliers' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Suppliers</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('subcontractors')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'subcontractors'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'subcontractors') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'subcontractors') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'subcontractors' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'subcontractors' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'subcontractors' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'subcontractors' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'subcontractors' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'subcontractors' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'subcontractors' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <HardHat className="w-4 h-4" />
                <span>Subcontractors</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('closeOut')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'closeOut'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'closeOut') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'closeOut') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'closeOut' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'closeOut' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'closeOut' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'closeOut' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'closeOut' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'closeOut' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'closeOut' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="w-4 h-4" />
                <span>Close Out</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('clientFeedback')}
              className={`px-4 py-2 text-sm font-medium border-2 rounded-t-lg transition-colors tab-with-extended-border ${
                activeTab === 'clientFeedback'
                  ? 'border-current active'
                  : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                if (activeTab !== 'clientFeedback') {
                  e.currentTarget.style.borderTopColor = colors.borderLight;
                  e.currentTarget.style.borderLeftColor = colors.borderLight;
                  e.currentTarget.style.borderRightColor = colors.borderLight;
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'clientFeedback') {
                  e.currentTarget.style.borderTopColor = colors.border;
                  e.currentTarget.style.borderLeftColor = colors.border;
                  e.currentTarget.style.borderRightColor = colors.border;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              style={{
                color: activeTab === 'clientFeedback' ? colors.primary : colors.textSecondary,
                borderTopColor: activeTab === 'clientFeedback' ? colors.primary : colors.border,
                borderLeftColor: activeTab === 'clientFeedback' ? colors.primary : colors.border,
                borderRightColor: activeTab === 'clientFeedback' ? colors.primary : colors.border,
                backgroundColor: activeTab === 'clientFeedback' ? colors.backgroundSecondary : 'transparent',
                borderBottomColor: activeTab === 'clientFeedback' ? 'transparent' : colors.border,
                '--tab-border-color': activeTab === 'clientFeedback' ? colors.primary : 'transparent'
              } as React.CSSProperties}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Client Feedback</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <div>
              {/* Project Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                <Building2 className="w-5 h-5" />
                <span>Basic Information</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Project Code</span>
                  <p className="text-lg" style={{ color: colors.textPrimary }}>{selectedProject.projectCode}</p>
                </div>
                <div>
                  <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Project Name</span>
                  <p className="text-lg" style={{ color: colors.textPrimary }}>{selectedProject.projectName}</p>
                </div>
                {selectedProject.projectDescription && (
                  <div>
                    <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Description</span>
                    <p style={{ color: colors.textPrimary }}>{selectedProject.projectDescription}</p>
                  </div>
                )}
                {selectedProject.projectValue && (
                  <div>
                    <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Project Value</span>
                    <p className="text-xl font-semibold" style={{ color: colors.primary }}>
                      {formatCurrency(Number(selectedProject.projectValue), siteSettings?.currencySymbol || '$')}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                <Calendar className="w-5 h-5" />
                <span>Timeline</span>
              </h2>
              <div className="space-y-4">
                {selectedProject.startDate && (
                  <div>
                    <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Start Date</span>
                    <p style={{ color: colors.textPrimary }}>
                      {new Date(selectedProject.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {selectedProject.endDate && (
                  <div>
                    <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>End Date</span>
                    <p style={{ color: colors.textPrimary }}>
                      {new Date(selectedProject.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {selectedProject.duration && (
                  <div>
                    <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Duration</span>
                    <p style={{ color: colors.textPrimary }}>{selectedProject.duration}</p>
                  </div>
                )}
                {selectedProject.eot && (
                  <div>
                    <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Extension of Time</span>
                    <p style={{ color: colors.textPrimary }}>{selectedProject.eot}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Client Information */}
            {selectedProject.client && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                  <Building2 className="w-5 h-5" />
                  <span>Client Information</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium block mb-1" style={{ color: colors.textSecondary }}>Client Name</span>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>{selectedProject.client.name}</p>
                  </div>
                  
                  {/* Client Contacts */}
                  {projectContacts.filter(pc => pc.contact.entityType === 'client' && pc.contact.entityId === selectedProject.clientId).length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-3" style={{ color: colors.textPrimary }}>Client Contacts</h3>
                      <div className="ml-6 space-y-2">
                        {projectContacts
                          .filter(pc => pc.contact.entityType === 'client' && pc.contact.entityId === selectedProject.clientId)
                          .map((projectContact) => (
                            <div 
                              key={projectContact.id} 
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                <div>
                                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                                    {projectContact.contact.firstName} {projectContact.contact.lastName}
                                  </p>
                                  {projectContact.contact.email && (
                                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                                      {projectContact.contact.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {projectContact.isPrimary && (
                                <span 
                                  className="px-2 py-1 text-xs rounded-full" 
                                  style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
                                >
                                  Primary
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Project Team - Director and Manager Only */}
            {selectedProject.projectStaff && selectedProject.projectStaff.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                  <Users className="w-5 h-5" />
                  <span>Project Team</span>
                </h2>
                <div className="space-y-4">
                  {selectedProject.projectStaff
                    .filter(staff => staff.designation === 'Project Director' || staff.designation === 'Project Manager')
                    .filter(staff => staff.staff) // Only show assigned staff
                    .map((staffAssignment) => (
                    <div key={staffAssignment.id} className="flex items-center space-x-3">
                      <User className="w-5 h-5" style={{ color: colors.textMuted }} />
                      <div>
                        <span className="text-sm font-medium block" style={{ color: colors.textSecondary }}>{staffAssignment.designation}</span>
                        <p style={{ color: colors.textPrimary }}>{staffAssignment.staff?.staffName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Consultants with Contacts */}
          {(selectedProject.projectManagementConsultant || selectedProject.designConsultant || selectedProject.supervisionConsultant || selectedProject.costConsultant) && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                <Users className="w-5 h-5" />
                <span>Consultants</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Management Consultant Card */}
                {selectedProject.projectManagementConsultant && (
                  <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <HardHat className="w-5 h-5" style={{ color: colors.textMuted }} />
                      <div>
                        <span className="text-sm font-medium block" style={{ color: colors.textSecondary }}>Project Management Consultant</span>
                        <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{selectedProject.projectManagementConsultant.name}</p>
                      </div>
                    </div>
                    {/* PMC Contacts */}
                    <div className="space-y-2">
                      {contacts
                        .filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.projectManagementConsultantId && contact.isActive)
                        .filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'pmc'))
                        .map((contact) => {
                          const projectContact = projectContacts.find(pc => pc.contactId === contact.id && pc.consultantType === 'pmc');
                          return (
                            <div 
                              key={contact.id} 
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                <div>
                                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                                    {contact.firstName} {contact.lastName}
                                  </p>
                                  {contact.email && (
                                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                                      {contact.email}
                                    </p>
                                  )}
                                  {contact.position && (
                                    <p className="text-xs" style={{ color: colors.textMuted }}>
                                      {contact.position}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {projectContact && projectContact.isPrimary && (
                                <span 
                                  className="px-2 py-1 text-xs rounded-full" 
                                  style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
                                >
                                  Primary
                                </span>
                              )}
                            </div>
                          );
                        })}
                      {contacts.filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.projectManagementConsultantId && contact.isActive).filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'pmc')).length === 0 && (
                        <p className="text-sm text-center py-4" style={{ color: colors.textMuted }}>
                          No contacts assigned to this project
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Design Consultant Card */}
                {selectedProject.designConsultant && (
                  <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <DraftingCompass className="w-5 h-5" style={{ color: colors.textMuted }} />
                      <div>
                        <span className="text-sm font-medium block" style={{ color: colors.textSecondary }}>Design Consultant</span>
                        <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{selectedProject.designConsultant.name}</p>
                      </div>
                    </div>
                    {/* Design Contacts */}
                    <div className="space-y-2">
                      {contacts
                        .filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.designConsultantId && contact.isActive)
                        .filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'design'))
                        .map((contact) => {
                          const projectContact = projectContacts.find(pc => pc.contactId === contact.id && pc.consultantType === 'design');
                          return (
                            <div 
                              key={contact.id} 
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                <div>
                                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                                    {contact.firstName} {contact.lastName}
                                  </p>
                                  {contact.email && (
                                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                                      {contact.email}
                                    </p>
                                  )}
                                  {contact.position && (
                                    <p className="text-xs" style={{ color: colors.textMuted }}>
                                      {contact.position}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {projectContact && projectContact.isPrimary && (
                                <span 
                                  className="px-2 py-1 text-xs rounded-full" 
                                  style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
                                >
                                  Primary
                                </span>
                              )}
                            </div>
                          );
                        })}
                      {contacts.filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.designConsultantId && contact.isActive).filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'design')).length === 0 && (
                        <p className="text-sm text-center py-4" style={{ color: colors.textMuted }}>
                          No contacts assigned to this project
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Supervision Consultant Card */}
                {selectedProject.supervisionConsultant && (
                  <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Eye className="w-5 h-5" style={{ color: colors.textMuted }} />
                      <div>
                        <span className="text-sm font-medium block" style={{ color: colors.textSecondary }}>Supervision Consultant</span>
                        <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{selectedProject.supervisionConsultant.name}</p>
                      </div>
                    </div>
                    {/* Supervision Contacts */}
                    <div className="space-y-2">
                      {contacts
                        .filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.supervisionConsultantId && contact.isActive)
                        .filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'supervision'))
                        .map((contact) => {
                          const projectContact = projectContacts.find(pc => pc.contactId === contact.id && pc.consultantType === 'supervision');
                          return (
                            <div 
                              key={contact.id} 
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                <div>
                                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                                    {contact.firstName} {contact.lastName}
                                  </p>
                                  {contact.email && (
                                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                                      {contact.email}
                                    </p>
                                  )}
                                  {contact.position && (
                                    <p className="text-xs" style={{ color: colors.textMuted }}>
                                      {contact.position}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {projectContact && projectContact.isPrimary && (
                                <span 
                                  className="px-2 py-1 text-xs rounded-full" 
                                  style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
                                >
                                  Primary
                                </span>
                              )}
                            </div>
                          );
                        })}
                      {contacts.filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.supervisionConsultantId && contact.isActive).filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'supervision')).length === 0 && (
                        <p className="text-sm text-center py-4" style={{ color: colors.textMuted }}>
                          No contacts assigned to this project
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Cost Consultant Card */}
                {selectedProject.costConsultant && (
                  <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calculator className="w-5 h-5" style={{ color: colors.textMuted }} />
                      <div>
                        <span className="text-sm font-medium block" style={{ color: colors.textSecondary }}>Cost Consultant</span>
                        <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{selectedProject.costConsultant.name}</p>
                      </div>
                    </div>
                    {/* Cost Contacts */}
                    <div className="space-y-2">
                      {contacts
                        .filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.costConsultantId && contact.isActive)
                        .filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'cost'))
                        .map((contact) => {
                          const projectContact = projectContacts.find(pc => pc.contactId === contact.id && pc.consultantType === 'cost');
                          return (
                            <div 
                              key={contact.id} 
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                <div>
                                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                                    {contact.firstName} {contact.lastName}
                                  </p>
                                  {contact.email && (
                                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                                      {contact.email}
                                    </p>
                                  )}
                                  {contact.position && (
                                    <p className="text-xs" style={{ color: colors.textMuted }}>
                                      {contact.position}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {projectContact && projectContact.isPrimary && (
                                <span 
                                  className="px-2 py-1 text-xs rounded-full" 
                                  style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
                                >
                                  Primary
                                </span>
                              )}
                            </div>
                          );
                        })}
                      {contacts.filter(contact => contact.entityType === 'consultant' && contact.entityId === selectedProject.costConsultantId && contact.isActive).filter(contact => projectContacts.some(pc => pc.contactId === contact.id && pc.consultantType === 'cost')).length === 0 && (
                        <p className="text-sm text-center py-4" style={{ color: colors.textMuted }}>
                          No contacts assigned to this project
                        </p>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
            </div>
          ) : activeTab === 'planning' ? (
            <div>
              {selectedProject && (
                <ProjectPlanning
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'quality' ? (
            <div>
              {selectedProject && (
                <ProjectQuality
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'risks' ? (
            <div className="space-y-8">
              {selectedProject && (
                <>
                  <ProjectRisks
                    projectId={selectedProject.id}
                    projectName={selectedProject.projectName}
                  />
                  <ProjectAreaOfConcerns
                    projectId={selectedProject.id}
                    projectName={selectedProject.projectName}
                  />
                </>
              )}
            </div>
          ) : activeTab === 'hse' ? (
            <div>
              {selectedProject && (
                <ProjectHSE
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                />
              )}
            </div>
          ) : activeTab === 'checklist' ? (
            <div>
              {selectedProject && (
                <ProjectChecklist 
                  projectId={selectedProject.id} 
                  projectName={selectedProject.projectName} 
                />
              )}
            </div>
          ) : activeTab === 'staff' ? (
            <div>
              {selectedProject && (
                <ProjectStaff 
                  projectId={selectedProject.id} 
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'labours' ? (
            <div>
              {selectedProject && (
                <ProjectLabours 
                  projectId={selectedProject.id} 
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'labourSupply' ? (
            <div>
              {selectedProject && (
                <ProjectLabourSupply 
                  projectId={selectedProject.id} 
                  projectName={selectedProject.projectName}
                />
              )}
            </div>
          ) : activeTab === 'plants' ? (
            <div>
              {selectedProject && (
                <ProjectPlants
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'assets' ? (
            <div>
              {selectedProject && (
                <ProjectAssets
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'pictures' ? (
            <div>
              {selectedProject && (
                <ProjectPictures
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'commercial' ? (
            <div>
              {selectedProject && (
                <ProjectCommercial
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'ipc' ? (
            <div>
              {selectedProject && (
                <ProjectIPC
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                />
              )}
            </div>
          ) : activeTab === 'suppliers' ? (
            <div>
              {selectedProject && selectedSupplierId ? (
                <SupplierDetailView
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  supplierId={selectedSupplierId}
                  onBack={() => setSelectedSupplierId(null)}
                />
              ) : selectedProject ? (
                <ProjectSuppliers
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  onViewSupplierDetails={(supplierId) => setSelectedSupplierId(supplierId)}
                />
              ) : null}
            </div>
          ) : activeTab === 'subcontractors' ? (
            <div>
              {selectedProject && selectedSubcontractorId ? (
                <SubcontractorDetailView
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  subcontractorId={selectedSubcontractorId}
                  onBack={() => setSelectedSubcontractorId(null)}
                />
              ) : selectedProject ? (
                <ProjectSubcontractors
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  onViewSubcontractorDetails={(subcontractorId) => setSelectedSubcontractorId(subcontractorId)}
                />
              ) : null}
            </div>
          ) : activeTab === 'closeOut' ? (
            <div>
              {selectedProject && (
                <ProjectCloseOut
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                  projectStartDate={selectedProject.startDate}
                  projectEndDate={selectedProject.endDate}
                />
              )}
            </div>
          ) : activeTab === 'clientFeedback' ? (
            <div>
              {selectedProject && (
                <ProjectClientFeedback
                  projectId={selectedProject.id}
                  projectName={selectedProject.projectName}
                />
              )}
            </div>
          ) : null}
        </div>
      ) : (
        // Project List View
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Project Management
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Manage your projects, consultants, and timelines
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2"
              style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </Button>
          </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: colors.backgroundSecondary,
            color: colors.textPrimary,
            borderColor: colors.borderLight
          }}
        />
      </div>

      {/* Project Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingProject(null);
                setSelectedContacts([]);
                setProjectContacts([]);
                setPendingContacts([]);
                setContactSearchTerm('');
                setPMCContactSearchTerm('');
                setDesignContactSearchTerm('');
                setCostContactSearchTerm('');
                setSupervisionContactSearchTerm('');
                setShowContactDropdown(false);
                setShowPMCContactDropdown(false);
                setShowDesignContactDropdown(false);
                setShowCostContactDropdown(false);
                setShowSupervisionContactDropdown(false);
                setFormData({
                  projectCode: '',
                  projectName: '',
                  projectDescription: '',
                  clientId: undefined,
                  projectManagementConsultantId: undefined,
                  designConsultantId: undefined,
                  supervisionConsultantId: undefined,
                  costConsultantId: undefined,
                  startDate: '',
                  endDate: '',
                  duration: '',
                  eot: '',
                });
              }}
              variant="ghost"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Project Code *
                </label>
                <Input
                  type="text"
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  placeholder="e.g., PRJ-2024-001"
                  required
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Project Name *
                </label>
                <Input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  required
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>

              {/* Client Section */}
              <div className="md:col-span-2">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Building2 className="w-5 h-5" style={{ color: colors.primary }} />
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Client</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Client
                      </label>
                        {canCreateClients && (
                          <Button
                            type="button"
                            onClick={() => setShowClientForm(true)}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            New Client
                          </Button>
                        )}
                      </div>
                      <select
                        value={formData.clientId || ''}
                        onChange={(e) => {
                          const clientId = e.target.value ? parseInt(e.target.value) : undefined;
                          setFormData({ ...formData, clientId });
                          setSelectedContacts([]);
                          setContactSearchTerm('');
                          setShowContactDropdown(false);
                        }}
                        className="w-full p-3 rounded-lg border"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          color: colors.textPrimary,
                          borderColor: colors.borderLight
                        }}
                      >
                        <option value="">Select Client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Client Contacts */}
                    {formData.clientId && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Client Contacts
                        </label>
                          {canCreateContacts && (
                            <Button
                              type="button"
                              onClick={() => {
                                setShowClientContactForm(true);
                                setClientContactFormData({
                                  firstName: '',
                                  lastName: '',
                                  email: '',
                                  phone: '',
                                  position: '',
                                  notes: '',
                                  isPrimary: false,
                                  isActive: true,
                                  entityType: 'client',
                                  entityId: formData.clientId,
                                });
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Contact
                            </Button>
                          )}
                        </div>
                        
                        {/* Pending Contacts Display */}
                        {!editingProject && pendingContacts.filter(pc => pc.entityType === 'client' && pc.entityId === formData.clientId).length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>Selected Contacts</div>
                            <div className="flex flex-wrap gap-2">
                              {pendingContacts
                                .filter(pc => pc.entityType === 'client' && pc.entityId === formData.clientId)
                                .map((pendingContact, index) => {
                                  const contact = contacts.find(c => c.id === pendingContact.contactId);
                                return contact ? (
                                  <div
                                      key={index}
                                      className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                      style={{ borderColor: colors.borderLight }}
                                    >
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <span className="flex-1" style={{ color: colors.textPrimary }}>
                                        {contact.firstName} {contact.lastName}
                                      </span>
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`client-primary-${formData.clientId}`}
                                          checked={pendingContact.isPrimary}
                                          onChange={() => {
                                            // Set this contact as primary and unset others
                                            setPendingContacts(prev => prev.map(pc => 
                                              pc.entityType === 'client' && pc.entityId === formData.clientId
                                                ? { ...pc, isPrimary: pc.contactId === contact.id }
                                                : pc
                                            ));
                                          }}
                                          className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                          style={{
                                            borderColor: pendingContact.isPrimary ? colors.primary : colors.borderLight,
                                            backgroundColor: pendingContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                            accentColor: colors.primary
                                          }}
                                        />
                                        <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                      </label>
                                    <button
                                      type="button"
                                        onClick={() => {
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'client' && pc.entityId === formData.clientId)));
                                        }}
                                        className="hover:opacity-75 p-1"
                                      >
                                        <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Project Contacts */}
                        {projectContacts.filter(pc => pc.contact.entityType === 'client' && pc.contact.entityId === formData.clientId).length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {projectContacts
                                .filter(pc => pc.contact.entityType === 'client' && pc.contact.entityId === formData.clientId)
                                .map(projectContact => (
                                  <div
                                    key={projectContact.id}
                                    className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                    style={{ borderColor: colors.borderLight }}
                                  >
                                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    <span className="flex-1" style={{ color: colors.textPrimary }}>
                                      {projectContact.contact.firstName} {projectContact.contact.lastName}
                                    </span>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`client-primary-existing-${formData.clientId}`}
                                        checked={projectContact.isPrimary}
                                        onChange={() => {
                                          handleTogglePrimaryContact(projectContact.id, projectContact.isPrimary);
                                        }}
                                        className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                        style={{
                                          borderColor: projectContact.isPrimary ? colors.primary : colors.borderLight,
                                          backgroundColor: projectContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                          accentColor: colors.primary
                                        }}
                                      />
                                      <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectContact(projectContact.id)}
                                      className="hover:opacity-75 p-1"
                                    >
                                      <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Contact Search */}
                        <div className="relative contact-dropdown-container">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search client contacts..."
                              value={contactSearchTerm}
                              onChange={(e) => setContactSearchTerm(e.target.value)}
                              onFocus={() => setShowContactDropdown(true)}
                              className="w-full p-3 pr-10 rounded-lg border"
                              style={{
                                backgroundColor: colors.backgroundPrimary,
                                color: colors.textPrimary,
                                borderColor: colors.borderLight
                              }}
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                          </div>

                          {/* Contact Dropdown */}
                          {showContactDropdown && (
                            <div 
                              className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                              style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}
                            >
                              {getFilteredContacts(formData.clientId).length > 0 ? (
                                getFilteredContacts(formData.clientId).map(contact => (
                                  <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-3 hover:opacity-75 cursor-pointer border-b last:border-b-0"
                                    style={{ borderBottomColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                                    onClick={() => {
                                      const isAssigned = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'client' && pc.contact.entityId === formData.clientId) ||
                                                       (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'client' && pc.entityId === formData.clientId));
                                      if (isAssigned) {
                                        if (editingProject) {
                                          const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'client' && pc.contact.entityId === formData.clientId);
                                          if (projectContact) {
                                            handleRemoveProjectContact(projectContact.id);
                                          }
                                        } else {
                                          // Remove from pending contacts
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'client' && pc.entityId === formData.clientId)));
                                        }
                                      } else {
                                        handleAddExistingContactToProject(contact.id, false, 'client', formData.clientId || 0);
                                      }
                                      // Don't close dropdown immediately to see the selection
                                      // setShowContactDropdown(false);
                                      setContactSearchTerm('');
                                    }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <div>
                                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                          {contact.firstName} {contact.lastName}
                                        </div>
                                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                                          {contact.position} {contact.email && `• ${contact.email}`}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {contact.isPrimary && (
                                        <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: colors.warning, color: colors.textPrimary }}>
                                          Primary
                                        </span>
                                      )}
                                      <input
                                        type="checkbox"
                                        checked={projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'client' && pc.contact.entityId === formData.clientId) || 
                                                (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'client' && pc.entityId === formData.clientId))}
                                        onChange={() => {
                                          const isAssigned = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'client' && pc.contact.entityId === formData.clientId) ||
                                                           (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'client' && pc.entityId === formData.clientId));
                                          if (isAssigned) {
                                            if (editingProject) {
                                              const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'client' && pc.contact.entityId === formData.clientId);
                                              if (projectContact) {
                                                handleRemoveProjectContact(projectContact.id);
                                              }
                                            } else {
                                              // Remove from pending contacts
                                              setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'client' && pc.entityId === formData.clientId)));
                                            }
                                          } else {
                                            handleAddExistingContactToProject(contact.id, false, 'client', formData.clientId || 0);
                                          }
                                        }}
                                        className="rounded"
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-sm" style={{ color: colors.textSecondary }}>
                                  {contactSearchTerm ? 'No contacts found matching your search.' : 'No contacts available for this client.'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Client Contact Creation Form */}
                    {showClientContactForm && canCreateContacts && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Add Client Contact
                          </h4>
                          <Button
                            onClick={() => setShowClientContactForm(false)}
                            variant="ghost"
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                  </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                <span style={{ color: colors.error }}>*</span> First Name
                              </label>
                              <Input
                                type="text"
                                value={clientContactFormData.firstName}
                                onChange={(e) => setClientContactFormData({ ...clientContactFormData, firstName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                <span style={{ color: colors.error }}>*</span> Last Name
                              </label>
                              <Input
                                type="text"
                                value={clientContactFormData.lastName}
                                onChange={(e) => setClientContactFormData({ ...clientContactFormData, lastName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={clientContactFormData.email}
                                onChange={(e) => setClientContactFormData({ ...clientContactFormData, email: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={clientContactFormData.phone}
                                onChange={(e) => setClientContactFormData({ ...clientContactFormData, phone: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Position
                              </label>
                              <Input
                                type="text"
                                value={clientContactFormData.position}
                                onChange={(e) => setClientContactFormData({ ...clientContactFormData, position: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Notes
                              </label>
                              <textarea
                                value={clientContactFormData.notes}
                                onChange={(e) => setClientContactFormData({ ...clientContactFormData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-2 rounded-lg border resize-none text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="button"
                              onClick={handleClientContactSubmit}
                              variant="primary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Contact</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowClientContactForm(false)}
                              variant="ghost"
                              className="text-sm px-3 py-1"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Client Creation Form */}
                    {showClientForm && canCreateClients && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Create New Client
                          </h4>
                          <Button
                            onClick={() => setShowClientForm(false)}
                            variant="ghost"
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Client Name *
                              </label>
                              <Input
                                type="text"
                                value={clientFormData.name}
                                onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={clientFormData.email}
                                onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={clientFormData.phone}
                                onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Office Address
                              </label>
                              <Input
                                type="text"
                                value={clientFormData.officeAddress}
                                onChange={(e) => setClientFormData({ ...clientFormData, officeAddress: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="button"
                              onClick={handleClientSubmit}
                              variant="primary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Create Client</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowClientForm(false)}
                              variant="ghost"
                              className="text-sm px-3 py-1"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PMC Consultant Section */}
              <div className="md:col-span-2">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <HardHat className="w-5 h-5" style={{ color: colors.success }} />
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Project Management Consultant</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                        PMC Consultant
                      </label>
                        {canCreateConsultants && (
                          <Button
                            type="button"
                            onClick={() => setShowConsultantModal(true)}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            New Consultant
                          </Button>
                        )}
                      </div>
                      <select
                        value={formData.projectManagementConsultantId || ''}
                        onChange={(e) => {
                          const consultantId = e.target.value ? parseInt(e.target.value) : undefined;
                          setFormData({ ...formData, projectManagementConsultantId: consultantId });
                          setPMCContactSearchTerm('');
                          setShowPMCContactDropdown(false);
                        }}
                        className="w-full p-3 rounded-lg border"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          color: colors.textPrimary,
                          borderColor: colors.borderLight
                        }}
                      >
                        <option value="">Select PMC</option>
                        {consultants.filter(c => getConsultantTypes(c).some(t => t.type === 'Project Management')).map(consultant => (
                          <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* PMC Contacts */}
                    {formData.projectManagementConsultantId && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                          PMC Contacts
                        </label>
                          <Button
                            type="button"
                            onClick={() => {
                              const consultant = consultants.find(c => c.id === formData.projectManagementConsultantId);
                              setContactModalData({
                                consultantType: 'Project Management Consultant',
                                consultantName: consultant?.name || 'Unknown',
                                consultantId: formData.projectManagementConsultantId || 0,
                              });
                              setModalContactFormData({
                                firstName: '',
                                lastName: '',
                                email: '',
                                phone: '',
                                position: '',
                                notes: '',
                                isPrimary: false,
                                isActive: true, // Always active when created
                                entityType: 'consultant',
                                entityId: formData.projectManagementConsultantId,
                              });
                              setShowContactModal(true);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Contact
                          </Button>
                        </div>
                        
                        {/* Pending Contacts Display */}
                        {!editingProject && pendingContacts.filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc').length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>Selected Contacts</div>
                            <div className="flex flex-wrap gap-2">
                              {pendingContacts
                                .filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc')
                                .map((pendingContact, index) => {
                                  const contact = contacts.find(c => c.id === pendingContact.contactId);
                                return contact ? (
                                  <div
                                      key={index}
                                      className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                      style={{ borderColor: colors.borderLight }}
                                    >
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <span className="flex-1" style={{ color: colors.textPrimary }}>
                                        {contact.firstName} {contact.lastName}
                                      </span>
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`pmc-primary-${formData.projectManagementConsultantId}-pmc`}
                                          checked={pendingContact.isPrimary}
                                          onChange={() => {
                                            // Set this contact as primary and unset others
                                            setPendingContacts(prev => prev.map(pc => 
                                              pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc'
                                                ? { ...pc, isPrimary: pc.contactId === contact.id }
                                                : pc
                                            ));
                                          }}
                                          className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                          style={{
                                            borderColor: pendingContact.isPrimary ? colors.primary : colors.borderLight,
                                            backgroundColor: pendingContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                            accentColor: colors.primary
                                          }}
                                        />
                                        <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                      </label>
                                    <button
                                      type="button"
                                        onClick={() => {
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc')));
                                        }}
                                        className="hover:opacity-75 p-1"
                                      >
                                        <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Project Contacts */}
                        {projectContacts.filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc').length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {projectContacts
                                .filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc')
                                .map(projectContact => (
                                  <div
                                    key={projectContact.id}
                                    className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                    style={{ borderColor: colors.borderLight }}
                                  >
                                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    <span className="flex-1" style={{ color: colors.textPrimary }}>
                                      {projectContact.contact.firstName} {projectContact.contact.lastName}
                                    </span>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`pmc-primary-existing-${formData.projectManagementConsultantId}-pmc`}
                                        checked={projectContact.isPrimary}
                                        onChange={() => {
                                          handleTogglePrimaryContact(projectContact.id, projectContact.isPrimary);
                                        }}
                                        className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                        style={{
                                          borderColor: projectContact.isPrimary ? colors.primary : colors.borderLight,
                                          backgroundColor: projectContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                          accentColor: colors.primary
                                        }}
                                      />
                                      <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectContact(projectContact.id)}
                                      className="hover:opacity-75 p-1"
                                    >
                                      <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Contact Search */}
                        <div className="relative pmc-contact-dropdown-container">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search PMC contacts..."
                              value={pmcContactSearchTerm}
                              onChange={(e) => setPMCContactSearchTerm(e.target.value)}
                              onFocus={() => setShowPMCContactDropdown(true)}
                              className="w-full p-3 pr-10 rounded-lg border"
                              style={{
                                backgroundColor: colors.backgroundPrimary,
                                color: colors.textPrimary,
                                borderColor: colors.borderLight
                              }}
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                          </div>

                          {/* Contact Dropdown */}
                          {showPMCContactDropdown && (
                            <div 
                              className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                              style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}
                            >
                              {getFilteredConsultantContacts(formData.projectManagementConsultantId, pmcContactSearchTerm).length > 0 ? (
                                getFilteredConsultantContacts(formData.projectManagementConsultantId, pmcContactSearchTerm).map(contact => (
                                  <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-3 hover:opacity-75 cursor-pointer border-b last:border-b-0"
                                    style={{ borderBottomColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                                    onClick={() => {
                                      const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc') ||
                                                       (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc'));
                                      
                                      if (isAssignedToThisType) {
                                        if (editingProject) {
                                          const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc');
                                          if (projectContact) {
                                            handleRemoveProjectContact(projectContact.id);
                                          }
                                        } else {
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc')));
                                        }
                                      } else {
                                        handleAddExistingContactToProject(contact.id, false, 'consultant', formData.projectManagementConsultantId || 0, 'pmc');
                                      }
                                      setShowPMCContactDropdown(false);
                                      setPMCContactSearchTerm('');
                                    }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <div>
                                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                          {contact.firstName} {contact.lastName}
                                        </div>
                                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                                          {contact.position} {contact.email && `• ${contact.email}`}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {contact.isPrimary && (
                                        <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: colors.warning, color: colors.textPrimary }}>
                                          Primary
                                        </span>
                                      )}
                                      <input
                                        type="checkbox"
                                        checked={projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc') || 
                                                (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc'))}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc') ||
                                                           (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc'));
                                          
                                          if (isAssignedToThisType) {
                                            if (editingProject) {
                                              const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc');
                                              if (projectContact) {
                                                handleRemoveProjectContact(projectContact.id);
                                              }
                                            } else {
                                              setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.projectManagementConsultantId && pc.consultantType === 'pmc')));
                                            }
                                          } else {
                                            handleAddExistingContactToProject(contact.id, false, 'consultant', formData.projectManagementConsultantId || 0, 'pmc');
                                          }
                                          setShowPMCContactDropdown(false);
                                          setPMCContactSearchTerm('');
                                        }}
                                        className="rounded"
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-sm" style={{ color: colors.textSecondary }}>
                                  {pmcContactSearchTerm ? 'No contacts found matching your search.' : 'No contacts available for this consultant.'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PMC Contact Creation Form */}
                    {showPMCContactForm && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Add PMC Contact
                          </h4>
                          <Button
                            onClick={() => setShowPMCContactForm(false)}
                            variant="ghost"
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                  </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                First Name *
                              </label>
                              <Input
                                type="text"
                                value={pmcContactFormData.firstName}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, firstName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Last Name *
                              </label>
                              <Input
                                type="text"
                                value={pmcContactFormData.lastName}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, lastName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={pmcContactFormData.email}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, email: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={pmcContactFormData.phone}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, phone: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Position
                              </label>
                              <Input
                                type="text"
                                value={pmcContactFormData.position}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, position: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Notes
                              </label>
                              <textarea
                                value={pmcContactFormData.notes}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-2 rounded-lg border resize-none text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={pmcContactFormData.isPrimary}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, isPrimary: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Primary Contact
                              </span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={pmcContactFormData.isActive}
                                onChange={(e) => setPMCContactFormData({ ...pmcContactFormData, isActive: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Active Contact
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="button"
                              onClick={handlePMCContactSubmit}
                              variant="primary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Contact</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowPMCContactForm(false)}
                              variant="ghost"
                              className="text-sm px-3 py-1"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Consultant Contact Creation Form */}
                    {showConsultantContactForm && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Add Consultant Contact
                          </h4>
                          <Button
                            onClick={() => setShowConsultantContactForm(false)}
                            variant="ghost"
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                First Name *
                              </label>
                              <Input
                                type="text"
                                value={consultantContactFormData.firstName}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, firstName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Last Name *
                              </label>
                              <Input
                                type="text"
                                value={consultantContactFormData.lastName}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, lastName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={consultantContactFormData.email}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, email: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={consultantContactFormData.phone}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, phone: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Position
                              </label>
                              <Input
                                type="text"
                                value={consultantContactFormData.position}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, position: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Notes
                              </label>
                              <textarea
                                value={consultantContactFormData.notes}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-2 rounded-lg border resize-none text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={consultantContactFormData.isPrimary}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, isPrimary: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Primary Contact
                              </span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={consultantContactFormData.isActive}
                                onChange={(e) => setConsultantContactFormData({ ...consultantContactFormData, isActive: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Active Contact
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="button"
                              onClick={handleConsultantContactSubmit}
                              variant="primary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Contact</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowConsultantContactForm(false)}
                              variant="ghost"
                              className="text-sm px-3 py-1"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Design Contact Creation Form */}
                    {showDesignContactForm && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Add Design Contact
                          </h4>
                          <Button
                            onClick={() => setShowDesignContactForm(false)}
                            variant="ghost"
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                First Name *
                              </label>
                              <Input
                                type="text"
                                value={designContactFormData.firstName}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, firstName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Last Name *
                              </label>
                              <Input
                                type="text"
                                value={designContactFormData.lastName}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, lastName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={designContactFormData.email}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, email: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={designContactFormData.phone}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, phone: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Position
                              </label>
                              <Input
                                type="text"
                                value={designContactFormData.position}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, position: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Notes
                              </label>
                              <textarea
                                value={designContactFormData.notes}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-2 rounded-lg border resize-none text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={designContactFormData.isPrimary}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, isPrimary: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Primary Contact
                              </span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={designContactFormData.isActive}
                                onChange={(e) => setDesignContactFormData({ ...designContactFormData, isActive: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Active Contact
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="button"
                              onClick={handleDesignContactSubmit}
                              variant="primary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Contact</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowDesignContactForm(false)}
                              variant="ghost"
                              className="text-sm px-3 py-1"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Contact Creation Form */}
                    {showCostContactForm && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Add Cost Contact
                          </h4>
                          <Button
                            onClick={() => setShowCostContactForm(false)}
                            variant="ghost"
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                First Name *
                              </label>
                              <Input
                                type="text"
                                value={costContactFormData.firstName}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, firstName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Last Name *
                              </label>
                              <Input
                                type="text"
                                value={costContactFormData.lastName}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, lastName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={costContactFormData.email}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, email: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={costContactFormData.phone}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, phone: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Position
                              </label>
                              <Input
                                type="text"
                                value={costContactFormData.position}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, position: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Notes
                              </label>
                              <textarea
                                value={costContactFormData.notes}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-2 rounded-lg border resize-none text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={costContactFormData.isPrimary}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, isPrimary: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Primary Contact
                              </span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={costContactFormData.isActive}
                                onChange={(e) => setCostContactFormData({ ...costContactFormData, isActive: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Active Contact
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="button"
                              onClick={handleCostContactSubmit}
                              variant="primary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Contact</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowCostContactForm(false)}
                              variant="ghost"
                              className="text-sm px-3 py-1"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Supervision Contact Creation Form */}
                    {showSupervisionContactForm && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Add Supervision Contact
                          </h4>
                          <Button
                            onClick={() => setShowSupervisionContactForm(false)}
                            variant="ghost"
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                First Name *
                              </label>
                              <Input
                                type="text"
                                value={supervisionContactFormData.firstName}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, firstName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Last Name *
                              </label>
                              <Input
                                type="text"
                                value={supervisionContactFormData.lastName}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, lastName: e.target.value })}
                                required
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={supervisionContactFormData.email}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, email: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={supervisionContactFormData.phone}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, phone: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Position
                              </label>
                              <Input
                                type="text"
                                value={supervisionContactFormData.position}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, position: e.target.value })}
                                className="text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Notes
                              </label>
                              <textarea
                                value={supervisionContactFormData.notes}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-2 rounded-lg border resize-none text-sm"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
                                  color: colors.textPrimary,
                                  borderColor: colors.borderLight
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={supervisionContactFormData.isPrimary}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, isPrimary: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Primary Contact
                              </span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={supervisionContactFormData.isActive}
                                onChange={(e) => setSupervisionContactFormData({ ...supervisionContactFormData, isActive: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                Active Contact
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="button"
                              onClick={handleSupervisionContactSubmit}
                              variant="primary"
                              size="sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Contact</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowSupervisionContactForm(false)}
                              variant="ghost"
                              className="text-sm px-3 py-1"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Design Consultant Section */}
              <div className="md:col-span-2">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <DraftingCompass className="w-5 h-5" style={{ color: colors.info }} />
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Design Consultant</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Design Consultant
                      </label>
                        {canCreateConsultants && (
                          <Button
                            type="button"
                            onClick={() => setShowConsultantModal(true)}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            New Consultant
                          </Button>
                        )}
                      </div>
                      <select
                        value={formData.designConsultantId || ''}
                        onChange={(e) => {
                          const consultantId = e.target.value ? parseInt(e.target.value) : undefined;
                          setFormData({ ...formData, designConsultantId: consultantId });
                          setDesignContactSearchTerm('');
                          setShowDesignContactDropdown(false);
                        }}
                        className="w-full p-3 rounded-lg border"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          color: colors.textPrimary,
                          borderColor: colors.borderLight
                        }}
                      >
                        <option value="">Select Design Consultant</option>
                        {consultants.filter(c => getConsultantTypes(c).some(t => t.type === 'Design')).map(consultant => (
                          <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Design Contacts */}
                    {formData.designConsultantId && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Design Contacts
                        </label>
                          <Button
                            type="button"
                            onClick={() => {
                              const consultant = consultants.find(c => c.id === formData.designConsultantId);
                              setContactModalData({
                                consultantType: 'Design Consultant',
                                consultantName: consultant?.name || 'Unknown',
                                consultantId: formData.designConsultantId || 0,
                              });
                              setModalContactFormData({
                                firstName: '',
                                lastName: '',
                                email: '',
                                phone: '',
                                position: '',
                                notes: '',
                                isPrimary: false,
                                isActive: true, // Always active when created
                                entityType: 'consultant',
                                entityId: formData.designConsultantId,
                              });
                              setShowContactModal(true);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Contact
                          </Button>
                        </div>
                        
                        {/* Pending Contacts Display */}
                        {!editingProject && pendingContacts.filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design').length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>Selected Contacts</div>
                            <div className="flex flex-wrap gap-2">
                              {pendingContacts
                                .filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design')
                                .map((pendingContact, index) => {
                                  const contact = contacts.find(c => c.id === pendingContact.contactId);
                                return contact ? (
                                  <div
                                      key={index}
                                      className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                      style={{ borderColor: colors.borderLight }}
                                    >
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <span className="flex-1" style={{ color: colors.textPrimary }}>
                                        {contact.firstName} {contact.lastName}
                                      </span>
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`design-primary-${formData.designConsultantId}-design`}
                                          checked={pendingContact.isPrimary}
                                          onChange={() => {
                                            // Set this contact as primary and unset others
                                            setPendingContacts(prev => prev.map(pc => 
                                              pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design'
                                                ? { ...pc, isPrimary: pc.contactId === contact.id }
                                                : pc
                                            ));
                                          }}
                                          className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                          style={{
                                            borderColor: pendingContact.isPrimary ? colors.primary : colors.borderLight,
                                            backgroundColor: pendingContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                            accentColor: colors.primary
                                          }}
                                        />
                                        <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                      </label>
                                    <button
                                      type="button"
                                        onClick={() => {
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design')));
                                        }}
                                        className="hover:opacity-75 p-1"
                                      >
                                        <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Project Contacts */}
                        {projectContacts.filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.designConsultantId && pc.consultantType === 'design').length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {projectContacts
                                .filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.designConsultantId && pc.consultantType === 'design')
                                .map(projectContact => (
                                  <div
                                    key={projectContact.id}
                                    className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                    style={{ borderColor: colors.borderLight }}
                                  >
                                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    <span className="flex-1" style={{ color: colors.textPrimary }}>
                                      {projectContact.contact.firstName} {projectContact.contact.lastName}
                                    </span>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`design-primary-existing-${formData.designConsultantId}-design`}
                                        checked={projectContact.isPrimary}
                                        onChange={() => {
                                          handleTogglePrimaryContact(projectContact.id, projectContact.isPrimary);
                                        }}
                                        className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                        style={{
                                          borderColor: projectContact.isPrimary ? colors.primary : colors.borderLight,
                                          backgroundColor: projectContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                          accentColor: colors.primary
                                        }}
                                      />
                                      <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectContact(projectContact.id)}
                                      className="hover:opacity-75 p-1"
                                    >
                                      <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Contact Search */}
                        <div className="relative design-contact-dropdown-container">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search design contacts..."
                              value={designContactSearchTerm}
                              onChange={(e) => setDesignContactSearchTerm(e.target.value)}
                              onFocus={() => setShowDesignContactDropdown(true)}
                              className="w-full p-3 pr-10 rounded-lg border"
                              style={{
                                backgroundColor: colors.backgroundPrimary,
                                color: colors.textPrimary,
                                borderColor: colors.borderLight
                              }}
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                          </div>

                          {/* Contact Dropdown */}
                          {showDesignContactDropdown && (
                            <div 
                              className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                              style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}
                            >
                              {getFilteredConsultantContacts(formData.designConsultantId, designContactSearchTerm).length > 0 ? (
                                getFilteredConsultantContacts(formData.designConsultantId, designContactSearchTerm).map(contact => (
                                  <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-3 hover:opacity-75 cursor-pointer border-b last:border-b-0"
                                    style={{ borderBottomColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                                    onClick={() => {
                                      const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.designConsultantId && pc.consultantType === 'design') ||
                                                       (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design'));
                                      
                                      if (isAssignedToThisType) {
                                        if (editingProject) {
                                          const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.designConsultantId && pc.consultantType === 'design');
                                          if (projectContact) {
                                            handleRemoveProjectContact(projectContact.id);
                                          }
                                        } else {
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design')));
                                        }
                                      } else {
                                        handleAddExistingContactToProject(contact.id, false, 'consultant', formData.designConsultantId || 0, 'design');
                                      }
                                      setShowDesignContactDropdown(false);
                                      setDesignContactSearchTerm('');
                                    }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <div>
                                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                          {contact.firstName} {contact.lastName}
                                        </div>
                                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                                          {contact.position} {contact.email && `• ${contact.email}`}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {contact.isPrimary && (
                                        <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: colors.warning, color: colors.textPrimary }}>
                                          Primary
                                        </span>
                                      )}
                                      <input
                                        type="checkbox"
                                        checked={projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.designConsultantId && pc.consultantType === 'design') || 
                                                (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design'))}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.designConsultantId && pc.consultantType === 'design') ||
                                                           (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design'));
                                          
                                          if (isAssignedToThisType) {
                                            if (editingProject) {
                                              const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.designConsultantId && pc.consultantType === 'design');
                                              if (projectContact) {
                                                handleRemoveProjectContact(projectContact.id);
                                              }
                                            } else {
                                              setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.designConsultantId && pc.consultantType === 'design')));
                                            }
                                          } else {
                                            handleAddExistingContactToProject(contact.id, false, 'consultant', formData.designConsultantId || 0, 'design');
                                          }
                                          setShowDesignContactDropdown(false);
                                          setDesignContactSearchTerm('');
                                        }}
                                        className="rounded"
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-sm" style={{ color: colors.textSecondary }}>
                                  {designContactSearchTerm ? 'No contacts found matching your search.' : 'No contacts available for this consultant.'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost Consultant Section */}
              <div className="md:col-span-2">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Calculator className="w-5 h-5" style={{ color: colors.warning }} />
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Cost Consultant</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Cost Consultant
                      </label>
                        {canCreateConsultants && (
                          <Button
                            type="button"
                            onClick={() => setShowConsultantModal(true)}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            New Consultant
                          </Button>
                        )}
                      </div>
                      <select
                        value={formData.costConsultantId || ''}
                        onChange={(e) => {
                          const consultantId = e.target.value ? parseInt(e.target.value) : undefined;
                          setFormData({ ...formData, costConsultantId: consultantId });
                          setCostContactSearchTerm('');
                          setShowCostContactDropdown(false);
                        }}
                        className="w-full p-3 rounded-lg border"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          color: colors.textPrimary,
                          borderColor: colors.borderLight
                        }}
                      >
                        <option value="">Select Cost Consultant</option>
                        {consultants.filter(c => getConsultantTypes(c).some(t => t.type === 'Cost')).map(consultant => (
                          <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cost Contacts */}
                    {formData.costConsultantId && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Cost Contacts
                        </label>
                          <Button
                            type="button"
                            onClick={() => {
                              const consultant = consultants.find(c => c.id === formData.costConsultantId);
                              setContactModalData({
                                consultantType: 'Cost Consultant',
                                consultantName: consultant?.name || 'Unknown',
                                consultantId: formData.costConsultantId || 0,
                              });
                              setModalContactFormData({
                                firstName: '',
                                lastName: '',
                                email: '',
                                phone: '',
                                position: '',
                                notes: '',
                                isPrimary: false,
                                isActive: true, // Always active when created
                                entityType: 'consultant',
                                entityId: formData.costConsultantId,
                              });
                              setShowContactModal(true);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Contact
                          </Button>
                        </div>
                        
                        {/* Pending Contacts Display */}
                        {!editingProject && pendingContacts.filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost').length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>Selected Contacts</div>
                            <div className="flex flex-wrap gap-2">
                              {pendingContacts
                                .filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost')
                                .map((pendingContact, index) => {
                                  const contact = contacts.find(c => c.id === pendingContact.contactId);
                                return contact ? (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                    style={{ borderColor: colors.borderLight }}
                                  >
                                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    <span className="flex-1" style={{ color: colors.textPrimary }}>
                                      {contact.firstName} {contact.lastName}
                                    </span>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`cost-primary-${formData.costConsultantId}-cost`}
                                        checked={pendingContact.isPrimary}
                                        onChange={() => {
                                          // Set this contact as primary and unset others
                                          setPendingContacts(prev => prev.map(pc => 
                                            pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost'
                                              ? { ...pc, isPrimary: pc.contactId === contact.id }
                                              : pc
                                          ));
                                        }}
                                        className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                        style={{
                                          borderColor: pendingContact.isPrimary ? colors.primary : colors.borderLight,
                                          backgroundColor: pendingContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                          accentColor: colors.primary
                                        }}
                                      />
                                      <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost')));
                                      }}
                                      className="hover:opacity-75 p-1"
                                    >
                                      <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Project Contacts */}
                        {projectContacts.filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.costConsultantId && pc.consultantType === 'cost').length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {projectContacts
                                .filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.costConsultantId && pc.consultantType === 'cost')
                                .map(projectContact => (
                                  <div
                                    key={projectContact.id}
                                    className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                    style={{ borderColor: colors.borderLight }}
                                  >
                                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    <span className="flex-1" style={{ color: colors.textPrimary }}>
                                      {projectContact.contact.firstName} {projectContact.contact.lastName}
                                    </span>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`cost-primary-existing-${formData.costConsultantId}-cost`}
                                        checked={projectContact.isPrimary}
                                        onChange={() => {
                                          handleTogglePrimaryContact(projectContact.id, projectContact.isPrimary);
                                        }}
                                        className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                        style={{
                                          borderColor: projectContact.isPrimary ? colors.primary : colors.borderLight,
                                          backgroundColor: projectContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                          accentColor: colors.primary
                                        }}
                                      />
                                      <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectContact(projectContact.id)}
                                      className="hover:opacity-75 p-1"
                                    >
                                      <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Contact Search */}
                        <div className="relative cost-contact-dropdown-container">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search cost contacts..."
                              value={costContactSearchTerm}
                              onChange={(e) => setCostContactSearchTerm(e.target.value)}
                              onFocus={() => setShowCostContactDropdown(true)}
                              className="w-full p-3 pr-10 rounded-lg border"
                              style={{
                                backgroundColor: colors.backgroundPrimary,
                                color: colors.textPrimary,
                                borderColor: colors.borderLight
                              }}
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                          </div>

                          {/* Contact Dropdown */}
                          {showCostContactDropdown && (
                            <div 
                              className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                              style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}
                            >
                              {getFilteredConsultantContacts(formData.costConsultantId, costContactSearchTerm).length > 0 ? (
                                getFilteredConsultantContacts(formData.costConsultantId, costContactSearchTerm).map(contact => (
                                  <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-3 hover:opacity-75 cursor-pointer border-b last:border-b-0"
                                    style={{ borderBottomColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                                    onClick={() => {
                                      const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.costConsultantId && pc.consultantType === 'cost') ||
                                                       (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost'));
                                      if (isAssignedToThisType) {
                                        if (editingProject) {
                                          const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.costConsultantId && pc.consultantType === 'cost');
                                          if (projectContact) {
                                            handleRemoveProjectContact(projectContact.id);
                                          }
                                        } else {
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost')));
                                        }
                                      } else {
                                        handleAddExistingContactToProject(contact.id, false, 'consultant', formData.costConsultantId || 0, 'cost');
                                      }
                                      setShowCostContactDropdown(false);
                                      setCostContactSearchTerm('');
                                    }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <div>
                                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                          {contact.firstName} {contact.lastName}
                                        </div>
                                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                                          {contact.position} {contact.email && `• ${contact.email}`}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.costConsultantId && pc.consultantType === 'cost') || 
                                                (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost'))}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.costConsultantId && pc.consultantType === 'cost') ||
                                                           (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost'));
                                          
                                          if (isAssignedToThisType) {
                                            if (editingProject) {
                                              const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.costConsultantId && pc.consultantType === 'cost');
                                              if (projectContact) {
                                                handleRemoveProjectContact(projectContact.id);
                                              }
                                            } else {
                                              setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.costConsultantId && pc.consultantType === 'cost')));
                                            }
                                          } else {
                                            handleAddExistingContactToProject(contact.id, false, 'consultant', formData.costConsultantId || 0, 'cost');
                                          }
                                          setShowCostContactDropdown(false);
                                          setCostContactSearchTerm('');
                                        }}
                                        className="rounded"
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-sm" style={{ color: colors.textSecondary }}>
                                  {costContactSearchTerm ? 'No contacts found matching your search.' : 'No contacts available for this consultant.'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Supervision Consultant Section */}
              <div className="md:col-span-2">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Eye className="w-5 h-5" style={{ color: colors.error }} />
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Supervision Consultant</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Supervision Consultant
                      </label>
                        {canCreateConsultants && (
                          <Button
                            type="button"
                            onClick={() => setShowConsultantModal(true)}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            New Consultant
                          </Button>
                        )}
                      </div>
                      <select
                        value={formData.supervisionConsultantId || ''}
                        onChange={(e) => {
                          const consultantId = e.target.value ? parseInt(e.target.value) : undefined;
                          setFormData({ ...formData, supervisionConsultantId: consultantId });
                          setSupervisionContactSearchTerm('');
                          setShowSupervisionContactDropdown(false);
                        }}
                        className="w-full p-3 rounded-lg border"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          color: colors.textPrimary,
                          borderColor: colors.borderLight
                        }}
                      >
                        <option value="">Select Supervision Consultant</option>
                        {consultants.filter(c => getConsultantTypes(c).some(t => t.type === 'Supervision')).map(consultant => (
                          <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Supervision Contacts */}
                    {formData.supervisionConsultantId && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Supervision Contacts
                        </label>
                          <Button
                            type="button"
                            onClick={() => {
                              const consultant = consultants.find(c => c.id === formData.supervisionConsultantId);
                              setContactModalData({
                                consultantType: 'Supervision Consultant',
                                consultantName: consultant?.name || 'Unknown',
                                consultantId: formData.supervisionConsultantId || 0,
                              });
                              setModalContactFormData({
                                firstName: '',
                                lastName: '',
                                email: '',
                                phone: '',
                                position: '',
                                notes: '',
                                isPrimary: false,
                                isActive: true, // Always active when created
                                entityType: 'consultant',
                                entityId: formData.supervisionConsultantId,
                              });
                              setShowContactModal(true);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Contact
                          </Button>
                        </div>
                        
                        {/* Pending Contacts Display */}
                        {!editingProject && pendingContacts.filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision').length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>Selected Contacts</div>
                            <div className="flex flex-wrap gap-2">
                              {pendingContacts
                                .filter(pc => pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision')
                                .map((pendingContact, index) => {
                                  const contact = contacts.find(c => c.id === pendingContact.contactId);
                                return contact ? (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                    style={{ borderColor: colors.borderLight }}
                                  >
                                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    <span className="flex-1" style={{ color: colors.textPrimary }}>
                                      {contact.firstName} {contact.lastName}
                                    </span>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`supervision-primary-${formData.supervisionConsultantId}-supervision`}
                                        checked={pendingContact.isPrimary}
                                        onChange={() => {
                                          // Set this contact as primary and unset others
                                          setPendingContacts(prev => prev.map(pc => 
                                            pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision'
                                              ? { ...pc, isPrimary: pc.contactId === contact.id }
                                              : pc
                                          ));
                                        }}
                                        className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                        style={{
                                          borderColor: pendingContact.isPrimary ? colors.primary : colors.borderLight,
                                          backgroundColor: pendingContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                          accentColor: colors.primary
                                        }}
                                      />
                                      <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision')));
                                      }}
                                      className="hover:opacity-75 p-1"
                                    >
                                      <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Project Contacts */}
                        {projectContacts.filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision').length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {projectContacts
                                .filter(pc => pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision')
                                .map(projectContact => (
                                  <div
                                    key={projectContact.id}
                                    className="flex items-center space-x-3 py-2 px-3 rounded-lg border"
                                    style={{ borderColor: colors.borderLight }}
                                  >
                                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    <span className="flex-1" style={{ color: colors.textPrimary }}>
                                      {projectContact.contact.firstName} {projectContact.contact.lastName}
                                    </span>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`supervision-primary-existing-${formData.supervisionConsultantId}-supervision`}
                                        checked={projectContact.isPrimary}
                                        onChange={() => {
                                          handleTogglePrimaryContact(projectContact.id, projectContact.isPrimary);
                                        }}
                                        className="w-4 h-4 rounded-full border-2 focus:ring-2 focus:ring-offset-0"
                                        style={{
                                          borderColor: projectContact.isPrimary ? colors.primary : colors.borderLight,
                                          backgroundColor: projectContact.isPrimary ? colors.primary : colors.backgroundPrimary,
                                          accentColor: colors.primary
                                        }}
                                      />
                                      <span className="text-sm" style={{ color: colors.textPrimary }}>Primary</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectContact(projectContact.id)}
                                      className="hover:opacity-75 p-1"
                                    >
                                      <X className="w-4 h-4" style={{ color: colors.textMuted }} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Contact Search */}
                        <div className="relative supervision-contact-dropdown-container">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search supervision contacts..."
                              value={supervisionContactSearchTerm}
                              onChange={(e) => setSupervisionContactSearchTerm(e.target.value)}
                              onFocus={() => setShowSupervisionContactDropdown(true)}
                              className="w-full p-3 pr-10 rounded-lg border"
                              style={{
                                backgroundColor: colors.backgroundPrimary,
                                color: colors.textPrimary,
                                borderColor: colors.borderLight
                              }}
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                          </div>

                          {/* Contact Dropdown */}
                          {showSupervisionContactDropdown && (
                            <div 
                              className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                              style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}
                            >
                              {getFilteredConsultantContacts(formData.supervisionConsultantId, supervisionContactSearchTerm).length > 0 ? (
                                getFilteredConsultantContacts(formData.supervisionConsultantId, supervisionContactSearchTerm).map(contact => (
                                  <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-3 hover:opacity-75 cursor-pointer border-b last:border-b-0"
                                    style={{ borderBottomColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                                    onClick={() => {
                                      const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision') ||
                                                       (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision'));
                                      if (isAssignedToThisType) {
                                        if (editingProject) {
                                          const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision');
                                          if (projectContact) {
                                            handleRemoveProjectContact(projectContact.id);
                                          }
                                        } else {
                                          setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision')));
                                        }
                                      } else {
                                        handleAddExistingContactToProject(contact.id, false, 'consultant', formData.supervisionConsultantId || 0, 'supervision');
                                      }
                                      setShowSupervisionContactDropdown(false);
                                      setSupervisionContactSearchTerm('');
                                    }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                      <div>
                                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                          {contact.firstName} {contact.lastName}
                                        </div>
                                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                                          {contact.position} {contact.email && `• ${contact.email}`}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision') || 
                                                (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision'))}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          const isAssignedToThisType = projectContacts.some(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision') ||
                                                           (!editingProject && pendingContacts.some(pc => pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision'));
                                          
                                          if (isAssignedToThisType) {
                                            if (editingProject) {
                                              const projectContact = projectContacts.find(pc => pc.contact.id === contact.id && pc.contact.entityType === 'consultant' && pc.contact.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision');
                                              if (projectContact) {
                                                handleRemoveProjectContact(projectContact.id);
                                              }
                                            } else {
                                              setPendingContacts(prev => prev.filter(pc => !(pc.contactId === contact.id && pc.entityType === 'consultant' && pc.entityId === formData.supervisionConsultantId && pc.consultantType === 'supervision')));
                                            }
                                          } else {
                                            handleAddExistingContactToProject(contact.id, false, 'consultant', formData.supervisionConsultantId || 0, 'supervision');
                                          }
                                          setShowSupervisionContactDropdown(false);
                                          setSupervisionContactSearchTerm('');
                                        }}
                                        className="rounded"
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-sm" style={{ color: colors.textSecondary }}>
                                  {supervisionContactSearchTerm ? 'No contacts found matching your search.' : 'No contacts available for this consultant.'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Leadership & Additional Staff Section - Grouped */}
              <div className="md:col-span-2">
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }}>
                  {/* Project Leadership Section */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5" style={{ color: colors.primary }} />
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Project Leadership</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Project Director - Searchable Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Project Director
                      </label>
                      <div className="relative">
                        <div
                          onClick={() => {
                            setShowDirectorDropdown(!showDirectorDropdown);
                            setShowManagerDropdown(false);
                          }}
                          className="w-full p-3 rounded-lg border cursor-pointer flex items-center justify-between"
                          style={{
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.borderLight,
                            color: colors.textPrimary
                          }}
                        >
                          <span>
                            {formData.projectDirectorId 
                              ? staff.find(s => s.id === formData.projectDirectorId)?.staffName 
                              : 'Select Project Director'}
                          </span>
                          <span>{showDirectorDropdown ? '▲' : '▼'}</span>
                        </div>
                        
                        {showDirectorDropdown && (
                          <div 
                            className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-auto"
                            style={{
                              backgroundColor: colors.backgroundPrimary,
                              borderColor: colors.borderLight
                            }}
                          >
                            <div className="p-2 sticky top-0" style={{ backgroundColor: colors.backgroundSecondary }}>
                              <input
                                type="text"
                                placeholder="Search director..."
                                value={directorSearchTerm}
                                onChange={(e) => setDirectorSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.border,
                                  color: colors.textPrimary
                                }}
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-auto">
                              {staff
                                .filter(s => s.staffName.toLowerCase().includes(directorSearchTerm.toLowerCase()))
                                .map((staffMember) => (
                                  <div
                                    key={staffMember.id}
                                    onClick={() => {
                                      setFormData({ ...formData, projectDirectorId: staffMember.id });
                                      setShowDirectorDropdown(false);
                                      setDirectorSearchTerm('');
                                    }}
                                    className="px-3 py-2 hover:opacity-75 cursor-pointer text-sm"
                                    style={{
                                      backgroundColor: formData.projectDirectorId === staffMember.id ? colors.primary : 'transparent',
                                      color: formData.projectDirectorId === staffMember.id ? '#FFFFFF' : colors.textPrimary
                                    }}
                                  >
                                    {staffMember.staffName}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Manager - Searchable Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Project Manager
                      </label>
                      <div className="relative">
                        <div
                          onClick={() => {
                            setShowManagerDropdown(!showManagerDropdown);
                            setShowDirectorDropdown(false);
                          }}
                          className="w-full p-3 rounded-lg border cursor-pointer flex items-center justify-between"
                          style={{
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.borderLight,
                            color: colors.textPrimary
                          }}
                        >
                          <span>
                            {formData.projectManagerId 
                              ? staff.find(s => s.id === formData.projectManagerId)?.staffName 
                              : 'Select Project Manager'}
                          </span>
                          <span>{showManagerDropdown ? '▲' : '▼'}</span>
                        </div>
                        
                        {showManagerDropdown && (
                          <div 
                            className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-auto"
                            style={{
                              backgroundColor: colors.backgroundPrimary,
                              borderColor: colors.borderLight
                            }}
                          >
                            <div className="p-2 sticky top-0" style={{ backgroundColor: colors.backgroundSecondary }}>
                              <input
                                type="text"
                                placeholder="Search manager..."
                                value={managerSearchTerm}
                                onChange={(e) => setManagerSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.border,
                                  color: colors.textPrimary
                                }}
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-auto">
                              {staff
                                .filter(s => s.staffName.toLowerCase().includes(managerSearchTerm.toLowerCase()))
                                .map((staffMember) => (
                                  <div
                                    key={staffMember.id}
                                    onClick={() => {
                                      setFormData({ ...formData, projectManagerId: staffMember.id });
                                      setShowManagerDropdown(false);
                                      setManagerSearchTerm('');
                                    }}
                                    className="px-3 py-2 hover:opacity-75 cursor-pointer text-sm"
                                    style={{
                                      backgroundColor: formData.projectManagerId === staffMember.id ? colors.primary : 'transparent',
                                      color: formData.projectManagerId === staffMember.id ? '#FFFFFF' : colors.textPrimary
                                    }}
                                  >
                                    {staffMember.staffName}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t mb-4" style={{ borderColor: colors.borderLight }}></div>

                  {/* Additional Staff Section */}
                  {canCreateStaff && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5" style={{ color: colors.primary }} />
                          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Additional Staff</h3>
                        </div>
                        <Button
                          onClick={() => setShowStaffForm(true)}
                          type="button"
                          variant="secondary"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Staff Member
                        </Button>
                      </div>
                      
                      <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        Add new staff members to your company database. These staff members can then be assigned to projects later.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Staff Creation Form */}
              {showStaffForm && canCreateStaff && (
                <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Add Company Staff
                    </h4>
                    <Button
                      onClick={() => {
                        setShowStaffForm(false);
                        setShowPositionDropdownInStaffForm(false);
                        setPositionSearchTermInStaffForm('');
                      }}
                      type="button"
                      variant="ghost"
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Staff Name *
                        </label>
                        <Input
                          type="text"
                          value={staffFormData.staffName}
                          onChange={(e) => setStaffFormData({ ...staffFormData, staffName: e.target.value })}
                          required
                          className="text-sm"
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            color: colors.textPrimary,
                            borderColor: colors.borderLight
                          }}
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Position
                        </label>
                        <div className="relative">
                          <div
                            onClick={() => setShowPositionDropdownInStaffForm(!showPositionDropdownInStaffForm)}
                            className="w-full p-2 border rounded-lg cursor-pointer flex items-center justify-between text-sm"
                            style={{
                              backgroundColor: colors.backgroundSecondary,
                              borderColor: colors.borderLight,
                              color: colors.textPrimary
                            }}
                          >
                            <span>
                              {staffFormData.positionId 
                                ? companyPositions.find(p => p.id === staffFormData.positionId)?.name 
                                : 'Select a position...'}
                            </span>
                            <span>{showPositionDropdownInStaffForm ? '▲' : '▼'}</span>
                          </div>
                          
                          {showPositionDropdownInStaffForm && (
                            <div 
                              className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-auto"
                              style={{
                                backgroundColor: colors.backgroundPrimary,
                                borderColor: colors.borderLight
                              }}
                            >
                              <div className="p-2 sticky top-0" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <input
                                  type="text"
                                  placeholder="Search positions..."
                                  value={positionSearchTermInStaffForm}
                                  onChange={(e) => setPositionSearchTermInStaffForm(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg text-xs"
                                  style={{
                                    backgroundColor: colors.backgroundSecondary,
                                    borderColor: colors.border,
                                    color: colors.textPrimary
                                  }}
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-48 overflow-auto">
                                {companyPositions
                                  .filter(p => p.name.toLowerCase().includes(positionSearchTermInStaffForm.toLowerCase()))
                                  .map((position) => (
                                    <div
                                      key={position.id}
                                      onClick={() => {
                                        setStaffFormData({ ...staffFormData, positionId: position.id });
                                        setShowPositionDropdownInStaffForm(false);
                                        setPositionSearchTermInStaffForm('');
                                      }}
                                      className="px-3 py-2 hover:opacity-75 cursor-pointer text-sm"
                                      style={{
                                        backgroundColor: staffFormData.positionId === position.id ? colors.primary : 'transparent',
                                        color: staffFormData.positionId === position.id ? '#FFFFFF' : colors.textPrimary
                                      }}
                                    >
                                      {position.name}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Email
                        </label>
                        <Input
                          type="email"
                          value={staffFormData.email}
                          onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                          className="text-sm"
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            color: colors.textPrimary,
                            borderColor: colors.borderLight
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={staffFormData.phone}
                          onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                          className="text-sm"
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            color: colors.textPrimary,
                            borderColor: colors.borderLight
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <Button
                        type="button"
                        onClick={handleStaffSubmit}
                        className="flex items-center space-x-2 text-sm px-3 py-1"
                        style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Staff</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowStaffForm(false);
                          setShowPositionDropdownInStaffForm(false);
                          setPositionSearchTermInStaffForm('');
                        }}
                        variant="ghost"
                        className="text-sm px-3 py-1"
                        style={{ color: colors.textSecondary }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Duration (Auto-calculated)
                </label>
                <Input
                  type="text"
                  value={formData.duration}
                  readOnly
                  placeholder="Will be calculated automatically"
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.textSecondary,
                    cursor: 'not-allowed',
                    borderColor: colors.borderLight
                  }}
                />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  Duration is automatically calculated from start and end dates
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  EOT (Extension of Time)
                </label>
                <Input
                  type="text"
                  value={formData.eot}
                  onChange={(e) => setFormData({ ...formData, eot: e.target.value })}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Project Value
                </label>
                <Input
                  type="number"
                  value={formData.projectValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectValue: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="Enter project value/budget"
                  min="0"
                  step="0.01"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Project Description
              </label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-lg border resize-none"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary,
                  borderColor: colors.borderLight
                }}
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
              >
                <Save className="w-4 h-4" />
                <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProject(null);
                }}
                variant="ghost"
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="p-6 relative" style={{ backgroundColor: colors.backgroundSecondary }}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                      {project.projectName}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: colors.primary }}>
                      {project.projectCode}
                    </p>
                  </div>
                </div>

                {project.projectDescription && (
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {project.projectDescription}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {project.client && (
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>Client:</span>
                      <span style={{ color: colors.textPrimary }}>{project.client.name}</span>
                    </div>
                  )}

                  {project.projectStaff && project.projectStaff.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>Team:</span>
                      <span style={{ color: colors.textPrimary }}>
                        {project.projectStaff
                          .filter(staff => staff.designation === 'Project Director' || staff.designation === 'Project Manager')
                          .filter(staff => staff.staff) // Only show assigned staff
                          .map(staff => `${staff.designation}: ${staff.staff?.staffName}`)
                          .join(', ')
                        }
                      </span>
                    </div>
                  )}

                  {project.startDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>Start:</span>
                      <span style={{ color: colors.textPrimary }}>
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {project.endDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>End:</span>
                      <span style={{ color: colors.textPrimary }}>
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {project.duration && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>Duration:</span>
                      <span style={{ color: colors.textPrimary }}>{project.duration}</span>
                    </div>
                  )}

                  {project.projectValue && (
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>Value:</span>
                      <span style={{ color: colors.textPrimary }}>
                        {formatCurrency(Number(project.projectValue), siteSettings?.currencySymbol || '$')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            {/* Action buttons positioned in lower right corner */}
            <div className="absolute bottom-6 right-6">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleViewDetails(project)}
                  variant="ghost"
                  className="p-2"
                  style={{ color: colors.textMuted }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleEdit(project)}
                  variant="ghost"
                  className="p-2"
                  style={{ color: colors.primary }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(project.id)}
                  variant="ghost"
                  className="p-2"
                  style={{ color: colors.error }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-8 text-center" style={{ backgroundColor: colors.backgroundSecondary }}>
          <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            No projects found
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first project'}
          </p>
        </Card>
      )}

      {/* Contact Creation Modal */}
      {showContactModal && contactModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border" style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.borderLight
          }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Add Contact for {contactModalData.consultantType}
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  {contactModalData.consultantName}
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowContactModal(false);
                  setContactModalData(null);
                  setModalContactFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    position: '',
                    notes: '',
                    isPrimary: false,
                    isActive: true, // Always active when created
                    entityType: 'consultant',
                    entityId: undefined,
                  });
                }}
                variant="ghost"
                className="p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    <span style={{ color: colors.error }}>*</span> First Name
                  </label>
                  <Input
                    type="text"
                    value={modalContactFormData.firstName}
                    onChange={(e) => setModalContactFormData({ ...modalContactFormData, firstName: e.target.value })}
                    required
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    <span style={{ color: colors.error }}>*</span> Last Name
                  </label>
                  <Input
                    type="text"
                    value={modalContactFormData.lastName}
                    onChange={(e) => setModalContactFormData({ ...modalContactFormData, lastName: e.target.value })}
                    required
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={modalContactFormData.email}
                    onChange={(e) => setModalContactFormData({ ...modalContactFormData, email: e.target.value })}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={modalContactFormData.phone}
                    onChange={(e) => setModalContactFormData({ ...modalContactFormData, phone: e.target.value })}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Position
                  </label>
                  <Input
                    type="text"
                    value={modalContactFormData.position}
                    onChange={(e) => setModalContactFormData({ ...modalContactFormData, position: e.target.value })}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Notes
                  </label>
                  <textarea
                    value={modalContactFormData.notes}
                    onChange={(e) => setModalContactFormData({ ...modalContactFormData, notes: e.target.value })}
                    rows={3}
                    className="w-full p-3 rounded-lg border resize-none"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t" style={{ borderTopColor: colors.borderLight }}>
                <Button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactModalData(null);
                    setModalContactFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      position: '',
                      notes: '',
                      isPrimary: false,
                      isActive: true, // Always active when created
                      entityType: 'consultant',
                      entityId: undefined,
                    });
                  }}
                  variant="ghost"
                  style={{ color: colors.textSecondary }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModalContactSubmit}
                  variant="primary"
                  size="md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultant Creation Modal */}
      {showConsultantModal && canCreateConsultants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border" style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.borderLight
          }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Create New Consultant
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Add a new consultant to the system
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowConsultantModal(false);
                  setConsultantFormData({
                    name: '',
                    officeAddress: '',
                    phone: '',
                    email: '',
                    isActive: true,
                    selectedTypes: [],
                  });
                }}
                variant="ghost"
                className="p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    <span style={{ color: colors.error }}>*</span> Consultant Name
                  </label>
                  <Input
                    type="text"
                    value={consultantFormData.name}
                    onChange={(e) => setConsultantFormData({ ...consultantFormData, name: e.target.value })}
                    required
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={consultantFormData.email}
                    onChange={(e) => setConsultantFormData({ ...consultantFormData, email: e.target.value })}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={consultantFormData.phone}
                    onChange={(e) => setConsultantFormData({ ...consultantFormData, phone: e.target.value })}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Office Address
                  </label>
                  <Input
                    type="text"
                    value={consultantFormData.officeAddress}
                    onChange={(e) => setConsultantFormData({ ...consultantFormData, officeAddress: e.target.value })}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>
              </div>

              {/* Consultant Types */}
              <div>
                <div className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  <span style={{ color: colors.error }}>*</span> Consultant Types
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {consultantTypes.map(type => {
                    const isSelected = consultantFormData.selectedTypes?.includes(type.id) || false;
                    
                    return (
                      <div 
                        key={type.id} 
                        className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg transition-all duration-200 border"
                        style={{
                          borderColor: isSelected ? colors.primary : colors.borderLight,
                          backgroundColor: isSelected ? `${colors.primary}20` : colors.backgroundPrimary,
                        }}
                        onClick={() => handleConsultantTypeToggle(type.id)}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleConsultantTypeToggle(type.id)}
                            className="sr-only"
                            id={`consultant-type-${type.id}`}
                          />
                          <div 
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected ? 'border-opacity-100' : 'border-opacity-50'
                            }`}
                            style={{
                              borderColor: colors.primary,
                              backgroundColor: isSelected ? colors.primary : 'transparent',
                            }}
                          >
                            {isSelected && (
                              <svg 
                                className="w-2 h-2" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                style={{ color: colors.textPrimary }}
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M5 13l4 4L19 7" 
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <label 
                          htmlFor={`consultant-type-${type.id}`}
                          className="text-sm font-medium cursor-pointer"
                          style={{ color: colors.textPrimary }}
                        >
                          {type.type}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {(!consultantFormData.selectedTypes || consultantFormData.selectedTypes.length === 0) && (
                  <p className="text-sm mt-2" style={{ color: colors.error }}>
                    Please select at least one consultant type
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t" style={{ borderTopColor: colors.borderLight }}>
                <Button
                  onClick={() => {
                    setShowConsultantModal(false);
                    setConsultantFormData({
                      name: '',
                      officeAddress: '',
                      phone: '',
                      email: '',
                      isActive: true,
                      selectedTypes: [],
                    });
                  }}
                  variant="ghost"
                  style={{ color: colors.textSecondary }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConsultantSubmit}
                  variant="primary"
                  size="md"
                  disabled={!consultantFormData.selectedTypes || consultantFormData.selectedTypes.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Consultant</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Generate Report Modal */}
      {showGenerateReportModal && selectedProject && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowGenerateReportModal(false)}
        >
          <Card 
            className="w-full max-w-2xl p-6"
            style={{ backgroundColor: colors.backgroundSecondary }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Generate Report
              </h2>
              <button
                onClick={() => setShowGenerateReportModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Project
                </label>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {selectedProject.projectName}
                  </p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {selectedProject.projectCode}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Month
                  </label>
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(parseInt(e.target.value))}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Year
                  </label>
                  <input
                    type="number"
                    value={reportYear}
                    onChange={(e) => setReportYear(parseInt(e.target.value) || new Date().getFullYear())}
                    min="2000"
                    max="2100"
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>
              </div>

              {/* Picture Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Select Pictures to Include
                  </label>
                  {availablePictures.length > 0 && (
                    <button
                      onClick={() => {
                        if (selectedPictureIds.size === availablePictures.length) {
                          setSelectedPictureIds(new Set());
                        } else {
                          setSelectedPictureIds(new Set(availablePictures.map((pic: any) => pic.id)));
                        }
                      }}
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        color: colors.primary,
                        backgroundColor: `${colors.primary}10`
                      }}
                    >
                      {selectedPictureIds.size === availablePictures.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                
                {isLoadingPictures ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mx-auto" style={{ borderColor: colors.primary }}></div>
                    <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>Loading pictures...</p>
                  </div>
                ) : availablePictures.length === 0 ? (
                  <div className="text-center py-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <Camera className="w-6 h-6 mx-auto mb-2" style={{ color: colors.textMuted }} />
                    <p className="text-xs" style={{ color: colors.textSecondary }}>No pictures available</p>
                  </div>
                ) : (
                  <div 
                    className="rounded-lg border overflow-y-auto"
                    style={{ 
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.borderLight,
                      maxHeight: '400px'
                    }}
                  >
                    <div className="p-3 grid grid-cols-2 gap-3">
                      {availablePictures.map((picture: any) => {
                        const isSelected = selectedPictureIds.has(picture.id);
                        const pictureUrl = picture.media?.publicUrl || picture.media?.fileUrl || picture.media?.url || '';
                        const caption = picture.caption || picture.media?.filename || picture.media?.fileName || 'Untitled';
                        const date = picture.createdAt || picture.media?.createdAt;
                        const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : '';

                        return (
                          <div
                            key={picture.id}
                            className="relative rounded-lg overflow-hidden cursor-pointer transition-all"
                            style={{
                              border: `2px solid ${isSelected ? colors.primary : colors.borderLight}`,
                              backgroundColor: isSelected ? `${colors.primary}05` : colors.backgroundSecondary
                            }}
                            onClick={() => {
                              const newSelected = new Set(selectedPictureIds);
                              if (isSelected) {
                                newSelected.delete(picture.id);
                              } else {
                                newSelected.add(picture.id);
                              }
                              setSelectedPictureIds(newSelected);
                            }}
                          >
                            {/* Checkbox overlay */}
                            <div 
                              className="absolute top-2 left-2 z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const newSelected = new Set(selectedPictureIds);
                                  if (isSelected) {
                                    newSelected.delete(picture.id);
                                  } else {
                                    newSelected.add(picture.id);
                                  }
                                  setSelectedPictureIds(newSelected);
                                }}
                                className="w-5 h-5 rounded cursor-pointer"
                                style={{
                                  accentColor: colors.primary,
                                  backgroundColor: isSelected ? colors.primary : colors.backgroundPrimary
                                }}
                              />
                            </div>
                            
                            {/* Picture */}
                            {pictureUrl ? (
                              <img
                                src={pictureUrl}
                                alt={caption}
                                className="w-full h-32 object-cover"
                                style={{ 
                                  opacity: isSelected ? 1 : 0.7,
                                  transition: 'opacity 0.2s'
                                }}
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.image-fallback') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            
                            {/* Fallback for missing image */}
                            <div 
                              className="image-fallback w-full h-32 flex items-center justify-center"
                              style={{ 
                                backgroundColor: colors.backgroundPrimary,
                                display: pictureUrl ? 'none' : 'flex'
                              }}
                            >
                              <Camera className="w-8 h-8" style={{ color: colors.textMuted }} />
                            </div>
                            
                            {/* Caption and Date */}
                            <div className="p-2">
                              <p className="text-xs font-medium truncate mb-1" style={{ color: colors.textPrimary }}>
                                {caption}
                              </p>
                              {formattedDate && (
                                <p className="text-xs" style={{ color: colors.textSecondary }}>
                                  {formattedDate}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {availablePictures.length > 0 && (
                  <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                    {selectedPictureIds.size} of {availablePictures.length} picture{availablePictures.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  onClick={() => {
                    setShowGenerateReportModal(false);
                    setSelectedPictureIds(new Set());
                    setAvailablePictures([]);
                  }}
                  className="px-4 py-2"
                  style={{ 
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textSecondary,
                    border: `1px solid ${colors.border}`
                  }}
                  disabled={isGeneratingReport}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 flex items-center space-x-2"
                  variant="outline"
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: colors.primary }}></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileBarChart className="w-4 h-4" />
                      <span>Generate Report</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
    </>
  );
}
