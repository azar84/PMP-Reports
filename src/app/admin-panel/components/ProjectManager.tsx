'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  ArrowLeft
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
  projectDirectorId?: number;
  projectDirector?: { id: number; staffName: string };
  projectManagerId?: number;
  projectManager?: { id: number; staffName: string };
  startDate?: string;
  endDate?: string;
  duration?: string;
  eot?: string;
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
  types: Array<{ id: number; type: string }>;
}

interface CompanyStaff {
  id: number;
  staffName: string;
  position?: string;
  email?: string;
  phone?: string;
}

export default function ProjectManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [staff, setStaff] = useState<CompanyStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate duration when form data changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const calculatedDuration = calculateDuration(formData.startDate, formData.endDate);
      if (calculatedDuration !== formData.duration) {
        setFormData(prev => ({ ...prev, duration: calculatedDuration }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, clientsRes, consultantsRes, staffRes] = await Promise.all([
        get<{ success: boolean; data: Project[] }>('/api/admin/projects'),
        get<{ success: boolean; data: Client[] }>('/api/admin/clients'),
        get<{ success: boolean; data: Consultant[] }>('/api/admin/consultants'),
        get<{ success: boolean; data: CompanyStaff[] }>('/api/admin/company-staff'),
      ]);

      if (projectsRes.success) setProjects(projectsRes.data);
      if (clientsRes.success) setClients(clientsRes.data);
      if (consultantsRes.success) setConsultants(consultantsRes.data);
      if (staffRes.success) setStaff(staffRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      if (editingProject) {
        const response = await put<{ success: boolean; data: Project }>(`/api/admin/projects/${editingProject.id}`, projectData);
        if (response.success) {
          setProjects(projects.map(p => p.id === editingProject.id ? response.data : p));
        }
      } else {
        const response = await post<{ success: boolean; data: Project }>('/api/admin/projects', projectData);
        if (response.success) {
          setProjects([response.data, ...projects]);
        }
      }

      setShowForm(false);
      setEditingProject(null);
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
    }
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

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectCode: project.projectCode,
      projectName: project.projectName,
      projectDescription: project.projectDescription || '',
      clientId: project.clientId || undefined,
      projectManagementConsultantId: project.projectManagementConsultantId || undefined,
      designConsultantId: project.designConsultantId || undefined,
      supervisionConsultantId: project.supervisionConsultantId || undefined,
      costConsultantId: project.costConsultantId || undefined,
      projectDirectorId: project.projectDirectorId || undefined,
      projectManagerId: project.projectManagerId || undefined,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      duration: project.duration || '',
      eot: project.eot || '',
    });
    setShowForm(true);
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
    <div className="space-y-6">
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
          style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
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
            color: colors.textPrimary
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
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
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
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Client
                </label>
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border border-gray-200/10"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Project Management Consultant
                </label>
                <select
                  value={formData.projectManagementConsultantId || ''}
                  onChange={(e) => setFormData({ ...formData, projectManagementConsultantId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border border-gray-200/10"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select PMC</option>
                  {consultants.filter(c => c.types.some(t => t.type === 'PMC')).map(consultant => (
                    <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Design Consultant
                </label>
                <select
                  value={formData.designConsultantId || ''}
                  onChange={(e) => setFormData({ ...formData, designConsultantId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border border-gray-200/10"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select Design Consultant</option>
                  {consultants.filter(c => c.types.some(t => t.type === 'Design')).map(consultant => (
                    <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Supervision Consultant
                </label>
                <select
                  value={formData.supervisionConsultantId || ''}
                  onChange={(e) => setFormData({ ...formData, supervisionConsultantId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border border-gray-200/10"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select Supervision Consultant</option>
                  {consultants.filter(c => c.types.some(t => t.type === 'Supervision')).map(consultant => (
                    <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Cost Consultant
                </label>
                <select
                  value={formData.costConsultantId || ''}
                  onChange={(e) => setFormData({ ...formData, costConsultantId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border border-gray-200/10"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select Cost Consultant</option>
                  {consultants.filter(c => c.types.some(t => t.type === 'Cost')).map(consultant => (
                    <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Project Director
                </label>
                <select
                  value={formData.projectDirectorId || ''}
                  onChange={(e) => setFormData({ ...formData, projectDirectorId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border border-gray-200/10"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select Project Director</option>
                  {staff.map(staffMember => (
                    <option key={staffMember.id} value={staffMember.id}>{staffMember.staffName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Project Manager
                </label>
                <select
                  value={formData.projectManagerId || ''}
                  onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border border-gray-200/10"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select Project Manager</option>
                  {staff.map(staffMember => (
                    <option key={staffMember.id} value={staffMember.id}>{staffMember.staffName}</option>
                  ))}
                </select>
              </div>

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
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
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
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
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
                    borderColor: colors.grayLight,
                    color: colors.textSecondary,
                    cursor: 'not-allowed'
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
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
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
                className="w-full p-3 rounded-lg border border-gray-200/10 resize-none"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: 'rgba(229, 231, 235, 0.1)',
                  color: colors.textPrimary
                }}
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
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
          <Card key={project.id} className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
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
                  <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
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

                  {project.projectDirector && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>Director:</span>
                      <span style={{ color: colors.textPrimary }}>{project.projectDirector.staffName}</span>
                    </div>
                  )}

                  {project.projectManager && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textSecondary }}>Manager:</span>
                      <span style={{ color: colors.textPrimary }}>{project.projectManager.staffName}</span>
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
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
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
    </div>
  );
}
