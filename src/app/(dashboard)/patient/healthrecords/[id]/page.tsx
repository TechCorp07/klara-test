// src/app/(dashboard)/patient/healthrecords/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { patientService } from '@/lib/api/services/patient.service';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Download,
  Share2,
  Edit,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Pill,
  Activity,
  Heart,
  FlaskConical,
  Shield,
  Users,
  Star,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface HealthRecordDetail {
  id: number;
  record_type: string;
  title: string;
  date: string;
  status: string;
  is_critical: boolean;
  provider?: {
    id: number;
    name: string;
    specialty: string;
    contact_info?: {
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  summary?: string;
  content?: string;
  notes?: string;
  attachments?: Array<{
    id: number;
    filename: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
  }>;
  related_records?: Array<{
    id: number;
    title: string;
    record_type: string;
    date: string;
  }>;
  created_at: string;
  updated_at: string;
  // Condition-specific fields
  diagnosis_code?: string;
  severity?: string;
  is_rare_condition?: boolean;
  rare_condition_details?: {
    orpha_code?: string;
    prevalence?: string;
    inheritance_pattern?: string;
  };
  // Lab result-specific fields
  result_value?: string;
  reference_range?: string;
  unit?: string;
  is_abnormal?: boolean;
  // Medication-specific fields
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  // Vital signs-specific fields
  measurements?: Record<string, number>;
}

export default function HealthRecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getUserRole } = useAuth();
  const [record, setRecord] = useState<HealthRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingAttachment, setDownloadingAttachment] = useState<number | null>(null);

  const recordId = params.id as string;

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  // Fetch record details
  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId || isNaN(Number(recordId))) {
        setError('Invalid record ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // This would call the API to get detailed record information
        const response = await patientService.getHealthRecordDetail(Number(recordId));
        setRecord(response);
      } catch (err) {
        console.error('Failed to fetch health record:', err);
        setError(err instanceof Error ? err.message : 'Failed to load health record');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const handleDownloadRecord = async () => {
    if (!record) return;
    
    try {
      await patientService.downloadLabResult(record.id);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      setDownloadingAttachment(attachmentId);
      // This would call a specific attachment download endpoint
      await patientService.downloadAttachment(attachmentId);
    } catch (error) {
      console.error('Attachment download failed:', error);
    } finally {
      setDownloadingAttachment(null);
    }
  };

  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'condition': return Heart;
      case 'medication': return Pill;
      case 'lab_result': return FlaskConical;
      case 'vital_sign': return Activity;
      case 'allergy': return Shield;
      case 'family_history': return Users;
      case 'immunization': return Shield;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preliminary':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading health record...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Record Not Found</h3>
              <p className="text-gray-600 mb-4">{error || 'The requested health record could not be found.'}</p>
              <button
                onClick={() => router.push('/patient/healthrecords')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Health Records
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const RecordIcon = getRecordIcon(record.record_type);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/patient/healthrecords')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Health Records
          </button>
          <div className="flex items-center">
            <RecordIcon className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{record.title}</h1>
              <p className="text-gray-600">
                {record.record_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {new Date(record.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Record Overview */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Record Details</h2>
                  
                  {record.is_critical && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Critical
                    </span>
                  )}
                  
                  {record.is_rare_condition && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Star className="w-3 h-3 mr-1" />
                      Rare Condition
                    </span>
                  )}
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadRecord}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded"
                    title="Download record"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded" title="Share record">
                    <Share2 className="w-4 h-4" />
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded" title="Edit record">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Record-specific content */}
              {record.summary && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700">{record.summary}</p>
                </div>
              )}

              {record.content && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{record.content}</div>
                </div>
              )}

              {/* Condition-specific fields */}
              {record.record_type === 'condition' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {record.diagnosis_code && (
                    <div>
                      <span className="font-medium text-gray-900">Diagnosis Code: </span>
                      <span className="text-gray-700">{record.diagnosis_code}</span>
                    </div>
                  )}
                  {record.severity && (
                    <div>
                      <span className="font-medium text-gray-900">Severity: </span>
                      <span className={`capitalize ${
                        record.severity === 'critical' ? 'text-red-600' :
                        record.severity === 'severe' ? 'text-orange-600' :
                        record.severity === 'moderate' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {record.severity}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Rare condition details */}
              {record.is_rare_condition && record.rare_condition_details && (
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Rare Disease Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {record.rare_condition_details.orpha_code && (
                      <div>
                        <span className="font-medium text-purple-800">ORPHA Code: </span>
                        <span className="text-purple-700">{record.rare_condition_details.orpha_code}</span>
                      </div>
                    )}
                    {record.rare_condition_details.prevalence && (
                      <div>
                        <span className="font-medium text-purple-800">Prevalence: </span>
                        <span className="text-purple-700">{record.rare_condition_details.prevalence}</span>
                      </div>
                    )}
                    {record.rare_condition_details.inheritance_pattern && (
                      <div>
                        <span className="font-medium text-purple-800">Inheritance: </span>
                        <span className="text-purple-700">{record.rare_condition_details.inheritance_pattern}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lab result-specific fields */}
              {record.record_type === 'lab_result' && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Lab Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {record.result_value && (
                      <div>
                        <span className="font-medium text-blue-800">Result: </span>
                        <span className={`${record.is_abnormal ? 'text-red-700 font-medium' : 'text-blue-700'}`}>
                          {record.result_value} {record.unit && record.unit}
                        </span>
                      </div>
                    )}
                    {record.reference_range && (
                      <div>
                        <span className="font-medium text-blue-800">Reference Range: </span>
                        <span className="text-blue-700">{record.reference_range}</span>
                      </div>
                    )}
                    {record.is_abnormal !== undefined && (
                      <div>
                        <span className="font-medium text-blue-800">Status: </span>
                        <span className={record.is_abnormal ? 'text-red-700 font-medium' : 'text-green-700'}>
                          {record.is_abnormal ? 'Abnormal' : 'Normal'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medication-specific fields */}
              {record.record_type === 'medication' && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-green-900 mb-2">Medication Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {record.dosage && (
                      <div>
                        <span className="font-medium text-green-800">Dosage: </span>
                        <span className="text-green-700">{record.dosage}</span>
                      </div>
                    )}
                    {record.frequency && (
                      <div>
                        <span className="font-medium text-green-800">Frequency: </span>
                        <span className="text-green-700">{record.frequency}</span>
                      </div>
                    )}
                    {record.start_date && (
                      <div>
                        <span className="font-medium text-green-800">Start Date: </span>
                        <span className="text-green-700">{new Date(record.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {record.end_date && (
                      <div>
                        <span className="font-medium text-green-800">End Date: </span>
                        <span className="text-green-700">{new Date(record.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vital signs-specific fields */}
              {record.record_type === 'vital_sign' && record.measurements && (
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-orange-900 mb-2">Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(record.measurements).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium text-orange-800 capitalize">
                          {key.replace('_', ' ')}: 
                        </span>
                        <span className="text-orange-700"> {value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{record.notes}</p>
                </div>
              )}
            </Card>

            {/* Attachments */}
            {record.attachments && record.attachments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                <div className="space-y-3">
                  {record.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-sm text-gray-500">
                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB • 
                            {new Date(attachment.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadAttachment(attachment.id, attachment.filename)}
                        disabled={downloadingAttachment === attachment.id}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
                        title="Download attachment"
                      >
                        {downloadingAttachment === attachment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Related Records */}
            {record.related_records && record.related_records.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Records</h3>
                <div className="space-y-3">
                  {record.related_records.map((relatedRecord) => (
                    <div
                      key={relatedRecord.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/patient/healthrecords/${relatedRecord.id}`)}
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{relatedRecord.title}</p>
                          <p className="text-sm text-gray-500">
                            {relatedRecord.record_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • 
                            {new Date(relatedRecord.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Information */}
            {record.provider && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{record.provider.name}</p>
                      <p className="text-sm text-gray-600">{record.provider.specialty}</p>
                    </div>
                  </div>
                  
                  {record.provider.contact_info && (
                    <div className="mt-4 space-y-2">
                      {record.provider.contact_info.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{record.provider.contact_info.phone}</span>
                        </div>
                      )}
                      {record.provider.contact_info.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{record.provider.contact_info.email}</span>
                        </div>
                      )}
                      {record.provider.contact_info.address && (
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{record.provider.contact_info.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Record Metadata */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-600">Record Date</p>
                    <p className="font-medium text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">{new Date(record.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">{new Date(record.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadRecord}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Record
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Record
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Record
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}