//src/app/(dashboard)/patient/medications/log/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import type { Prescription } from '@/types/patient.types';

export default function MedicationLogPage() {
  const router = useRouter();
  const { medications, loading, todaySchedule } = usePatientMedications();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Log</h1>
        <p className="text-gray-600">Log your medication intake and track adherence</p>
      </div>

      {successMessage && (
        <FormAlert type="success" message={successMessage} dismissible onDismiss={() => setSuccessMessage(null)} />
      )}

      {errorMessage && (
        <FormAlert type="error" message={errorMessage} dismissible onDismiss={() => setErrorMessage(null)} />
      )}

      {/* Today's Schedule */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Medications</h2>
        {todaySchedule.length === 0 ? (
          <p className="text-gray-500">No medications scheduled for today</p>
        ) : (
          <div className="space-y-4">
            {todaySchedule.map((scheduleItem) => (
              <div key={scheduleItem.prescription.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{scheduleItem.prescription.medication.name}</h3>
                <p className="text-sm text-gray-600">
                  Dosage: {scheduleItem.prescription.dosage}
                </p>
                
                {/* Adherence data for today */}
                <div className="mt-2 space-y-2">
                  {scheduleItem.adherence_data.map((adherence, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        {new Date(adherence.scheduled_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        {adherence.taken ? (
                          <span className="text-green-600 text-sm">✓ Taken</span>
                        ) : (
                          <FormButton
                            size="sm"
                            onClick={() => router.push(`/patient/medications/${scheduleItem.prescription.id}/log`)}
                          >
                            Log Dose
                          </FormButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* All Medications */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Medications</h2>
        <div className="grid gap-4">
          {medications.map((medication: Prescription) => (
            <div key={medication.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{medication.medication.name}</h3>
                  <p className="text-sm text-gray-600">Dosage: {medication.dosage}</p>
                  <p className="text-sm text-gray-600">Frequency: {medication.frequency}</p>
                </div>
                <FormButton
                  variant="outline"
                  onClick={() => router.push(`/patient/medications/${medication.id}/log`)}
                >
                  Log Medication
                </FormButton>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}