'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertCircle, Calendar, FileText, Microscope, Pill, ShieldCheck, Stethoscope, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { handleScanUpload } from './action';
import type { AnalyzeMedicalScanOutput } from '@/types/scan';
import { buildApiUrl } from '@/lib/backend-url';

interface IntegratedMedicalReport {
  condition: string;
  patient: { age: number | null; gender: string };
  summary: string;
  radiology: {
    findings: Array<{ condition: string; location: string; severity: string; confidence: string }>;
    summary: string;
    originalScanFindings?: Array<{ condition: string; anatomicalLocation: string; severity: string; confidence: number }>;
    originalScanSummary?: string;
  };
  diagnosisPlan: {
    clinicalSummary: string;
    tests: string[];
    treatment: {
      medications: string[];
      dosages: Record<string, string>;
    };
    lifestyle: string[];
    diet: string[];
    followUp: string;
    specialists: string;
    risks: string[];
    prevention: string[];
  };
}

export default function ScanForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeMedicalScanOutput | null>(null);
  const [integratedReport, setIntegratedReport] = useState<IntegratedMedicalReport | null>(null);
  const [disease, setDisease] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Upload a PNG, JPG, GIF, or WEBP image.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
    setAnalysisResult(null);
    setIntegratedReport(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Choose a scan image before starting the analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setIntegratedReport(null);
    setProgressValue(14);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const image = reader.result as string;
      try {
        setProgressValue(42);
        const result = await handleScanUpload(image);
        setProgressValue(88);

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.data) {
          setAnalysisResult(result.data);
          setDisease(result.data.summary);
        }

        setProgressValue(100);
      } catch (caught) {
        const err = caught as Error;
        setError(err.message || 'Scan analysis failed.');
        setProgressValue(0);
      } finally {
        setIsLoading(false);
      }
    };
  };

  const handleGenerateIntegratedReport = async () => {
    if (!file || !disease.trim()) {
      setError('Analyze a scan first, then provide the clinical concern if needed.');
      return;
    }

    setIsGeneratingReport(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/scan-full'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            disease: disease.trim(),
            scanDataUri: reader.result as string,
            age: age || undefined,
            gender: gender || undefined,
            scanAnalysis: analysisResult || undefined,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Integrated report generation failed.');
        }

        if (!payload.data) {
          throw new Error('No integrated report was returned.');
        }

        setIntegratedReport(payload.data);
      } catch (caught) {
        const err = caught as Error;
        setError(err.message || 'Unable to generate integrated report.');
      } finally {
        setIsGeneratingReport(false);
      }
    };
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <form onSubmit={handleAnalyze} className="soft-panel p-6 sm:p-8">
          <div className="grid gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Upload</p>
              <h2 className="mt-2 text-3xl text-foreground">Start with a scan image</h2>
            </div>
            <Input type="file" onChange={handleFileChange} disabled={isLoading || isGeneratingReport} className="rounded-full" />
            <p className="text-sm text-muted-foreground">Accepted formats: PNG, JPG, GIF, WEBP. Clear, high-contrast images work best.</p>
            <Button type="submit" className="rounded-full px-6 py-6 text-base" disabled={isLoading || !file}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {isLoading ? 'Analyzing scan...' : 'Analyze scan'}
            </Button>
            {(isLoading || progressValue > 0) && (
              <div className="space-y-3 rounded-[24px] border border-border/70 bg-background/70 p-4">
                <Progress value={progressValue} className="h-2" />
                <p className="text-sm text-muted-foreground">The scan workflow is extracting findings and preparing a concise summary.</p>
              </div>
            )}
          </div>
        </form>

        <section className="soft-panel overflow-hidden">
          <div className="border-b border-border/70 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Preview</p>
            <h2 className="mt-2 text-3xl text-foreground">Image panel</h2>
          </div>
          <div className="flex min-h-[320px] items-center justify-center p-6">
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded medical scan preview" className="max-h-[420px] w-full rounded-[24px] border border-border/70 object-contain" />
            ) : (
              <div className="flex max-w-md flex-col items-center gap-3 text-center text-muted-foreground">
                <Microscope className="h-10 w-10 text-primary" />
                <p>Choose an image to preview it here before you run the analysis.</p>
              </div>
            )}
          </div>
        </section>
      </section>

      {error && (
        <Alert variant="destructive" className="rounded-[24px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Scan workflow failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <section className="grid gap-4 lg:grid-cols-[0.62fr_1.38fr]">
          <article className="soft-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Scan summary</p>
            <p className="mt-3 text-sm leading-7 text-foreground/90">{analysisResult.summary}</p>
            <div className="mt-5 rounded-[24px] border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Clinical concern</p>
              <Input value={disease} onChange={(event) => setDisease(event.target.value)} placeholder="Refine the condition or concern before the full report" className="mt-3 rounded-full" disabled={isGeneratingReport} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input type="number" min="0" max="150" value={age} onChange={(event) => setAge(event.target.value ? Number.parseInt(event.target.value, 10) : '')} placeholder="Age (optional)" disabled={isGeneratingReport} />
                <select value={gender} onChange={(event) => setGender(event.target.value)} className="h-11 rounded-full border border-input bg-background px-4 text-sm" disabled={isGeneratingReport}>
                  <option value="">Gender (optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button type="button" onClick={handleGenerateIntegratedReport} className="mt-4 w-full rounded-full px-6 py-6 text-base" disabled={isGeneratingReport}>
                {isGeneratingReport ? 'Generating integrated report...' : 'Generate integrated report'}
              </Button>
            </div>
          </article>

          <div className="grid gap-4">
            {analysisResult.findings.length > 0 ? (
              analysisResult.findings.map((finding, index) => (
                <article key={`${finding.condition}-${index}`} className="soft-panel p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Finding {index + 1}</p>
                      <h3 className="mt-2 text-3xl text-foreground">{finding.condition}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">Anatomical location: {finding.anatomicalLocation}</p>
                    </div>
                    <div className="rounded-[20px] bg-secondary/70 px-4 py-2 text-sm text-foreground">{Math.round(finding.confidence * 100)}% confidence</div>
                  </div>
                  <div className="mt-4 rounded-[20px] border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Severity</p>
                    <p className="mt-2 text-sm leading-7 text-foreground/90">{finding.severity}</p>
                  </div>
                </article>
              ))
            ) : (
              <article className="soft-panel p-6">
                <p className="text-sm leading-7 text-muted-foreground">No specific findings were returned from the scan summary. You can still generate an integrated report if you want a broader narrative and follow-up structure.</p>
              </article>
            )}
          </div>
        </section>
      )}

      {integratedReport && (
        <section className="grid gap-4">
          <article className="soft-panel p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Integrated report</p>
            <h3 className="mt-2 text-4xl text-foreground">{integratedReport.condition}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Patient: {integratedReport.patient.age ?? 'Age not provided'} · {integratedReport.patient.gender}</p>
            <div className="mt-5 rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex items-center gap-3 text-primary">
                <FileText className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Executive summary</h4>
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground/90">{integratedReport.summary}</p>
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <Microscope className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Radiology</h4>
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground/90">{integratedReport.radiology.summary}</p>
              <ListGroup items={integratedReport.radiology.findings.map((finding) => `${finding.condition} · ${finding.location} · ${finding.severity} · ${finding.confidence}`)} emptyText="No radiology findings listed." />
            </section>
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <Stethoscope className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Clinical assessment</h4>
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground/90">{integratedReport.diagnosisPlan.clinicalSummary}</p>
              <div className="mt-4 rounded-[20px] bg-background/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Follow-up</p>
                <p className="mt-2 text-sm leading-7 text-foreground/90">{integratedReport.diagnosisPlan.followUp}</p>
              </div>
            </section>
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <Pill className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Treatment</h4>
              </div>
              <ListGroup items={integratedReport.diagnosisPlan.treatment.medications} emptyText="No medications listed." />
              {Object.keys(integratedReport.diagnosisPlan.treatment.dosages).length > 0 && (
                <div className="mt-4 space-y-2">
                  {Object.entries(integratedReport.diagnosisPlan.treatment.dosages).map(([medicine, dose]) => (
                    <div key={medicine} className="rounded-[18px] bg-background/70 px-4 py-3 text-sm leading-7 text-foreground/90">
                      <span className="font-semibold text-foreground">{medicine}:</span> {dose}
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <Calendar className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Tests and referrals</h4>
              </div>
              <ListGroup items={integratedReport.diagnosisPlan.tests} emptyText="No additional tests returned." />
              <div className="mt-4 rounded-[20px] bg-background/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Specialists</p>
                <p className="mt-2 text-sm leading-7 text-foreground/90">{integratedReport.diagnosisPlan.specialists}</p>
              </div>
            </section>
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Lifestyle and diet</h4>
              </div>
              <ListGroup items={integratedReport.diagnosisPlan.lifestyle} emptyText="No lifestyle guidance returned." />
              <ListGroup items={integratedReport.diagnosisPlan.diet} emptyText="No diet guidance returned." />
            </section>
            <section className="soft-panel p-6">
              <div className="flex items-center gap-3 text-primary">
                <AlertCircle className="h-5 w-5" />
                <h4 className="text-2xl text-foreground">Risks and prevention</h4>
              </div>
              <ListGroup items={integratedReport.diagnosisPlan.risks} emptyText="No risk items returned." />
              <ListGroup items={integratedReport.diagnosisPlan.prevention} emptyText="No prevention items returned." />
            </section>
          </div>
        </section>
      )}
    </div>
  );
}

function ListGroup({ items, emptyText }: { items: string[]; emptyText: string }) {
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
