'use client';

import { useState } from 'react';
import { Mail, MapPinned, MessageSquareText, Send } from 'lucide-react';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const channels = [
  { title: 'Product feedback', body: 'Tell us which workflow feels confusing, slow, or incomplete.' },
  { title: 'Partnerships', body: 'Reach out if you want to test Sonarive in a clinic, lab, or care coordination workflow.' },
  { title: 'Technical issues', body: 'If a result shape is broken or a module fails, describe the exact input and module path.' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <PageContainer className="space-y-8">
      <section className="soft-panel overflow-hidden">
        <div className="grid gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-4">
            <span className="eyebrow">contact</span>
            <h1 className="text-4xl text-foreground sm:text-5xl">Reach the team without the usual sales-page fog.</h1>
            <p className="support-copy max-w-3xl">
              If a page is unclear, a module breaks, or you want to collaborate, send a direct note. This placeholder form is local-only right now, but the page is structured for a real support pipeline.
            </p>
          </div>
          <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
            <div className="flex items-center gap-3">
              <MapPinned className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">response expectation</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Use this page for product feedback, module requests, or technical notes. For medical emergencies, contact local emergency services immediately.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="grid gap-4">
          {channels.map((channel) => (
            <article key={channel.title} className="soft-panel p-6">
              <h2 className="text-2xl text-foreground">{channel.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{channel.body}</p>
            </article>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="soft-panel p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Mail className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">message form</p>
              <h2 className="text-3xl text-foreground">Send a note</h2>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </div>
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What are you trying to do, and where did the product get in your way?" className="min-h-40" required />
            <Button type="submit" className="w-full rounded-full py-6 text-base">
              <Send className="mr-2 h-4 w-4" />
              Send message
            </Button>
            {sent && (
              <div className="rounded-[20px] border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
                Message captured locally. Wire this form to a real support endpoint when you are ready.
              </div>
            )}
          </div>
        </form>
      </section>
    </PageContainer>
  );
}
