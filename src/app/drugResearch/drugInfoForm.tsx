'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, IndianRupee, Pill, ShieldAlert, UserRoundCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buildApiUrl } from '@/lib/backend-url';

interface DrugInfo {
  drugName: string;
  genericAlternatives: string[];
  sideEffects: string[];
  allergies: string[];
  dosageByAgeGroup: {
    children: string;
    adults: string;
    elderly: string;
  };
  standardPriceINR: string;
  usageInstructions: string;
  specialistRecommendation: string;
  imageUrl?: string;
}

interface DrugResponse {
  drugs: DrugInfo[];
}

export function DrugInfoForm() {
  const [drugInput, setDrugInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrugResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!drugInput.trim()) {
      setError('Enter at least one drug name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const drugs = drugInput
        .split(',')
        .map((drug) => drug.trim())
        .filter(Boolean);

      const response = await fetch(buildApiUrl('/api/drug-info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || `Request failed with status ${response.status}`);
      }

      if (!payload.data) {
        throw new Error('No medication data returned.');
      }

      setResult(payload.data);
    } catch (caught) {
      const error = caught as Error;
      setError(error.message || 'Unable to load drug information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="soft-panel p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Input</p>
              <h2 className="mt-2 text-3xl text-foreground">Research one medicine or a full prescription list</h2>
            </div>
            <Textarea
              value={drugInput}
              onChange={(event) => setDrugInput(event.target.value)}
              placeholder="Amoxicillin, Paracetamol, Aspirin"
              className="min-h-32 rounded-[24px] border-border/80 bg-background/70"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">Separate multiple medicines with commas.</p>
          </div>

          <Button type="submit" className="rounded-full px-6 py-6 text-base" disabled={isLoading}>
            {isLoading ? 'Researching medicines...' : 'Generate medication brief'}
          </Button>
        </form>
      </section>

      {error && (
        <Alert variant="destructive" className="rounded-[24px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to complete request</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <section className="grid gap-4">
          {result.drugs.map((drug) => (
            <article key={drug.drugName} className="soft-panel overflow-hidden">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Medicine</p>
                    <h3 className="mt-2 text-4xl text-foreground">{drug.drugName}</h3>
                  </div>

                  <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
                    <div className="flex items-center gap-3 text-primary">
                      <IndianRupee className="h-5 w-5" />
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estimated price</p>
                    </div>
                    <p className="mt-3 text-lg text-foreground">{drug.standardPriceINR}</p>
                  </div>

                  {drug.imageUrl && (
                    <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/70">
                      <img src={drug.imageUrl} alt={drug.drugName} className="h-56 w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-[24px] border border-border/70 bg-background/70 p-5 lg:col-span-2">
                    <div className="flex items-center gap-3 text-primary">
                      <Pill className="h-5 w-5" />
                      <h4 className="text-2xl text-foreground">Dosage guide</h4>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <DoseCard label="Children" value={drug.dosageByAgeGroup.children} />
                      <DoseCard label="Adults" value={drug.dosageByAgeGroup.adults} />
                      <DoseCard label="Elderly" value={drug.dosageByAgeGroup.elderly} />
                    </div>
                  </section>

                  <InfoBlock title="Generic alternatives" items={drug.genericAlternatives} emptyText="No generic alternatives returned." />
                  <InfoBlock title="Common side effects" items={drug.sideEffects} emptyText="No side effects returned." />
                  <InfoBlock title="Allergies and cautions" items={drug.allergies} emptyText="No allergy or contraindication notes returned." icon={<ShieldAlert className="h-4 w-4 text-accent" />} />

                  <section className="rounded-[24px] border border-border/70 bg-background/70 p-5">
                    <div className="flex items-center gap-3 text-primary">
                      <UserRoundCog className="h-5 w-5" />
                      <h4 className="text-2xl text-foreground">Usage and specialist context</h4>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{drug.usageInstructions}</p>
                    <div className="mt-4 rounded-[20px] bg-secondary/70 p-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Specialist note</p>
                      <p className="mt-2 text-sm leading-7 text-foreground/90">{drug.specialistRecommendation}</p>
                    </div>
                  </section>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function DoseCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border/70 bg-card p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-sm leading-7 text-foreground/90">{value}</p>
    </div>
  );
}

function InfoBlock({ title, items, emptyText, icon }: { title: string; items: string[]; emptyText: string; icon?: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-border/70 bg-background/70 p-5">
      <div className="flex items-center gap-3 text-primary">
        {icon}
        <h4 className="text-2xl text-foreground">{title}</h4>
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-[18px] bg-card px-4 py-3 text-sm leading-7 text-foreground/90">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{emptyText}</p>
      )}
    </section>
  );
}
