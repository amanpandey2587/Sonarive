import Link from 'next/link';
import { CalendarClock, FileBadge2, Map, ScanLine, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const modules = [
  {
    title: 'Scan Review',
    body: 'Upload imaging, get a concise radiology-style summary, then expand it into a full care report.',
    href: '/scan',
    icon: ScanLine,
  },
  {
    title: 'Medication Research',
    body: 'Compare generic options, dosage guidance, side effects, and specialist notes in one pass.',
    href: '/drugResearch',
    icon: FileBadge2,
  },
  {
    title: 'Care Navigation',
    body: 'Use symptoms, diagnoses, and live location to surface nearby hospitals on an open map stack.',
    href: '/smartHospitals',
    icon: Map,
  },
];

const metrics = [
  { value: '6', label: 'Clinical modules' },
  { value: '1', label: 'Shared workspace' },
  { value: 'Open', label: 'Map stack' },
];

export function HeroSection() {
  return (
    <section className="site-shell border-b border-border/70">
      <div className="absolute inset-0 subtle-grid opacity-30" />
      <div className="page-frame grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <span className="eyebrow gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            modular clinical workspace
          </span>

          <div className="space-y-5">
            <h1 className="display-title max-w-4xl text-balance text-foreground">
              Rebuilt for <span className="text-primary">practical health workflows</span>, not demo theatrics.
            </h1>
            <p className="max-w-2xl support-copy">
              Sonarive is a single place to review scans, generate treatment structure, research medicines, request a second opinion, and locate nearby hospitals without bouncing across disconnected tools.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/scan">Start with scan analysis</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6">
              <Link href="/mentalHealth">Open mental wellness module</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="soft-panel p-4">
                <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-panel overflow-hidden">
          <div className="border-b border-border/70 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workbench view</p>
                <h2 className="mt-2 text-3xl text-foreground">Move across modules without losing context</h2>
              </div>
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="grid gap-4 p-5">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group rounded-[24px] border border-border/70 bg-background/70 p-5 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl text-foreground">{module.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{module.body}</p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-primary">Open module</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
