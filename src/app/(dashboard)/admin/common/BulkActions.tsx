// src/components/admin/BulkActions.tsx
'use client';
import { User } from '@/types/auth.types';

interface BulkActionsProps {
  selectedUserIds: number[];
  onSelectAll: (users: User[]) => void;
  onDeselectAll: () => void;
  onBulkApprove: () => void;
  onBulkDeny: () => void;
  users: User[];
  canPerformActions: boolean;
  isProcessing?: boolean;
}

export const BulkActions = ({ 
  selectedUserIds, 
  onSelectAll, 
  onDeselectAll, 
  onBulkApprove, 
  onBulkDeny, 
  users,
  canPerformActions,
  isProcessing = false
}: BulkActionsProps) => {
  const allSelected = selectedUserIds.length === users.length && users.length > 0;
  const someSelected = selectedUserIds.length > 0;
  const partiallySelected = someSelected && !allSelected;

  const handleSelectAllChange = () => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll(users);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 border">
      <div className="flex items-center justify-between">
        {/* Selection Controls */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = partiallySelected;
              }}
              onChange={handleSelectAllChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
          </label>
          
          {someSelected && (
            <span className="text-sm text-blue-600 font-medium">
              {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        
        {/* Bulk Action Buttons */}
        {someSelected && (
          <div className="flex items-center space-x-2">
            {canPerformActions ? (
              <>
                <button
                  onClick={onBulkApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Bulk Approve ({selectedUserIds.length})</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={onBulkDeny}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Bulk Deny ({selectedUserIds.length})</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-500 italic bg-gray-100 px-3 py-2 rounded">
                View Only - Contact administrator for bulk operation permissions
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {!someSelected && (
        <div className="mt-2 text-xs text-gray-500">
          Select users using the checkboxes to perform bulk approve or deny operations
        </div>
      )}
    </div>
  );
};