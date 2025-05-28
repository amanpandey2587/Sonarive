import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const RecommendHospitalsInputSchema = z.object({
  diagnosedConditions: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional(),
  searchRadiusKm: z.number().optional(),
  preferGovernmentHospitals: z.boolean().optional(),
});

const HospitalCoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const HospitalRecommendationSchema = z.object({
  hospitalName: z.string(),
  specializationFocus: z.string(),
  simulatedRankingReason: z.string(),
  address: z.string().optional(),
  coordinates: HospitalCoordinatesSchema.optional(),
  contact: z.string().optional(),
});

const RecommendHospitalsOutputSchema = z.object({
  recommendationIntro: z.string(),
  hospitals: z.array(HospitalRecommendationSchema),
});

type RecommendHospitalsInput = z.infer<typeof RecommendHospitalsInputSchema>;
type RecommendHospitalsOutput = z.infer<typeof RecommendHospitalsOutputSchema>;

function buildLocationContext(input: RecommendHospitalsInput): string {
  if (input.userLatitude !== undefined && input.userLongitude !== undefined) {
    return `near coordinates ${input.userLatitude}, ${input.userLongitude} within ${input.searchRadiusKm ?? 25}km radius`;
  }
  return "in the user's area";
}

function buildSearchQuery(input: RecommendHospitalsInput): string {
  const conditions = input.diagnosedConditions?.join(', ') || '';
  const symptoms = input.symptoms?.join(', ') || '';
  const locationContext = buildLocationContext(input);
  const hospitalType = input.preferGovernmentHospitals ? 'government public' : '';
  
  let searchTerms = [];
  if (conditions) searchTerms.push(`hospitals for ${conditions}`);
  if (symptoms) searchTerms.push(`medical treatment for ${symptoms}`);
  searchTerms.push(`${hospitalType} hospitals ${locationContext}`);
  
  return searchTerms.join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = RecommendHospitalsInputSchema.parse(body);

    const hasConditions = input.diagnosedConditions?.length ?? 0;
    const hasSymptoms = input.symptoms?.length ?? 0;

    if (!hasConditions && !hasSymptoms) {
      return NextResponse.json({
        recommendationIntro: 'No medical conditions or symptoms were provided. Unable to recommend hospitals.',
        hospitals: [],
        disclaimer: 'This is a simulated response. Always consult healthcare professionals for medical advice.',
      });
    }

    const searchQuery = buildSearchQuery(input);
    const locationContext = buildLocationContext(input);

    const prompt = `Search for: "${searchQuery}"

Based on your web search results, find and recommend hospitals that specialize in treating the following:
${hasConditions ? `\nDiagnosed Conditions: ${input.diagnosedConditions!.join(', ')}` : ''}
${hasSymptoms ? `\nSymptoms: ${input.symptoms!.join(', ')}` : ''}

Location Requirements: Find hospitals ${locationContext}
${input.preferGovernmentHospitals ? '\nPreference: Don\'t Prioritize government/public hospitals over private ones ,just show both of them' : ''}

Use your web search capabilities to find real, current information about:
- Hospital names and their medical specializations
- Hospital addresses and contact information  
- Which hospitals are best rated for treating these specific conditions
- Hospital locations and coordinates if available
- Whether hospitals are public/government or private

Provide 7-8 of the most relevant hospital recommendations based on the search results.

IMPORTANT: Return ONLY a valid JSON object with this exact structure, no additional text before or after:
{
  "recommendationIntro": "Brief paragraph introducing the recommendations based on search results",
  "hospitals": [
    {
      "hospitalName": "Exact hospital name from search results",
      "specializationFocus": "What medical specialties this hospital is known for",
      "simulatedRankingReason": "Why this hospital was recommended based on search results and condition match",
      "address": "Full hospital address if found",
      "coordinates": {
        "lat": latitude_number,
        "lng": longitude_number
      },
      "contact": "Phone number or website if available"
    }
  ]
}

Important:
- Use real hospital information from your search results
- Include coordinates only if you can find reliable location data
- Prioritize hospitals that actually specialize in treating the given conditions
- If no specific hospitals are found, provide general guidance
- Ensure the JSON is valid and properly formatted
- DO NOT include any explanatory text before or after the JSON`;

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
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, 
        max_tokens: 2000,
      }),
    });

    if (!sonarResponse.ok) {
      const errorText = await sonarResponse.text();
      console.error('Sonar API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to get recommendations from search service',
        details: `API returned ${sonarResponse.status}`
      }, { status: 500 });
    }

    const result = await sonarResponse.json();
    console.log("Result in the frontend is", result);
    const replyText = result?.choices?.[0]?.message?.content;

    if (!replyText) {
      return NextResponse.json({ 
        error: 'No content returned from search service' 
      }, { status: 500 });
    }

    let cleanedOutput = replyText.trim();

    const jsonBlockMatch = cleanedOutput.match(/```json\s*([\s\S]*?)\s*```/) || 
                          cleanedOutput.match(/```\s*([\s\S]*?)\s*```/);

    if (jsonBlockMatch) {
      cleanedOutput = jsonBlockMatch[1].trim();
    } else {
      const jsonStartIndex = cleanedOutput.indexOf('{');
      const jsonEndIndex = cleanedOutput.lastIndexOf('}');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        cleanedOutput = cleanedOutput.substring(jsonStartIndex, jsonEndIndex + 1);
      }
    }

    let parsed: RecommendHospitalsOutput;

    try {
      const jsonData = JSON.parse(cleanedOutput);
      parsed = RecommendHospitalsOutputSchema.parse(jsonData);
    } catch (parseError: any) {
      console.error('Parse error:', parseError);
      console.error('Raw output:', replyText);
      console.error('Cleaned output:', cleanedOutput); 
      
      return NextResponse.json({
        recommendationIntro: "Search completed but response formatting encountered an issue. Here's general guidance based on your request:",
        hospitals: [{
          hospitalName: "Manual Search Recommended",
          specializationFocus: hasConditions ? 
            `Treatment for ${input.diagnosedConditions!.join(', ')}` : 
            `Care for ${input.symptoms!.join(', ')}`,
          simulatedRankingReason: `Please search manually for hospitals ${locationContext} specializing in your specific condition. The search service returned data but in an unexpected format.`,
          address: "Location-based search recommended",
        }],
        debugInfo: {
          parseError: parseError.message,
          rawOutputPreview: replyText.substring(0, 300) + "...",
          cleanedOutputPreview: cleanedOutput.substring(0, 300) + "..."
        }
      });
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('API Route error:', error);
    return NextResponse.json({ 
      error: 'Invalid input or server error',
      details: error.message 
    }, { status: 400 });
  }
}