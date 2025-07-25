//src/app/(dashboard)/patient/medications/[medicationId]/log/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import type { Prescription } from '@/types/patient.types';

export default function LogMedicationPage() {
  const router = useRouter();
  const params = useParams();
  const medicationId = Number(params.medicationId);
  
  const { medications, logMedicationTaken } = usePatientMedications();
  
  const [medication, setMedication] = useState<Prescription | null>(null);
  const [takenTime, setTakenTime] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const med = medications.find(m => m.id === medicationId);
    setMedication(med || null);
  }, [medications, medicationId]);

  const handleLogMedication = async () => {
    if (!medication) return;

    setLoading(true);
    setErrorMessage(null);
    
    try {
      await logMedicationTaken(
        medicationId,
        takenTime,
        notes || undefined
      );
      
      setSuccessMessage('Medication logged successfully!');
      setTimeout(() => {
        router.push('/patient/medications');
      }, 2000);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to log medication';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!medication) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <FormButton 
          variant="secondary" 
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back
        </FormButton>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Log Medication</h1>
        <p className="text-gray-600">Record when you took your medication</p>
      </div>

      {successMessage && (
        <FormAlert type="success" message={successMessage} dismissible onDismiss={() => setSuccessMessage(null)} />
      )}

      {errorMessage && (
        <FormAlert type="error" message={errorMessage} dismissible onDismiss={() => setErrorMessage(null)} />
      )}

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{medication.medication.name}</h2>
          <p className="text-sm text-gray-600">
            Dosage: {medication.dosage} | Frequency: {medication.frequency}
          </p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="takenTime" className="block text-sm font-medium text-gray-700 mb-2">
              Time Taken
            </label>
            <input
              id="takenTime"
              type="datetime-local"
              value={takenTime}
              onChange={(e) => setTakenTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="Any side effects, how you're feeling, or other notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>

          <div className="flex space-x-4">
            <FormButton 
              onClick={handleLogMedication}
              disabled={loading}
              className="flex-1"
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Log Medication
            </FormButton>
            <FormButton 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </FormButton>
          </div>
        </div>
      </Card>
    </div>
  );
}