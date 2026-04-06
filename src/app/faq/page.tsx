'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LifeBuoy } from 'lucide-react';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { faqData } from '@/components/ui/sections/faq-data';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageContainer className="space-y-8">
      <section className="soft-panel overflow-hidden">
        <div className="grid gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-4">
            <span className="eyebrow">faq</span>
            <h1 className="text-4xl text-foreground sm:text-5xl">Common questions, answered with less marketing fluff.</h1>
            <p className="support-copy max-w-3xl">
              This page explains what Sonarive does, what the AI outputs are meant for, and where the boundaries still are.
            </p>
          </div>
          <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">need more help?</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">If the FAQ does not cover your use case, send the team a direct note and include the module you were using.</p>
          </div>
        </div>
      </section>

      <section className="soft-panel divide-y divide-border/70 overflow-hidden">
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className="px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="text-xl text-foreground sm:text-2xl">{item.question}</span>
                <span className={cn('rounded-full border border-border bg-secondary/80 p-2 transition-transform', isOpen && 'rotate-180')}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              {isOpen && <p className="max-w-4xl pt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p>}
            </div>
          );
        })}
      </section>

      <section className="soft-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-3xl text-foreground">Still missing something?</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">Use the contact page and tell us which module should be clearer.</p>
        </div>
        <Button asChild className="rounded-full px-6">
          <Link href="/contact">Contact the team</Link>
        </Button>
      </section>
    </PageContainer>
  );
}
