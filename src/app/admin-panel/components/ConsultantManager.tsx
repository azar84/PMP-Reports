'use client';

import React, { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Search,
  X,
  Save,
  Tag,
  Users,
  User,
  Star,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface ConsultantType {
  id: number;
  type: string;
  description?: string;
}

interface Consultant {
  id: number;
  name: string;
  officeAddress?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ConsultantToConsultantType?: Array<{
    consultant_types: ConsultantType;
  }>;
  types?: ConsultantType[]; // Legacy support
  projectsAsPMC: Array<{ id: number; projectName: string }>;
  projectsAsDesign: Array<{ id: number; projectName: string }>;
  projectsAsCost: Array<{ id: number; projectName: string }>;
  projectsAsSupervision: Array<{ id: number; projectName: string }>;
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
  entityType: 'client' | 'consultant';
  entityId: number;
  createdAt: string;
  updatedAt: string;
}

export default function ConsultantManager() {
  const { get, post, put, delete: del } = useAdminApi();
  const { permissions } = useUserPermissions();

  // Permission checks
  const canViewConsultants = hasPermission(permissions, 'consultants.view');
  const canCreateConsultants = hasPermission(permissions, 'consultants.create');
  const canUpdateConsultants = hasPermission(permissions, 'consultants.update');
  const canDeleteConsultants = hasPermission(permissions, 'consultants.delete');

  // Helper function to get consultant types
  const getConsultantTypes = (consultant: Consultant): ConsultantType[] => {
    if (consultant.ConsultantToConsultantType) {
      return consultant.ConsultantToConsultantType.map(item => item.consultant_types);
    }
    return consultant.types || [];
  };

  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [consultantTypes, setConsultantTypes] = useState<ConsultantType[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const [expandedConsultant, setExpandedConsultant] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState<number | null>(null);
  const [showDetailView, setShowDetailView] = useState<number | null>(null);
  const [contactFormData, setContactFormData] = useState<Partial<Contact>>({
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
  const [formData, setFormData] = useState<Partial<Consultant & { selectedTypes: number[] }>>({
    name: '',
    officeAddress: '',
    phone: '',
    email: '',
    isActive: true,
    selectedTypes: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consultantsRes, typesRes, contactsRes] = await Promise.all([
        get<{ success: boolean; data: Consultant[] }>('/api/admin/consultants'),
        get<{ success: boolean; data: ConsultantType[] }>('/api/admin/consultant-types'),
        get<{ success: boolean; data: Contact[] }>('/api/admin/contacts'),
      ]);

      if (consultantsRes.success) setConsultants(consultantsRes.data);
      if (typesRes.success) setConsultantTypes(typesRes.data);
      if (contactsRes.success) setContacts(contactsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const consultantData = {
        name: formData.name,
        officeAddress: formData.officeAddress || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        isActive: formData.isActive,
        types: formData.selectedTypes || [],
      };

      if (editingConsultant) {
        const response = await put<{ success: boolean; data: Consultant }>(`/api/admin/consultants/${editingConsultant.id}`, consultantData);
        if (response.success) {
          setConsultants(consultants.map(c => c.id === editingConsultant.id ? response.data : c));
        }
      } else {
        const response = await post<{ success: boolean; data: Consultant }>('/api/admin/consultants', consultantData);
        if (response.success) {
          setConsultants([response.data, ...consultants]);
        }
      }

      setShowForm(false);
      setEditingConsultant(null);
      setFormData({
        name: '',
        officeAddress: '',
        phone: '',
        email: '',
        isActive: true,
        selectedTypes: [],
      });
    } catch (error) {
      console.error('Error saving consultant:', error);
    }
  };

  const handleEdit = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setFormData({
      name: consultant.name,
      officeAddress: consultant.officeAddress || '',
      phone: consultant.phone || '',
      email: consultant.email || '',
      isActive: consultant.isActive,
      selectedTypes: (consultant.ConsultantToConsultantType?.map(t => t.consultant_types.id) || consultant.types?.map(t => t.id) || []),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this consultant?')) {
      try {
        const response = await del(`/api/admin/consultants/${id}`) as { success: boolean };
        if (response.success) {
          setConsultants(consultants.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting consultant:', error);
      }
    }
  };

  const getConsultantContacts = (consultantId: number) => {
    return contacts.filter(contact => contact.entityType === 'consultant' && contact.entityId === consultantId);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contactData = {
        ...contactFormData,
        email: contactFormData.email || undefined,
        phone: contactFormData.phone || undefined,
        position: contactFormData.position || undefined,
        notes: contactFormData.notes || undefined,
      };

      const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
      if (response.success) {
        setContacts([response.data, ...contacts]);
        setShowContactForm(null);
        setContactFormData({
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
      console.error('Error saving contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await del(`/api/admin/contacts/${contactId}`) as { success: boolean };
        if (response.success) {
          setContacts(contacts.filter(c => c.id !== contactId));
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleTypeToggle = (typeId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes?.includes(typeId)
        ? prev.selectedTypes.filter(id => id !== typeId)
        : [...(prev.selectedTypes || []), typeId]
    }));
  };

  const getTotalProjects = (consultant: Consultant) => {
    // Get all project IDs from all roles to count unique projects
    const allProjectIds = new Set([
      ...consultant.projectsAsPMC.map(p => p.id),
      ...consultant.projectsAsDesign.map(p => p.id),
      ...consultant.projectsAsCost.map(p => p.id),
      ...consultant.projectsAsSupervision.map(p => p.id)
    ]);
    return allProjectIds.size;
  };

  const filteredConsultants = consultants.filter(consultant =>
    consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.officeAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (consultant.ConsultantToConsultantType || consultant.types || []).some((item: any) => {
      const type = item.consultant_types || item;
      return type.type?.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  // Check if user has view permission
  if (!canViewConsultants) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Access Denied
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            You do not have permission to view consultants.
          </p>
        </Card>
      </div>
    );
  }

  // Show detail view if selected
  if (showDetailView) {
    const consultant = consultants.find(c => c.id === showDetailView);
    if (!consultant) {
      setShowDetailView(null);
      return null;
    }

    const consultantContacts = getConsultantContacts(consultant.id);
    const consultantTypes = getConsultantTypes(consultant);
    const totalProjects = getTotalProjects(consultant);

    return (
      <div className="space-y-6">
        {/* Detail View Header */}
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowDetailView(null)}
                variant="ghost"
                className="p-2 hover:bg-opacity-80 transition-all"
                title="Back to Consultants List"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Button>
              <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: 'var(--color-primary)' }}>
                <Building2 className="w-8 h-8" style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {consultant.name}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {consultant.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {totalProjects > 0 && (
                    <>
                      <span className="text-sm" style={{ color: 'var(--color-border-light)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {totalProjects} {totalProjects === 1 ? 'Project' : 'Projects'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canUpdateConsultants && (
                <Button
                  onClick={() => {
                    setShowDetailView(null);
                    handleEdit(consultant);
                  }}
                  className="flex items-center space-x-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Consultant</span>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Detail Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Basic Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                <Building2 className="w-4 h-4" />
                <span>Basic Information</span>
              </h3>
              <div className="space-y-3">
                {consultant.officeAddress && (
                  <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Office Address</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {consultant.officeAddress}
                      </p>
                    </div>
                  </div>
                )}
                {consultant.phone && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Phone</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {consultant.phone}
                      </p>
                    </div>
                  </div>
                )}
                {consultant.email && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</p>
                      <p className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {consultant.email}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {consultant.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {consultantTypes.length > 0 && (
              <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Tag className="w-4 h-4" />
                  <span>Consultant Types</span>
                </h3>
                <div className="space-y-2">
                  {consultantTypes.map((type) => (
                    <div key={type.id} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {type.type}
                      </p>
                      {type.description && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {type.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {totalProjects > 0 && (
              <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Associated Projects ({totalProjects})
                </h3>
                <div className="space-y-4">
                  {consultant.projectsAsPMC.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        PMC Projects ({consultant.projectsAsPMC.length})
                      </p>
                      <div className="space-y-1.5">
                        {consultant.projectsAsPMC.map((project) => (
                          <div key={project.id} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {project.projectName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {consultant.projectsAsDesign.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        Design Projects ({consultant.projectsAsDesign.length})
                      </p>
                      <div className="space-y-1.5">
                        {consultant.projectsAsDesign.map((project) => (
                          <div key={project.id} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {project.projectName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {consultant.projectsAsCost.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        Cost Projects ({consultant.projectsAsCost.length})
                      </p>
                      <div className="space-y-1.5">
                        {consultant.projectsAsCost.map((project) => (
                          <div key={project.id} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {project.projectName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {consultant.projectsAsSupervision.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        Supervision Projects ({consultant.projectsAsSupervision.length})
                      </p>
                      <div className="space-y-1.5">
                        {consultant.projectsAsSupervision.map((project) => (
                          <div key={project.id} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {project.projectName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Content - Contacts */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Users className="w-4 h-4" />
                  <span>Related Contacts ({consultantContacts.length})</span>
                </h3>
                {canCreateConsultants && (
                  <Button
                    onClick={() => {
                      setShowContactForm(consultant.id);
                      setContactFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        position: '',
                        notes: '',
                        isPrimary: false,
                        isActive: true,
                        entityType: 'consultant',
                        entityId: consultant.id,
                      });
                    }}
                    className="flex items-center space-x-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Contact</span>
                  </Button>
                )}
              </div>

              {consultantContacts.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    No contacts found for this consultant
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                          Position
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                          Phone
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                          Primary
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                          Status
                        </th>
                        {canDeleteConsultants && (
                          <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {consultantContacts.map((contact) => (
                        <tr 
                          key={contact.id}
                          style={{ 
                            borderBottom: '1px solid var(--color-border-light)',
                            backgroundColor: 'var(--color-bg-primary)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {contact.firstName} {contact.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {contact.position || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {contact.email || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                              {contact.phone || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {contact.isPrimary ? (
                              <Star className="w-4 h-4 mx-auto fill-current" style={{ color: 'var(--color-warning)' }} />
                            ) : (
                              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {contact.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          {canDeleteConsultants && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="p-1.5 rounded hover:opacity-80 transition-all"
                                style={{ color: 'var(--color-error)' }}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Contact Form */}
              {showContactForm === consultant.id && canCreateConsultants && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                  <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Add Contact for {consultant.name}
                      </h3>
                      <Button
                        onClick={() => setShowContactForm(null)}
                        variant="ghost"
                        className="p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            First Name *
                          </label>
                          <Input
                            type="text"
                            value={contactFormData.firstName}
                            onChange={(e) => setContactFormData({ ...contactFormData, firstName: e.target.value })}
                            required
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-light)',
                              color: 'var(--color-text-primary)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            Last Name *
                          </label>
                          <Input
                            type="text"
                            value={contactFormData.lastName}
                            onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
                            required
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-light)',
                              color: 'var(--color-text-primary)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            Email
                          </label>
                          <Input
                            type="email"
                            value={contactFormData.email}
                            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-light)',
                              color: 'var(--color-text-primary)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            Phone
                          </label>
                          <Input
                            type="tel"
                            value={contactFormData.phone}
                            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-light)',
                              color: 'var(--color-text-primary)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            Position
                          </label>
                          <Input
                            type="text"
                            value={contactFormData.position}
                            onChange={(e) => setContactFormData({ ...contactFormData, position: e.target.value })}
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-light)',
                              color: 'var(--color-text-primary)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            Notes
                          </label>
                          <textarea
                            value={contactFormData.notes}
                            onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
                            rows={2}
                            className="w-full p-3 rounded-lg border resize-none"
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-light)',
                              color: 'var(--color-text-primary)'
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={contactFormData.isPrimary}
                            onChange={(e) => setContactFormData({ ...contactFormData, isPrimary: e.target.checked })}
                            className="rounded"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Primary Contact
                          </span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={contactFormData.isActive}
                            onChange={(e) => setContactFormData({ ...contactFormData, isActive: e.target.checked })}
                            className="rounded"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Active Contact
                          </span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 pt-2">
                        <Button
                          type="submit"
                          className="flex items-center space-x-2"
                          style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Contact</span>
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowContactForm(null)}
                          variant="ghost"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Consultants
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your consultants and their specializations
          </p>
        </div>
        {canCreateConsultants && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
            style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Consultant</span>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <Input
          type="text"
          placeholder="Search consultants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>

      {/* Consultant Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {editingConsultant ? 'Edit Consultant' : 'Add New Consultant'}
            </h2>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingConsultant(null);
                setFormData({
                  name: '',
                  officeAddress: '',
                  phone: '',
                  email: '',
                  isActive: true,
                  selectedTypes: [],
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Consultant Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Office Address
                </label>
                <textarea
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-lg border resize-none"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Active Consultant
                  </span>
                </label>
              </div>
            </div>

            {/* Consultant Types */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Consultant Types *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {consultantTypes.map(type => {
                  const isSelected = formData.selectedTypes?.includes(type.id) || false;
                  
                  return (
                    <label 
                      key={type.id} 
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all duration-200"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTypeToggle(type.id)}
                          className="sr-only"
                        />
                        <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected ? 'border-opacity-100' : 'border-opacity-50'
                          }`}
                          style={{
                            borderColor: 'var(--color-primary)',
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <svg 
                              className="w-3 h-3" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              style={{ color: 'var(--color-bg-primary)' }}
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
                      <div className="flex-1">
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {type.type}
                        </span>
                        {type.description && (
                          <p 
                            className="text-xs mt-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {type.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              {(!formData.selectedTypes || formData.selectedTypes.length === 0) && (
                <p className="text-sm mt-2" style={{ color: 'var(--color-error)' }}>
                  Please select at least one consultant type
                </p>
              )}
            </div>


            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                disabled={!formData.selectedTypes || formData.selectedTypes.length === 0}
              >
                <Save className="w-4 h-4" />
                <span>{editingConsultant ? 'Update Consultant' : 'Create Consultant'}</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingConsultant(null);
                }}
                variant="ghost"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Consultants List */}
      {filteredConsultants.length > 0 && (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Consultants ({filteredConsultants.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConsultants.map((consultant) => (
              <div 
                key={consultant.id}
                className="p-4 rounded-lg relative"
                style={{ 
                      backgroundColor: 'var(--color-bg-primary)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {consultant.name}
                    </h4>
                  </div>
                  <span 
                    className="px-2 py-1 text-xs rounded border"
                    style={{ 
                      borderColor: 'var(--color-border-light)',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {consultant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-1">
                    {getConsultantTypes(consultant).map(type => (
                      <span 
                        key={type.id}
                        className="px-2 py-1 text-xs rounded-full flex items-center space-x-1"
                        style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{type.type}</span>
                      </span>
                    ))}
                  </div>
                  
                  {consultant.officeAddress && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <MapPin className="w-4 h-4" />
                      <span>{consultant.officeAddress}</span>
                    </div>
                  )}
                  {consultant.phone && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Phone className="w-4 h-4" />
                      <span>{consultant.phone}</span>
                    </div>
                  )}
                  {consultant.email && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Mail className="w-4 h-4" />
                      <span>{consultant.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="font-medium">{getTotalProjects(consultant)} projects</span>
                  </div>
                </div>

                {/* Action buttons positioned in lower right corner */}
                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => {
                        setShowDetailView(consultant.id);
                      }}
                      variant="ghost"
                      className="p-2"
                      style={{ color: 'var(--color-primary)' }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canUpdateConsultants && (
                      <Button
                        onClick={() => handleEdit(consultant)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: 'var(--color-primary)' }}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canDeleteConsultants && (
                      <Button
                        onClick={() => handleDelete(consultant.id)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: 'var(--color-error)' }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {filteredConsultants.length === 0 && (
        <Card className="p-8 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No consultants found
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first consultant'}
          </p>
        </Card>
      )}
    </div>
  );
}
