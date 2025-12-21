'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Building2,
  Search,
  X,
  Save,
  Star,
  Users,
  Download,
  Upload,
  FileSpreadsheet,
  Trash,
  CheckCircle,
  Filter,
  AlertCircle
} from 'lucide-react';

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

interface Client {
  id: number;
  name: string;
}

interface Consultant {
  id: number;
  name: string;
}

export default function ContactManager() {
  const { get, post, put, delete: del } = useAdminApi();
  const { permissions } = useUserPermissions();

  // Permission checks
  const canViewContacts = hasPermission(permissions, 'contacts.view');
  const canCreateContacts = hasPermission(permissions, 'contacts.create');
  const canUpdateContacts = hasPermission(permissions, 'contacts.update');
  const canDeleteContacts = hasPermission(permissions, 'contacts.delete');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [entityFilter, setEntityFilter] = useState<'all' | 'client' | 'consultant'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState<Partial<Contact>>({
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsRes, clientsRes, consultantsRes] = await Promise.all([
        get<{ success: boolean; data: Contact[] }>('/api/admin/contacts'),
        get<{ success: boolean; data: Client[] }>('/api/admin/clients'),
        get<{ success: boolean; data: Consultant[] }>('/api/admin/consultants'),
      ]);

      if (contactsRes.success) setContacts(contactsRes.data);
      if (clientsRes.success) setClients(clientsRes.data);
      if (consultantsRes.success) setConsultants(consultantsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contactData = {
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        position: formData.position || undefined,
        notes: formData.notes || undefined,
      };

      if (editingContact) {
        const response = await put<{ success: boolean; data: Contact }>(`/api/admin/contacts/${editingContact.id}`, contactData);
        if (response.success) {
          setContacts(contacts.map(c => c.id === editingContact.id ? response.data : c));
        }
      } else {
        const response = await post<{ success: boolean; data: Contact }>('/api/admin/contacts', contactData);
        if (response.success) {
          setContacts([response.data, ...contacts]);
        }
      }

      setShowForm(false);
      setEditingContact(null);
      setFormData({
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
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || '',
      notes: contact.notes || '',
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
      entityType: contact.entityType,
      entityId: contact.entityId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await del(`/api/admin/contacts/${id}`) as { success: boolean };
        if (response.success) {
          setContacts(contacts.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const getEntityName = (contact: Contact) => {
    if (contact.entityType === 'client') {
      const client = clients.find(c => c.id === contact.entityId);
      return client?.name || 'Unknown Client';
    } else {
      const consultant = consultants.find(c => c.id === contact.entityId);
      return consultant?.name || 'Unknown Consultant';
    }
  };

  const filteredContacts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return contacts.filter(contact => {
      // Search filter
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(searchLower) ||
        contact.lastName.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.position?.toLowerCase().includes(searchLower) ||
        getEntityName(contact).toLowerCase().includes(searchLower);
      
      // Entity filter
      const matchesEntity = entityFilter === 'all' || contact.entityType === entityFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && contact.isActive) ||
        (statusFilter === 'inactive' && !contact.isActive);
      
      return matchesSearch && matchesEntity && matchesStatus;
    });
  }, [contacts, searchTerm, entityFilter, statusFilter, clients, consultants]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = contacts.length;
    const active = contacts.filter(c => c.isActive).length;
    const clients = contacts.filter(c => c.entityType === 'client').length;
    const consultants = contacts.filter(c => c.entityType === 'consultant').length;
    const primary = contacts.filter(c => c.isPrimary).length;
    
    return { total, active, clients, consultants, primary };
  }, [contacts]);

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedContacts(new Set());
    } else {
      const newSelection = new Set(filteredContacts.map(contact => contact.id));
      setSelectedContacts(newSelection);
    }
  };

  const handleSelectContact = (contactId: number) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const response = await fetch(`/api/admin/contacts/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_data_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting contacts data:', error);
      alert('Failed to export contacts data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  // Check if user has view permission
  if (!canViewContacts) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Access Denied
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            You do not have permission to view contacts.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Contacts
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage contacts for clients and consultants
          </p>
        </div>
        {canCreateContacts && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
            style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Total Contacts
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {stats.total}
              </p>
            </div>
            <Users className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Active Contacts
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {stats.active}
              </p>
            </div>
            <CheckCircle className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Client Contacts
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {stats.clients}
              </p>
            </div>
            <Building2 className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Consultant Contacts
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {stats.consultants}
              </p>
            </div>
            <User className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <Input
            type="text"
            placeholder="Search contacts by name, email, position, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--color-border-light)' }}>
            <Filter className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            {(['all', 'client', 'consultant'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setEntityFilter(option === 'all' ? 'all' : option)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: entityFilter === option ? 'var(--color-bg-primary)' : 'transparent',
                  color: entityFilter === option ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: `1px solid ${entityFilter === option ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
                }}
              >
                {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingContact(null);
                setFormData({
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
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Position
                </label>
                <Input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Entity Type *
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value as 'client' | 'consultant', entityId: undefined })}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="client">Client</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {formData.entityType === 'client' ? 'Client' : 'Consultant'} *
                </label>
                <select
                  value={formData.entityId || ''}
                  onChange={(e) => setFormData({ ...formData, entityId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                    color: 'var(--color-text-primary)'
                  }}
                  required
                >
                  <option value="">Select {formData.entityType}</option>
                  {formData.entityType === 'client' 
                    ? clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))
                    : consultants.map(consultant => (
                        <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                      ))
                  }
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-lg border resize-none"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-light)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
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
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Active Contact
                </span>
              </label>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
              >
                <Save className="w-4 h-4" />
                <span>{editingContact ? 'Update Contact' : 'Create Contact'}</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingContact(null);
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

      {/* Contacts Table */}
      <Card className="overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* Card Header with Import/Export Actions */}
        <div className="px-6 py-4 border-b flex items-center justify-end" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="p-2 rounded hover:opacity-80 transition-all duration-150"
              style={{ 
                color: 'var(--color-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Export to Excel"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="p-2 rounded hover:opacity-80 transition-all duration-150"
              style={{ 
                color: 'var(--color-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Export to CSV"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            {canCreateContacts && (
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 rounded hover:opacity-80 transition-all duration-150"
                style={{ 
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Import Contact Data"
              >
                <Upload className="w-5 h-5" />
              </button>
            )}
            {selectedContacts.size > 0 && canDeleteContacts && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="p-2 rounded hover:opacity-80 transition-all duration-150"
                style={{ 
                  color: 'var(--color-error)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={`Delete Selected (${selectedContacts.size})`}
              >
                <Trash className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Selection Status */}
        {selectedContacts.size > 0 && (
          <div className="px-6 py-3 border-b" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)' }}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {selectedContacts.size} contact(s) selected
              </span>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {searchTerm ? 'No contacts found matching your search' : 'No contacts found. Add your first contact to get started.'}
              </p>
            </div>
          ) : (
            <table className="w-full table-auto" style={{ tableLayout: 'auto' }}>
              <thead>
                <tr style={{ 
                  borderBottom: '1px solid var(--color-border-light)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}>
                  <th className="w-12 px-2 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        variant="primary"
                        size="sm"
                        checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Entity
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Position
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Email
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Phone
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Status
                  </th>
                  {(canUpdateContacts || canDeleteContacts) && (
                    <th className="w-24 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id}
                    style={{ 
                      borderBottom: '1px solid var(--color-border-light)',
                      backgroundColor: 'var(--color-bg-primary)',
                      opacity: contact.isActive ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          variant="primary"
                          size="sm"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => handleSelectContact(contact.id)}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.isPrimary && (
                          <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--color-warning)' }} />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {getEntityName(contact)}
                          </div>
                          <div className="text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                            {contact.entityType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {contact.position || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {contact.email || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {contact.phone || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {(canUpdateContacts || canDeleteContacts) && (
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          {canUpdateContacts && (
                            <button
                              onClick={() => handleEdit(contact)}
                              className="p-1.5 rounded hover:opacity-80 transition-all"
                              style={{ color: 'var(--color-primary)' }}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteContacts && (
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="p-1.5 rounded hover:opacity-80 transition-all"
                              style={{ color: 'var(--color-error)' }}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
