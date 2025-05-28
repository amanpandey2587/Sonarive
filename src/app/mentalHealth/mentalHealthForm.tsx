'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Brain, MessageSquareHeart, Activity, Info, Mic, MicOff, User, ChevronRight, ChevronLeft, CheckCircle, Maximize, LocateFixed, MapPin } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

// Types for API communication
export interface MentalWellnessAnalysisInput {
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phq9Score?: number;
  gad7Score?: number;
  textInput?: string;
  userLatitude?: number;
  userLongitude?: number;
}

export interface MentalWellnessAnalysisOutput {
  comprehensiveReportMarkdown: string;
}

// Simplified speech recognition interface
interface SimpleSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SimpleSpeechRecognition;
    SpeechRecognition?: new () => SimpleSpeechRecognition;
  }
}

type Step = 'start' | 'demographics' | 'text-input' | 'phq9' | 'gad7' | 'review' | 'results';
  
interface ApiResult {
  analysis: MentalWellnessAnalysisOutput | null;
  error?: string | null; 
}

const phq9Questions = [
  { id: 'q1', text: "Little interest or pleasure in doing things" },
  { id: 'q2', text: "Feeling down, depressed, or hopeless" },
  { id: 'q3', text: "Trouble falling or staying asleep, or sleeping too much" },
  { id: 'q4', text: "Feeling tired or having little energy" },
  { id: 'q5', text: "Poor appetite or overeating" },
  { id: 'q6', text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down" },
  { id: 'q7', text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
  { id: 'q8', text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual" },
  { id: 'q9', text: "Thoughts that you would be better off dead or of hurting yourself in some way" },
];

const gad7Questions = [
  { id: 'g1', text: "Feeling nervous, anxious, or on edge" },
  { id: 'g2', text: "Not being able to stop or control worrying" },
  { id: 'g3', text: "Worrying too much about different things" },
  { id: 'g4', text: "Trouble relaxing" },
  { id: 'g5', text: "Being so restless that it's hard to sit still" },
  { id: 'g6', text: "Becoming easily annoyed or irritable" },
  { id: 'g7', text: "Feeling afraid as if something awful might happen" },
];

const answerOptions = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

// API call function
async function handleMentalWellnessAnalysis(input: MentalWellnessAnalysisInput): Promise<ApiResult> {
  try {
    // Map the input to match the API schema
    const apiPayload = {
      age: input.age,
      gender: input.gender,
      ph9Score: input.phq9Score || 0, // API expects ph9Score, not phq9Score
      gad7Score: input.gad7Score || 0,
      textInput: input.textInput || "No additional text provided", // API requires non-empty string
      userLatitude: input.userLatitude,
      userLongitude: input.userLongitude,
    };

    const response = await fetch('/api/mental-health', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        analysis: null,
        error: data.error || `API error: ${response.statusText}`,
      };
    }

    return {
      analysis: {
        comprehensiveReportMarkdown: data.interventionPlan || 'No intervention plan received.',
      },
      error: null,
    };
  } catch (error: any) {
    console.error('API call failed:', error);
    return {
      analysis: null,
      error: error.message || 'Failed to connect to the analysis service.',
    };
  }
}

export default function MentalHealthForm() {
  const [currentStep, setCurrentStep] = useState<Step>('start');
  const [age, setAge] = useState<number | string>(''); // Allow string for empty input
  const [gender, setGender] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [phq9Answers, setPhq9Answers] = useState<Record<string, number>>({});
  const [gad7Answers, setGad7Answers] = useState<Record<string, number>>({});
  
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<ApiResult | null>(null); 
  
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SimpleSpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          setTextInput(prevText => prevText ? `${prevText.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error object:', event);
        setIsListening(false);
        let errorMessage = 'Speech recognition error occurred.';
        if (event.error) {
            switch (event.error) {
                case 'network': errorMessage = 'Network error with speech service. Please check your internet connection.'; break;
                case 'not-allowed': errorMessage = 'Microphone access denied. Please enable microphone permissions for this site in your browser settings.'; break;
                case 'no-speech': errorMessage = 'No speech detected. Please try speaking again.'; break;
                case 'audio-capture': errorMessage = 'Audio capture failed. Please check if your microphone is connected and enabled in your system settings, and that no other application is exclusively using it.'; break;
                case 'service-not-allowed': errorMessage = 'Speech recognition service not allowed by the browser or an extension.'; break;
                default: errorMessage = `Speech error: ${event.error}. Please try again or check microphone settings.`;
            }
        }
        setMicError(errorMessage);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  const toggleListening = async () => {
    if (!recognitionRef.current || !isSpeechSupported) {
      setMicError('Speech recognition not available or not initialized.');
      return;
    }
    setMicError(null);
  
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        // Ensure microphone permission is granted before starting
        await navigator.mediaDevices.getUserMedia({ audio: true }); 
        recognitionRef.current.start();
      } catch (err: any) {
        console.error('Error starting speech recognition or getting mic permission:', err);
        let specificError = `Could not start voice input. Please check your microphone and browser permissions. Details: ${err.message}`;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          specificError = 'Microphone permission denied. Please enable it in your browser settings for this site.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          specificError = 'No microphone found. Please connect a microphone and ensure it is enabled.';
        } else if (err.name === 'InvalidStateError') {
           specificError = 'Microphone is busy or in an invalid state. Please try again in a moment.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') { // TrackStartError is sometimes thrown by Chrome for hardware issues
          specificError = 'Microphone is not readable or could not start. This might be due to a hardware issue, an OS-level permission problem, or another application using the microphone.';
        }
        setMicError(specificError);
        setIsListening(false);
      }
    }
  };
  
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLatitude(position.coords.latitude);
          setUserLongitude(position.coords.longitude);
          setIsGettingLocation(false);
        },
        (err) => {
          setLocationError(`Error getting location: ${err.message}. Please ensure location services are enabled and try again.`);
          setIsGettingLocation(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const calculateScore = (answers: Record<string, number>, questions: any[]) => {
    return questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
  };

  const handleSubmit = async () => {
    const numericAge = typeof age === 'string' && age !== '' ? parseInt(age, 10) : (typeof age === 'number' ? age : undefined);

    if (numericAge === undefined || numericAge <= 0) {
      setError("Please enter a valid age.");
      setCurrentStep('demographics');
      return;
    }
    if (!gender) {
        setError("Please select a gender.");
        setCurrentStep('demographics');
        return;
    }
     if (textInput.trim().length < 10 && (Object.keys(phq9Answers).length < phq9Questions.length || Object.keys(gad7Answers).length < gad7Questions.length)) {
      setError("Please provide either text input (min 10 chars) or complete both PHQ-9 and GAD-7 questionnaires fully.");
      if(textInput.trim().length < 10 && Object.keys(phq9Answers).length < phq9Questions.length && Object.keys(gad7Answers).length < gad7Questions.length ) setCurrentStep('text-input');
      else if (Object.keys(phq9Answers).length < phq9Questions.length) setCurrentStep('phq9');
      else setCurrentStep('gad7');
      return;
    }

    const phq9Score = Object.keys(phq9Answers).length === phq9Questions.length ? calculateScore(phq9Answers, phq9Questions) : undefined;
    const gad7Score = Object.keys(gad7Answers).length === gad7Questions.length ? calculateScore(gad7Answers, gad7Questions) : undefined;
    
    setIsLoading(true);
    setError(null);
    setApiResult(null);
    
    const payload: MentalWellnessAnalysisInput = {
      age: numericAge,
      gender: gender as any,
      phq9Score, 
      gad7Score,
      textInput: textInput.trim() || undefined, // Send undefined if empty
      userLatitude: userLatitude ?? undefined,
      userLongitude: userLongitude ?? undefined,
    };

    try {
      const result = await handleMentalWellnessAnalysis(payload);
      
      setApiResult(result); 
      
      if (result.error) {
        setError(result.error);
      }
      setCurrentStep('results');

    } catch (error) {
      const err=error as Error
      console.error("Mental health analysis call failed:", err);
      setError(err.message || 'An error occurred during analysis. Please try again.');
      setApiResult({ analysis: null, error: err.message || 'An error occurred during analysis. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    const steps: Step[] = ['start', 'demographics', 'text-input', 'phq9', 'gad7', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex) / (steps.length -1 )) * 100; 
  };

  const isStepComplete = (step: Step) => {
    switch (step) {
      case 'demographics': 
        const numericAge = typeof age === 'string' && age !== '' ? parseInt(age, 10) : (typeof age === 'number' ? age : undefined);
        return (numericAge !== undefined && numericAge > 0) && gender !== '';
      case 'text-input': return textInput.trim().length >= 0; 
      case 'phq9': return Object.keys(phq9Answers).length === phq9Questions.length;
      case 'gad7': return Object.keys(gad7Answers).length === gad7Questions.length;
      default: return true;
    }
  };
  
  const canProceedToNext = () => {
    if (currentStep === 'review') {
        const demographicsMet = isStepComplete('demographics');
        const textInputMet = textInput.trim().length >= 10;
        const questionnairesMet = isStepComplete('phq9') && isStepComplete('gad7');
        return demographicsMet && (textInputMet || questionnairesMet);
    }
    return isStepComplete(currentStep);
  };

  const StepNavigation = () => (
    <div className="flex justify-between items-center mt-6 pt-4 border-t">
      <Button
        variant="outline"
        onClick={() => {
          const steps: Step[] = ['start', 'demographics', 'text-input', 'phq9', 'gad7', 'review'];
          const currentIndex = steps.indexOf(currentStep);
          if (currentIndex > 1) setCurrentStep(steps[currentIndex - 1]); 
          else if (currentIndex === 1) setCurrentStep('start');
        }}
        disabled={currentStep === 'start' || isLoading}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>
      
      <div className="flex-1 flex justify-center items-center px-4">
        {['demographics', 'text-input', 'phq9', 'gad7', 'review'].map((stepId) => {
          const stepKey = stepId as Step;
          const isCompleted = isStepComplete(stepKey);
          const isActive = currentStep === stepKey;
          const stepsOrder: Step[] = ['start', 'demographics', 'text-input', 'phq9', 'gad7', 'review', 'results'];
          let bgColorClass = 'bg-muted';
          if (isCompleted && stepsOrder.indexOf(currentStep) > stepsOrder.indexOf(stepKey)) { 
            bgColorClass = 'bg-green-500';
          } else if (isActive) {
            bgColorClass = 'bg-primary scale-125';
          }
          
          return (
            <React.Fragment key={stepId}>
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${bgColorClass}`}
              />
              {stepId !== 'review' && <div className="flex-1 h-0.5 bg-muted mx-1"></div>}
            </React.Fragment>
          );
        })}
      </div>

      <Button
        onClick={() => {
          if (currentStep === 'review') {
            handleSubmit();
          } else {
            const steps: Step[] = ['start', 'demographics', 'text-input', 'phq9', 'gad7', 'review'];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1]);
          }
        }}
        disabled={!canProceedToNext() || isLoading}
        className="flex items-center gap-2"
      >
        {currentStep === 'review' ? (
          isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              Get Analysis <Brain className="h-4 w-4" />
            </>
          )
        ) : (
          <>
            Next <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
  
  const steps: Step[] = ['start', 'demographics', 'text-input', 'phq9', 'gad7', 'review', 'results'];
  
  const renderStep = () => {
    switch (currentStep) {case 'start':
    return (
      <Card className="shadow-xl animate-in fade-in duration-500 border-indigo-200 bg-gradient-to-br from-indigo-50 to-teal-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-3 text-indigo-700">
            <Brain className="h-8 w-8 text-teal-600" /> Mental Wellness Assessment
          </CardTitle>
          <CardDescription className="text-lg mt-4 text-blue-600">
            A multi-step AI-powered screening to help you understand your current wellness state. This is not a diagnostic tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard icon={<User />} title="Demographics & Location" desc="Basic information for context, location is optional." />
            <InfoCard icon={<MessageSquareHeart />} title="Your Thoughts" desc="Optionally share your feelings via text or voice." />
            <InfoCard icon={<Activity />} title="Screeners" desc="Answer PHQ-9 (Depression) & GAD-7 (Anxiety) questions." />
          </div>
          <Button 
            onClick={() => setCurrentStep('demographics')} 
            className="w-full text-lg py-6 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white shadow-lg"
          >
            Start Assessment <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );

  case 'demographics':
    return (
      <Card className="shadow-xl animate-in slide-in-from-right duration-500 border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <User className="h-6 w-6 text-teal-600" /> Demographics & Location
          </CardTitle>
          <CardDescription className="text-indigo-600">Age and gender help provide context. Location is optional but can help with conceptual recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-indigo-700 font-medium">Age <span className="text-red-600">*</span></Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
              min="1"
              max="130"
              className="text-lg border-teal-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80"
              placeholder="Enter your age"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-indigo-700 font-medium">Gender <span className="text-red-600">*</span></Label>
            <Select value={gender} onValueChange={setGender} required>
              <SelectTrigger className="text-lg border-teal-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="border-teal-300">
                <SelectItem value="male" className="text-indigo-700 hover:bg-teal-50">Male</SelectItem>
                <SelectItem value="female" className="text-indigo-700 hover:bg-teal-50">Female</SelectItem>
                <SelectItem value="other" className="text-indigo-700 hover:bg-teal-50">Other</SelectItem>
                <SelectItem value="prefer_not_to_say" className="text-indigo-700 hover:bg-teal-50">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-indigo-700 font-medium">Location (Optional)</Label>
             <Button 
                type="button" 
                variant="outline"
                onClick={handleGetLocation} 
                disabled={isLoading || isGettingLocation}
                className="w-full flex items-center gap-2 border-teal-400 text-teal-700 hover:bg-teal-50 hover:border-teal-500"
            >
                {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                {userLatitude && userLongitude ? 'Update My Location' : 'Get My Current Location'}
            </Button>
            {userLatitude && userLongitude && (
                <p className="text-xs text-blue-600 text-center flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3 text-teal-500" /> Location captured (Lat: {userLatitude.toFixed(2)}, Lng: {userLongitude.toFixed(2)}).
                </p>
            )}
            {locationError && <p className="text-xs text-red-600 text-center">{locationError}</p>}
          </div>
        </CardContent>
      </Card>
    );

  case 'text-input':
    return (
      <Card className="shadow-xl animate-in slide-in-from-right duration-500 border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <MessageSquareHeart className="h-6 w-6 text-teal-600" /> Share Your Thoughts (Optional)
          </CardTitle>
          <CardDescription className="text-indigo-600">If you wish, tell us how you're feeling or what's on your mind. (Min. 10 characters if providing input, or skip if completing questionnaires).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="textInput" className="text-indigo-700 font-medium">Your thoughts and feelings</Label>
            <Textarea
              id="textInput"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Take a moment to write about what's on your mind..."
              className="min-h-[200px] text-base border-teal-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80"
              disabled={isLoading}
            />
            <p className={`text-xs ${textInput.trim().length > 0 && textInput.trim().length < 10 ? 'text-red-600' : 'text-teal-600'}`}>
              {textInput.trim().length} characters {textInput.trim().length > 0 && textInput.trim().length < 10 ? '(min 10 if providing input)' : ''}
            </p>
          </div>

          {isSpeechSupported && (
            <div className="flex flex-col items-center space-y-2">
              <Button 
                type="button" 
                onClick={toggleListening} 
                disabled={isLoading}
                variant={isListening ? "destructive" : "outline"}
                className={`w-full sm:w-auto ${!isListening ? 'border-teal-400 text-teal-700 hover:bg-teal-50 hover:border-teal-500' : ''}`}
              >
                {isListening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                {isListening ? 'Stop Listening' : 'Start Voice Input'}
              </Button>
              {isListening && <p className="text-sm text-indigo-600 animate-pulse font-medium">Listening...</p>}
            </div>
          )}
          {micError && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Voice Input Error</AlertTitle>
              <AlertDescription>{micError}</AlertDescription>
            </Alert>
          )}
          {!isSpeechSupported && (
            <Alert className="text-sm border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Voice Input Not Supported</AlertTitle>
              <AlertDescription className="text-blue-700">
                Speech recognition is not supported in this browser. Please type your response.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );

  case 'phq9':
  case 'gad7':
    const isPhq9 = currentStep === 'phq9';
    const questions = isPhq9 ? phq9Questions : gad7Questions;
    const currentAnswers = isPhq9 ? phq9Answers : gad7Answers;
    const setAnswersFunction = isPhq9 ? setPhq9Answers : setGad7Answers;
    const title = isPhq9 ? "PHQ-9 Depression Screener" : "GAD-7 Anxiety Screener";
    
    return (
      <Card className="shadow-xl animate-in slide-in-from-right duration-500 border-indigo-200 bg-gradient-to-br from-indigo-50 to-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            {isPhq9 ? <MessageSquareHeart className="h-6 w-6 text-teal-600" /> : <Activity className="h-6 w-6 text-blue-600" />} {title}
          </CardTitle>
          <CardDescription className="text-blue-600">
            Over the last 2 weeks, how often have you been bothered by any of the following problems? All questions required to complete this section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, index) => (
            <QuestionnaireItem 
                key={q.id} 
                question={q} 
                index={index} 
                currentValue={currentAnswers[q.id]} 
                onValueChange={(value) => setAnswersFunction(prev => ({ ...prev, [q.id]: parseInt(value) }))} />
          ))}
        </CardContent>
      </Card>
    );
  
       
    case 'review':
      const phq9Score = calculateScore(phq9Answers, phq9Questions);
      const gad7Score = calculateScore(gad7Answers, gad7Questions);
      
      return (
        <Card className="shadow-xl animate-in slide-in-from-right duration-500 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-6 w-6 text-teal-600" /> Review Your Responses
            </CardTitle>
            <CardDescription className="text-indigo-600">Please review your information before getting your analysis. You must provide demographics, and either text input (min 10 characters) or complete both questionnaires.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4 bg-teal-50/50 border-teal-200">
                <CardHeader className="p-0 pb-2">
                   <CardTitle className="text-lg flex items-center gap-2 text-teal-700"><User className="h-5 w-5 text-teal-600" /> Demographics</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-1">
                  <p className="text-sm text-indigo-700">Age: <span className="font-medium text-indigo-800">{age || "Not specified"}</span></p>
                  <p className="text-sm text-indigo-700">Gender: <span className="font-medium text-indigo-800">{gender || "Not specified"}</span></p>
                  <p className="text-sm text-indigo-700">Location: <span className="font-medium text-indigo-800">{userLatitude && userLongitude ? `Lat: ${userLatitude.toFixed(2)}, Lng: ${userLongitude.toFixed(2)}` : "Not shared"}</span></p>
                </CardContent>
              </Card>
              
              <Card className="p-4 bg-blue-50/50 border-blue-200">
                 <CardHeader className="p-0 pb-2">
                   <CardTitle className="text-lg flex items-center gap-2 text-blue-700"><Activity className="h-5 w-5 text-blue-600" /> Assessment Scores</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-1">
                  <p className="text-sm text-indigo-700">PHQ-9 Score: <span className="font-medium text-indigo-800">{isStepComplete('phq9') ? `${phq9Score}/27` : 'Not completed'}</span></p>
                  <p className="text-sm text-indigo-700">GAD-7 Score: <span className="font-medium text-indigo-800">{isStepComplete('gad7') ? `${gad7Score}/21` : 'Not completed'}</span></p>
                 </CardContent>
              </Card>
            </div>
            
            <Card className="p-4 bg-indigo-50/50 border-indigo-200">
              <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-indigo-700"><MessageSquareHeart className="h-5 w-5 text-teal-600" /> Your Text Input</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <div className="bg-white/80 p-3 rounded-md max-h-32 overflow-y-auto border border-teal-200 shadow-inner">
                  <p className="text-sm text-blue-700 whitespace-pre-wrap">
                      {textInput.trim() || <span className="italic text-teal-600">No text input provided</span>}
                  </p>
                  </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      );

    case 'results':
      return (
        <Card className="shadow-xl animate-in fade-in duration-500 border-indigo-300 bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50">
          <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="flex items-center gap-2 text-indigo-700 text-2xl">
                          <Brain className="h-7 w-7 text-teal-600" /> Mental Health Analysis & Intervention Plan
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                          AI-generated insights based on your responses. This is not a medical diagnosis.
                      </CardDescription>
                  </div>
                  <Dialog>
                      <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="ml-auto border-teal-400 text-teal-700 hover:bg-teal-50 hover:border-teal-500" title="View Fullscreen">
                              <Maximize className="h-5 w-5" />
                          </Button>
                      </DialogTrigger>
                      <DialogTitle>
                      <DialogContent className="max-w-3xl h-[90vh] flex flex-col border-indigo-200">
                          <DialogHeader>
                              <DialogTitle className="text-indigo-700">Mental Health Analysis & Intervention Plan</DialogTitle>
                          </DialogHeader>
                          <div className="flex-grow overflow-y-auto prose prose-sm max-w-none p-1 prose-headings:text-indigo-700 prose-p:text-blue-700 prose-strong:text-teal-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {apiResult?.analysis?.comprehensiveReportMarkdown || "No intervention plan available."}
                              </ReactMarkdown>
                          </div>
                           <DialogClose asChild>
                              <Button type="button" variant="secondary" className="mt-4 bg-teal-100 text-teal-700 hover:bg-teal-200">Close</Button>
                          </DialogClose>
                      </DialogContent>
                      </DialogTitle>
                  </Dialog>
              </div>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto prose prose-sm max-w-none p-4 border border-blue-200 rounded-md bg-blue-50/30 shadow-inner prose-headings:text-indigo-700 prose-p:text-blue-700 prose-strong:text-teal-700">
            {apiResult?.error && (
               <Alert variant="destructive">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Analysis Error</AlertTitle>
                  <AlertDescription>{apiResult.error}</AlertDescription>
                </Alert>
            )}
            {apiResult?.analysis?.comprehensiveReportMarkdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {apiResult.analysis.comprehensiveReportMarkdown}
              </ReactMarkdown>
            ) : !apiResult?.error ? ( // Only show "No plan" if there wasn't an explicit error displayed
              <p className="text-blue-700">No intervention plan available or an error occurred.</p>
            ) : null}
          </CardContent>
          <CardFooter className="mt-6 flex flex-col sm:flex-row gap-4 pt-6 border-t border-teal-200">
            <Button 
              onClick={() => {
                setCurrentStep('start');
                setApiResult(null);
                setPhq9Answers({});
                setGad7Answers({});
                setTextInput('');
                setAge(''); 
                setGender('');
                setUserLatitude(null);
                setUserLongitude(null);
                setLocationError(null);
                setError(null);
              }}
              variant="outline"
              className="flex-1 border-indigo-400 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-500"
            >
              Start New Assessment
            </Button>
          </CardFooter>
           
        </Card>
      );
    default: return null;
      }
    };
  
    return (
      <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6 space-y-6">
        {currentStep !== 'start' && currentStep !== 'results' && (
          <div className="space-y-3 sticky top-[calc(var(--header-height,64px)+1rem)] bg-background/80 backdrop-blur-sm py-2 z-10 rounded-md px-2 -mx-2 shadow-sm border">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Progress: Step {steps.indexOf(currentStep)} of {steps.length - 2}</span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2 [&>div]:bg-gradient-to-r from-sky-400 to-primary" />
          </div>
        )}
  
        {error && currentStep !== 'results' && ( // Don't show global error if result page has its own error display
          <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Input Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        {renderStep()}
        
        {currentStep !== 'start' && currentStep !== 'results' && <StepNavigation />}
      </div>
    );
  }
  
  const InfoCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <Card className="p-4 hover:shadow-md transition-shadow border-2 hover:border-primary/50 flex flex-col items-center text-center">
      <div className="text-primary mb-2">{React.cloneElement(icon as React.ReactElement)}</div>
      <h3 className="font-semibold text-md mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </Card>
  );
  
  const QuestionnaireItem = ({ question, index, currentValue, onValueChange }: { question: {id: string, text: string}, index: number, currentValue: number | undefined, onValueChange: (value: string) => void}) => (
      <div key={question.id} className="space-y-3 p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-teal-600 via-indigo-600 to-blue-650">
          <Label className="font-medium text-foreground block text-md">
          {index + 1}. {question.text} <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
          value={currentValue?.toString()}
          onValueChange={onValueChange}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2"
          required
          >
          {answerOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors border has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
              <RadioGroupItem value={opt.value.toString()} id={`${question.id}-${opt.value}`} />
              <Label htmlFor={`${question.id}-${opt.value}`} className="font-normal text-sm cursor-pointer flex-1">
                  {opt.label}
              </Label>
              </div>
          ))}
          </RadioGroup>
      </div>
  );