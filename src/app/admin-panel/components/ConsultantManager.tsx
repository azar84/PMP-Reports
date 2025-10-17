'use client';

import React, { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  ChevronRight
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
  types: ConsultantType[];
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
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

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
      selectedTypes: consultant.types.map(t => t.id),
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
    consultant.types.some(type => type.type.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Consultant Management
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage your consultants and their specializations
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
          style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Consultant</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search consultants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: colors.backgroundSecondary,
            color: colors.textPrimary
          }}
        />
      </div>

      {/* Consultant Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Consultant Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Office Address
                </label>
                <textarea
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-lg border resize-none"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
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
                  <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Active Consultant
                  </span>
                </label>
              </div>
            </div>

            {/* Consultant Types */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
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
                            borderColor: colors.primary,
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <svg 
                              className="w-3 h-3" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              style={{ color: colors.backgroundPrimary }}
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
                          style={{ color: colors.textPrimary }}
                        >
                          {type.type}
                        </span>
                        {type.description && (
                          <p 
                            className="text-xs mt-1"
                            style={{ color: colors.textSecondary }}
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
                <p className="text-sm mt-2" style={{ color: colors.error }}>
                  Please select at least one consultant type
                </p>
              )}
            </div>


            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
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
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Consultants List */}
      {filteredConsultants.length > 0 && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            Consultants ({filteredConsultants.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConsultants.map((consultant) => (
              <div 
                key={consultant.id}
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: colors.backgroundPrimary
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" style={{ color: colors.primary }} />
                    <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                      {consultant.name}
                    </h4>
                  </div>
                  <span 
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ 
                      backgroundColor: consultant.isActive ? colors.success : colors.error,
                      color: '#FFFFFF'
                    }}
                  >
                    {consultant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-1">
                    {consultant.types.map(type => (
                      <span 
                        key={type.id}
                        className="px-2 py-1 text-xs rounded-full flex items-center space-x-1"
                        style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{type.type}</span>
                      </span>
                    ))}
                  </div>
                  
                  {consultant.officeAddress && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <MapPin className="w-4 h-4" />
                      <span>{consultant.officeAddress}</span>
                    </div>
                  )}
                  {consultant.phone && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <Phone className="w-4 h-4" />
                      <span>{consultant.phone}</span>
                    </div>
                  )}
                  {consultant.email && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <Mail className="w-4 h-4" />
                      <span>{consultant.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                    <span className="font-medium">{getTotalProjects(consultant)} projects</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => {
                        setShowDetailView(showDetailView === consultant.id ? null : consultant.id);
                      }}
                      variant="ghost"
                      className="p-2"
                      style={{ color: colors.info }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleEdit(consultant)}
                      variant="ghost"
                      className="p-2"
                      style={{ color: colors.primary }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(consultant.id)}
                      variant="ghost"
                      className="p-2"
                      style={{ color: colors.error }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {filteredConsultants.length === 0 && (
        <Card className="p-8 text-center" style={{ backgroundColor: colors.backgroundSecondary }}>
          <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            No consultants found
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first consultant'}
          </p>
        </Card>
      )}

      {/* Detail View */}
      {showDetailView && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Consultant Details
            </h2>
            <Button
              onClick={() => setShowDetailView(null)}
              variant="ghost"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {(() => {
            const consultant = consultants.find(c => c.id === showDetailView);
            if (!consultant) return null;

            return (
              <div className="space-y-6">
                {/* Consultant Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-semibold mb-3" style={{ color: colors.textPrimary }}>
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Name:</strong> {consultant.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Address:</strong> {consultant.officeAddress || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Phone:</strong> {consultant.phone || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Email:</strong> {consultant.email || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: consultant.isActive ? colors.success : colors.error,
                            color: '#FFFFFF'
                          }}
                        >
                          <strong>Status:</strong> {consultant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold mb-3" style={{ color: colors.textPrimary }}>
                      Consultant Types & Projects
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Types:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {consultant.types.map((type) => (
                            <span 
                              key={type.id}
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                            >
                              {type.type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Total Projects: {getTotalProjects(consultant)}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {consultant.projectsAsPMC.length > 0 && (
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: colors.info, color: '#FFFFFF' }}
                            >
                              {consultant.projectsAsPMC.length} PMC
                            </span>
                          )}
                          {consultant.projectsAsDesign.length > 0 && (
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: colors.success, color: '#FFFFFF' }}
                            >
                              {consultant.projectsAsDesign.length} Design
                            </span>
                          )}
                          {consultant.projectsAsCost.length > 0 && (
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: colors.warning, color: '#FFFFFF' }}
                            >
                              {consultant.projectsAsCost.length} Cost
                            </span>
                          )}
                          {consultant.projectsAsSupervision.length > 0 && (
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: colors.error, color: '#FFFFFF' }}
                            >
                              {consultant.projectsAsSupervision.length} Supervision
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200/10 pt-6">
                </div>

                {/* Contacts Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold" style={{ color: colors.textPrimary }}>
                      Related Contacts
                    </h3>
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
                      style={{ backgroundColor: colors.success, color: '#FFFFFF' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Contact</span>
                    </Button>
                  </div>

                  {(() => {
                    const consultantContacts = getConsultantContacts(consultant.id);
                    
                    if (consultantContacts.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <User className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
                          <p className="text-sm" style={{ color: colors.textMuted }}>
                            No contacts found for this consultant
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200/20">
                              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Name
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Position
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Email
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Phone
                              </th>
                              <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Primary
                              </th>
                              <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Status
                              </th>
                              <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {consultantContacts.map((contact, index) => (
                              <tr 
                                key={contact.id}
                                className="border-b border-gray-200/10"
                                style={{ 
                                  backgroundColor: colors.backgroundSecondary
                                }}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" style={{ color: colors.primary }} />
                                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                                      {contact.firstName} {contact.lastName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm" style={{ color: colors.textPrimary }}>
                                    {contact.position || '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm" style={{ color: colors.textPrimary }}>
                                    {contact.email || '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm" style={{ color: colors.textPrimary }}>
                                    {contact.phone || '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {contact.isPrimary ? (
                                    <Star className="w-4 h-4 mx-auto" style={{ color: colors.warning }} />
                                  ) : (
                                    <span className="text-sm" style={{ color: colors.textMuted }}>-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span 
                                    className="px-2 py-1 text-xs rounded-full"
                                    style={{ 
                                      backgroundColor: contact.isActive ? colors.success : colors.error,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    {contact.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Button
                                    onClick={() => handleDeleteContact(contact.id)}
                                    variant="ghost"
                                    className="p-1"
                                    style={{ color: colors.error }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {/* Contact Form - Show when adding contact from detail view */}
                  {showContactForm && (
                    <div className="mt-6 pt-6 border-t border-gray-200/10">
                      <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Add Contact for {(() => {
                              const consultant = consultants.find(c => c.id === showDetailView);
                              return consultant ? consultant.name : '';
                            })()}
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
                              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                                First Name *
                              </label>
                              <Input
                                type="text"
                                value={contactFormData.firstName}
                                onChange={(e) => setContactFormData({ ...contactFormData, firstName: e.target.value })}
                                required
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.grayLight,
                                  color: colors.textPrimary
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                                Last Name *
                              </label>
                              <Input
                                type="text"
                                value={contactFormData.lastName}
                                onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
                                required
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.grayLight,
                                  color: colors.textPrimary
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                                Email
                              </label>
                              <Input
                                type="email"
                                value={contactFormData.email}
                                onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.grayLight,
                                  color: colors.textPrimary
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                                Phone
                              </label>
                              <Input
                                type="tel"
                                value={contactFormData.phone}
                                onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.grayLight,
                                  color: colors.textPrimary
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                                Position
                              </label>
                              <Input
                                type="text"
                                value={contactFormData.position}
                                onChange={(e) => setContactFormData({ ...contactFormData, position: e.target.value })}
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.grayLight,
                                  color: colors.textPrimary
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                                Notes
                              </label>
                              <textarea
                                value={contactFormData.notes}
                                onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-3 rounded-lg border resize-none"
                                style={{
                                  backgroundColor: colors.backgroundPrimary,
                                  borderColor: colors.grayLight,
                                  color: colors.textPrimary
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
                              />
                              <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Primary Contact
                              </span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={contactFormData.isActive}
                                onChange={(e) => setContactFormData({ ...contactFormData, isActive: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                Active Contact
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <Button
                              type="submit"
                              className="flex items-center space-x-2"
                              style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Contact</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowContactForm(null)}
                              variant="ghost"
                              style={{ color: colors.textSecondary }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
