'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle, Pill, Info, IndianRupee, Users, Clock, AlertTriangle } from 'lucide-react';

// Updated types to match the new API response
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
  imageUrl?: string; // Added for medicine images
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
      setError('Please enter at least one drug name to research.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse the input into an array of drug names
      const drugsArray = drugInput
        .split(',')
        .map(drug => drug.trim())
        .filter(drug => drug.length > 0);

      const response = await fetch('/api/drug-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drugs: drugsArray
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Response data in the frontend is ",response);
      if (responseData.data) {
        setResult(responseData.data);
      } else {
        setError('No information returned for the specified drugs.');
      }
    } catch (e: any) {
      setError('An unexpected error occurred: ' + (e.message || 'Please try again.'));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-xl p-6 shadow-2xl border border-white/20">
      <Card className="shadow-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm border border-white/20 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-teal-500">
            <Pill className="h-7 w-7" /> Drug Information Research
          </CardTitle>
          <CardDescription className="text-indigo-300">
            Enter drug names (comma-separated) to get comprehensive information including pricing, alternatives, dosages, and side effects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="drugInput" className="block text-sm font-medium text-white mb-1">
                Drug Names <span className="text-red-400">*</span>
              </label>
              <Textarea
                id="drugInput"
                value={drugInput}
                onChange={(e) => setDrugInput(e.target.value)}
                placeholder="e.g., Amoxicillin, Paracetamol, Aspirin"
                className="min-h-[80px] bg-white/20 text-white placeholder:text-indigo-300 border border-white/30 rounded-lg focus:ring-teal-500"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-indigo-200 mt-1">
                Enter multiple drug names separated by commas
              </p>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-blue-500 hover:from-teal-600 hover:to-indigo-600 text-white text-lg py-3 rounded-xl shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Researching Drugs...
                </>
              ) : 'Get Drug Information'}
            </Button>
          </form>
        </CardContent>
      </Card>
  
      {error && (
        <Alert variant="destructive" className="shadow-md bg-red-500/20 backdrop-blur-md border border-red-400/30 text-white">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
  
      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {result.drugs.map((drug, index) => (
            <Card key={index} className="shadow-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm border border-white/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-indigo-400">
                  <Pill className="h-6 w-6" /> {drug.drugName}
                </CardTitle>
                {drug.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={drug.imageUrl}
                      alt={`${drug.drugName} medicine`}
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-white/30"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6 text-white">
                <div className="bg-teal-500/10 p-4 rounded-lg border border-teal-400/30">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-teal-300">
                    <IndianRupee className="h-5 w-5" /> Price in India
                  </h3>
                  <p className="text-teal-200 font-medium">{drug.standardPriceINR}</p>
                </div>
  
                {drug.genericAlternatives && drug.genericAlternatives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-300 mb-2">Generic Alternatives</h3>
                    <div className="flex flex-wrap gap-2">
                      {drug.genericAlternatives.map((alt, i) => (
                        <span key={i} className="bg-indigo-700/30 text-indigo-100 px-3 py-1 rounded-full text-sm">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
  
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5" /> Dosage by Age Group
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-400/30">
                      <h4 className="font-medium text-blue-300">Children</h4>
                      <p className="text-sm text-blue-200">{drug.dosageByAgeGroup.children}</p>
                    </div>
                    <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-400/30">
                      <h4 className="font-medium text-indigo-300">Adults</h4>
                      <p className="text-sm text-indigo-200">{drug.dosageByAgeGroup.adults}</p>
                    </div>
                    <div className="bg-teal-500/10 p-3 rounded-lg border border-teal-400/30">
                      <h4 className="font-medium text-teal-300">Elderly</h4>
                      <p className="text-sm text-teal-200">{drug.dosageByAgeGroup.elderly}</p>
                    </div>
                  </div>
                </div>
  
                <div>
                  <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Usage Instructions
                  </h3>
                  <p className="bg-white/10 p-3 rounded-lg border border-white/20 text-indigo-200">
                    {drug.usageInstructions}
                  </p>
                </div>
  
                {drug.sideEffects && drug.sideEffects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" /> Common Side Effects
                    </h3>
                    <ul className="list-disc list-inside text-yellow-200 space-y-1 pl-2">
                      {drug.sideEffects.map((effect, i) => (
                        <li key={i} className="text-sm">{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
  
                {drug.allergies && drug.allergies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-300 mb-2">
                      Known Allergies & Contraindications
                    </h3>
                    <ul className="list-disc list-inside text-red-200 space-y-1 pl-2">
                      {drug.allergies.map((allergy, i) => (
                        <li key={i} className="text-sm">{allergy}</li>
                      ))}
                    </ul>
                  </div>
                )}
  
                {drug.specialistRecommendation && (
                  <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-400/30">
                    <h3 className="text-lg font-semibold text-indigo-200 mb-2">
                      Specialist Recommendation
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {drug.specialistRecommendation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  
}