'use client';

import { useState } from 'react';
import { AlertCircle, CalendarCheck2, FileText, HeartPulse, Pill, ShieldCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buildApiUrl } from '@/lib/backend-url';

interface DiagnosisResponse {
  condition: string;
  patient: { age: number; gender: string };
  summary: string;
  diagnosticTests: string[];
  treatmentPlan: {
    medications: string[];
    dosageGuidelines: Record<string, string>;
    duration: string;
  };
  lifestyle: string[];
  diet: string[];
  followUp: string;
  specialist: string;
  riskFactors: string[];
  preventiveMeasures: string[];
}

export default function TreatmentPlanForm() {
  const [disease, setDisease] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);

  const handleSubmit = async () => {
    const ageNum = Number.parseInt(age, 10);
    if (!disease.trim() || Number.isNaN(ageNum)) {
      setError('Enter a condition and a valid age to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(buildApiUrl('/api/treatment-plan-from-symptoms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: notes.trim() ? `${disease.trim()} | Notes: ${notes.trim()}` : disease.trim(),
          age: ageNum,
          gender,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Treatment plan request failed.');
      }

      if (!payload.data) {
        throw new Error('No treatment plan data returned.');
      }

      setResult(payload.data);
    } catch (caught) {
      const err = caught as Error;
      setError(err.message || 'Unable to generate treatment plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="soft-panel p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Care planning input</p>
            <h2 className="text-3xl text-foreground">Build a practical treatment structure around an existing diagnosis</h2>
          </div>
          <Input value={disease} onChange={(event) => setDisease(event.target.value)} placeholder="Type 2 diabetes, pneumonia, hypertension" disabled={isLoading} />
          <Input type="number" min="0" max="150" value={age} onChange={(event) => setAge(event.target.value)} placeholder="Age" disabled={isLoading} />
          <select value={gender} onChange={(event) => setGender(event.target.value as 'male' | 'female' | 'other')} className="h-11 rounded-full border border-input bg-background px-4 text-sm" disabled={isLoading}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <div className="rounded-full border border-border/70 bg-secondary/70 px-4 text-sm text-muted-foreground flex items-center">Optional notes will be appended to the diagnosis context.</div>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-28 rounded-[24px] border-border/80 bg-background/70 lg:col-span-2" placeholder="History, allergies, current medications, or specific concerns" disabled={isLoading} />
          <Button type="button" onClick={handleSubmit} className="rounded-full px-6 py-6 text-base lg:col-span-2" disabled={isLoading}>
            {isLoading ? 'Generating treatment plan...' : 'Generate treatment plan'}
          </Button>
        </div>
      </section>

      {error && (
        <Alert variant="destructive" className="rounded-[24px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Treatment plan failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <section className="grid gap-4">
          <article className="soft-panel p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Condition summary</p>
            <h3 className="mt-2 text-4xl text-foreground">{result.condition}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Patient: {result.patient.age} years old, {result.patient.gender}</p>
            <div className="mt-5 rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex items-center gap-3 text-primary">
                <FileText className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Clinical summary</h4>
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground/90">{result.summary}</p>
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <ListBlock title="Diagnostic tests" icon={<CalendarCheck2 className="h-4 w-4 text-primary" />} items={result.diagnosticTests} />
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <Pill className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Medication plan</h4>
              </div>
              <List items={result.treatmentPlan.medications} emptyText="No medication list returned." />
              <div className="mt-4 rounded-[20px] bg-background/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Duration</p>
                <p className="mt-2 text-sm leading-7 text-foreground/90">{result.treatmentPlan.duration}</p>
              </div>
              {Object.keys(result.treatmentPlan.dosageGuidelines).length > 0 && (
                <div className="mt-4 space-y-2">
                  {Object.entries(result.treatmentPlan.dosageGuidelines).map(([medicine, dose]) => (
                    <div key={medicine} className="rounded-[18px] bg-background/70 px-4 py-3 text-sm leading-7 text-foreground/90">
                      <span className="font-semibold text-foreground">{medicine}:</span> {dose}
                    </div>
                  ))}
                </div>
              )}
            </section>
            <ListBlock title="Lifestyle guidance" icon={<HeartPulse className="h-4 w-4 text-primary" />} items={result.lifestyle} />
            <ListBlock title="Diet guidance" icon={<HeartPulse className="h-4 w-4 text-accent" />} items={result.diet} />
            <ListBlock title="Risk factors" icon={<AlertCircle className="h-4 w-4 text-accent" />} items={result.riskFactors} />
            <ListBlock title="Preventive measures" icon={<ShieldCheck className="h-4 w-4 text-primary" />} items={result.preventiveMeasures} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <CalendarCheck2 className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Follow-up</h4>
              </div>
              <p className="mt-4 text-sm leading-7 text-foreground/90">{result.followUp}</p>
            </article>
            <article className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <Stethoscope className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Specialist referral</h4>
              </div>
              <p className="mt-4 text-sm leading-7 text-foreground/90">{result.specialist}</p>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}

function ListBlock({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <section className="soft-panel p-6">
      <div className="flex items-center gap-3 text-primary">
        {icon}
        <h4 className="text-2xl text-foreground">{title}</h4>
      </div>
      <List items={items} emptyText="No items returned." />
    </section>
  );
}

function List({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (!items.length) {
    return <p className="mt-4 text-sm leading-7 text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li key={item} className="rounded-[18px] bg-background/70 px-4 py-3 text-sm leading-7 text-foreground/90">
          {item}
        </li>
      ))}
    </ul>
  );
}
