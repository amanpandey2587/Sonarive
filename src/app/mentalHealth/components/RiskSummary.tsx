import { Activity, AlertTriangle, Brain, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MentalHealthRiskPrediction } from '../types';

function riskClasses(label: string) {
  switch (label) {
    case 'High':
      return {
        badge: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
        panel: 'border-red-500/20 bg-red-500/5',
      };
    case 'Medium':
      return {
        badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        panel: 'border-amber-500/20 bg-amber-500/5',
      };
    case 'Low':
      return {
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        panel: 'border-emerald-500/20 bg-emerald-500/5',
      };
    default:
      return {
        badge: 'border-border bg-secondary text-foreground',
        panel: 'border-border bg-card',
      };
  }
}

export default function RiskSummary({
  riskPrediction,
  phq9Score,
  gad7Score,
  narrativeLength,
  populationContext,
}: {
  riskPrediction: MentalHealthRiskPrediction;
  phq9Score: number;
  gad7Score: number;
  narrativeLength: number;
  populationContext?: string | null;
}) {
  const theme = riskClasses(riskPrediction.label);
  const confidenceText = riskPrediction.confidence != null ? `${Math.round(riskPrediction.confidence * 100)}% confidence` : 'Confidence unavailable';

  return (
    <section className="soft-panel p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk overview</p>
          <h3 className="mt-2 text-3xl text-foreground">MindSignal classification and intake summary</h3>
        </div>
        <div className={cn('rounded-full border px-4 py-2 text-sm font-semibold', theme.badge)}>
          {riskPrediction.label} risk
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className={cn('rounded-[24px] border p-5', theme.panel)}>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Model signal
          </div>
          <p className="mt-4 text-2xl text-foreground">{riskPrediction.label} risk profile</p>
          <p className="mt-2 text-sm text-muted-foreground">{confidenceText} via {riskPrediction.source.replace(/_/g, ' ')}</p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{riskPrediction.reasoning || 'No additional model reasoning was returned.'}</p>
        </article>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <MetricCard icon={Brain} label="PHQ-9" value={String(phq9Score)} note="Depression screening" />
          <MetricCard icon={Activity} label="GAD-7" value={String(gad7Score)} note="Anxiety screening" />
          <MetricCard icon={NotebookPen} label="Narrative" value={String(narrativeLength)} note="Characters submitted" />
        </div>
      </div>

      {populationContext ? (
        <article className="mt-4 rounded-[24px] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Population context</p>
          <div className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{populationContext.replace(/^## Population Context \(from Spark analysis of the MindSignal dataset\)\n?/, '')}</div>
        </article>
      ) : null}
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, note }: { icon: typeof Brain; label: string; value: string; note: string }) {
  return (
    <article className="rounded-[24px] border border-border/70 bg-background/70 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-3xl text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </article>
  );
}
