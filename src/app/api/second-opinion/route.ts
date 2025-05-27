import {z} from 'zod'
import { NextRequest,NextResponse } from 'next/server'

const SecondOpinionInputSchema = z.object({
    disease: z.string().min(1, "Disease name is required"),
    age: z.number().min(0).max(150),
    gender: z.enum(['male', 'female', 'other']),
    medicationWithDosages: z.string().min(1, "Medication details are required"),
})

type SecondOpinionInput=z.infer<typeof SecondOpinionInputSchema>
function buildSecondOpinionPrompt(input: SecondOpinionInput): string {
    return `
  You are a highly experienced and trusted medical specialist. Please provide a comprehensive **second opinion** for a patient diagnosed with ${input.disease}.
  
  Patient Details:
  - Age: ${input.age} years
  - Gender: ${input.gender}
  - Current Medication(s): ${input.medicationWithDosages}
  
  Please evaluate the **appropriateness of the current treatment** and suggest any adjustments or alternatives, backed by clinical reasoning and evidence.
  
  Your response must include:
  
  1. **Assessment of Current Diagnosis and Treatment**:
     - Are the prescribed medications appropriate for the disease, age, and gender?
     - Are dosages within the recommended therapeutic range?
     - Are there potential interactions or contraindications?
  
  2. **Recommendations for Improvement**:
     - Alternative medications or adjusted dosages (if applicable)
     - New treatment protocols, if needed
     - Additional diagnostic evaluations or lab tests
  
  3. **Justification**:
     - Clinical rationale behind any changes
     - Reference guidelines, recent studies, or consensus best practices
  
  4. **Warnings or Red Flags**:
     - Risk factors due to age, gender, or medication choices
     - Symptoms or side effects to monitor
  
  Respond only in valid JSON using this structure:
  
  \`\`\`json
  {
    "condition": "${input.disease}",
    "patient": {
      "age": ${input.age},
      "gender": "${input.gender}"
    },
    "currentTreatment": "${input.medicationWithDosages}",
    "assessment": "Analysis of whether the current treatment is optimal and safe",
    "recommendations": {
      "adjustments": [
        "Any recommended dosage/frequency changes or safer alternatives"
      ],
      "alternativeTreatments": [
        "Suggested new medications or therapies"
      ],
      "tests": [
        "Any further diagnostics to support second opinion"
      ]
    },
    "justification": "Detailed clinical reasoning for the recommendations",
    "warnings": [
      "List of concerns, interactions, or complications to monitor"
    ]
  }
  \`\`\`
  
  IMPORTANT:
  - Provide medication names, not categories
  - Ensure dosages are realistic and age-appropriate
  - Justify all changes with medical rationale
  - Return only clean JSON without any explanations outside the code block
  `.trim()
}

export async function POST(req:NextRequest){
    try{
        const body=await req.json();
        const input=SecondOpinionInputSchema.parse(body)
        const prompt=buildSecondOpinionPrompt(input)

        const sonarResponse=await fetch('https://api.perplexity.ai/chat/completions',{
            method:'POST',
            headers:{
                'Authorization': `Bearer ${process.env.SONAR_API_KEY}`,
                'Content-Type': 'application/json',
            },body:JSON.stringify({
                model:'sonar-pro',
                messages:[
                    {
                        role:'system',
                        content:'You are a medical expert providing second opinions. Always respond with valid JSON only.'
                    },
                    {
                        role:'user',
                        content:prompt,
                    }
                ],
                temperature:0.1,
                max_tokens:4000,
            })
        });
        if(!sonarResponse.ok){
            const errorText=await sonarResponse.text()
            console.error('SONar api error: ',errorText)
            return NextResponse.json({
                error:"Failed to get second opinions from search service",
                details:`API returned ${sonarResponse.status}:${errorText}`,
            },{status:500})
        }
        const result = await sonarResponse.json()
        console.log("Result in the frontend is ",result)
        const replyText=result?.choices?.[0]?.message?.content
        if(!replyText){
            return NextResponse.json({
                error:'No content returned from search service'
            },{status:500})
        }
        let cleanedOutput=replyText.trim()
        if (cleanedOutput.startsWith("```json") || cleanedOutput.startsWith("```")) {
            cleanedOutput = cleanedOutput.replace(/```json|```/g, "").trim()
          }
      
          cleanedOutput = cleanedOutput.replace(/^[^{]*/, '').replace(/[^}]*$/, '')
          try{
                const parsed=JSON.parse(cleanedOutput)
                const requiredFields=['condition','patient','assessment','recommendations']
                const missingFields=requiredFields.filter(field=>!parsed[field])
                if(missingFields.length>0){
                    console.error('Missing required fields: ',missingFields)
                    return NextResponse.json({
                        error:'Incomplete response from search service',
                        details:`Missing fields: ${missingFields.join(', ')}`
                    },{status:500})
                }
                return NextResponse.json({data:parsed},{status:200})
          }catch(error){
            console.error('JSON parsing error:',error)
            console.error('Raw response:', cleanedOutput.substring(0, 500) + '...')
            return NextResponse.json({
                error: 'Failed to parse response from search service',
                details: 'Invalid JSON format received'
            }, { status: 500 })
          }
    }catch(error){
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
  