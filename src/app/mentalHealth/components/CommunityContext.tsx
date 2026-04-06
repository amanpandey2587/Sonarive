import { BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { MentalHealthAnalytics } from '../types';

function riskColor(label: string) {
  switch (label) {
    case 'High':
      return '[&>div]:bg-red-500 text-red-700 dark:text-red-300';
    case 'Medium':
      return '[&>div]:bg-amber-500 text-amber-700 dark:text-amber-300';
    case 'Low':
      return '[&>div]:bg-emerald-500 text-emerald-700 dark:text-emerald-300';
    default:
      return '[&>div]:bg-primary text-foreground';
  }
}

export default function CommunityContext({ riskLevel, analytics }: { riskLevel: string; analytics: MentalHealthAnalytics }) {
  return (
    <section className="soft-panel p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <BarChart3 className="mt-1 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Community context</p>
          <h3 className="mt-2 text-2xl text-foreground">How your profile compares across {analytics.totalDatasetSize.toLocaleString()} MindSignal posts</h3>
          <p className="mt-2 text-sm text-muted-foreground">Powered by Spark queries over the local Parquet dataset.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {analytics.distribution.map((item) => (
            <div key={item.predicted_risk}>
              <div className="mb-2 flex justify-between text-sm">
                <span className={cn('font-medium', riskColor(item.predicted_risk).split(' ').slice(1).join(' '))}>
                  {item.predicted_risk} risk{item.predicted_risk === riskLevel ? ' <- your result' : ''}
                </span>
                <span className="text-muted-foreground">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className={cn('h-2', riskColor(item.predicted_risk))} />
            </div>
          ))}
        </div>

        <div className="grid gap-4">
          <article className="rounded-[24px] border border-border/70 bg-background/70 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Word patterns</p>
            <div className="mt-4 space-y-3">
              {analytics.wordPatterns.map((item) => (
                <div key={item.predicted_risk} className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-foreground">{item.predicted_risk}</span>
                  <span className="text-muted-foreground">{Math.round(item.avg_words)} words avg</span>
                  <span className="text-muted-foreground">{Math.round(item.avg_chars)} chars avg</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-border/70 bg-background/70 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Top communities in this risk group</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {analytics.communityBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subreddit breakdown was available for this request.</p>
              ) : (
                analytics.communityBreakdown.map((item) => (
                  <span key={item.subreddit_label} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                    r/{item.subreddit_label} – {item.post_count.toLocaleString()}
                  </span>
                ))
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
