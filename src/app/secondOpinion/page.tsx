import React from 'react';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { PageHeader } from '@/components/ui/common/pageHeader';
import SecondOpinionForm from './secondOpinionForm';

export default function SecondOpinionPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader eyebrow="second opinion" title="Pressure-test an existing treatment plan." description="Provide diagnosis, age, gender, and current medications to get a structured review of appropriateness, alternatives, additional tests, and caution points." />
      <SecondOpinionForm />
    </PageContainer>
  );
}
