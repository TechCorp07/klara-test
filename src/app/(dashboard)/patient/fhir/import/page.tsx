// src/app/(dashboard)/patient/fhir/import/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

export default function FHIRImportPage() {
  const router = useRouter();
  const [importRequest, setImportRequest] = useState({
    provider_name: '',
    provider_type: 'hospital',
    contact_info: '',
    data_types: [] as string[],
    date_range_start: '',
    date_range_end: '',
    notes: ''
  });

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setImportRequest({
        ...importRequest,
        data_types: [...importRequest.data_types, dataType]
      });
    } else {
      setImportRequest({
        ...importRequest,
        data_types: importRequest.data_types.filter(type => type !== dataType)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      router.push('/patient?tab=health');
    } catch (error) {
      console.error('Failed to submit import request:', error);
      alert('Failed to submit import request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Import Medical Records</h1>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We&apos;ll contact your previous healthcare provider on your behalf</li>
              <li>• Your records will be securely transferred using FHIR standards</li>
              <li>• You&apos;ll be notified when the import is complete</li>
              <li>• All data transfers are HIPAA compliant and encrypted</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Provider Name *
                </label>
                <input
                  type="text"
                  value={importRequest.provider_name}
                  onChange={(e) => setImportRequest({...importRequest, provider_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Mayo Clinic, Johns Hopkins"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type
                </label>
                <select
                  value={importRequest.provider_type}
                  onChange={(e) => setImportRequest({...importRequest, provider_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="specialist">Specialist Office</option>
                  <option value="primary_care">Primary Care</option>
                  <option value="lab">Laboratory</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <input
                type="text"
                value={importRequest.contact_info}
                onChange={(e) => setImportRequest({...importRequest, contact_info: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Phone number, email, or address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Types of Data to Import *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'medications', 'lab_results', 'imaging', 'procedures',
                  'allergies', 'immunizations', 'vital_signs', 'diagnoses',
                  'care_plans', 'clinical_notes'
                ].map((dataType) => (
                  <label key={dataType} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={importRequest.data_types.includes(dataType)}
                      onChange={(e) => handleDataTypeChange(dataType, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">
                      {dataType.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={importRequest.date_range_start}
                  onChange={(e) => setImportRequest({...importRequest, date_range_start: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={importRequest.date_range_end}
                  onChange={(e) => setImportRequest({...importRequest, date_range_end: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={importRequest.notes}
                onChange={(e) => setImportRequest({...importRequest, notes: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Any specific information that might help locate your records..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Import Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}