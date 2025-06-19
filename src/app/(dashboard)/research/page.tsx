import { ResearchGuard } from '@/components/guards/ResearchGuard';

export default function ResearchPage() {
  return (
    <ResearchGuard>
      <div>
        <h1>Research Projects</h1>
        {/* Research content */}
      </div>
    </ResearchGuard>
  );
}