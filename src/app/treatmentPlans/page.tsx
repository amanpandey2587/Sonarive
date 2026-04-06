import React from 'react';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { PageHeader } from '@/components/ui/common/pageHeader';
import TreatmentPlanForm from './TreatmentPlanForm';

export default function TreatmentPlansPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader eyebrow="treatment planning" title="Generate a practical treatment structure from a known diagnosis." description="This workflow creates a full care outline with summary, tests, medicines, lifestyle, diet, follow-up, risk factors, and prevention guidance." />
      <TreatmentPlanForm />
    </PageContainer>
  );
}
