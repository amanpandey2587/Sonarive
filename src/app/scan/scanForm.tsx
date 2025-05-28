'use client'
import {useState,type FormEvent ,ChangeEvent} from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {Alert,AlertDescription,AlertTitle} from '@/components/ui/alert';
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'
import { handleScanUpload } from './action'
import type { AnalyzeMedicalScanOutput } from '@/ai/flows/analyzeMedicalScan'
import { UploadCloud,AlertCircle,CheckCircle,Microscope,ClipboardList,FileText,Stethoscope,Calendar,Pill,Heart,User,ShieldCheck,AlertTriangle } from 'lucide-react'

interface IntegratedMedicalReport {
  condition: string;
  patient: {
    age: number | null;
    gender: string;
  };
  summary: string;
  radiology: {
    findings: Array<{
      condition: string;
      location: string;
      severity: string;
      confidence: string;
    }>;
    summary: string;
    originalScanFindings?: Array<any>;
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

const ScanForm = () => {
    const [file,setFile]=useState<File|null>(null);
    const [previewUrl,setPreviewUrl]=useState<string|null>(null);
    const [isLoading,setIsLoading]=useState(false)
    const [loadingMessage,setLoadingMessage]=useState('Analyzing... ')
    const [error,setError]=useState<string|null>(null);
    const [analysisResult,setAnalysisResult]=useState<AnalyzeMedicalScanOutput|null>(null);
    const [progressValue,setProgressValue]=useState(0);
    
    const [showIntegratedForm, setShowIntegratedForm] = useState(false);
    const [disease, setDisease] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [gender, setGender] = useState('');
    const [integratedReport, setIntegratedReport] = useState<IntegratedMedicalReport | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const handleFileChange=(event:ChangeEvent<HTMLInputElement>)=>{
        const selectedFile=event.target.files?.[0];
        if(selectedFile){
            const allowedTypes=['image/png','image/jpeg','image/gif','image/webp'];
            if(!allowedTypes.includes(selectedFile.type)){
                setError('Invalid file type. Please upload an image (PNG,JPG,GIF,WEBP).');
                setFile(null);
                setPreviewUrl(null);
                return;
            }
            setError(null);
            setFile(selectedFile); 
            setAnalysisResult(null);
            setIntegratedReport(null);
            setShowIntegratedForm(false);
            const reader=new FileReader()
            reader.onloadend=()=>{
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile)
        }
    };

    const handleSubmit=async (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        if(!file){
            setError('Please select a file to upload. ');
            return;
        }
        setIsLoading(true)
        setError(null);
        setAnalysisResult(null);
        setIntegratedReport(null);
        setShowIntegratedForm(false);
        setProgressValue(0);
        setLoadingMessage('Analyzing your scan...');

        let currentProgress=0;
        const progressInterval=setInterval(()=>{
            currentProgress+=10;
            if(currentProgress<=90){
                setProgressValue(currentProgress);
            }
        },200)

        const reader=new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend=async()=>{
            const base64data=reader.result as string;
            try{
                const result=await handleScanUpload(base64data)
                console.log("Result in the frontend is" ,result);
                
                clearInterval(progressInterval)
                setProgressValue(100)
                if(result.error){
                    setError(result.error)
                    setAnalysisResult(null)
                }else if(result.data){
                    setAnalysisResult(result.data);
                    setDisease(result?.data?.summary);
                }
            }catch(e){
                clearInterval(progressInterval)
                setProgressValue(0)
                setError('An unexpected error occurred during the analysis. Please try again.');
                console.error(e);
            }finally{
                setIsLoading(false)
                setLoadingMessage('Analysis Complete')
                if(error){
                    setTimeout(()=>setProgressValue(0),2000);
                }
            }
        };
        reader.onerror=()=>{
            clearInterval(progressInterval)
            setProgressValue(0)
            setIsLoading(false)
            setError('Failed to read the file.');
        }
    }

    const handleGenerateIntegratedReport = async () => {
        if (!disease.trim() || !file) {
            setError('Please provide symptoms/condition and ensure scan is uploaded.');
            return;
        }

        setIsGeneratingReport(true);
        setError(null);
        setLoadingMessage('Generating comprehensive medical report...');

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            
            try {
                const response = await fetch('/api/scan-full', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        disease: disease.trim(),
                        scanDataUri: base64data,
                        age: age || undefined,
                        gender: gender || undefined,
                    }),
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to generate report');
                }

                if (result.data) {
                    setIntegratedReport(result.data);
                } else {
                    setError('No report data received');
                }
            } catch (e) {
                setError('Failed to generate integrated report. Please try again.');
                console.error('Integrated report error:', e);
            } finally {
                setIsGeneratingReport(false);
            }
        };
    };

    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Card */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <UploadCloud className="h-7 w-7" /> Upload Your Medical Scan
              </CardTitle>
              <CardDescription className="text-teal-100">
                Supports MRI, CT, and X-ray images (PNG, JPG, GIF, WEBP formats). Get AI-powered insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-b from-white to-slate-50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="scanFile" className="sr-only">Choose file</label>
                  <Input
                    id="scanFile"
                    type="file"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 cursor-pointer border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                    aria-describedby="fileHelp"
                    disabled={isLoading}
                  />
                  <p id="fileHelp" className="mt-1 text-sm text-slate-600">
                    Ensure your scan is clear and well-lit for best results.
                  </p>
                </div>
                {previewUrl && !analysisResult && (
                  <div className="mt-4 p-4 border-2 border-dashed border-teal-300 rounded-lg bg-teal-50 flex justify-center items-center max-h-96 overflow-hidden">
                    <img src={previewUrl} alt="Scan preview" className="max-h-80 rounded-md object-contain shadow-lg" />
                  </div>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading || !file} 
                  className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-lg py-3 shadow-lg"
                >
                  {isLoading ? loadingMessage : 'Analyze Scan'}
                </Button>
              </form>
            </CardContent>
          </Card>
  
          {isLoading && (
            <div className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <Progress value={progressValue} className="w-full h-3" />
              <p className="text-sm text-center text-slate-700">{loadingMessage} This may take some time...</p>
            </div>
          )}
  
          {error && (
            <Alert className="border-red-200 bg-red-50 shadow-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">Analysis Error</AlertTitle>
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
  
          {analysisResult && (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="h-7 w-7" /> Scan Analysis Complete
                </CardTitle>
                <CardDescription className="text-emerald-100">Review the findings from your medical scan analysis.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-gradient-to-b from-white to-slate-50">
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-slate-800">
                    <ClipboardList className="h-6 w-6 text-teal-600" /> Summary
                  </h3>
                  <p className="text-slate-700 bg-gradient-to-r from-teal-50 to-indigo-50 p-4 rounded-lg shadow-inner border-l-4 border-teal-500">{analysisResult.summary}</p>
                </div>
  
                {analysisResult.findings.length > 0 && analysisResult.findings.map((finding, index) => (
                  <Card key={index} className="bg-gradient-to-br from-white to-slate-50 shadow-lg border border-indigo-200">
                    <CardHeader className="bg-gradient-to-r from-indigo-100 to-teal-100">
                      <CardTitle className="flex items-center gap-2 text-lg text-indigo-800">
                         <Microscope className="h-5 w-5" /> Finding #{index + 1}: {finding.condition}
                      </CardTitle>
                      <CardDescription className="text-indigo-700">
                        Located at: {finding.anatomicalLocation}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                          <h4 className="font-semibold text-amber-800">Severity:</h4>
                          <p className="text-amber-700">{finding.severity}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <h4 className="font-semibold text-blue-800">Confidence:</h4>
                          <Progress value={finding.confidence * 100} className="h-2 mt-1" />
                          <p className="text-xs text-blue-700 text-right mt-1">{(finding.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {analysisResult.findings.length === 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">No specific findings</AlertTitle>
                    <AlertDescription className="text-green-700">
                      The analysis did not detect any specific anomalies based on the provided scan.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  {!showIntegratedForm ? (
                    <Button 
                      onClick={() => setShowIntegratedForm(true)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg py-3"
                      disabled={isGeneratingReport}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Comprehensive Medical Report
                    </Button>
                  ) : (
                    <Card className="bg-gradient-to-br from-slate-50 to-teal-50 border border-teal-200">
                      <CardHeader className="bg-gradient-to-r from-slate-100 to-teal-100 border-b border-teal-200">
                        <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                          <Stethoscope className="h-5 w-5 text-teal-600" />
                          Patient Information for Comprehensive Report
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                          Provide additional information to generate a detailed medical report
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="age" className="block text-sm font-medium mb-2 text-slate-700">
                              Age (optional)
                            </label>
                            <Input
                              id="age"
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                              placeholder="e.g., 45"
                              disabled={isGeneratingReport}
                              className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="gender" className="block text-sm font-medium mb-2 text-slate-700">
                              Gender (optional)
                            </label>
                            <select
                              id="gender"
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-full p-2 border border-teal-200 rounded-md bg-white focus:border-teal-500 focus:ring-teal-500"
                              disabled={isGeneratingReport}
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={handleGenerateIntegratedReport}
                            disabled={isGeneratingReport}
                            className="flex-1 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700"
                          >
                            {isGeneratingReport ? (
                              <>Generating Report...</>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setShowIntegratedForm(false)}
                            disabled={isGeneratingReport}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
  
          {integratedReport && (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-7 w-7" /> Comprehensive Medical Report
                </CardTitle>
                <CardDescription className="text-indigo-100">Integrated analysis combining scan findings with clinical presentation</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8 bg-gradient-to-b from-white to-slate-50">
                
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-200 border-b border-blue-300">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <User className="h-5 w-5" /> Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/70 p-3 rounded-lg">
                        <span className="font-semibold text-blue-800">Condition:</span>
                        <p className="text-blue-700">{integratedReport.condition}</p>
                      </div>
                      {integratedReport.patient.age && (
                        <div className="bg-white/70 p-3 rounded-lg">
                          <span className="font-semibold text-blue-800">Age:</span>
                          <p className="text-blue-700">{integratedReport.patient.age}</p>
                        </div>
                      )}
                      <div className="bg-white/70 p-3 rounded-lg">
                        <span className="font-semibold text-blue-800">Gender:</span>
                        <p className="text-blue-700">{integratedReport.patient.gender}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
  
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-slate-800">
                    <ClipboardList className="h-6 w-6 text-teal-600" /> Executive Summary
                  </h3>
                  <p className="text-slate-700 bg-gradient-to-r from-teal-50 to-indigo-50 p-4 rounded-lg shadow-inner border-l-4 border-teal-500">{integratedReport.summary}</p>
                </div>
  
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-emerald-100 to-teal-200 border-b border-emerald-300">
                    <CardTitle className="flex items-center gap-2 text-emerald-800">
                      <Heart className="h-5 w-5" /> Clinical Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-emerald-800 bg-white/70 p-3 rounded-lg">{integratedReport.diagnosisPlan.clinicalSummary}</p>
                  </CardContent>
                </Card>
  
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-200 border-b border-purple-300">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Pill className="h-5 w-5" /> Treatment Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {integratedReport.diagnosisPlan.treatment.medications.length > 0 && (
                      <div className="bg-white/70 p-3 rounded-lg">
                        <h4 className="font-semibold mb-2 text-purple-800">Medications:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {integratedReport.diagnosisPlan.treatment.medications.map((med, i) => (
                            <li key={i} className="text-purple-700">
                              {med}
                              {integratedReport.diagnosisPlan.treatment.dosages[med] && (
                                <span className="ml-2 text-sm font-medium text-purple-600">
                                  ({integratedReport.diagnosisPlan.treatment.dosages[med]})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {integratedReport.diagnosisPlan.lifestyle.length > 0 && (
                      <div className="bg-white/70 p-3 rounded-lg">
                        <h4 className="font-semibold mb-2 text-purple-800">Lifestyle Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {integratedReport.diagnosisPlan.lifestyle.map((item, i) => (
                            <li key={i} className="text-purple-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
  
                    {integratedReport.diagnosisPlan.diet.length > 0 && (
                      <div className="bg-white/70 p-3 rounded-lg">
                        <h4 className="font-semibold mb-2 text-purple-800">Dietary Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {integratedReport.diagnosisPlan.diet.map((item, i) => (
                            <li key={i} className="text-purple-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-200 border-b border-orange-300">
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <Calendar className="h-5 w-5" /> Follow-up Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-orange-800 bg-white/70 p-3 rounded-lg">{integratedReport.diagnosisPlan.followUp}</p>
                      {integratedReport.diagnosisPlan.specialists && (
                        <div className="mt-3 bg-white/70 p-3 rounded-lg">
                          <h4 className="font-semibold text-orange-800">Specialist Referrals:</h4>
                          <p className="text-orange-700">{integratedReport.diagnosisPlan.specialists}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
  
                  {integratedReport.diagnosisPlan.tests.length > 0 && (
                    <Card className="bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-200 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-violet-100 to-purple-200 border-b border-violet-300">
                        <CardTitle className="flex items-center gap-2 text-violet-800">
                          <Microscope className="h-5 w-5" /> Additional Tests
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ul className="list-disc list-inside space-y-1">
                          {integratedReport.diagnosisPlan.tests.map((test, i) => (
                            <li key={i} className="text-violet-700 bg-white/70 p-2 rounded mb-1">{test}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
  
                {(integratedReport.diagnosisPlan.risks.length > 0 || integratedReport.diagnosisPlan.prevention.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integratedReport.diagnosisPlan.risks.length > 0 && (
                      <Card className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-red-100 to-rose-200 border-b border-red-300">
                          <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-5 w-5" /> Risks
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ul className="list-disc list-inside space-y-1">
                            {integratedReport.diagnosisPlan.risks.map((risk, i) => (
                              <li key={i} className="text-red-700 bg-white/70 p-2 rounded mb-1">{risk}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
  
                    {integratedReport.diagnosisPlan.prevention.length > 0 && (
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-200 border-b border-green-300">
                          <CardTitle className="flex items-center gap-2 text-green-800">
                            <ShieldCheck className="h-5 w-5" /> Prevention
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ul className="list-disc list-inside space-y-1">
                            {integratedReport.diagnosisPlan.prevention.map((tip, i) => (
                              <li key={i} className="text-green-700 bg-white/70 p-2 rounded mb-1">{tip}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
}

export default ScanForm;

        