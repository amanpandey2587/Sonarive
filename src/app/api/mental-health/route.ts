
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const MentalHealthInputSchema = z.object({
  age: z.number().min(0).max(130),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']), 
  ph9Score: z.number().min(0).max(27),
  gad7Score: z.number().min(0).max(21),
  textInput: z.string().min(1),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional(),
});

type MentalHealthInput = z.infer<typeof MentalHealthInputSchema>;

function buildPrompt(input: MentalHealthInput): string {
  let locationInfo = "User has not shared their location.";
  if (input.userLatitude !== undefined && input.userLongitude !== undefined) {
      locationInfo = `User's approximate location for mental health support recommendations: Latitude ${input.userLatitude.toFixed(4)}, Longitude ${input.userLongitude.toFixed(4)}.`;
  }

  return `
You are an expert clinical psychologist and digital mental health researcher, simulating the capabilities of "Sonar" AI.

Here is a user’s screening data:
- **PHQ-9 (Depression Score)**: ${input.ph9Score} (out of 27)
- **GAD-7 (Anxiety Score)**: ${input.gad7Score} (out of 21)
- **Age**: ${input.age}
- **Gender**: ${input.gender}
- **${locationInfo}**

They wrote:
"${input.textInput}"

Based on ALL this information, provide a comprehensive intervention plan.
The output should be a single Markdown string.
The plan should include:

## Immediate Safety Assessment
- Evaluate suicide risk based on PHQ-9 and text input. If PHQ-9 is high or text indicates distress, suggest using a validated tool like C-SSRS (conceptually).
- Outline a crisis safety plan (emergency contacts, helplines, self-harm mitigation steps).
- Identify potential support systems.
- Consider if urgent psychiatric evaluation is needed.

## Diagnostic Considerations
- Primary concerns (e.g., MDD, GAD based on scores).
- Differential diagnoses (e.g., Adjustment Disorder, PDD).
- Contributing factors (e.g., relationship, professional stressors).

## Treatment Recommendations
### Psychotherapy
- Recommend appropriate evidence-based therapy (e.g., CBT for depression/anxiety).
- Suggest focus areas (negative thoughts, behavioral activation).
- Outline a structured treatment plan (phases, session frequency).
### Pharmacotherapy
- If scores are severe, suggest considering medication alongside therapy (e.g., SSRI like escitalopram, conceptual dosage).
- Mention monitoring.
### Combination Approach
- Highlight benefits of integrated treatment if applicable.
- Suggest collaborative care.

## Monitoring Plan
- Regular assessment (PHQ-9/GAD-7 frequency).
- Functional evaluation (relationship, work, social functioning).
- Treatment response markers (score reduction, symptom improvement).

## Supportive/Lifestyle Advice
- Establish structure (routine, time management).
- Physical wellbeing (exercise, nutrition, limit substances).
- Social connection (reconnect, support groups).
- Stress management (mindfulness, wellness plan, coping strategies).

## Nearby Psychiatrist/Clinic Recommendations
- Based on the user's approximate location (if provided), retrieve and display **real-time or current** examples of psychiatrists, therapists, or clinics available either locally or via trusted online platforms.
- Provide a table with columns: | Name/Clinic | Experience (Years) | Location/Platform | Consultation Fee (approx.) | Notable Features |
- If no specific providers are available for real-time lookup, list real directories, telehealth platforms, or national helplines users can check (e.g., Practo, Manastha, NIMHANS, BetterHelp, etc.).
- Ensure the information is timely, accurate, and aligns with the user’s region (urban, rural, or unspecified).

**IMPORTANT**: Tailor the entire plan based on the provided severity levels, age, gender, text input, and location (if available).
Use Markdown for formatting, including headers (##), lists (-), and tables.
  `;
}

  

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = MentalHealthInputSchema.parse(body);
    const prompt = buildPrompt(input);

  
    const apiKey = process.env.SONAR_API_KEY || process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("API key for the AI service is not configured.");
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'You are a clinical psychology expert simulating Sonar AI, providing a comprehensive mental health intervention plan in Markdown format.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5, 
      }),
    });
    console.log("Response in the frontedn is ",response);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API Error:", errorText);
      return NextResponse.json({ error: `AI service error: ${response.statusText}. Details: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
        return NextResponse.json({ error: "AI model did not return a message." }, { status: 500 });
    }

    return NextResponse.json({
      interventionPlan: aiMessage,
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
        console.error("Zod Validation Error:", err.errors);
        return NextResponse.json({ error: "Invalid input data.", details: err.errors }, { status: 400 });
    }
    console.error("API Route Error:", err);
    return NextResponse.json({ error: err.message || "An internal server error occurred." }, { status: 500 });
  }
}

