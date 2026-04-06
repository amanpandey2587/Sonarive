import { PageContainer } from '@/components/ui/common/pageContainer';
import { PageHeader } from '@/components/ui/common/pageHeader';
import ScanForm from './scanForm';

export default function ScanPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader eyebrow="scan analysis" title="Upload imaging, review findings, and expand into a care report." description="Start with a scan summary, then optionally generate a broader medical report that folds in age, gender, and your clinical concern." />
      <ScanForm />
    </PageContainer>
  );
}
