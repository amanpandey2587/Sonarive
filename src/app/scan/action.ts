'use server';

import {analyzeMedicalScan,type AnalyzeMedicalScanInput,type AnalyzeMedicalScanOutput} from '@/ai/flows/analyzeMedicalScan'

interface ScanAnalysisResult{
    data:AnalyzeMedicalScanOutput|null;
    error:string|null;
}
export async function  handleScanUpload(scanDataUri:string):Promise<ScanAnalysisResult> {
    if(!scanDataUri){
        return {
            data:null,
            error:'No scan data provided.'
        }
    }
    if(!scanDataUri.startsWith('data:image/') || !scanDataUri.includes){
        return{
            data:null,
            error:"Invalid image data format. Please upload a valid image file (PNG,JPG,etc.)."
    };
    }
    try{
        const initialInput:AnalyzeMedicalScanInput={scanDataUri};
        const initialResult=await analyzeMedicalScan(initialInput);
        console.log("Initial result in the user server is",initialResult);
        if(!initialResult || !initialResult.findings|| typeof initialResult.summary!=='string'){
            console.error("AI initial analysis result structure is not as expected: ",initialResult);
            return {
                data:null,error:'AI initital analysis returned an unexpected data structure.Please try again. '
            };
        }
        return {data:initialResult,error:null};
    }
    catch(error){
            console.error('Error during scan analysis process:',error);
            let errorMessage='An error occurred during the scan analysis. Please try again later.';
            if(error instanceof Error){
                errorMessage= `Analysis failed:${error.message}`
            }
            return {data:null,error:errorMessage};
        }
}