import React from 'react';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { PageHeader } from '@/components/ui/common/pageHeader';
import { DrugInfoForm } from './drugInfoForm';

export default function DrugResearchPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader eyebrow="medication research" title="Research a medicine list without leaving the workspace." description="Paste one or more drug names and get structured output covering generics, dosing, common side effects, allergies, and specialist context." />
      <DrugInfoForm />
    </PageContainer>
  );
}
