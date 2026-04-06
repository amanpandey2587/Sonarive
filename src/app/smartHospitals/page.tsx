'use client'
import dynamic from 'next/dynamic';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { PageHeader } from '@/components/ui/common/pageHeader';

const HospitalRecsForm = dynamic(
  () => import('./hospitalRecsForm').then((mod) => mod.HospitalRecsForm),
  { 
    ssr: false,
    loading: () => <p className="text-muted-foreground text-sm">Loading map...</p>
  }
);

export default function SmartHospitalsPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader eyebrow="hospital discovery" title="Find nearby hospitals on a fully open map stack." description="Use diagnosis, symptoms, and current location to discover nearby facilities ranked by distance and likely specialty fit from OpenStreetMap directory data." />
      <HospitalRecsForm />
    </PageContainer>
  );
}