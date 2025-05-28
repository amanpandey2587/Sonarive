'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Users, MessageSquareHeart, Activity, Stethoscope } from 'lucide-react';

interface SecondOpinionInput {
  disease: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicationWithDosages: string;
}

interface SecondOpinionResponse {
  condition: string;
  patient: {
    age: number;
    gender: string;
  };
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
    
    if (!disease.trim() || !age.trim() || !medicationWithDosages.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setError('Please enter a valid age between 0 and 150.');
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

      const response = await fetch('/api/second-opinion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Failed to get second opinion');
        return;
      }

      if (responseData.data) {
        setResult(responseData.data);
      } else {
        setError('No second opinion data returned from the service.');
      }
    } catch (e: any) {
      setError('An unexpected error occurred: ' + (e.message || 'Please try again.'));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-indigo-600 to-blue-600 p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-teal-500/10 via-indigo-500/10 to-blue-500/10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(14,165,233,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative max-w-4xl mx-auto space-y-8">
        <Card className="backdrop-blur-lg bg-white/30 border border-white/20 shadow-2xl shadow-teal-500/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 shadow-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
              AI Medical Second Opinion
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              Get a comprehensive second opinion powered by advanced AI research
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-2xl shadow-indigo-500/10">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
              <Users className="h-7 w-7 text-teal-600" /> Patient Information
            </CardTitle>
            <CardDescription className="text-slate-600">
              Provide patient details to receive a personalized medical second opinion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="disease" className="block text-sm font-semibold text-slate-700">
                    Diagnosed Condition <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="disease"
                    type="text"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    placeholder="e.g., Type 2 Diabetes, Hypertension"
                    required
                    disabled={isLoading}
                    className="backdrop-blur-sm bg-white/50 border-white/40 focus:border-teal-400 focus:ring-teal-400/20 text-slate-800 placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-sm font-semibold text-slate-700">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="35"
                      min="0"
                      max="150"
                      required
                      disabled={isLoading}
                      className="backdrop-blur-sm bg-white/50 border-white/40 focus:border-teal-400 focus:ring-teal-400/20 text-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                      disabled={isLoading}
                      className="w-full px-3 py-2 rounded-md backdrop-blur-sm bg-white/50 border border-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 text-slate-800 focus:outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="medication" className="block text-sm font-semibold text-slate-700">
                  Current Medications & Dosages <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="medication"
                  value={medicationWithDosages}
                  onChange={(e) => setMedicationWithDosages(e.target.value)}
                  placeholder="e.g., Metformin 500mg twice daily, Lisinopril 10mg once daily"
                  className="min-h-[100px] backdrop-blur-sm bg-white/50 border-white/40 focus:border-teal-400 focus:ring-teal-400/20 text-slate-800 placeholder:text-slate-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-semibold text-lg py-6 shadow-lg shadow-teal-500/25 border-0 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" /> 
                    Analyzing Medical Data...
                  </>
                ) : (
                  <>
                    <Activity className="mr-3 h-5 w-5" />
                    Get AI Second Opinion
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert className="backdrop-blur-lg bg-red-50/80 border border-red-200/50 shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 font-semibold">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Card className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-2xl shadow-blue-500/10 animate-in fade-in duration-700">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                <MessageSquareHeart className="h-7 w-7 text-indigo-600" /> 
                Second Opinion Report
              </CardTitle>
              <CardDescription className="text-slate-600 text-lg">
                Analysis for {result.condition} - Patient: {result.patient.age} years, {result.patient.gender}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section 
                title="Current Treatment Assessment" 
                content={result.assessment}
                icon={<Activity className="h-5 w-5" />}
              />
              
              {result.recommendations.adjustments.length > 0 && (
                <Section 
                  title="Recommended Adjustments" 
                  listContent={result.recommendations.adjustments}
                  icon={<Stethoscope className="h-5 w-5" />}
                  variant="teal"
                />
              )}
              
              {result.recommendations.alternativeTreatments.length > 0 && (
                <Section 
                  title="Alternative Treatment Options" 
                  listContent={result.recommendations.alternativeTreatments}
                  icon={<Users className="h-5 w-5" />}
                  variant="indigo"
                />
              )}
              
              {result.recommendations.tests.length > 0 && (
                <Section 
                  title="Recommended Additional Tests" 
                  listContent={result.recommendations.tests}
                  icon={<AlertCircle className="h-5 w-5" />}
                  variant="blue"
                />
              )}
              
              <Section 
                title="Clinical Justification" 
                content={result.justification}
                icon={<MessageSquareHeart className="h-5 w-5" />}
              />
              
              {result.warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Important Warnings & Monitoring
                  </h3>
                  <ul className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-amber-700">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            
          </Card>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  content?: string;
  listContent?: string[];
  icon?: React.ReactNode;
  variant?: 'teal' | 'indigo' | 'blue';
}

const Section: React.FC<SectionProps> = ({ title, content, listContent, icon, variant = 'teal' }) => {
  if (!content && (!listContent || listContent.length === 0)) return null;
  
  const variantStyles = {
    teal: 'from-teal-50 to-cyan-50 border-teal-200/50 text-teal-800',
    indigo: 'from-indigo-50 to-purple-50 border-indigo-200/50 text-indigo-800',
    blue: 'from-blue-50 to-sky-50 border-blue-200/50 text-blue-800'
  };

  return (
    <div className={`p-4 rounded-lg bg-gradient-to-r ${variantStyles[variant]} border backdrop-blur-sm`}>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      {content && (
        <div className="prose prose-sm max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      )}
      {listContent && listContent.length > 0 && (
        <ul className="space-y-2 mt-2">
          {listContent.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-slate-700">
              <span className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0 opacity-60"></span>
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};