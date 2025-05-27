'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function TreatmentPlanForm() {
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

    // Simulate API call with mock data
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: DiagnosisResponse = {
        condition: disease,
        patient: { age: parseInt(age), gender },
        summary: `Based on the clinical presentation and patient demographics, the diagnosis of ${disease} requires comprehensive management. This condition affects multiple body systems and requires careful monitoring and treatment adherence.`,
        diagnosticTests: [
          'Complete Blood Count (CBC)',
          'Comprehensive Metabolic Panel',
          'HbA1c (if diabetes related)',
          'Lipid Profile',
          'Urinalysis'
        ],
        treatmentPlan: {
          medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg'],
          dosageGuidelines: {
            'Metformin': '500mg twice daily with meals',
            'Lisinopril': '10mg once daily in the morning',
            'Atorvastatin': '20mg once daily in the evening'
          },
          duration: 'Initial treatment period of 3 months with regular monitoring and adjustments as needed'
        },
        lifestyle: [
          'Regular physical activity (150 minutes moderate exercise per week)',
          'Maintain healthy weight (BMI 18.5-24.9)',
          'Stress management techniques',
          'Adequate sleep (7-9 hours nightly)',
          'Smoking cessation if applicable'
        ],
        diet: [
          'Low-sodium diet (<2300mg daily)',
          'Increase fiber intake (25-35g daily)',
          'Limit processed foods and refined sugars',
          'Include omega-3 rich foods',
          'Maintain consistent meal timing'
        ],
        followUp: 'Schedule follow-up appointment in 2-4 weeks to assess treatment response and adjust medications as needed. Regular monitoring every 3 months thereafter.',
        specialist: 'Consider referral to endocrinologist for specialized management if condition does not improve within 3 months.',
        riskFactors: [
          'Family history of cardiovascular disease',
          'Sedentary lifestyle',
          'Poor dietary habits',
          'Chronic stress',
          'Age-related metabolic changes'
        ],
        preventiveMeasures: [
          'Annual comprehensive health screenings',
          'Regular blood pressure monitoring',
          'Maintain updated vaccinations',
          'Regular dental and eye examinations',
          'Early intervention for risk factor modification'
        ]
      };

      setResult(mockResult);
    } catch (e: any) {
      setError('An unexpected error occurred: ' + (e.message || 'Please try again.'));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Stethoscope className="h-10 w-10 text-teal-300" />
            Medical Diagnosis System
          </h1>
          <p className="text-teal-100 text-lg">Advanced AI-Powered Treatment Planning</p>
        </div>

        {/* Main Form Card */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl flex items-center gap-2 text-white">
              <Stethoscope className="h-7 w-7 text-teal-300" /> Medical Diagnosis & Treatment Plan
            </CardTitle>
            <CardDescription className="text-teal-100">
              Enter a diagnosed condition and patient details to generate a comprehensive medical diagnosis and treatment plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label htmlFor="disease" className="block text-sm font-medium text-white mb-2">
                  Diagnosed Condition <span className="text-red-400">*</span>
                </label>
                <Input
                  id="disease"
                  type="text"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  placeholder="e.g., Type 2 Diabetes, Hypertension, Pneumonia"
                  required
                  disabled={isLoading}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:bg-white/30 focus:border-teal-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-white mb-2">
                    Patient Age <span className="text-red-400">*</span>
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
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:bg-white/30 focus:border-teal-300"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-white mb-2">
                    Patient Gender <span className="text-red-400">*</span>
                  </label>
                  <Select value={gender} onValueChange={setGender} disabled={isLoading}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30 focus:border-teal-300">
                      <SelectValue placeholder="Select gender" className="text-gray-300" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="male" className="text-white focus:bg-teal-600">Male</SelectItem>
                      <SelectItem value="female" className="text-white focus:bg-teal-600">Female</SelectItem>
                      <SelectItem value="other" className="text-white focus:bg-teal-600">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-white mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  id="additionalNotes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g., Patient history, allergies, current medications, specific concerns"
                  className="min-h-[80px] bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:bg-white/30 focus:border-teal-300"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isLoading || !disease.trim() || !age || !gender} 
                className={`w-full text-lg py-6 transition-all duration-300 ${
                  isLoading || !disease.trim() || !age || !gender
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                } text-white shadow-xl`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" /> 
                    <span>Generating Diagnosis Plan...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="mr-3 h-6 w-6" />
                    Generate Diagnosis & Treatment Plan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Progress Indicator */}
        {isLoading && (
          <Card className="backdrop-blur-md bg-teal-500/20 border-teal-300/30 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <Loader2 className="h-12 w-12 animate-spin text-teal-300" />
                <div className="space-y-3">
                  <p className="text-xl font-medium text-white">
                    Analyzing Medical Condition...
                  </p>
                  <div className="w-80 bg-white/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-teal-300 to-blue-400 h-3 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-sm text-teal-100">
                    Consulting medical databases and generating comprehensive treatment plan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="backdrop-blur-md bg-red-500/20 border-red-300/30 shadow-xl">
            <AlertCircle className="h-5 w-5 text-red-300" />
            <AlertTitle className="text-red-200">Error</AlertTitle>
            <AlertDescription className="text-red-100">{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl animate-in fade-in duration-500">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-2 text-white">
                <FileText className="h-7 w-7 text-teal-300" /> Diagnosis: {result.condition}
              </CardTitle>
              <CardDescription className="text-teal-100">
                Patient: {result.patient.age} year old {result.patient.gender}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

              <Section title="Clinical Summary" content={result.summary} icon={<FileText className="h-5 w-5" />} />

              {result.diagnosticTests && result.diagnosticTests.length > 0 && (
                <Section 
                  title="Recommended Diagnostic Tests" 
                  listContent={result.diagnosticTests} 
                  icon={<CalendarCheck className="h-5 w-5" />}
                />
              )}

              {result.treatmentPlan && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4 border-b border-teal-300/30 pb-2 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-teal-300" /> Treatment Plan
                  </h3>
                  
                  {result.treatmentPlan.medications && result.treatmentPlan.medications.length > 0 && (
                    <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-300/30 p-6 rounded-xl">
                      <h4 className="font-semibold text-blue-200 mb-3 text-lg">Medications</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {result.treatmentPlan.medications.map((med, i) => (
                          <li key={i} className="text-blue-100">{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.treatmentPlan.dosageGuidelines && Object.keys(result.treatmentPlan.dosageGuidelines).length > 0 && (
                    <div className="backdrop-blur-sm bg-green-500/20 border border-green-300/30 p-6 rounded-xl">
                      <h4 className="font-semibold text-green-200 mb-3 text-lg">Dosage Guidelines</h4>
                      {Object.entries(result.treatmentPlan.dosageGuidelines).map(([med, dosage], i) => (
                        <div key={i} className="mb-3">
                          <span className="font-medium text-green-100">{med}:</span>
                          <span className="ml-2 text-green-200">{dosage}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {result.treatmentPlan.duration && (
                    <div className="backdrop-blur-sm bg-purple-500/20 border border-purple-300/30 p-6 rounded-xl">
                      <h4 className="font-semibold text-purple-200 mb-2 text-lg">Treatment Duration</h4>
                      <p className="text-purple-100">{result.treatmentPlan.duration}</p>
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
        return 'backdrop-blur-sm bg-orange-500/20 border-orange-300/30';
      case 'diet':
        return 'backdrop-blur-sm bg-green-500/20 border-green-300/30';
      case 'warning':
        return 'backdrop-blur-sm bg-red-500/20 border-red-300/30';
      case 'prevention':
        return 'backdrop-blur-sm bg-blue-500/20 border-blue-300/30';
      default:
        return 'backdrop-blur-sm bg-white/10 border-white/20';
    }
  };

  return (
    <div className="py-2">
      <h3 className="text-xl font-semibold text-white mb-4 border-b border-teal-300/30 pb-2 flex items-center gap-2">
        <span className="text-teal-300">{icon}</span> {title}
      </h3>
      {content && (
        <div className={`p-6 rounded-xl border ${getVariantStyles()}`}>
          <p className="text-sm whitespace-pre-wrap text-gray-100 leading-relaxed">{content}</p>
        </div>
      )}
      {listContent && listContent.length > 0 && (
        <div className={`p-6 rounded-xl border ${getVariantStyles()}`}>
          <ul className="list-disc list-inside space-y-2">
            {listContent.map((item, index) => (
              <li key={index} className="text-sm text-gray-100 leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};