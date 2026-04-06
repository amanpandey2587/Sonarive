import { LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MentalHealthHistoryPoint } from '../types';

function riskBadge(label: string) {
  switch (label) {
    case 'High':
      return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
    case 'Medium':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    case 'Low':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    default:
      return 'border-border bg-secondary text-foreground';
  }
}

export default function TrendHistoryPanel({ history }: { history: MentalHealthHistoryPoint[] }) {
  return (
    <section className="soft-panel p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <LineChart className="mt-1 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Trend tracking</p>
          <h3 className="mt-2 text-2xl text-foreground">Your recent local submission history</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">Each submission is logged to the local MindSignal submissions Parquet dataset when Spark is available, then queried back to show your recent trajectory.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {history.length === 0 ? (
          <article className="rounded-[24px] border border-dashed border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
            No prior submission history is available for this browser profile yet.
          </article>
        ) : (
          history.map((item) => (
            <article key={`${item.timestamp}-${item.predictedRisk}`} className="rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-muted-foreground">PHQ-9 {item.phq9Score} - GAD-7 {item.gad7Score} - {item.wordCount} words</p>
                </div>
                <span className={cn('rounded-full border px-3 py-1 text-sm font-medium', riskBadge(item.predictedRisk))}>
                  {item.predictedRisk} risk
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
