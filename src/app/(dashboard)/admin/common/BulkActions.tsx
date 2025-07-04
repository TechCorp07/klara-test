// src/app/(dashboard)/admin/common/BulkActions.tsx
'use client';

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import FormButton from '@/components/ui/common/FormButton';
import { Spinner } from '@/components/ui/spinner';

interface BulkActionsProps {
  selectedItems: number[]; // Array of user IDs
  selectedUserIds: number[];
  onAction: (action: string, note?: string) => Promise<void>;
  onSelectAll: () => void;
  onBulkApprove: () => Promise<void>;
  onDeselectAll: () => void;
  onBulkDeny: () => Promise<void>;
  //users: EnhancedUser[];
  canPerformActions: boolean;
  onClearSelection: () => void;
  totalItems: number;
  isAllSelected: boolean;
  isProcessing?: boolean;
  actionType?: 'users' | 'approvals' | 'general';
}

interface ActionConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  requiresNote?: boolean;
  confirmMessage?: string;
  permission?: string;
}

export function BulkActions({
  selectedItems,
  onAction,
  onSelectAll,
  onClearSelection,
  totalItems,
  isAllSelected,
  isProcessing = false,
  actionType = 'users',
}: BulkActionsProps) {
  const { permissions } = usePermissions();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [actionNote, setActionNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const getAvailableActions = (): ActionConfig[] => {
    const baseActions: ActionConfig[] = [];

    if (actionType === 'users' || actionType === 'approvals') {
      if (permissions?.has_user_management_access) {
        baseActions.push(
          {
            id: 'approve',
            label: 'Approve Selected',
            icon: '✓',
            color: 'green',
            requiresNote: true,
            permission: 'user_management',
          },
          {
            id: 'reject',
            label: 'Reject Selected',
            icon: '✗',
            color: 'red',
            requiresNote: true,
            confirmMessage: 'Are you sure you want to reject these users? This action cannot be undone.',
            permission: 'user_management',
          },
          {
            id: 'activate',
            label: 'Activate Selected',
            icon: '🔓',
            color: 'blue',
            requiresNote: false,
            permission: 'user_management',
          },
          {
            id: 'deactivate',
            label: 'Deactivate Selected',
            icon: '🔒',
            color: 'orange',
            requiresNote: true,
            confirmMessage: 'Are you sure you want to deactivate these users?',
            permission: 'user_management',
          }
        );
      }

      if (permissions?.has_admin_access) {
        baseActions.push(
          {
            id: 'lock',
            label: 'Lock Accounts',
            icon: '🚫',
            color: 'red',
            requiresNote: true,
            confirmMessage: 'Are you sure you want to lock these accounts?',
            permission: 'admin',
          },
          {
            id: 'unlock',
            label: 'Unlock Accounts',
            icon: '🔓',
            color: 'green',
            requiresNote: false,
            permission: 'admin',
          },
          {
            id: 'reset_password',
            label: 'Force Password Reset',
            icon: '🔄',
            color: 'yellow',
            requiresNote: true,
            confirmMessage: 'Users will be required to reset their passwords on next login.',
            permission: 'admin',
          }
        );
      }
    }

    if (actionType === 'general') {
      baseActions.push(
        {
          id: 'export',
          label: 'Export Selected',
          icon: '📥',
          color: 'blue',
          requiresNote: false,
          permission: 'export',
        },
        {
          id: 'send_notification',
          label: 'Send Notification',
          icon: '📧',
          color: 'purple',
          requiresNote: true,
          permission: 'notifications',
        }
      );
    }

    return baseActions.filter(action => {
      // Filter based on permissions
      if (action.permission === 'user_management') {
        return permissions?.has_user_management_access;
      }
      if (action.permission === 'admin') {
        return permissions?.has_admin_access;
      }
      return true;
    });
  };

  const handleActionClick = (action: ActionConfig) => {
    setCurrentAction(action.id);
    
    if (action.confirmMessage) {
      setIsConfirming(true);
    } else if (action.requiresNote) {
      setShowNoteModal(true);
    } else {
      executeAction(action.id);
    }
  };

  const executeAction = async (actionId: string, note?: string) => {
    try {
      await onAction(actionId, note);
      setShowNoteModal(false);
      setIsConfirming(false);
      setActionNote('');
      setCurrentAction('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const availableActions = getAvailableActions();

  if (selectedItems.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Select items to perform bulk actions
          </span>
          <button
            onClick={onSelectAll}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Select All ({totalItems})
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              {!isAllSelected && (
                <button
                  onClick={onSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Select All ({totalItems})
                </button>
              )}
              <button
                onClick={onClearSelection}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {availableActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={isProcessing}
                className={`
                  inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md
                  ${action.color === 'green' && 'text-green-700 bg-green-100 hover:bg-green-200'}
                  ${action.color === 'red' && 'text-red-700 bg-red-100 hover:bg-red-200'}
                  ${action.color === 'blue' && 'text-blue-700 bg-blue-100 hover:bg-blue-200'}
                  ${action.color === 'orange' && 'text-orange-700 bg-orange-100 hover:bg-orange-200'}
                  ${action.color === 'yellow' && 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'}
                  ${action.color === 'purple' && 'text-purple-700 bg-purple-100 hover:bg-purple-200'}
                  ${isProcessing && 'opacity-50 cursor-not-allowed'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                {isProcessing && currentAction === action.id ? (
                  <Spinner size="sm" className="mr-1" />
                ) : (
                  <span className="mr-1">{action.icon}</span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Note for Action
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason/Note (optional):
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for this action..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setActionNote('');
                    setCurrentAction('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <FormButton
                  onClick={() => executeAction(currentAction, actionNote)}
                  isLoading={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm Action
                </FormButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Action
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {availableActions.find(a => a.id === currentAction)?.confirmMessage}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsConfirming(false);
                    setCurrentAction('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <FormButton
                  onClick={() => executeAction(currentAction)}
                  isLoading={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Confirm
                </FormButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BulkActions;