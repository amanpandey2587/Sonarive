import Link from 'next/link';

const links = [
  { label: 'Scan', href: '/scan' },
  { label: 'Second Opinion', href: '/secondOpinion' },
  { label: 'Hospital Finder', href: '/smartHospitals' },
  { label: 'Contact', href: '/contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/85">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:grid-cols-[1.2fr_0.8fr] sm:px-6">
        <div className="space-y-3">
          <p className="text-lg font-semibold">Sonarive</p>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            A modular health workspace rebuilt around clear flows, open maps, and lightweight AI infrastructure.
          </p>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Groq + OpenStreetMap + Next.js + FastAPI</p>
        </div>
        <div className="grid gap-2 sm:justify-items-end">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <p className="pt-2 text-sm text-muted-foreground">© {new Date().getFullYear()} Sonarive</p>
        </div>
      </div>
    </footer>
  );
}
