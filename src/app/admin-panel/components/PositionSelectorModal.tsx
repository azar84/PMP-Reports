'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search,
  Plus,
  X,
  Check,
  Briefcase,
  DollarSign
} from 'lucide-react';

interface Position {
  id: number;
  name: string;
  description?: string;
  monthlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PositionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPosition: (position: Position) => void;
  projectId?: number;
}

export default function PositionSelectorModal({ isOpen, onClose, onSelectPosition, projectId }: PositionSelectorModalProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post } = useAdminApi();

  const [positions, setPositions] = useState<Position[]>([]);
  const [existingProjectPositions, setExistingProjectPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPosition, setNewPosition] = useState({
    name: '',
    description: '',
    monthlyRate: undefined as number | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchPositions();
      if (projectId) {
        fetchExistingProjectPositions();
      }
    }
  }, [isOpen, projectId]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Position[] }>('/api/admin/positions');
      if (response.success) {
        setPositions(response.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingProjectPositions = async () => {
    if (!projectId) return;
    
    try {
      const response = await get<{ success: boolean; data: any[] }>(`/api/admin/project-staff?projectId=${projectId}`);
      if (response.success) {
        const existingPositions = response.data.map(staff => staff.designation);
        setExistingProjectPositions(existingPositions);
      }
    } catch (error) {
      console.error('Error fetching existing project positions:', error);
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosition.name.trim()) {
      setErrorMessage('Position name is required');
      return;
    }

    // Check if position name already exists
    const existingPosition = positions.find(pos => 
      pos.name.toLowerCase() === newPosition.name.toLowerCase()
    );
    if (existingPosition) {
      setErrorMessage('Position name already exists');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await post<{ success: boolean; data: Position }>('/api/admin/positions', newPosition);
      if (response.success) {
        setPositions([response.data, ...positions]);
        setNewPosition({ name: '', description: '', monthlyRate: undefined });
        setShowAddForm(false);
        setErrorMessage('');
      }
    } catch (error: any) {
      console.error('Error creating position:', error);
      setErrorMessage(error.message || 'Failed to create position');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPosition = (position: Position) => {
    // Don't allow selection of already assigned positions
    if (existingProjectPositions.includes(position.name)) {
      return;
    }
    onSelectPosition(position);
    onClose();
  };

  const filteredPositions = positions.filter(position =>
    position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (position.description && position.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (position.monthlyRate && position.monthlyRate.toString().includes(searchTerm))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" style={{ backgroundColor: colors.backgroundPrimary }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
              Select Position
            </h2>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Choose an existing position or create a new one
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
            <Input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ backgroundColor: colors.backgroundSecondary }}
            />
          </div>

          {/* Add New Position Button */}
          <div className="mb-6">
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setNewPosition({ name: '', description: '', monthlyRate: undefined });
                setErrorMessage('');
              }}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel' : 'Add New Position'}</span>
            </Button>
          </div>

          {/* Add New Position Form */}
          {showAddForm && (
            <Card className="p-4 mb-6" style={{ backgroundColor: colors.backgroundSecondary }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Add New Position
              </h3>
              
              <form onSubmit={handleAddPosition} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Position Name *
                  </label>
                  <Input
                    type="text"
                    value={newPosition.name}
                    onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                    placeholder="e.g., Project Director, Site Engineer"
                    required
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Monthly Base Rate
                  </label>
                  <Input
                    type="number"
                    value={newPosition.monthlyRate || ''}
                    onChange={(e) => setNewPosition({ ...newPosition, monthlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Description
                  </label>
                  <textarea
                    value={newPosition.description}
                    onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                    placeholder="Brief description of the position..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ 
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewPosition({ name: '', description: '', monthlyRate: undefined });
                      setErrorMessage('');
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Position'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Positions List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPositions.map((position) => {
                const isAlreadyAssigned = existingProjectPositions.includes(position.name);
                return (
                  <div
                    key={position.id}
                    className={`p-4 border rounded-lg transition-shadow ${
                      isAlreadyAssigned 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:shadow-md'
                    }`}
                    style={{ 
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight
                    }}
                    onClick={() => handleSelectPosition(position)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5" style={{ color: colors.textMuted }} />
                        <div>
                          <h3 className="font-medium" style={{ color: colors.textPrimary }}>
                            {position.name}
                            {isAlreadyAssigned && (
                              <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: colors.textMuted + '20', color: colors.textMuted }}>
                                Already Assigned
                              </span>
                            )}
                          </h3>
                          {position.description && (
                            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                              {position.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {position.monthlyRate && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" style={{ color: colors.textMuted }} />
                            <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                              {position.monthlyRate.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center space-x-1"
                          disabled={isAlreadyAssigned}
                        >
                          <Check className="w-4 h-4" />
                          <span>{isAlreadyAssigned ? 'Assigned' : 'Select'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredPositions.length === 0 && !loading && (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                {searchTerm ? 'No positions found' : 'No positions available'}
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first position to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
