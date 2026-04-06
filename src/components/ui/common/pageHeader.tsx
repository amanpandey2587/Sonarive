interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
}

export function PageHeader({ title, description, eyebrow = 'module' }: PageHeaderProps) {
  return (
    <section className="soft-panel overflow-hidden">
      <div className="grid gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="text-4xl text-foreground sm:text-5xl">{title}</h1>
          {description && <p className="max-w-3xl support-copy">{description}</p>}
        </div>
        <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Design note</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Each workflow is now framed as a focused health task: collect input, generate a structured result, and help the user decide what to verify next.
          </p>
        </div>
      </div>
    </section>
  );
}
