import { ClinicalAccessGuard } from '@/components/guards/ClinicalAccessGuard';

export default function HealthRecordsPage() {
  return (
    <ClinicalAccessGuard>
      <div>
        <h1>Health Records</h1>
        {/* Health records content */}
      </div>
    </ClinicalAccessGuard>
  );
}