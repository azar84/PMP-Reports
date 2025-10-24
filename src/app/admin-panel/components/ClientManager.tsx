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
  Users,
  User,
  Star,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Client {
  id: number;
  name: string;
  officeAddress?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projects: Array<{
    id: number;
    projectName: string;
  }>;
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

export default function ClientManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
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
    entityType: 'client',
    entityId: undefined,
  });
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    officeAddress: '',
    phone: '',
    email: '',
    isActive: true,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const [clientsRes, contactsRes] = await Promise.all([
        get<{ success: boolean; data: Client[] }>('/api/admin/clients'),
        get<{ success: boolean; data: Contact[] }>('/api/admin/contacts')
      ]);
      
      if (clientsRes.success) {
        setClients(clientsRes.data);
      }
      if (contactsRes.success) {
        setContacts(contactsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clientData = {
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        officeAddress: formData.officeAddress || undefined,
      };

      if (editingClient) {
        const response = await put<{ success: boolean; data: Client }>(`/api/admin/clients/${editingClient.id}`, clientData);
        if (response.success) {
          setClients(clients.map(c => c.id === editingClient.id ? response.data : c));
        }
      } else {
        const response = await post<{ success: boolean; data: Client }>('/api/admin/clients', clientData);
        if (response.success) {
          setClients([response.data, ...clients]);
        }
      }

      setShowForm(false);
      setEditingClient(null);
      setFormData({
        name: '',
        officeAddress: '',
        phone: '',
        email: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      officeAddress: client.officeAddress || '',
      phone: client.phone || '',
      email: client.email || '',
      isActive: client.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await del(`/api/admin/clients/${id}`) as { success: boolean };
        if (response.success) {
          setClients(clients.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const getClientContacts = (clientId: number) => {
    return contacts.filter(contact => contact.entityType === 'client' && contact.entityId === clientId);
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
          entityType: 'client',
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.officeAddress?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Client Management
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage your clients and their information
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
          style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: colors.backgroundSecondary,
            color: colors.textPrimary
          }}
        />
      </div>

      {/* Client Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingClient(null);
                setFormData({
                  name: '',
                  officeAddress: '',
                  phone: '',
                  email: '',
                  isActive: true,
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
                  Client Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      borderColor: colors.borderLight,
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
                    Active Client
                  </span>
                </label>
              </div>
            </div>


            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
              >
                <Save className="w-4 h-4" />
                <span>{editingClient ? 'Update Client' : 'Create Client'}</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingClient(null);
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

      {/* Clients List */}
      {filteredClients.length > 0 && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            Clients ({filteredClients.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                className="p-4 rounded-lg relative"
                style={{ 
                  backgroundColor: colors.backgroundPrimary
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" style={{ color: colors.primary }} />
                    <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                      {client.name}
                    </h4>
                  </div>
                  <span 
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ 
                      backgroundColor: client.isActive ? colors.success : colors.error,
                      color: colors.backgroundPrimary
                    }}
                  >
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {client.officeAddress && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <MapPin className="w-4 h-4" />
                      <span>{client.officeAddress}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                    <span className="font-medium">{client.projects.length} projects</span>
                  </div>
                </div>

                {/* Action buttons positioned in lower right corner */}
                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => {
                        setShowDetailView(showDetailView === client.id ? null : client.id);
                      }}
                      variant="ghost"
                      className="p-2"
                      style={{ color: colors.info }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleEdit(client)}
                      variant="ghost"
                      className="p-2"
                      style={{ color: colors.primary }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(client.id)}
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

      {filteredClients.length === 0 && (
        <Card className="p-8 text-center" style={{ backgroundColor: colors.backgroundSecondary }}>
          <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            No clients found
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
          </p>
        </Card>
      )}

      {/* Detail View */}
      {showDetailView && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Client Details
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
            const client = clients.find(c => c.id === showDetailView);
            if (!client) return null;

            return (
              <div className="space-y-6">
                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-semibold mb-3" style={{ color: colors.textPrimary }}>
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Name:</strong> {client.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Address:</strong> {client.officeAddress || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Phone:</strong> {client.phone || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          <strong>Email:</strong> {client.email || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: client.isActive ? colors.success : colors.error,
                            color: colors.backgroundPrimary
                          }}
                        >
                          <strong>Status:</strong> {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold mb-3" style={{ color: colors.textPrimary }}>
                      Projects
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Total Projects: {client.projects.length}
                        </span>
                        {client.projects.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {client.projects.slice(0, 5).map((project) => (
                              <span 
                                key={project.id}
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: colors.info, color: '#FFFFFF' }}
                              >
                                {project.projectName}
                              </span>
                            ))}
                            {client.projects.length > 5 && (
                              <span 
                                className="px-2 py-1 text-xs rounded"
                                style={{ backgroundColor: colors.textMuted, color: colors.backgroundPrimary }}
                              >
                                +{client.projects.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
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
                        setShowContactForm(client.id);
                        setContactFormData({
                          firstName: '',
                          lastName: '',
                          email: '',
                          phone: '',
                          position: '',
                          notes: '',
                          isPrimary: false,
                          isActive: true,
                          entityType: 'client',
                          entityId: client.id,
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
                    const clientContacts = getClientContacts(client.id);
                    
                    if (clientContacts.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <User className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
                          <p className="text-sm" style={{ color: colors.textMuted }}>
                            No contacts found for this client
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
                            {clientContacts.map((contact, index) => (
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
                                      color: colors.backgroundPrimary
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
                              const client = clients.find(c => c.id === showDetailView);
                              return client ? client.name : '';
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
                                value={contactFormData.lastName}
                                onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
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
                                value={contactFormData.email}
                                onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
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
                                value={contactFormData.phone}
                                onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
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
                                value={contactFormData.position}
                                onChange={(e) => setContactFormData({ ...contactFormData, position: e.target.value })}
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.borderLight,
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
                      borderColor: colors.borderLight,
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
