// src/app/(dashboard)/admin/common/BulkActions.tsx

'use client';

import { useState } from 'react';
import { FormButton } from '@/components/ui/form-button';

interface BulkActionsProps {
  selectedIds: number[];
  onAction: (action: string, options?: { reason?: string; note?: string }) => Promise<void>;
  isProcessing: boolean;
  onClear: () => void;
}

export default function BulkActions({ selectedIds, onAction, isProcessing, onClear }: BulkActionsProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const actions = [
    { value: 'approve', label: 'Approve', variant: 'success' as const, requiresNote: false },
    { value: 'reject', label: 'Reject', variant: 'danger' as const, requiresNote: true },
    { value: 'activate', label: 'Activate', variant: 'success' as const, requiresNote: false },
    { value: 'deactivate', label: 'Deactivate', variant: 'danger' as const, requiresNote: true },
    { value: 'lock', label: 'Lock', variant: 'danger' as const, requiresNote: true },
    { value: 'unlock', label: 'Unlock', variant: 'success' as const, requiresNote: false },
  ];

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    const actionConfig = actions.find(a => a.value === action);
    if (actionConfig?.requiresNote) {
      setShowOptions(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: string, options?: { reason?: string; note?: string }) => {
    try {
      await onAction(action, options);
      resetForm();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleExecuteWithOptions = () => {
    if (selectedAction) {
      executeAction(selectedAction, { reason, note });
    }
  };

  const resetForm = () => {
    setSelectedAction('');
    setShowOptions(false);
    setReason('');
    setNote('');
    onClear();
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.length} user{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center space-x-2">
            {actions.map(action => (
              <FormButton
                key={action.value}
                type="button"
                variant={action.variant}
                size="sm"
                onClick={() => handleActionSelect(action.value)}
                isLoading={isProcessing && selectedAction === action.value}
                disabled={isProcessing}
              >
                {action.label}
              </FormButton>
            ))}
          </div>
        </div>

        <button
          onClick={resetForm}
          className="text-sm text-gray-500 hover:text-gray-700"
          disabled={isProcessing}
        >
          Clear Selection
        </button>
      </div>

      {showOptions && (
        <div className="mt-4 border-t border-blue-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (required)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for this action"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter additional notes"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <FormButton
              type="button"
              onClick={handleExecuteWithOptions}
              isLoading={isProcessing}
              disabled={!reason.trim()}
            >
              Execute {selectedAction}
            </FormButton>
            <button
              onClick={() => setShowOptions(false)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
