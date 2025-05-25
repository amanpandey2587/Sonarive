'use client'
import {useState,type FormEvent ,ChangeEvent} from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {Alert,AlertDescription,AlertTitle} from '@/components/ui/alert';
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'
import { handleScanUpload } from './action'
import type { AnalyzeMedicalScanOutput } from '@/ai/flows/analyzeMedicalScan'
import { UploadCloud,AlertCircle,CheckCircle,FileImage,Microscope,ClipboardList } from 'lucide-react'

const ScanForm = () => {
    const [file,setFile]=useState<File|null>(null);
    const [previewUrl,setPreviewUrl]=useState<string|null>(null);
    const [isLoading,setIsLoading]=useState(false)
    const [loadingMessage,setLoadingMessage]=useState('Analyzing... ')
    const [error,setError]=useState<string|null>(null);
    const [analysisResult,setAnalysisResult]=useState<AnalyzeMedicalScanOutput|null>(null);
    const [progressValue,setProgressValue]=useState(0);

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
        setProgressValue(0);
        setLoadingMessage('Analyzing your scan...');

        let currentProgress=0;
        const progressInterval=setInterval(()=>{
            currentProgress+=10;
            if(currentProgress<=90){
                setProgressValue(currentProgress);
            }else{

            }
        },200)

        const reader=new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend=async()=>{
            const base64data=reader.result as string;
            try{
                const result=await handleScanUpload(base64data)
                clearInterval(progressInterval)
                setProgressValue(100)
                if(result.error){
                    setError(result.error)
                    setAnalysisResult(null)
                }else if(result.data){
                    setAnalysisResult(result.data);
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

  return (
    <div className="space-y-8">
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-primary">
          <UploadCloud className="h-7 w-7" /> Upload Your Medical Scan
        </CardTitle>
        <CardDescription>
          Supports MRI, CT, and X-ray images (PNG, JPG, GIF, WEBP formats). Get AI-powered insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="scanFile" className="sr-only">Choose file</label>
            <Input
              id="scanFile"
              type="file"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              aria-describedby="fileHelp"
              disabled={isLoading}
            />
            <p id="fileHelp" className="mt-1 text-sm text-muted-foreground">
              Ensure your scan is clear and well-lit for best results.
            </p>
          </div>
          {previewUrl && !analysisResult && (
            <div className="mt-4 p-4 border border-dashed border-border rounded-lg bg-muted/50 flex justify-center items-center max-h-96 overflow-hidden">
              <img src={previewUrl} alt="Scan preview" className="max-h-80 rounded-md object-contain shadow-md" />
            </div>
          )}
          <Button type="submit" disabled={isLoading || !file} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
            {isLoading ? loadingMessage : 'Analyze Scan'} {/* Reverted button text */}
          </Button>
        </form>
      </CardContent>
    </Card>

    {isLoading && (
      <div className="space-y-2">
          <Progress value={progressValue} className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary" />
          <p className="text-sm text-center text-muted-foreground">{loadingMessage} This may take some time...</p>
      </div>
    )}

    {error && (
      <Alert variant="destructive" className="shadow-md">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    {analysisResult && (
      <Card className="shadow-xl mt-8 animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <CheckCircle className="h-7 w-7" /> Analysis Complete
          </CardTitle>
          <CardDescription>Review the findings from your medical scan analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
              <ClipboardList className="h-6 w-6 text-primary" /> Summary
            </h3>
            <p className="text-muted-foreground bg-secondary/50 p-4 rounded-md shadow-inner">{analysisResult.summary}</p>
          </div>

          {analysisResult.findings.length > 0 && analysisResult.findings.map((finding, index) => (
            <Card key={index} className="bg-background shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-primary">
                   <Microscope className="h-5 w-5" /> Finding #{index + 1}: {finding.condition}
                </CardTitle>
                <CardDescription>
                  Located at: {finding.anatomicalLocation}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Severity:</h4>
                    <p className="text-muted-foreground">{finding.severity}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Confidence:</h4>
                    <Progress value={finding.confidence * 100} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground text-right">{(finding.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>
                
                {finding.highlightedArea && (
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Highlighted Area:</h4>
                    <img 
                      src={finding.highlightedArea} 
                      alt={`Highlighted area for ${finding.condition}`} 
                      className="rounded-md border border-border shadow-md w-full object-contain max-h-[500px]"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
           {analysisResult.findings.length === 0 && (
              <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>No specific findings</AlertTitle>
                  <AlertDescription>
                      The analysis did not detect any specific anomalies based on the provided scan.
                  </AlertDescription>
              </Alert>
          )}
        </CardContent>
        {/* Deep Dive Report section removed */}
        
        <CardFooter>
           <p className="text-xs text-muted-foreground">
              Disclaimer: This AI analysis is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any health concerns or before making any decisions related to your health.
            </p>
        </CardFooter>
      </Card>
    )}
     {!isLoading && !analysisResult && !error && !file && (
       <Card className="text-center py-12 bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center space-y-4">
              <FileImage className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">Upload a scan to begin analysis.</p>
              <p className="text-sm text-muted-foreground">
                  Your results will appear here.
              </p>
          </CardContent>
       </Card>
     )}
  </div>
  )
}

export default ScanForm
