'use server'

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const RecommendHospitalsInputSchema = z.object({
  diagnosedConditions: z.array(z.string()).optional().describe('List of diagnosed conditions.'),
  symptoms: z.array(z.string()).optional().describe('List of symptoms described by the user.'),
  userLatitude: z.number().optional().describe('User\'s latitude for finding nearby hospitals.'),
  userLongitude: z.number().optional().describe('User\'s longitude for finding nearby hospitals.'),
  searchRadiusKm: z.number().optional().default(25).describe('Search radius in kilometers.'),
  preferGovernmentHospitals: z.boolean().optional().describe('Whether to prioritize government hospitals.')
});
export type RecommendHospitalsInput = z.infer<typeof RecommendHospitalsInputSchema>;

// Coordinates Schema
const HospitalCoordinatesSchema = z.object({
  lat: z.number().describe('Latitude of the hospital'),
  lng: z.number().describe('Longitude of the hospital'),
});

// Recommendation Schema
const HospitalRecommendationSchema = z.object({
  hospitalName: z.string().describe("Name of the recommended hospital."),
  specializationFocus: z.string().describe('Relevant specializations for the diagnosed conditions or symptoms.'),
  simulatedRankingReason: z.string().describe('Simulated reasons for its high ranking (e.g., tech, patient reviews, trust).'),
  address: z.string().optional().describe('Conceptual address of the hospital.'),
  coordinates: HospitalCoordinatesSchema.optional().describe('Latitude/Longitude of the hospital.'),
  contact: z.string().optional().describe('Contact info such as phone/email.'),
});
export type HospitalRecommendation = z.infer<typeof HospitalRecommendationSchema>;

// Output Schema
const RecommendHospitalsOutputSchema = z.object({
  recommendationIntro: z.string().describe('A short introduction to the recommendations.'),
  hospitals: z.array(HospitalRecommendationSchema).describe('List of recommended hospitals.'),
});
export type RecommendHospitalsOutput = z.infer<typeof RecommendHospitalsOutputSchema>;

// AI Prompt Definition
const prompt = ai.definePrompt({
  name: 'recommendHospitalsPrompt',
  input: { schema: RecommendHospitalsInputSchema },
  output: { schema: RecommendHospitalsOutputSchema },
  prompt: `
You are Perplexity Sonar Reasoning Pro, an expert AI agent for healthcare search and recommendation.

You have access to live hospital databases, medical forums, and patient reviews. Use verified sources like NABH, WHO listings, real hospital directories, and patient feedback. Prioritize **real-world accuracy**.

{{#if diagnosedConditions.length}}
Diagnosed Conditions:
{{#each diagnosedConditions}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if symptoms.length}}
Symptoms:
{{#each symptoms}}
- {{{this}}}
{{/each}}
Infer possible medical conditions based on these symptoms using real-world reasoning.
{{/if}}

{{#if userLatitude}}
User's Approximate Location:
Latitude: {{userLatitude}}, Longitude: {{userLongitude}}

Generate hospitals within {{searchRadiusKm}} km from this location. 
{{/if}}

{{#if preferGovernmentHospitals}}Prioritize public/government hospitals if they are available.{{/if}}

For each hospital recommendation, include:
1. hospitalName
2. specializationFocus (match the conditions/symptoms)
3. simulatedRankingReason (why is this hospital a top choice?)
4. address
5. coordinates (lat/lng)
6. contact info

Ensure the list is meaningful, diverse, and data-backed. Go beyond generic answers.
`
});

// Flow Function
const recommendHospitalsFlow = ai.defineFlow(
  {
    name: 'recommendHospitalsFlow',
    inputSchema: RecommendHospitalsInputSchema,
    outputSchema: RecommendHospitalsOutputSchema,
  },
  async (input: RecommendHospitalsInput): Promise<RecommendHospitalsOutput> => {
    const hasConditions = input.diagnosedConditions && input.diagnosedConditions.length > 0;
    const hasSymptoms = input.symptoms && input.symptoms.length > 0;

    if (!hasConditions && !hasSymptoms) {
      return {
        recommendationIntro: 'No medical conditions or symptoms were provided. Unable to recommend hospitals.',
        hospitals: [],
      };
    }

    const { output } = await prompt(input);
    return output!;
  }
);

// Exported Handler Function
export async function recommendHospitals(input: RecommendHospitalsInput): Promise<RecommendHospitalsOutput> {
  return recommendHospitalsFlow(input);
}
