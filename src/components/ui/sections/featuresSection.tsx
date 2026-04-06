import Link from 'next/link';
import { Brain, FileText, HeartPulse, Hospital, MapPinned, Microscope, Pill, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { title: 'Scan Analysis', description: 'Vision-first review for uploaded MRI, CT, and X-ray images.', href: '/scan', icon: Microscope },
  { title: 'Mental Wellness', description: 'Narrative intake plus PHQ-9 and GAD-7 scoring in one flow.', href: '/mentalHealth', icon: Brain },
  { title: 'Drug Research', description: 'Generics, dosage, cautions, specialist guidance, and pricing context.', href: '/drugResearch', icon: Pill },
  { title: 'Treatment Planner', description: 'Structured care plans with tests, medicines, follow-up, and prevention.', href: '/treatmentPlans', icon: Stethoscope },
  { title: 'Second Opinion', description: 'Treatment validation with adjustments, alternatives, and red flags.', href: '/secondOpinion', icon: FileText },
  { title: 'Hospital Finder', description: 'Nearby hospitals surfaced with open map data and distance-aware ranking.', href: '/smartHospitals', icon: MapPinned },
];

const process = [
  { step: '01', title: 'Start from the module you need', body: 'The app is organized around real decisions: scans, medicines, mental health, treatment planning, and hospital discovery.' },
  { step: '02', title: 'Get structured output back', body: 'Results come back as markdown or JSON-shaped views so the UI can present them cleanly instead of dumping raw model text.' },
  { step: '03', title: 'Cross-check before acting', body: 'Every screen is built to help you verify, compare, and decide what to ask a clinician next.' },
];

export default function FeaturesSection() {
  return (
    <section className="page-frame space-y-12">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
        <div className="space-y-4">
          <span className="eyebrow">module index</span>
          <h2 className="text-4xl text-foreground sm:text-5xl">A more deliberate product surface</h2>
          <p className="support-copy">
            Each page now fits into one visual system, and each module focuses on a single healthcare task instead of trying to look futuristic for its own sake.
          </p>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/about">Read the product overview</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href} className="soft-panel group p-5 transition-transform duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl text-foreground">{feature.title}</h3>
                  <div className="rounded-2xl bg-accent/12 p-3 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                <p className="mt-4 text-sm font-medium text-primary">Open workflow</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="soft-panel p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <HeartPulse className="h-5 w-5 text-primary" />
          <h3 className="text-3xl text-foreground">How the workspace is meant to be used</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {process.map((item) => (
            <div key={item.step} className="rounded-[24px] border border-border/70 bg-background/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Step {item.step}</p>
              <h4 className="mt-3 text-2xl text-foreground">{item.title}</h4>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
