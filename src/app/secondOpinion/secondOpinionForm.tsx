'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, ClipboardCheck, FlaskConical, ShieldAlert, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buildApiUrl } from '@/lib/backend-url';

interface SecondOpinionInput {
  disease: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicationWithDosages: string;
}

interface SecondOpinionResponse {
  condition: string;
  patient: { age: number; gender: string };
  currentTreatment: string;
  assessment: string;
  recommendations: {
    adjustments: string[];
    alternativeTreatments: string[];
    tests: string[];
  };
  justification: string;
  warnings: string[];
}

export default function SecondOpinionForm() {
  const [disease, setDisease] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [medicationWithDosages, setMedicationWithDosages] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SecondOpinionResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ageNum = Number.parseInt(age, 10);

    if (!disease.trim() || !medicationWithDosages.trim() || Number.isNaN(ageNum)) {
      setError('Complete the diagnosis, age, and medication fields before requesting a second opinion.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: SecondOpinionInput = {
        disease: disease.trim(),
        age: ageNum,
        gender,
        medicationWithDosages: medicationWithDosages.trim(),
      };

      const response = await fetch(buildApiUrl('/api/second-opinion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Second opinion request failed.');
      }

      if (!responseData.data) {
        throw new Error('No structured opinion was returned.');
      }

      setResult(responseData.data);
    } catch (caught) {
      const err = caught as Error;
      setError(err.message || 'Unable to generate second opinion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="soft-panel p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Patient snapshot</p>
            <h2 className="text-3xl text-foreground">Request a structured treatment review</h2>
          </div>

          <Input value={disease} onChange={(event) => setDisease(event.target.value)} placeholder="Diagnosed condition" disabled={isLoading} />
          <Input type="number" min="0" max="150" value={age} onChange={(event) => setAge(event.target.value)} placeholder="Age" disabled={isLoading} />

          <select value={gender} onChange={(event) => setGender(event.target.value as 'male' | 'female' | 'other')} className="h-11 rounded-full border border-input bg-background px-4 text-sm" disabled={isLoading}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <div className="rounded-full border border-border/70 bg-secondary/70 px-4 text-sm text-muted-foreground flex items-center">Include exact medicine names and dosages for better output.</div>

          <Textarea value={medicationWithDosages} onChange={(event) => setMedicationWithDosages(event.target.value)} className="min-h-36 rounded-[24px] border-border/80 bg-background/70 lg:col-span-2" placeholder="Metformin 500mg twice daily, Lisinopril 10mg once daily" disabled={isLoading} />

          <Button type="submit" className="rounded-full px-6 py-6 text-base lg:col-span-2" disabled={isLoading}>
            {isLoading ? 'Reviewing treatment...' : 'Generate second opinion'}
          </Button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive" className="rounded-[24px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Second opinion failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <section className="grid gap-4">
          <article className="soft-panel p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Assessment</p>
            <h3 className="mt-2 text-4xl text-foreground">{result.condition}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Patient: {result.patient.age} years old, {result.patient.gender}. Current treatment: {result.currentTreatment}</p>
            <div className="mt-5 rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex items-center gap-3 text-primary">
                <ClipboardCheck className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Current treatment assessment</h4>
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground/90">{result.assessment}</p>
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <RecommendationBlock title="Recommended adjustments" items={result.recommendations.adjustments} icon={<Stethoscope className="h-4 w-4 text-primary" />} />
            <RecommendationBlock title="Alternative treatments" items={result.recommendations.alternativeTreatments} icon={<ClipboardCheck className="h-4 w-4 text-primary" />} />
            <RecommendationBlock title="Additional tests" items={result.recommendations.tests} icon={<FlaskConical className="h-4 w-4 text-primary" />} />
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <ShieldAlert className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Warnings and monitoring</h4>
              </div>
              {result.warnings.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {result.warnings.map((warning) => (
                    <li key={warning} className="rounded-[18px] bg-background/70 px-4 py-3 text-sm leading-7 text-foreground/90">{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-7 text-muted-foreground">No warning items were returned.</p>
              )}
            </section>
          </div>

          <article className="soft-panel p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Clinical justification</p>
            <p className="mt-3 text-sm leading-7 text-foreground/90">{result.justification}</p>
          </article>
        </section>
      )}
    </div>
  );
}

function RecommendationBlock({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <section className="soft-panel p-6">
      <div className="flex items-center gap-3 text-primary">
        {icon}
        <h4 className="text-2xl text-foreground">{title}</h4>
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-[18px] bg-background/70 px-4 py-3 text-sm leading-7 text-foreground/90">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted-foreground">No items were returned for this section.</p>
      )}
    </section>
  );
}
