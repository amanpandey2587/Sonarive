import { NextRequest, NextResponse } from 'next/server'
import { z as zod } from 'zod'
import { analyzeMedicalScan } from '../../../ai/flows/analyzeMedicalScan'

const FullMedicalReportInputSchema = zod.object({
  disease: zod.string().min(1),
  scanDataUri: zod.string().startsWith('data:image/'),
  age: zod.number().optional(),
  gender: zod.string().optional()
})

type FullMedicalReportInput = zod.infer<typeof FullMedicalReportInputSchema>

function buildDiagnosisPrompt(input: FullMedicalReportInput, scanFindings: any): string {
  return `
You are a highly experienced medical expert. Combine radiological findings with clinical presentation to provide an integrated diagnosis and treatment plan.

Patient Info:
- Condition/Symptoms: ${input.disease}
${input.age ? `- Age: ${input.age}` : ''}
${input.gender ? `- Gender: ${input.gender}` : ''}

Radiological Findings from Scan Analysis:
${JSON.stringify(scanFindings, null, 2)}

Your response MUST be a valid JSON object with the following structure:

{
  "condition": "${input.disease}",
  "patient": {
    "age": ${input.age || 'null'},
    "gender": "${input.gender || 'unknown'}"
  },
  "summary": "Comprehensive summary integrating both scan findings and clinical presentation",
  "radiology": {
    "findings": [
      {
        "condition": "specific finding from scan",
        "location": "anatomical location",
        "severity": "severity level",
        "confidence": "confidence percentage"
      }
    ],
    "summary": "Plain-language overview of scan interpretation"
  },
  "diagnosisPlan": {
    "clinicalSummary": "Integrated clinical assessment combining symptoms and scan results",
    "tests": ["additional tests recommended"],
    "treatment": {
      "medications": ["recommended medications"],
      "dosages": {
        "medication_name": "dosage_instructions"
      }
    },
    "lifestyle": ["lifestyle recommendations"],
    "diet": ["dietary recommendations"],
    "followUp": "follow-up schedule and monitoring plan",
    "specialists": "specialist referrals if needed",
    "risks": ["potential risks and complications"],
    "prevention": ["preventive measures"]
  }
}

Please provide a comprehensive medical report that integrates the scan findings with the clinical presentation. Focus on practical, actionable recommendations while being thorough and professional.
`.trim()
}

export async function POST(req: NextRequest) {
  try {
    console.log('Starting integrated medical report generation...')
    
    const body = await req.json()
    const input = FullMedicalReportInputSchema.parse(body)
    
    console.log('Input validated:', { disease: input.disease, hasImage: !!input.scanDataUri })

    // Step 1: Analyze the medical scan
    console.log('Analyzing medical scan...')
    const scanResult = await analyzeMedicalScan({ scanDataUri: input.scanDataUri })
    console.log('Scan analysis complete:', scanResult)

    // Step 2: Generate integrated report using scan findings
    const prompt = buildDiagnosisPrompt(input, scanResult)
    console.log('Generated prompt for integrated analysis')

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SONAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a medical expert generating integrated reports from scan data and clinical context. Provide comprehensive, actionable medical advice. Reply with only valid JSON that matches the exact structure requested.'
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Sonar API error:', errorText)
      return NextResponse.json({ 
        error: 'Failed to generate integrated medical report', 
        details: errorText 
      }, { status: 500 })
    }

    const sonarResponse = await response.json()
    let rawText = sonarResponse?.choices?.[0]?.message?.content?.trim() ?? ''
    
    console.log('Raw response from Sonar:', rawText.substring(0, 200) + '...')

    // Clean up the response
    if (rawText.startsWith('```json') || rawText.startsWith('```')) {
      rawText = rawText.replace(/```json|```/g, '').trim()
    }

    // Remove any text before the first { and after the last }
    const firstBrace = rawText.indexOf('{')
    const lastBrace = rawText.lastIndexOf('}')
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      rawText = rawText.substring(firstBrace, lastBrace + 1)
    }

    try {
      const parsed = JSON.parse(rawText)
      
      // Ensure the response includes the original scan findings
      if (parsed.radiology && scanResult.findings) {
        parsed.radiology.originalScanFindings = scanResult.findings
        parsed.radiology.originalScanSummary = scanResult.summary
      }
      
      console.log('Successfully generated integrated report')
      return NextResponse.json({ 
        data: parsed,
        scanAnalysis: scanResult // Include original scan analysis for reference
      }, { status: 200 })
      
    } catch (jsonErr) {
      console.error('Error parsing final JSON:', jsonErr)
      console.error('Raw text that failed to parse:', rawText)
      
      return NextResponse.json({ 
        error: 'Invalid JSON received from AI', 
        raw: rawText,
        scanAnalysis: scanResult // Still return scan analysis even if report generation fails
      }, { status: 500 })
    }

  } catch (err) {
    if (err instanceof zod.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        issues: err.errors 
      }, { status: 400 })
    }

    console.error('Server Error:', err)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}