'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Pause, 
  XCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  GripVertical
} from 'lucide-react';

interface ChecklistItem {
  id: number;
  itemNumber?: string;
  phase: string;
  plannedDate?: string;
  actualDate?: string;
  status?: string;
  notes?: string;
  isSubItem: boolean;
  parentItemId?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectChecklistProps {
  projectId: number;
  projectName: string;
}

const statusOptions = [
  { value: 'Pending', label: 'Pending', color: 'text-gray-500', icon: Clock },
  { value: 'In Progress', label: 'In Progress', color: 'text-blue-500', icon: AlertCircle },
  { value: 'Completed', label: 'Completed', color: 'text-green-500', icon: CheckCircle2 },
  { value: 'On Hold', label: 'On Hold', color: 'text-yellow-500', icon: Pause },
  { value: 'Cancelled', label: 'Cancelled', color: 'text-red-500', icon: XCircle },
];

export default function ProjectChecklist({ projectId, projectName }: ProjectChecklistProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<ChecklistItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const addFormRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    phase: '',
    status: 'Pending',
  });

  useEffect(() => {
    fetchChecklist();
  }, [projectId]);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: ChecklistItem[] }>(`/api/admin/projects/${projectId}/checklist`);
      if (response.success) {
        setChecklistItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeChecklist = async () => {
    try {
      const response = await post<{ success: boolean; data: ChecklistItem[] }>(`/api/admin/projects/${projectId}/checklist/initialize`, {});
      if (response.success) {
        setChecklistItems(response.data);
      }
    } catch (error) {
      console.error('Error initializing checklist:', error);
    }
  };

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item.id);
    setEditingData({
      plannedDate: item.plannedDate ? new Date(item.plannedDate).toISOString().split('T')[0] : '',
      actualDate: item.actualDate ? new Date(item.actualDate).toISOString().split('T')[0] : '',
      status: item.status || 'Pending',
      notes: item.notes || '',
    });
  };

  const handleSave = async (itemId: number) => {
    try {
      const item = checklistItems.find(i => i.id === itemId);
      if (!item) return;

      const updateData = {
        ...item,
        ...editingData,
      };

      const response = await put<{ success: boolean; data: ChecklistItem }>(`/api/admin/projects/${projectId}/checklist/${itemId}`, updateData);
      if (response.success) {
        setChecklistItems(items => 
          items.map(item => item.id === itemId ? response.data : item)
        );
        setEditingItem(null);
        setEditingData({});
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      const itemData = {
        ...newItem,
        itemNumber: '', // Add empty itemNumber
        isSubItem: false,
        parentItemId: undefined,
        order: checklistItems.length, // Set order to end of list
      };
      
      const response = await post<{ success: boolean; data: ChecklistItem }>(`/api/admin/projects/${projectId}/checklist`, itemData);
      if (response.success) {
        setChecklistItems(items => [...items, response.data]);
        setNewItem({
          phase: '',
          status: 'Pending',
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (addFormRef.current) {
        addFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm('Are you sure you want to delete this checklist item?')) {
      try {
        const response = await del(`/api/admin/projects/${projectId}/checklist/${itemId}`) as { success: boolean };
        if (response.success) {
          setChecklistItems(items => items.filter(item => item.id !== itemId));
        }
      } catch (error) {
        console.error('Error deleting checklist item:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return Clock;
    return statusOption.icon;
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return 'text-gray-500';
    return statusOption.color;
  };

  // Get available parent items (items that are not sub-items)
  const getAvailableParentItems = () => {
    return checklistItems.filter(item => !item.isSubItem);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(itemId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetItemId: number) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetItemId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedItemData = checklistItems.find(item => item.id === draggedItem);
    const targetItemData = checklistItems.find(item => item.id === targetItemId);

    if (!draggedItemData || !targetItemData) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Reorder items
    const newItems = [...checklistItems];
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem);
    const targetIndex = newItems.findIndex(item => item.id === targetItemId);

    // Remove dragged item
    const [draggedItemObj] = newItems.splice(draggedIndex, 1);
    
    // Insert at new position
    newItems.splice(targetIndex, 0, draggedItemObj);

    setChecklistItems(newItems);
    setDraggedItem(null);
    setDragOverItem(null);

    // TODO: Update order in database
  };

  // Indent/Outdent handlers
  const handleIndent = async (itemId: number) => {
    const item = checklistItems.find(i => i.id === itemId);
    if (!item) return;

    const itemIndex = checklistItems.findIndex(i => i.id === itemId);
    if (itemIndex === 0) return; // Can't indent first item

    const previousItem = checklistItems[itemIndex - 1];
    
    // Smart demote logic:
    // 1. If previous item has a parent, inherit that parent
    // 2. If previous item is a parent item, become its sub-item
    // 3. If previous item is a sub-item, become sibling under its parent
    
    let newParentId: number | undefined;
    
    if (previousItem.isSubItem && previousItem.parentItemId) {
      // Previous item is a sub-item, inherit its parent
      newParentId = previousItem.parentItemId;
    } else if (!previousItem.isSubItem) {
      // Previous item is a parent item, become its sub-item
      newParentId = previousItem.id;
    }

    if (newParentId === undefined) return;

    try {
      const response = await put(`/api/admin/projects/${projectId}/checklist/${itemId}`, {
        ...item,
        isSubItem: true,
        parentItemId: newParentId,
      }) as { success: boolean };

      if (response.success) {
        setChecklistItems(items => 
          items.map(i => 
            i.id === itemId 
              ? { ...i, isSubItem: true, parentItemId: newParentId }
              : i
          )
        );
      }
    } catch (error) {
      console.error('Error indenting item:', error);
    }
  };

  const handleOutdent = async (itemId: number) => {
    const item = checklistItems.find(i => i.id === itemId);
    if (!item || !item.isSubItem) return;

    // Smart promote logic:
    // 1. If current item has siblings (same parent), promote to same level as parent
    // 2. If current item is only child, promote to same level as parent
    // 3. Always promote to parent level (remove sub-item status)
    
    try {
      const response = await put(`/api/admin/projects/${projectId}/checklist/${itemId}`, {
        ...item,
        isSubItem: false,
        parentItemId: undefined,
      }) as { success: boolean };

      if (response.success) {
        setChecklistItems(items => 
          items.map(i => 
            i.id === itemId 
              ? { ...i, isSubItem: false, parentItemId: undefined }
              : i
          )
        );
      }
    } catch (error) {
      console.error('Error outdenting item:', error);
    }
  };

  // Save current arrangement as default template
  const handleSaveAsDefault = async () => {
    if (!confirm('Are you sure you want to save the current checklist arrangement as the default template for new projects?')) {
      return;
    }

    setSavingTemplate(true);
    try {
      // Convert current checklist items to template format
      const templateItems = checklistItems.map((item, index) => {
        const parentItem = item.parentItemId 
          ? checklistItems.find(p => p.id === item.parentItemId)
          : null;

        return {
          phase: item.phase,
          isSubItem: item.isSubItem,
          parentPhase: parentItem?.phase,
          order: index + 1,
        };
      });

      const response = await post('/api/admin/checklist-template', {
        items: templateItems,
      }) as { success: boolean };

      if (response.success) {
        alert('Checklist template saved successfully! New projects will use this arrangement.');
      } else {
        alert('Failed to save template. Please try again.');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    } finally {
      setSavingTemplate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Project Checklist
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {projectName}
          </p>
        </div>
        <div className="flex space-x-3">
          {checklistItems.length === 0 && (
            <Button
              onClick={initializeChecklist}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Initialize Default Checklist</span>
            </Button>
          )}
          <Button
            onClick={handleShowAddForm}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
          {checklistItems.length > 0 && (
            <Button
              onClick={handleSaveAsDefault}
              variant="primary"
              className="flex items-center space-x-2"
              disabled={savingTemplate}
            >
              <Save className="w-4 h-4" />
              <span>{savingTemplate ? 'Saving...' : 'Save as Default'}</span>
            </Button>
          )}
        </div>
      </div>

      {checklistItems.length === 0 ? (
        <Card className="p-8 text-center" style={{ backgroundColor: colors.backgroundSecondary }}>
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            No Checklist Items
          </h3>
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            Initialize the default project checklist or add custom items to get started.
          </p>
          <Button
            onClick={initializeChecklist}
            variant="primary"
            className="flex items-center space-x-2 mx-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Initialize Default Checklist</span>
          </Button>
        </Card>
      ) : (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/20" style={{ backgroundColor: colors.backgroundPrimary }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Drag</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Phase</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Planned Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actual Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Notes</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checklistItems.map((item) => {
                  const StatusIcon = getStatusIcon(item.status || 'Pending');
                  const statusColor = getStatusColor(item.status || 'Pending');
                  
                  // Check if this item has children (sub-items)
                  const hasChildren = checklistItems.some(child => 
                    child.isSubItem && child.parentItemId === item.id
                  );
                  
                  const isHeaderItem = !item.isSubItem && hasChildren;
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-gray-200/10 hover:opacity-75 ${
                        draggedItem === item.id ? 'opacity-50' : ''
                      } ${
                        dragOverItem === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item.id)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <GripVertical 
                            className="w-4 h-4 cursor-move text-gray-400 hover:text-gray-600" 
                            style={{ color: colors.textSecondary }}
                          />
                          <div className="flex flex-col space-y-1">
                            <Button
                              onClick={() => handleIndent(item.id)}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                              disabled={checklistItems.findIndex(i => i.id === item.id) === 0}
                              title="Demote (inherit parent from previous item)"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleOutdent(item.id)}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                              disabled={!item.isSubItem}
                              title="Promote (move to parent level)"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          className={`${item.isSubItem ? 'ml-4 text-sm' : ''} ${isHeaderItem ? 'font-semibold' : ''}`}
                          style={{ color: colors.textPrimary }}
                        >
                          {item.phase}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {editingItem === item.id ? (
                          <Input
                            type="date"
                            value={editingData.plannedDate || ''}
                            onChange={(e) => setEditingData({ ...editingData, plannedDate: e.target.value })}
                            className="w-32"
                          />
                        ) : (
                          <span style={{ color: colors.textSecondary }}>
                            {item.plannedDate ? new Date(item.plannedDate).toLocaleDateString() : '-'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingItem === item.id ? (
                          <Input
                            type="date"
                            value={editingData.actualDate || ''}
                            onChange={(e) => setEditingData({ ...editingData, actualDate: e.target.value })}
                            className="w-32"
                          />
                        ) : (
                          <span style={{ color: colors.textSecondary }}>
                            {item.actualDate ? new Date(item.actualDate).toLocaleDateString() : '-'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingItem === item.id ? (
                          <select
                            value={editingData.status || 'Pending'}
                            onChange={(e) => setEditingData({ ...editingData, status: e.target.value })}
                            className="px-2 py-1 rounded border border-gray-200/10"
                            style={{ 
                              backgroundColor: colors.backgroundPrimary,
                              color: colors.textPrimary 
                            }}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                            <span className={statusColor}>
                              {item.status || 'Pending'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingItem === item.id ? (
                          <Input
                            type="text"
                            value={editingData.notes || ''}
                            onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                            placeholder="Add notes..."
                            className="w-48"
                          />
                        ) : (
                          <span style={{ color: colors.textSecondary }}>
                            {item.notes || '-'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {isHeaderItem ? (
                            <span className="text-xs text-gray-500 italic">Header Item</span>
                          ) : editingItem === item.id ? (
                            <>
                              <Button
                                onClick={() => handleSave(item.id)}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingItem(null);
                                  setEditingData({});
                                }}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleEdit(item)}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Item Modal */}
      {showAddForm && (
        <Card 
          ref={addFormRef}
          className="p-6" 
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            Add New Checklist Item
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Status
              </label>
              <select
                value={newItem.status || 'Pending'}
                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200/10"
                style={{ 
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary 
                }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Phase Description
              </label>
              <Input
                type="text"
                value={newItem.phase || ''}
                onChange={(e) => setNewItem({ ...newItem, phase: e.target.value })}
                placeholder="Enter phase description..."
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-6">
            <Button
              onClick={() => {
                setShowAddForm(false);
                setNewItem({
                  phase: '',
                  status: 'Pending',
                });
              }}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              variant="primary"
              disabled={!newItem.phase}
            >
              Add Item
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
