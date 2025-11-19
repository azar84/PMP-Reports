'use client';

import React from 'react';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ConflictInfo {
  staffId: number;
  staffName: string;
  type: 'director' | 'manager';
  existingAssignment: {
    projectId: number;
    projectName: string;
    projectCode: string;
    positionId: number;
    positionName: string;
    isSameProject: boolean;
  };
  newAssignment: {
    projectId: number;
    projectName: string;
    projectCode: string;
    positionName: string;
  };
}

interface StaffMovementConfirmationDialogProps {
  conflict: ConflictInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function StaffMovementConfirmationDialog({
  conflict,
  onConfirm,
  onCancel,
}: StaffMovementConfirmationDialogProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);

  const isMovingBetweenProjects = !conflict.existingAssignment.isSameProject;
  const positionType = conflict.type === 'director' ? 'Project Director' : 'Project Manager';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card 
        className="max-w-2xl w-full"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.warning + '20' }}
              >
                <AlertTriangle 
                  className="w-6 h-6" 
                  style={{ color: colors.warning }}
                />
              </div>
              <div>
                <h2 
                  className="text-xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Staff Assignment Conflict
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {conflict.staffName} is already assigned
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg hover:opacity-80 transition-opacity"
              style={{ color: colors.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conflict Details */}
          <div className="space-y-4 mb-6">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.backgroundPrimary }}
            >
              <p 
                className="text-sm font-semibold mb-3"
                style={{ color: colors.textSecondary }}
              >
                Current Assignment
              </p>
              <div className="space-y-2">
                <p style={{ color: colors.textPrimary }}>
                  <span className="font-semibold">Project:</span>{' '}
                  {conflict.existingAssignment.projectName} ({conflict.existingAssignment.projectCode})
                </p>
                <p style={{ color: colors.textPrimary }}>
                  <span className="font-semibold">Position:</span>{' '}
                  {conflict.existingAssignment.positionName}
                </p>
              </div>
            </div>

            {isMovingBetweenProjects && (
              <div className="flex items-center justify-center my-4">
                <ArrowRight 
                  className="w-6 h-6" 
                  style={{ color: colors.primary }}
                />
              </div>
            )}

            <div 
              className="p-4 rounded-lg border-2"
              style={{ 
                backgroundColor: colors.backgroundPrimary,
                borderColor: colors.primary
              }}
            >
              <p 
                className="text-sm font-semibold mb-3"
                style={{ color: colors.primary }}
              >
                New Assignment
              </p>
              <div className="space-y-2">
                <p style={{ color: colors.textPrimary }}>
                  <span className="font-semibold">Project:</span>{' '}
                  {conflict.newAssignment.projectName} ({conflict.newAssignment.projectCode})
                </p>
                <p style={{ color: colors.textPrimary }}>
                  <span className="font-semibold">Position:</span>{' '}
                  {conflict.newAssignment.positionName}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div 
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: colors.warning + '15' }}
          >
            <p style={{ color: colors.textPrimary }}>
              {isMovingBetweenProjects ? (
                <>
                  This will move <span className="font-semibold">{conflict.staffName}</span> from{' '}
                  <span className="font-semibold">{conflict.existingAssignment.projectName}</span> to{' '}
                  <span className="font-semibold">{conflict.newAssignment.projectName}</span>.
                  {conflict.existingAssignment.positionName !== conflict.newAssignment.positionName && (
                    <> The position will change from {conflict.existingAssignment.positionName} to {conflict.newAssignment.positionName}.</>
                  )}
                  {' '}This movement will be recorded in the staff movement history.
                </>
              ) : (
                <>
                  This will change <span className="font-semibold">{conflict.staffName}</span>'s position in{' '}
                  <span className="font-semibold">{conflict.newAssignment.projectName}</span> from{' '}
                  <span className="font-semibold">{conflict.existingAssignment.positionName}</span> to{' '}
                  <span className="font-semibold">{conflict.newAssignment.positionName}</span>.
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              onClick={onCancel}
              style={{
                backgroundColor: colors.backgroundPrimary,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              style={{
                backgroundColor: colors.primary,
                color: colors.backgroundPrimary,
              }}
            >
              {isMovingBetweenProjects ? 'Move Staff' : 'Update Assignment'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

