// src/app/(dashboard)/patient/components/dashboard/FHIRDataWidget.tsx
import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface FHIRExport {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resource_types: string[];
  created_at: string;
  completed_at?: string;
  download_url?: string;
  file_size?: number;
  expires_at?: string;
}

interface FHIRImportRequest {
  id: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'denied';
  requested_data: string;
  source_institution: string;
  reason: string;
  requested_at: string;
  approved_at?: string;
}

interface FHIRDataProps {
  onRequestImport?: () => void;
  onExportData?: () => void;
}

export function FHIRDataWidget({ onRequestImport, onExportData }: FHIRDataProps) {
  const [exports, setExports] = useState<FHIRExport[]>([]);
  const [importRequests, setImportRequests] = useState<FHIRImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFHIRData();
  }, []);

  const fetchFHIRData = async () => {
    try {
      setLoading(true);
      // This would be implemented with actual FHIR endpoints
      // For now, using mock data structure
      setExports([]);
      setImportRequests([]);
    } catch (err) {
      setError('Failed to load FHIR data');
      console.error('Error fetching FHIR data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (resourceTypes: string[] = ['Patient', 'Observation', 'MedicationStatement', 'Condition']) => {
    try {
      setExporting(true);
      const response = await apiClient.post(ENDPOINTS.PATIENT.FHIR_EXPORT, {
        resource_types: resourceTypes,
        include_external: true,
        format: 'json'
      });
      
      const newExport: FHIRExport = {
        id: response.data.export_id,
        status: 'pending',
        resource_types: resourceTypes,
        created_at: new Date().toISOString()
      };
      
      setExports(prev => [newExport, ...prev]);
      onExportData?.();
    } catch (err) {
      setError('Failed to initiate data export');
      console.error('Error exporting FHIR data:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleRequestImport = async () => {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.FHIR_IMPORT_REQUEST, {
        requested_data: 'Complete medical history',
        source_institution: 'External Healthcare Provider',
        reason: 'Comprehensive rare disease treatment planning',
        include_family_history: true
      });
      
      onRequestImport?.();
    } catch (err) {
      setError('Failed to request data import');
      console.error('Error requesting FHIR import:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'failed':
      case 'denied':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'processing':
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'failed':
      case 'denied':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Database className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">FHIR Data Exchange</h3>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleExportData()}
          disabled={exporting}
          className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export My Data'}
        </button>
        
        <button
          onClick={handleRequestImport}
          className="flex items-center justify-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Request Import
        </button>
      </div>

      {/* Recent Exports */}
      {exports.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Recent Exports</h4>
          <div className="space-y-2">
            {exports.slice(0, 2).map((exportItem) => (
              <div key={exportItem.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(exportItem.status)}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      Health Data Export
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(exportItem.status)}`}>
                    {exportItem.status}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  Resources: {exportItem.resource_types.join(', ')}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {formatDate(exportItem.created_at)}</span>
                  {exportItem.file_size && (
                    <span>Size: {formatFileSize(exportItem.file_size)}</span>
                  )}
                </div>

                {exportItem.status === 'completed' && exportItem.download_url && (
                  <div className="mt-2">
                    <a
                      href={exportItem.download_url}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      download
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Import Requests */}
      {importRequests.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Import Requests</h4>
          <div className="space-y-2">
            {importRequests.slice(0, 2).map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(request.status)}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {request.source_institution}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 mb-1">
                  {request.requested_data}
                </div>
                
                <div className="text-xs text-gray-500">
                  Requested: {formatDate(request.requested_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-2">What is FHIR?</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Fast Healthcare Interoperability Resources (FHIR) enables secure health data exchange</p>
          <p>• Export your complete medical history in a standardized format</p>
          <p>• Import previous medical records from other healthcare providers</p>
          <p>• All data transfers are encrypted and HIPAA compliant</p>
        </div>
      </div>

      {/* No Data State */}
      {exports.length === 0 && importRequests.length === 0 && (
        <div className="text-center py-4 border-t border-gray-200">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">No data exchange history</p>
          <p className="text-xs text-gray-400 mt-1">
            Export your data or request medical records from other providers
          </p>
        </div>
      )}
    </div>
  );
}