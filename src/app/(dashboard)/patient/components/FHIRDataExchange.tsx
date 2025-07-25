// src/app/(dashboard)/patient/components/FHIRDataExchange.tsx
import { patientService  } from "@/lib/api/services/patient.service";
import { useState } from "react";

export function FHIRDataExchange() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [exportType, setExportType] = useState<'all' | 'medications' | 'conditions' | 'observations'>('all');
  
    const handleExportFHIR = async () => {
      try {
        setIsExporting(true);
        
        const exportData = await patientService.getFHIRData({
          resource_type: exportType === 'all' ? 'Patient' : 
                        exportType === 'medications' ? 'MedicationStatement' :
                        exportType === 'conditions' ? 'Condition' : 'Observation',
          include_external: true
        });
  
        // Create and download FHIR bundle
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
          type: 'application/fhir+json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patient-fhir-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
  
      } catch (error) {
        console.error('FHIR export failed:', error);
        alert('Failed to export FHIR data. Please try again.');
      } finally {
        setIsExporting(false);
      }
    };
  
    const handleImportRequest = async () => {
      const providerName = prompt('Enter the name of your previous healthcare provider:');
      const providerAddress = prompt('Enter the address of the healthcare provider:');
      
      if (!providerName || !providerAddress) return;
  
      try {
        setIsImporting(true);
        
        const result = await patientService.requestExternalRecordsImport(
          providerName,
          providerAddress,
          {
            start: '2020-01-01',
            end: new Date().toISOString().split('T')[0]
          }
        );
  
        alert(`Records import request submitted. Request ID: ${result.request_id}`);
        
      } catch (error) {
        console.error('FHIR import request failed:', error);
        alert('Failed to submit import request. Please try again.');
      } finally {
        setIsImporting(false);
      }
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-4a2 2 0 00-2-2H8z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Health Data Exchange</h3>
        </div>
  
        <p className="text-gray-600 mb-6">
          Export your health data in FHIR format or import records from other healthcare providers.
        </p>
  
        {/* Export Section */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-3">Export Your Data</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type to Export
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Health Data</option>
              <option value="medications">Medications Only</option>
              <option value="conditions">Medical Conditions Only</option>
              <option value="observations">Vital Signs & Lab Results</option>
            </select>
          </div>
  
          <button
            onClick={handleExportFHIR}
            disabled={isExporting}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export FHIR Data'}
          </button>
        </div>
  
        {/* Import Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-3">Import Previous Records</h4>
          
          <p className="text-sm text-gray-600 mb-4">
            Request your medical records from previous healthcare providers. 
            We&apos;ll help facilitate the transfer using secure FHIR standards.
          </p>
  
          <button
            onClick={handleImportRequest}
            disabled={isImporting}
            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isImporting ? 'Submitting Request...' : 'Request Records Import'}
          </button>
        </div>
  
        {/* Information */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">About FHIR</h5>
          <p className="text-sm text-gray-600">
            FHIR (Fast Healthcare Interoperability Resources) is the international 
            standard for health data exchange. Your exported data can be used with 
            any FHIR-compatible healthcare system.
          </p>
        </div>
      </div>
    );
  }