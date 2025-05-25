import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const DiagnosisInputSchema = z.object({
  disease: z.string().min(1, "Disease name is required"),
  age: z.number().min(0).max(150),
  gender: z.enum(['male', 'female', 'other']),
})

type DiagnosisInput = z.infer<typeof DiagnosisInputSchema>

function buildDiagnosisPrompt(input: DiagnosisInput): string {
  return `
You are a highly experienced medical expert and physician. Prepare a comprehensive, evidence-based diagnosis and treatment plan for a patient diagnosed with ${input.disease}.

Patient Demographics:
- Age: ${input.age} years
- Gender: ${input.gender}

Please provide a thorough medical assessment that includes:

1. **Clinical Summary**: A brief overview of the condition and its relevance to this patient's age/gender profile
2. **Diagnostic Tests**: Recommended laboratory tests, imaging studies, and other diagnostic procedures
3. **Treatment Protocol**: Evidence-based treatment approach including:
   - First-line medications with specific drug names
   - Dosage recommendations appropriate for age/gender
   - Treatment duration and monitoring schedule
4. **Lifestyle Modifications**: Specific, actionable lifestyle changes
5. **Dietary Recommendations**: Detailed nutritional guidance and restrictions
6. **Follow-up Care**: Monitoring schedule and what to watch for
7. **Specialist Referrals**: When and which specialists should be involved
8. **Risk Factors**: Age and gender-specific risk considerations
9. **Preventive Measures**: Long-term prevention strategies and vaccinations if applicable

Consider the following important factors:
- Age-appropriate dosing and medication considerations
- Gender-specific health considerations
- Common comorbidities for this age group
- Drug interactions and contraindications
- Quality of life considerations
- Cost-effectiveness of treatments

Structure your response in the following JSON format. Ensure all fields are properly filled with relevant, specific information:

\`\`\`json
{
  "condition": "${input.disease}",
  "patient": {
    "age": ${input.age},
    "gender": "${input.gender}"
  },
  "summary": "Detailed clinical summary considering patient demographics and condition severity",
  "diagnosticTests": [
    "Specific test names with normal ranges and interpretation notes"
  ],
  "treatmentPlan": {
    "medications": [
      "Specific medication names with mechanism of action"
    ],
    "dosageGuidelines": {
      "Medication Name": "Specific dosage, frequency, and administration instructions"
    },
    "duration": "Expected treatment timeline with milestones"
  },
  "lifestyle": [
    "Specific, actionable lifestyle modifications with expected outcomes"
  ],
  "diet": [
    "Detailed dietary recommendations including foods to avoid and encourage"
  ],
  "followUp": "Specific follow-up schedule with what to monitor and when",
  "specialist": "Which specialists to consult and when, including urgency level",
  "riskFactors": [
    "Age and gender-specific risk factors and complications to monitor"
  ],
  "preventiveMeasures": [
    "Long-term prevention strategies, vaccinations, and screening recommendations"
  ]
}
\`\`\`

IMPORTANT: 
- Provide specific medication names, not generic categories
- Include realistic dosages appropriate for the patient's age and gender
- Be specific about timeframes and monitoring intervals
- Consider drug interactions and contraindications
- Provide actionable, measurable recommendations
- Only return valid JSON without any additional commentary

Return only the JSON response.
`.trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = DiagnosisInputSchema.parse(body)
    const prompt = buildDiagnosisPrompt(input)

    const sonarResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: 'You are a medical expert providing evidence-based diagnosis and treatment plans. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.1,
        max_tokens: 4000, // Increased for more comprehensive responses
      }),
    });

    if (!sonarResponse.ok) {
      const errorText = await sonarResponse.text()
      console.error('Sonar API error:', errorText)
      return NextResponse.json({
        error: 'Failed to get diagnosis plan from search service',
        details: `API returned ${sonarResponse.status}: ${errorText}`,
      }, { status: 500 })
    }

    const result = await sonarResponse.json()
    const replyText = result?.choices?.[0]?.message?.content

    if (!replyText) {
      return NextResponse.json({ 
        error: 'No content returned from search service' 
      }, { status: 500 })
    }

    // Clean the response
    let cleanedOutput = replyText.trim()
    if (cleanedOutput.startsWith("```json") || cleanedOutput.startsWith("```")) {
      cleanedOutput = cleanedOutput.replace(/```json|```/g, "").trim()
    }

    // Additional cleanup for common formatting issues
    cleanedOutput = cleanedOutput.replace(/^[^{]*/, '').replace(/[^}]*$/, '')

    try {
      const parsed = JSON.parse(cleanedOutput)
      
      // Validate the parsed response has required fields
      const requiredFields = ['condition', 'patient', 'summary']
      const missingFields = requiredFields.filter(field => !parsed[field])
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        return NextResponse.json({
          error: 'Incomplete response from search service',
          details: `Missing fields: ${missingFields.join(', ')}`
        }, { status: 500 })
      }

      return NextResponse.json({ data: parsed }, { status: 200 })
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', cleanedOutput.substring(0, 500) + '...')
      return NextResponse.json({
        error: 'Failed to parse response from search service',
        details: 'Invalid JSON format received'
      }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }, { status: 400 })
    }
    
    console.error('Handler error:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}