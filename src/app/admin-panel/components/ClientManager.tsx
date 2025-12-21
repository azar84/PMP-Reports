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
  Users,
  User,
  Star,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  ArrowRight
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
  const { get, post, put, delete: del } = useAdminApi();
  const { permissions } = useUserPermissions();

  // Permission checks
  const canViewClient = hasPermission(permissions, 'clients.view');
  const canCreateClient = hasPermission(permissions, 'clients.create');
  const canUpdateClient = hasPermission(permissions, 'clients.update');
  const canDeleteClient = hasPermission(permissions, 'clients.delete');

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  // Check if user has view permission
  if (!canViewClient) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Access Denied
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            You do not have permission to view clients.
          </p>
        </Card>
      </div>
    );
  }

  // Show detail view if selected
  if (showDetailView) {
    const client = clients.find(c => c.id === showDetailView);
    if (!client) {
      setShowDetailView(null);
      return null;
    }

    const clientContacts = getClientContacts(client.id);

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
                title="Back to Clients List"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                <ArrowRight className="w-5 h-5 rotate-180" />
            </Button>
              <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: 'var(--color-primary)' }}>
                <Building2 className="w-8 h-8" style={{ color: '#FFFFFF' }} />
          </div>
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {client.name}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {client.projects.length > 0 && (
                    <>
                      <span className="text-sm" style={{ color: 'var(--color-border-light)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {client.projects.length} {client.projects.length === 1 ? 'Project' : 'Projects'}
                      </span>
                    </>
                  )}
                    </div>
                    </div>
                  </div>
            <div className="flex items-center space-x-3">
              {canUpdateClient && (
                    <Button
                      onClick={() => {
                    setShowDetailView(null);
                    handleEdit(client);
                  }}
                  className="flex items-center space-x-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                      >
                        <Edit className="w-4 h-4" />
                  <span>Edit Client</span>
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
                {client.officeAddress && (
                  <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Office Address</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {client.officeAddress}
                      </p>
          </div>
                      </div>
                )}
                {client.phone && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Phone</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {client.phone}
                      </p>
                      </div>
                      </div>
                )}
                {client.email && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</p>
                      <p className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {client.email}
                      </p>
                      </div>
                      </div>
                )}
                <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </p>
                    </div>
                  </div>
              </div>
            </Card>

                        {client.projects.length > 0 && (
              <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Associated Projects ({client.projects.length})
                </h3>
                <div className="space-y-1.5">
                  {client.projects.map((project) => (
                    <div key={project.id} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                {project.projectName}
                      </p>
                    </div>
                  ))}
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
                  <span>Related Contacts ({clientContacts.length})</span>
                    </h3>
                    {canCreateClient && (
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
                    style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Contact</span>
                      </Button>
                    )}
                  </div>

              {clientContacts.length === 0 ? (
                        <div className="text-center py-8">
                  <User className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            No contacts found for this client
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
                              {canDeleteClient && (
                          <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                      {clientContacts.map((contact) => (
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
                                {canDeleteClient && (
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
              {showContactForm === client.id && canCreateClient && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                  <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                        <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Add Contact for {client.name}
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
            Clients
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your clients and their information
          </p>
        </div>
        {canCreateClient && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
            style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>

      {/* Client Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Client Name *
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
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Active Client
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
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
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Clients List */}
      {filteredClients.length > 0 && (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Clients ({filteredClients.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                className="p-4 rounded-lg relative"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {client.name}
                    </h4>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {client.officeAddress && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <MapPin className="w-4 h-4" />
                      <span>{client.officeAddress}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="font-medium">{client.projects.length} projects</span>
                  </div>
                </div>

                {/* Action buttons positioned in lower right corner */}
                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => {
                        setShowDetailView(client.id);
                      }}
                      variant="ghost"
                      className="p-2"
                      style={{ color: 'var(--color-primary)' }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canUpdateClient && (
                      <Button
                        onClick={() => handleEdit(client)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: 'var(--color-primary)' }}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canDeleteClient && (
                      <Button
                        onClick={() => handleDelete(client.id)}
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

      {filteredClients.length === 0 && (
        <Card className="p-8 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No clients found
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
          </p>
        </Card>
      )}
    </div>
  );
}
