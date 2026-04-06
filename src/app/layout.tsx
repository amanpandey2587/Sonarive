import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Navbar } from '@/components/ui/layout/navbar';
import { Footer } from '@/components/ui/layout/footer';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';

const sans = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
});

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Sonarive',
  description: 'A modular health intelligence workspace for scans, care planning, medication research, and hospital discovery.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster richColors position="top-right" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
