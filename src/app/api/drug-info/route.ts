import {z} from 'zod'
import { NextRequest,NextResponse } from 'next/server'

const DrugInputSchema=z.object({
    drugs:z.array(z.string()),
})

const drugInfoSchema=z.object({
    drugName:z.string()
})

type DrugInputs=z.infer<typeof DrugInputSchema>

function buildSearchQuery(input:DrugInputs):string{
    const drugsConcat=input?.drugs?.join(', ')|| '';
    return drugsConcat
}

export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const input = DrugInputSchema.parse(body);
      const searchQuery = buildSearchQuery(input);
  
      const prompt = `
You are a medical assistant. For the following list of prescribed medications or drugs: "${searchQuery}", provide a comprehensive report including:

1. **Generic Alternatives** – Mention cost-effective or widely available generic substitutes with their pricing.
2. **Common Side Effects & Known Allergies** – Summarize for each drug.
3. **Recommended Dosage** – Provide dosage details across age groups (children, adults, elderly).
4. **Standard Prices in India (INR)** – Mention average cost or price range.
5. **Usage Instructions & Warnings** – Explain administration guidelines and what to avoid.
6. **Specialist Recommendation** – Suggest if a specialist (like pulmonologist, pediatrician) is typically involved.
7. **Medicine Image** – Provide a high-quality image URL of the actual medicine/tablet/capsule if available.

Structure the response as a JSON object in this format:

\`\`\`json
{
  "drugs": [
    {
      "drugName": "ExampleDrug",
      "genericAlternatives": ["Generic1", "Generic2"],
      "sideEffects": ["Nausea", "Dizziness"],
      "allergies": ["Penicillin allergy"],
      "dosageByAgeGroup": {
        "children": "5mg twice daily",
        "adults": "10mg once daily",
        "elderly": "5mg once daily"
      },
      "standardPriceINR": "₹50-₹100 per strip",
      "usageInstructions": "Take after meals with water",
      "specialistRecommendation": "Consult a pulmonologist for long-term use",
      "imageUrl": "https://example.com/medicine-image.jpg"
    }
  ]
}
\`\`\`

Important notes:
- For imageUrl, try to find actual medicine/tablet images from reliable medical sources
- Ensure all medical information is accurate and up-to-date

Only return the JSON and nothing else.
      `.trim();
  
      const sonarResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${process.env.SONAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: prompt,
            }
          ],
          temperature: 0.1,
          max_tokens: 3000, 
        }),
      });
  
      if (!sonarResponse.ok) {
        const errorText = await sonarResponse.text();
        console.error('Sonar API error:', errorText);
        return NextResponse.json({
          error: 'Failed to get recommendations from search service',
          details: `API returned ${sonarResponse.status}`,
        }, { status: 500 });
      }
  
      const result = await sonarResponse.json();
      console.log("Result in the frontend is ",result);
      const replyText = result?.choices?.[0]?.message?.content;
  
      if (!replyText) {
        return NextResponse.json({ error: 'No content returned from search service' }, { status: 500 });
      }
  
      let cleanedOutput = replyText.trim();
      if (cleanedOutput.startsWith("```json") || cleanedOutput.startsWith("```")) {
        cleanedOutput = cleanedOutput.replace(/```json|```/g, "").trim();
      }
  
      try {
        const parsed = JSON.parse(cleanedOutput); // Validate it is a JSON object
        return NextResponse.json({ data: parsed }, { status: 200 });
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Raw response:', cleanedOutput);
        return NextResponse.json({ 
          error: 'Failed to parse response from search service',
          details: 'Invalid JSON format received'
        }, { status: 500 });
      }
  
    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}