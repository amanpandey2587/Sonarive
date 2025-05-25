'use server'

import {ai} from '@/ai/genkit'
import {z} from 'genkit'

const SummarizeScanFindingsInputSchema=z.object({
    scanType:z.string().describe('The type of scan (e.g., MRI, CT scan, X-ray).'),
    findings:z.string().describe("The detailed findings from the scan report. "),
});
export type SummarizeScanFindingsInput=z.infer<typeof SummarizeScanFindingsInputSchema>;

const SummarizeScanFindingsOutputSchema=z.object({
    summary:z.string().describe('A concise summary of the scan findings in plain language.'),
});
export type SummarizeScanFindingsOutput=z.infer<typeof SummarizeScanFindingsOutputSchema>

export async function summarizeScanFindings(input:SummarizeScanFindingsInput):Promise<SummarizeScanFindingsOutput>{
    return summarizeScanFindingsFlow(input);
}
const prompt=ai.definePrompt({
    name:'summarizeScanFindingsPrompt',
    input:{schema:SummarizeScanFindingsInputSchema},
    output:{schema:SummarizeScanFindingsOutputSchema},
    prompt:`You are a medical expert tasked with summarizing medical scan findings into plain language.
    Scan Type: {{{scanType}}}
    Findings: {{{findings}}}
    Please provide a concise and easy-to-understand summary of the findings, avoiding complex medical terminology.`
});

const summarizeScanFindingsFlow=ai.defineFlow(
    {
        name:'summarzieScanFindingsFlow',
        inputSchema:SummarizeScanFindingsInputSchema,
        outputSchema:SummarizeScanFindingsOutputSchema,
    },async input=>{
        const {output}=await prompt(input);
        return output!;
    }
);