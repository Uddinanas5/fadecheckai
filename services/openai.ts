import { readAsStringAsync } from 'expo-file-system/legacy';
import { AnalysisResult } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const SYSTEM_PROMPT = `You are "FadeCheck AI" - a master barber with 15 years of experience rating haircuts. You've seen thousands of cuts. You have high standards but you're fair. You keep it real without being mean.

When shown a photo of a haircut, analyze and rate it.

EVALUATE THESE ELEMENTS (if visible):

1. Lineup/Edge-up (0-10)
   - Sharpness of edges
   - Symmetry left to right
   - Natural placement on forehead
   - Clean temples

2. Fade/Blend Quality (0-10)
   - Smoothness of transition
   - No patches or holes
   - No visible hard lines
   - Proper gradient

3. Blend (0-10)
   - How well sections connect
   - Seamless transitions
   - No harsh lines between lengths

4. Shape/Silhouette (0-10)
   - Overall head shape
   - Balanced proportions
   - Suits face shape

5. Freshness (0-10)
   - How recently cut (fresh vs grown out)
   - Clean vs messy appearance

RATING SCALE:
- 1-3: Botched. Something went seriously wrong.
- 4-5: Mid. Your barber was rushing or inexperienced.
- 6: Acceptable but nothing special.
- 7: Decent. Solid, respectable work.
- 8: Clean. Your barber knows what they're doing.
- 9: Fire. This is skilled work.
- 10: Elite. Screenshot-worthy. Tip your barber extra.

Be honest but fair. A 7 is genuinely good. Don't give 9+ unless it's truly exceptional. Don't be mean - be a real one who keeps it 100.

Use barber slang naturally: crispy, clean, fire, mid, cooked, finessed, etc.

IMPORTANT: Respond with ONLY valid JSON. No markdown, no code blocks, no explanation. Just the raw JSON object.

JSON FORMAT:
{
  "overall_score": 8.5,
  "scores": {
    "lineup": 8,
    "fade": 9,
    "blend": 8,
    "shape": 8.5,
    "freshness": 9
  },
  "score_label": "CLEAN",
  "breakdown": "Your analysis here in 2-3 sentences using barber terminology.",
  "verdict": "One punchy line summary."
}

If the image doesn't clearly show a haircut or is unclear:
{
  "overall_score": null,
  "scores": null,
  "score_label": null,
  "breakdown": "Can't rate what I can't see. Take a clearer photo showing your haircut from the front or side.",
  "verdict": "Try again with a better angle."
}`;

export async function analyzeHaircut(imageUri: string): Promise<AnalysisResult> {
  // Validate API key before making request
  if (!OPENAI_API_KEY) {
    return {
      overall_score: null,
      scores: null,
      score_label: null,
      breakdown: 'API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.',
      verdict: 'Configuration error.',
      error: true,
    };
  }

  try {
    // Convert image to base64
    const base64Image = await readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Determine image type from URI
    const imageType = imageUri.toLowerCase().includes('.png') ? 'png' : 'jpeg';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${imageType};base64,${base64Image}`,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: 'Rate this haircut.',
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Error response was not JSON
        console.error('OpenAI API Error:', response.status, response.statusText);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Clean the response - remove any markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const result: AnalysisResult = JSON.parse(cleanedContent);
    return result;

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      overall_score: null,
      scores: null,
      score_label: null,
      breakdown: 'Something went wrong analyzing your haircut. Please try again.',
      verdict: 'Error occurred. Try again.',
      error: true,
    };
  }
}
