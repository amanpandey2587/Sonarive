'use client'
import Link from 'next/link';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, MoonStar, Stethoscope } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Scan', href: '/scan' },
  { label: 'Mental Health', href: '/mentalHealth' },
  { label: 'Drug Research', href: '/drugResearch' },
  { label: 'Treatment Plan', href: '/treatmentPlans' },
  { label: 'Second Opinion', href: '/secondOpinion' },
  { label: 'Hospitals', href: '/smartHospitals' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">Sonarive</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">clinical workspace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <ThemeToggle />
          <Button asChild className="rounded-full px-5">
            <Link href="/scan">Open workspace</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] bg-card">
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <MoonStar className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold">Navigation</p>
                    <p className="text-sm text-muted-foreground">Move across modules</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                        pathname === item.href ? 'bg-primary text-primary-foreground' : 'bg-secondary/70 text-foreground hover:bg-secondary'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
