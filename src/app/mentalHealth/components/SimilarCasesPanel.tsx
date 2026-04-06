import { MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SimilarMentalHealthCase } from '../types';

function riskTone(label: string) {
  switch (label) {
    case 'High':
      return 'text-red-700 dark:text-red-300';
    case 'Medium':
      return 'text-amber-700 dark:text-amber-300';
    case 'Low':
      return 'text-emerald-700 dark:text-emerald-300';
    default:
      return 'text-foreground';
  }
}

export default function SimilarCasesPanel({ cases }: { cases: SimilarMentalHealthCase[] }) {
  return (
    <section className="soft-panel p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <MessageSquareQuote className="mt-1 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Retrieved with Spark</p>
          <h3 className="mt-2 text-2xl text-foreground">Closest community narratives from the MindSignal dataset</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">These excerpts are retrieved by overlap with the submitted narrative and matched against the predicted risk profile before Groq generates the final plan.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {cases.length === 0 ? (
          <article className="rounded-[24px] border border-dashed border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
            No similar cases were available for this submission.
          </article>
        ) : (
          cases.map((item, index) => (
            <article key={`${item.excerpt}-${index}`} className="rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={cn('font-semibold', riskTone(item.riskLevel))}>{item.riskLevel} risk</span>
                <span className="text-muted-foreground">Overlap score {item.overlapScore}</span>
                {item.wordCount ? <span className="text-muted-foreground">{item.wordCount} words</span> : null}
                {item.subreddit ? <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">r/{item.subreddit}</span> : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-foreground/90">{item.excerpt}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
