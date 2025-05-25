'use server'

import {ai} from '@/ai/genkit'
import {z} from 'genkit'

const AnalyzeMedicalScanInputSchema=z.object({
    scanDataUri:z.string().describe(
        "A medial scan image(MRI,CT scan, or X-ray), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'  "
    ),
});
export type AnalyzeMedicalScanInput=z.infer<typeof AnalyzeMedicalScanInputSchema>;

const AnalyzeMedicalScanOutputSchema=z.object({
    findings:z.array(
        z.object({
            condition:z.string().describe('The potential medical condition detected.'),
            anatomicalLocation:z.string().describe("The anatomical location of the finding."),
            severity:z.string().describe('The severity of the detected condition.'),
            confidence:z.number().describe('The confidence level of the AI in the finding (0-1).'),
            highlightedArea:z.string().describe("A data URI of the original scan with the area of the interest highlighted,that must include a MIME type and use Base64 encoding.Expected format:'data:<mimetype>;base64,<encoded_data>'."),
        })
    )
    .describe('An array of findings detected in the medical scan.'),
    summary:z.string().describe('A concise plain language summary of the medical findings.'),
});

export type AnalyzeMedicalScanOutput=z.infer<typeof AnalyzeMedicalScanOutputSchema>;

export async function analyzeMedicalScan(
    input:AnalyzeMedicalScanInput
):Promise<AnalyzeMedicalScanOutput>{
    return analyzeMedicalScanFlow(input);
}

const analyzeScanPrompt=ai.definePrompt({
    name:'analyzeScanPrompt',
    input:{schema:AnalyzeMedicalScanInputSchema},
    output:{schema:AnalyzeMedicalScanOutputSchema},
    prompt:`You are an expert radiologist specializing in analyzing medical scans.

    You will analyze the provided medical scan image and detect any anomalies or potential conditions.
    For each detected finding, you MUST:
    1. Identify the 'condition'.
    2. Specify the 'anatomicalLocation'.
    3. Assess its 'severity'.
    4. Provide a 'confidence' level (0-1).
    5. Generate a 'highlightedArea'. This MUST be a data URI of an image. This image should be a copy of the original input scan ('{{media url=scanDataUri}}') but with the specific area corresponding to THIS finding clearly visually marked (e.g., using a colored bounding box, circle, or a semi-transparent colored overlay). Each 'finding' object in the 'findings' array must have its own 'highlightedArea' field populated with such a valid data URI.
  
    Finally, you will generate a concise 'summary' of all findings in plain language.
  
    Analyze the following medical scan:
    Scan Image: {{media url=scanDataUri}}
  
    Ensure the output is a valid JSON object conforming to the AnalyzeMedicalScanOutputSchema.
    The confidence level should be a value between 0 and 1.
    `,
});

const analyzeMedicalScanFlow=ai.defineFlow(
    {
        name:'analyzeMedicalScanFlow',
        inputSchema:AnalyzeMedicalScanInputSchema,
        outputSchema:AnalyzeMedicalScanOutputSchema,
    },async input => {
        const {output}=await analyzeScanPrompt(input);
        if(!output){
            throw new Error('AI analysis didnot return valid output.');
        }
        if(output.findings){
            for(const finding of output.findings){
                if(typeof finding.highlightedArea!=='string' || !finding.highlightedArea.startsWith('data:image/')){
                console.warn("A finding was returned without a valid highlightedArea data URI:",finding);
                }
            }
        }
        return output;
    }
)