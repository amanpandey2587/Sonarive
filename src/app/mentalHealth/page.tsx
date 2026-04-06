import React from 'react';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { PageHeader } from '@/components/ui/common/pageHeader';
import MentalHealthForm from './mentalHealthForm';

export default function MentalHealthPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader eyebrow="mental wellness" title="Check in, score symptoms, and get a structured support plan." description="This flow combines demographic context, optional narrative intake, PHQ-9, and GAD-7 responses into a single markdown report with safety framing and practical next steps." />
      <MentalHealthForm />
    </PageContainer>
  );
}
