'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Brain, LocateFixed, MapPin, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { buildApiUrl } from '@/lib/backend-url';
import { cn } from '@/lib/utils';
import CommunityContext from './components/CommunityContext';
import RiskSummary from './components/RiskSummary';
import SimilarCasesPanel from './components/SimilarCasesPanel';
import TrendHistoryPanel from './components/TrendHistoryPanel';
import type { MentalHealthResponsePayload } from './types';

const phq9Questions = [
  { id: 'q1', text: 'Little interest or pleasure in doing things' },
  { id: 'q2', text: 'Feeling down, depressed, or hopeless' },
  { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much' },
  { id: 'q4', text: 'Feeling tired or having little energy' },
  { id: 'q5', text: 'Poor appetite or overeating' },
  { id: 'q6', text: 'Feeling bad about yourself or feeling like a failure' },
  { id: 'q7', text: 'Trouble concentrating on things' },
  { id: 'q8', text: 'Moving or speaking unusually slowly, or feeling very restless' },
  { id: 'q9', text: 'Thoughts that you would be better off dead or self-harm thoughts' },
] as const;

const gad7Questions = [
  { id: 'g1', text: 'Feeling nervous, anxious, or on edge' },
  { id: 'g2', text: 'Not being able to stop or control worrying' },
  { id: 'g3', text: 'Worrying too much about different things' },
  { id: 'g4', text: 'Trouble relaxing' },
  { id: 'g5', text: 'Being so restless that it is hard to sit still' },
  { id: 'g6', text: 'Becoming easily annoyed or irritable' },
  { id: 'g7', text: 'Feeling afraid as if something awful might happen' },
] as const;

const answerOptions = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
] as const;

type Step = 'profile' | 'narrative' | 'screening' | 'review' | 'results';

export default function MentalHealthForm() {
  const [step, setStep] = useState<Step>('profile');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [textInput, setTextInput] = useState('');
  const [phq9Answers, setPhq9Answers] = useState<Record<string, number>>({});
  const [gad7Answers, setGad7Answers] = useState<Record<string, number>>({});
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<MentalHealthResponsePayload | null>(null);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = 'sonarive-mental-health-client-id';
    const existing = window.localStorage.getItem(storageKey);
    if (existing) {
      setClientId(existing);
      return;
    }

    const generated = window.crypto?.randomUUID?.() ?? `mh-${Date.now()}`;
    window.localStorage.setItem(storageKey, generated);
    setClientId(generated);
  }, []);

  useEffect(() => {
    if (!apiResult || apiResult.analytics !== undefined || !apiResult.riskPrediction?.label) {
      return;
    }

    let cancelled = false;

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const response = await fetch(buildApiUrl('/api/mental-health/analytics'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ riskLevel: apiResult.riskPrediction.label }),
        });

        const payload = (await response.json()) as {
          analytics?: MentalHealthResponsePayload['analytics'];
          warnings?: string[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error || 'Unable to load community analytics.');
        }

        if (!cancelled) {
          setApiResult((current) =>
            current
              ? {
                  ...current,
                  analytics: payload.analytics ?? null,
                  warnings: Array.from(new Set([...(current.warnings || []), ...((payload.warnings || []).filter(Boolean))])),
                }
              : current
          );
        }
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Unable to load community analytics.';
        if (!cancelled) {
          setApiResult((current) =>
            current
              ? {
                  ...current,
                  analytics: null,
                  warnings: Array.from(new Set([...(current.warnings || []), message])),
                }
              : current
          );
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [apiResult]);

  const phq9Score = useMemo(() => sumAnswers(phq9Answers, phq9Questions.map((item) => item.id)), [phq9Answers]);
  const gad7Score = useMemo(() => sumAnswers(gad7Answers, gad7Questions.map((item) => item.id)), [gad7Answers]);
  const profileValid = age.trim().length > 0 && Number.parseInt(age, 10) > 0;
  const screeningComplete = Object.keys(phq9Answers).length === phq9Questions.length && Object.keys(gad7Answers).length === gad7Questions.length;
  const narrativeComplete = textInput.trim().length >= 20;
  const narrativeLength = textInput.trim().length;
  const progressMap: Record<Exclude<Step, 'results'>, number> = {
    profile: 25,
    narrative: 50,
    screening: 75,
    review: 100,
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLatitude(position.coords.latitude);
        setUserLongitude(position.coords.longitude);
        setIsGettingLocation(false);
      },
      (positionError) => {
        setLocationError(positionError.message);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async () => {
    const ageNum = Number.parseInt(age, 10);
    if (!profileValid) {
      setError('Enter a valid age before requesting analysis.');
      setStep('profile');
      return;
    }

    if (!narrativeComplete && !screeningComplete) {
      setError('Provide a meaningful narrative or complete both PHQ-9 and GAD-7 before continuing.');
      setStep('narrative');
      return;
    }

    setIsLoading(true);
    setAnalyticsLoading(false);
    setError(null);
    setResultError(null);
    setApiResult(null);

    try {
      const response = await fetch(buildApiUrl('/api/mental-health'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: ageNum,
          gender,
          ph9Score: screeningComplete ? phq9Score : 0,
          gad7Score: screeningComplete ? gad7Score : 0,
          textInput: textInput.trim() || 'No additional narrative provided.',
          userLatitude: userLatitude ?? undefined,
          userLongitude: userLongitude ?? undefined,
          clientId: clientId || undefined,
        }),
      });

      const payload = (await response.json()) as MentalHealthResponsePayload & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Mental wellness analysis failed.');
      }

      setApiResult({ ...payload, analytics: undefined });
      setStep('results');
    } catch (caught) {
      const err = caught as Error;
      setResultError(err.message || 'Unable to generate mental wellness report.');
      setStep('results');
    } finally {
      setIsLoading(false);
    }
  };

  const resetExperience = () => {
    setStep('profile');
    setError(null);
    setResultError(null);
    setApiResult(null);
    setAnalyticsLoading(false);
  };

  return (
    <div className="grid gap-6">
      {step !== 'results' && (
        <section className="soft-panel p-6 sm:p-8">
          <div className="grid gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Guided intake</p>
                <h2 className="mt-2 text-3xl text-foreground">Capture enough context for a grounded support plan</h2>
              </div>
              <div className="rounded-full border border-border/70 bg-secondary/70 px-4 py-2 text-sm text-muted-foreground">{progressMap[step as Exclude<Step, 'results'>]}% complete</div>
            </div>

            <Progress value={progressMap[step as Exclude<Step, 'results'>]} className="h-2" />

            {step === 'profile' && (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 lg:col-span-2">
                  <p className="text-sm leading-7 text-muted-foreground">We use age, gender, optional location, and a local browser ID to contextualize results and show your own trend history over time without requiring an account.</p>
                </div>
                <Input type="number" min="1" max="130" value={age} onChange={(event) => setAge(event.target.value)} placeholder="Age" disabled={isLoading} />
                <select value={gender} onChange={(event) => setGender(event.target.value as 'male' | 'female' | 'other' | 'prefer_not_to_say')} className="h-11 rounded-full border border-input bg-background px-4 text-sm" disabled={isLoading}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <div className="rounded-[24px] border border-border/70 bg-background/70 p-4 lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Optional location</p>
                      <p className="text-sm text-muted-foreground">Used only for nearby clinic and psychiatrist suggestions.</p>
                    </div>
                    <Button type="button" variant="outline" className="rounded-full" onClick={handleGetLocation} disabled={isGettingLocation || isLoading}>
                      <LocateFixed className="mr-2 h-4 w-4" />
                      {isGettingLocation ? 'Locating...' : 'Use current location'}
                    </Button>
                  </div>
                  {userLatitude !== null && userLongitude !== null && (
                    <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-1 h-4 w-4" />
                      {userLatitude.toFixed(4)}, {userLongitude.toFixed(4)}
                    </p>
                  )}
                  {locationError && <p className="mt-3 text-sm text-destructive">{locationError}</p>}
                </div>
              </div>
            )}

            {step === 'narrative' && (
              <div className="grid gap-4">
                <p className="text-sm leading-7 text-muted-foreground">Describe what has been going on lately. Spark uses this narrative to retrieve similar posts from the MindSignal dataset before the support plan is generated.</p>
                <Textarea value={textInput} onChange={(event) => setTextInput(event.target.value)} className="min-h-48 rounded-[24px] bg-background/70" placeholder="What have you been feeling, for how long, and what is affecting work, sleep, relationships, or daily life?" disabled={isLoading} />
                <p className="text-sm text-muted-foreground">Current length: {narrativeLength} characters. A useful narrative is usually 20 or more characters.</p>
              </div>
            )}

            {step === 'screening' && (
              <div className="grid gap-8">
                <QuestionGroup title="PHQ-9" subtitle="Depression screening" questions={phq9Questions} answers={phq9Answers} onAnswer={(questionId, value) => setPhq9Answers((current) => ({ ...current, [questionId]: value }))} />
                <QuestionGroup title="GAD-7" subtitle="Anxiety screening" questions={gad7Questions} answers={gad7Answers} onAnswer={(questionId, value) => setGad7Answers((current) => ({ ...current, [questionId]: value }))} />
              </div>
            )}

            {step === 'review' && (
              <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                <article className="rounded-[24px] border border-border/70 bg-background/70 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Scores</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <StatCard label="PHQ-9" value={String(phq9Score)} note={screeningComplete ? 'Complete' : 'Incomplete'} />
                    <StatCard label="GAD-7" value={String(gad7Score)} note={screeningComplete ? 'Complete' : 'Incomplete'} />
                  </div>
                </article>
                <article className="rounded-[24px] border border-border/70 bg-background/70 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Submission check</p>
                  <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
                    <li>Age entered: {profileValid ? 'yes' : 'no'}</li>
                    <li>Narrative ready: {narrativeComplete ? 'yes' : 'no'}</li>
                    <li>Screeners complete: {screeningComplete ? 'yes' : 'no'}</li>
                    <li>Location attached: {userLatitude !== null && userLongitude !== null ? 'yes' : 'no'}</li>
                    <li>History tracking ready: {clientId ? 'yes' : 'pending'}</li>
                  </ul>
                </article>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(previousStep(step))} disabled={step === 'profile' || isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {step === 'review' ? (
                <Button type="button" className="rounded-full px-6" onClick={handleSubmit} disabled={isLoading || !profileValid || (!narrativeComplete && !screeningComplete)}>
                  <Brain className="mr-2 h-4 w-4" />
                  {isLoading ? 'Generating report...' : 'Generate support plan'}
                </Button>
              ) : (
                <Button type="button" className="rounded-full px-6" onClick={() => setStep(nextStep(step))} disabled={isLoading || (step === 'profile' && !profileValid)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {error && step !== 'results' && (
        <Alert variant="destructive" className="rounded-[24px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to continue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'results' && (
        <section className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Mental wellness dashboard</p>
              <h2 className="mt-2 text-4xl text-foreground">Support plan, Spark context, and your local trend line</h2>
            </div>
            <Button type="button" variant="outline" className="rounded-full" onClick={resetExperience}>
              <Sparkles className="mr-2 h-4 w-4" />
              Start again
            </Button>
          </div>

          {resultError ? (
            <Alert variant="destructive" className="rounded-[24px]">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analysis failed</AlertTitle>
              <AlertDescription>{resultError}</AlertDescription>
            </Alert>
          ) : apiResult ? (
            <>
              {apiResult.warnings.length > 0 ? (
                <Alert className="rounded-[24px] border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Partial data mode</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      {apiResult.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : null}

              <RiskSummary
                riskPrediction={apiResult.riskPrediction}
                phq9Score={phq9Score}
                gad7Score={gad7Score}
                narrativeLength={narrativeLength}
                populationContext={apiResult.populationContext}
              />

              <article className="soft-panel p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Groq intervention plan</p>
                    <h3 className="mt-2 text-2xl text-foreground">Clinically framed response grounded in the retrieved dataset context</h3>
                  </div>
                </div>
                <div className="result-copy prose prose-neutral mt-6 max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{apiResult.interventionPlan}</ReactMarkdown>
                </div>
              </article>

              <SimilarCasesPanel cases={apiResult.similarCases} />
              {analyticsLoading ? (
                <section className="soft-panel p-6 sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Community context</p>
                  <h3 className="mt-2 text-2xl text-foreground">Loading Spark analytics...</h3>
                  <p className="mt-2 text-sm text-muted-foreground">The dashboard query runs separately so the support plan does not wait on the full dataset distribution scan.</p>
                </section>
              ) : apiResult.analytics ? (
                <CommunityContext riskLevel={apiResult.riskPrediction.label} analytics={apiResult.analytics} />
              ) : null}
              <TrendHistoryPanel history={apiResult.history} />
            </>
          ) : null}
        </section>
      )}
    </div>
  );
}

function QuestionGroup({ title, subtitle, questions, answers, onAnswer }: { title: string; subtitle: string; questions: ReadonlyArray<{ id: string; text: string }>; answers: Record<string, number>; onAnswer: (questionId: string, value: number) => void }) {
  return (
    <section className="rounded-[24px] border border-border/70 bg-background/70 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{subtitle}</p>
      <h3 className="mt-2 text-3xl text-foreground">{title}</h3>
      <div className="mt-5 space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="rounded-[20px] border border-border/70 bg-card p-4">
            <p className="text-sm leading-7 text-foreground/90">{question.text}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {answerOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onAnswer(question.id, option.value)}
                  className={cn(
                    'rounded-full border px-3 py-2 text-sm transition-colors',
                    answers[question.id] === option.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[20px] border border-border/70 bg-card px-4 py-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function sumAnswers(answers: Record<string, number>, ids: string[]) {
  return ids.reduce((total, id) => total + (answers[id] ?? 0), 0);
}

function nextStep(step: Step): Step {
  switch (step) {
    case 'profile':
      return 'narrative';
    case 'narrative':
      return 'screening';
    case 'screening':
      return 'review';
    default:
      return step;
  }
}

function previousStep(step: Step): Step {
  switch (step) {
    case 'narrative':
      return 'profile';
    case 'screening':
      return 'narrative';
    case 'review':
      return 'screening';
    default:
      return step;
  }
}
