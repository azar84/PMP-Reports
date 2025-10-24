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
  User, 
  Phone, 
  Mail, 
  Building2,
  Search,
  X,
  Save,
  Star,
  Users
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
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
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

  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEntityName(contact).toLowerCase().includes(searchTerm.toLowerCase())
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
            Contact Management
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage contacts for clients and consultants
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
          style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: colors.backgroundSecondary,
            color: colors.textPrimary
          }}
        />
      </div>

      {/* Contact Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
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
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
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
                    borderColor: colors.borderLight,
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
                    borderColor: colors.borderLight,
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
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Entity Type *
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value as 'client' | 'consultant', entityId: undefined })}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                    color: colors.textPrimary
                  }}
                >
                  <option value="client">Client</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  {formData.entityType === 'client' ? 'Client' : 'Consultant'} *
                </label>
                <select
                  value={formData.entityId || ''}
                  onChange={(e) => setFormData({ ...formData, entityId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                    color: colors.textPrimary
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
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-lg border resize-none"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.borderLight,
                  color: colors.textPrimary
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
                />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Primary Contact
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Active Contact
                </span>
              </label>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
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
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Contacts Table */}
      <Card className="overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/20" style={{ backgroundColor: colors.backgroundPrimary }}>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Entity
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Position
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Phone
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact, index) => (
                <tr 
                  key={contact.id}
                  className="border-b border-gray-200/10"
                  style={{ 
                    backgroundColor: colors.backgroundSecondary
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {contact.firstName} {contact.lastName}
                      </span>
                      {contact.isPrimary && (
                        <Star className="w-4 h-4" style={{ color: colors.warning }} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          {getEntityName(contact)}
                        </div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                          {contact.entityType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      {contact.position || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      {contact.email || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      {contact.phone || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ 
                        backgroundColor: contact.isActive ? colors.success : colors.error,
                        color: colors.backgroundPrimary
                      }}
                    >
                      {contact.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        onClick={() => handleEdit(contact)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: colors.primary }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(contact.id)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: colors.error }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredContacts.length === 0 && (
        <Card className="p-8 text-center" style={{ backgroundColor: colors.backgroundSecondary }}>
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            No contacts found
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first contact'}
          </p>
        </Card>
      )}
    </div>
  );
}
