'use client'

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CalendarCheck, FileText, Stethoscope, Pill, Heart } from 'lucide-react';

interface DiagnosisResponse {
condition: string;
patient: {
age: number;
gender: string;
};
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

export function TreatmentPlanForm() {
const [disease, setDisease] = useState('');
const [age, setAge] = useState('');
const [gender, setGender] = useState('');
const [additionalNotes, setAdditionalNotes] = useState('');

const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [result, setResult] = useState<DiagnosisResponse | null>(null);

const handleSubmit = async () => {
if (!disease.trim()) {
setError('Please enter the diagnosed condition.');
return;
}

if (!age || isNaN(parseInt(age)) || parseInt(age) < 0 || parseInt(age) > 150) {
setError('Please enter a valid age between 0 and 150.');
return;
}

if (!gender) {
setError('Please select a gender.');
return;
}

setIsLoading(true);
setError(null);
setResult(null);

try {
const response = await fetch('/api/treatment-plan', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
disease: disease.trim(),
age: parseInt(age),
gender: gender,
}),
});

const data = await response.json();

if (!response.ok) {
setError(data.error || 'Failed to generate diagnosis plan');
return;
}

if (data.data) {
setResult(data.data);
} else {
setError('No diagnosis data returned from the service.');
}
} catch (e: any) {
setError('An unexpected error occurred: ' + (e.message || 'Please try again.'));
console.error(e);
} finally {
setIsLoading(false);
}
};

return (
<div className="space-y-8">
<Card className="shadow-xl">
<CardHeader>
<CardTitle className="text-2xl flex items-center gap-2 text-primary">
<Stethoscope className="h-7 w-7" /> Medical Diagnosis & Treatment Plan
</CardTitle>
<CardDescription>
Enter a diagnosed condition and patient details to generate a comprehensive medical diagnosis and treatment plan.
</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-6">
<div>
<label htmlFor="disease" className="block text-sm font-medium text-foreground mb-1">
  Diagnosed Condition <span className="text-destructive">*</span>
</label>
<Input
  id="disease"
  type="text"
  value={disease}
  onChange={(e) => setDisease(e.target.value)}
  placeholder="e.g., Type 2 Diabetes, Hypertension, Pneumonia"
  required
  disabled={isLoading}
/>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
  <label htmlFor="age" className="block text-sm font-medium text-foreground mb-1">
    Patient Age <span className="text-destructive">*</span>
  </label>
  <Input
    id="age"
    type="number"
    value={age}
    onChange={(e) => setAge(e.target.value)}
    placeholder="e.g., 45"
    min="0"
    max="150"
    required
    disabled={isLoading}
  />
</div>
<div>
  <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-1">
    Patient Gender <span className="text-destructive">*</span>
  </label>
  <Select value={gender} onValueChange={setGender} disabled={isLoading}>
    <SelectTrigger>
      <SelectValue placeholder="Select gender" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="male">Male</SelectItem>
      <SelectItem value="female">Female</SelectItem>
      <SelectItem value="other">Other</SelectItem>
    </SelectContent>
  </Select>
</div>
</div>

<div>
<label htmlFor="additionalNotes" className="block text-sm font-medium text-foreground mb-1">
  Additional Notes (Optional)
</label>
<Textarea
  id="additionalNotes"
  value={additionalNotes}
  onChange={(e) => setAdditionalNotes(e.target.value)}
  placeholder="e.g., Patient history, allergies, current medications, specific concerns"
  className="min-h-[80px]"
  disabled={isLoading}
/>
</div>

<Button 
type="button" 
onClick={handleSubmit}
disabled={isLoading || !disease.trim() || !age || !gender} 
className={`w-full text-lg py-3 transition-all duration-200 ${
  isLoading || !disease.trim() || !age || !gender
    ? 'bg-gray-400 cursor-not-allowed' 
    : 'bg-primary hover:bg-primary/90 hover:shadow-lg'
} text-primary-foreground`}
>
{isLoading ? (
  <>
    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
    <span>Generating Diagnosis Plan...</span>
  </>
) : (
  <>
    <Stethoscope className="mr-2 h-5 w-5" />
    Generate Diagnosis & Treatment Plan
  </>
)}
</Button>
        </div>
</CardContent>
</Card>

{/* Loading Progress Indicator */}
{isLoading && (
<Card className="shadow-lg border-blue-200 bg-blue-50 dark:bg-blue-950/30">
<CardContent className="pt-6">
<div className="flex items-center justify-center space-x-4">
<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
<div className="space-y-2">
  <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
    Analyzing Medical Condition...
  </p>
  <div className="w-64 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
  </div>
  <p className="text-sm text-blue-700 dark:text-blue-300">
    Consulting medical databases and generating comprehensive treatment plan
  </p>
</div>
</div>
</CardContent>
</Card>
)}

{error && (
<Alert variant="destructive" className="shadow-md">
<AlertCircle className="h-5 w-5" />
<AlertTitle>Error</AlertTitle>
<AlertDescription>{error}</AlertDescription>
</Alert>
)}

{result && (
<Card className="shadow-xl mt-8 animate-in fade-in duration-500">
<CardHeader>
<CardTitle className="text-2xl flex items-center gap-2 text-primary">
<FileText className="h-7 w-7" /> Diagnosis: {result.condition}
</CardTitle>
<CardDescription>
Patient: {result.patient.age} year old {result.patient.gender}
</CardDescription>
</CardHeader>
<CardContent className="space-y-6">

<Section title="Clinical Summary" content={result.summary} icon={<FileText className="h-5 w-5" />} />

{result.diagnosticTests && result.diagnosticTests.length > 0 && (
<Section 
  title="Recommended Diagnostic Tests" 
  listContent={result.diagnosticTests} 
  icon={<CalendarCheck className="h-5 w-5" />}
/>
)}

{result.treatmentPlan && (
<div className="space-y-4">
  <h3 className="text-xl font-semibold text-foreground mb-2 border-b pb-1 border-primary/20 flex items-center gap-2">
    <Pill className="h-5 w-5" /> Treatment Plan
  </h3>
  
  {result.treatmentPlan.medications && result.treatmentPlan.medications.length > 0 && (
    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Medications</h4>
      <ul className="list-disc list-inside space-y-1">
        {result.treatmentPlan.medications.map((med, i) => (
          <li key={i} className="text-blue-800 dark:text-blue-200">{med}</li>
        ))}
      </ul>
    </div>
  )}
  
  {result.treatmentPlan.dosageGuidelines && Object.keys(result.treatmentPlan.dosageGuidelines).length > 0 && (
    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Dosage Guidelines</h4>
      {Object.entries(result.treatmentPlan.dosageGuidelines).map(([med, dosage], i) => (
        <div key={i} className="mb-2">
          <span className="font-medium text-green-800 dark:text-green-200">{med}:</span>
          <span className="ml-2 text-green-700 dark:text-green-300">{dosage}</span>
        </div>
      ))}
    </div>
  )}
  
  {result.treatmentPlan.duration && (
    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Treatment Duration</h4>
      <p className="text-purple-800 dark:text-purple-200">{result.treatmentPlan.duration}</p>
    </div>
  )}
</div>
)}

{result.lifestyle && result.lifestyle.length > 0 && (
<Section 
  title="Lifestyle Recommendations" 
  listContent={result.lifestyle} 
  icon={<Heart className="h-5 w-5" />}
  variant="lifestyle"
/>
)}

{result.diet && result.diet.length > 0 && (
<Section 
  title="Dietary Advice" 
  listContent={result.diet} 
  icon={<CalendarCheck className="h-5 w-5" />}
  variant="diet"
/>
)}

<Section title="Follow-Up Care" content={result.followUp} icon={<CalendarCheck className="h-5 w-5" />} />

{result.specialist && (
<Section title="Specialist Consultation" content={result.specialist} icon={<Stethoscope className="h-5 w-5" />} />
)}

{result.riskFactors && result.riskFactors.length > 0 && (
<Section 
  title="Risk Factors" 
  listContent={result.riskFactors} 
  icon={<AlertCircle className="h-5 w-5" />}
  variant="warning"
/>
)}

{result.preventiveMeasures && result.preventiveMeasures.length > 0 && (
<Section 
  title="Preventive Measures" 
  listContent={result.preventiveMeasures} 
  icon={<Heart className="h-5 w-5" />}
  variant="prevention"
/>
)}

</CardContent>

</Card>
)}
</div>
);
}

// Enhanced Section component
interface SectionProps {
title: string;
content?: string | null;
listContent?: string[];
icon?: React.ReactNode;
variant?: 'default' | 'lifestyle' | 'diet' | 'warning' | 'prevention';
}

const Section: React.FC<SectionProps> = ({ title, content, listContent, icon, variant = 'default' }) => {
if (!content && (!listContent || listContent.length === 0)) return null;

const getVariantStyles = () => {
switch (variant) {
case 'lifestyle':
return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
case 'diet':
return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
case 'warning':
return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
case 'prevention':
return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
default:
return 'bg-secondary/30 border-secondary';
}
};

return (
<div className="py-2">
<h3 className="text-xl font-semibold text-foreground mb-2 border-b pb-1 border-primary/20 flex items-center gap-2">
{icon} {title}
</h3>
{content && (
<div className={`p-4 rounded-lg border ${getVariantStyles()}`}>
<p className="text-sm whitespace-pre-wrap">{content}</p>
</div>
)}
{listContent && listContent.length > 0 && (
<div className={`p-4 rounded-lg border ${getVariantStyles()}`}>
<ul className="list-disc list-inside space-y-2">
{listContent.map((item, index) => (
<li key={index} className="text-sm">{item}</li>
))}
</ul>
</div>
)}
</div>
);
};