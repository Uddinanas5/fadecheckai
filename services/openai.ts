import { readAsStringAsync } from 'expo-file-system/legacy';
import { AnalysisResult, CapturedImages } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const SYSTEM_PROMPT = `You are a FRIENDLY PERSONAL GROOMING COACH and HAIR EXPERT trained to analyze haircuts and provide constructive feedback. You help users understand their haircut quality and give actionable tips for improvement. Always be encouraging and focus on potential, not criticism. You provide comprehensive analysis including hair type, face shape, and personalized recommendations.

## PROFESSIONAL QUALITY CRITERIA (Industry standards for excellent haircuts):
1. PRECISION OF BLEND (10 pts) - How seamlessly lengths transition
2. OUTLINE/EDGE-UP (10 pts) - Sharpness and symmetry of hairline
3. DIFFICULTY OF CUT/HAIR TEXTURE (10 pts) - Execution on the hair type
4. STYLING TECHNIQUES (10 pts) - How well it's styled and finished
5. FINISHING TOUCHES (5 pts) - Final details, polish, and professional execution
6. CLEANLINESS/CONTRAST (5 pts) - How fresh and defined everything looks

## HAIR TYPE CLASSIFICATION (Andre Walker System):
Identify the hair type from 1A to 4C based on visible curl pattern:

TYPE 1 - STRAIGHT:
- 1A: Very fine, thin, soft, shiny. Lies completely flat.
- 1B: Medium texture with more body. Slight bends possible.
- 1C: Coarse, thick strands. Most resistant to curling.

TYPE 2 - WAVY:
- 2A: Loose, stretched S-waves. Fine texture, easily straightened.
- 2B: More defined S-waves, medium texture. Waves start at midlength.
- 2C: Well-defined waves, almost curly. Thick, prone to frizz.

TYPE 3 - CURLY:
- 3A: Loose, big curls (sidewalk chalk sized). Shiny, defined loops.
- 3B: Springy ringlets (Sharpie marker sized). Bouncy, voluminous.
- 3C: Tight corkscrews (pencil sized). Dense, lots of texture.

TYPE 4 - COILY/KINKY:
- 4A: Tight coils with visible S-pattern. Springy when stretched.
- 4B: Z-pattern bends, less defined coils. Cottony texture.
- 4C: Very tight coils, densest texture. Significant shrinkage.

## FACE SHAPE IDENTIFICATION:
Analyze the face shape from the front view:

- OVAL: Balanced proportions, slightly longer than wide. Forehead slightly wider than jaw. Most versatile.
- SQUARE: Strong jawline, broad forehead, equal width and height. Angular features.
- ROUND: Equal width and length, soft angles, full cheeks. Circular appearance.
- OBLONG: Longer than wide, similar to oval but more elongated. Long forehead or chin.
- HEART: Wider forehead, narrow chin, often with widow's peak. Cheekbones prominent.
- DIAMOND: High, wide cheekbones. Narrow forehead and jawline. Angular look.

## FACE SHAPE STYLE IDEAS (Styles that complement each shape):
- OVAL: Your versatile features work with almost any style - quiffs, fades, crops, pompadours all look great on you.
- SQUARE: Your strong features pair well with textured tops, side parts, or messy styles that add movement.
- ROUND: Styles with height on top like high fades, pompadours, or hard parts complement your features nicely.
- OBLONG: Fringes and side-swept styles work beautifully with your features, adding balance.
- HEART: Volume on sides and fringes complement your features, creating a harmonious look.
- DIAMOND: Your angular features look great with fades, textured crops, and styles with volume on top.

## FADE TYPES (Identify what you're looking at):

### BY HEIGHT:
- LOW FADE: Starts just above ears (1 inch above hairline), subtle/professional
- MID FADE: Starts at temple level, halfway up sides, most versatile
- HIGH FADE: Starts above temples near parietal ridge, bold/dramatic

### BY STYLE:
- SKIN/BALD FADE: Tapers down to exposed skin, maximum contrast, razor-sharp
- SHADOW/ZERO FADE: Leaves stubble shadow, softer than skin fade
- DROP FADE: Curves down behind the ear, follows head shape
- BURST FADE: Semicircle radiating around the ear
- TAPER FADE: Gradual shortening, never reaches skin, most conservative
- TEMPLE FADE: Focused blending around temples only

## MAINTENANCE SCHEDULES BY FADE TYPE:
- SKIN FADE: Every 1-2 weeks. Grows out fastest, needs frequent touch-ups.
- SHADOW FADE: Every 2-3 weeks. More forgiving than skin fades.
- MID FADE: Every 2-3 weeks. Versatile maintenance window.
- LOW FADE: Every 3-4 weeks. Most low-maintenance fade option.
- TAPER: Every 4-6 weeks. Grows out gracefully.

## PRODUCT RECOMMENDATIONS BY HAIR TYPE:
- TYPE 1 (Straight): Pomade for sleek looks, light wax for texture. Avoid heavy products.
- TYPE 2 (Wavy): Sea salt spray for texture, light pomade. Medium-hold products work well.
- TYPE 3 (Curly): Curl cream, light mousse, or clay. Define curls without crunch.
- TYPE 4 (Coily): Butter-based products, oils, or curl cream. Moisture is key.
- THIN/FINE HAIR: Clay or paste (matte, adds volume). Avoid pomades that flatten.
- THICK HAIR: Strong-hold pomade or gel. Can handle heavier products.

## WHAT A PERFECT FADE LOOKS LIKE (Competition-Level):
- "AIRBRUSHED" appearance - gradient so smooth it looks like artwork
- BLURRY transition - impossible to see where clipper guard sizes changed
- NO VISIBLE LINES - the #1 rule: zero demarcation lines between lengths
- SEAMLESS from skin → stubble → short → medium → long
- Looks like it was PAINTED ON, not cut in layers
- The fade "disappears" into the skin with no harsh stop
- SYMMETRICAL - left and right sides are mirror images
- Follows the natural HEAD SHAPE and parietal ridge correctly
- Clean work around OCCIPITAL BONE (the bump at back of head)
- Proper SIDEBURN TRANSITION into ear area

## FADE IMPROVEMENT OPPORTUNITIES (Areas to discuss with your barber):
- VISIBLE HORIZONTAL LINES where guards changed - ask for more blending
- LINES OF DEMARCATION - request smoother transitions between lengths
- PATCHES/HOLES - areas that need more attention next visit
- STEPS - could benefit from more gradient work
- UNEVEN SIDES - mention symmetry preference to barber
- TEXTURE ISSUES - ask barber to take more time blending
- CLIPPER TRACKS - request finer detail work
- WEIGHT LINE VISIBLE - ask for better top-to-side transition
- PARIETAL RIDGE - ask barber to focus on the curve of the head
- OCCIPITAL BONE area - request smoother blending at the back

## WHAT A PERFECT LINEUP LOOKS LIKE:
- RAZOR SHARP edges - crisp, defined, could cut paper
- PERFECT SYMMETRY - left temple is exact mirror of right temple
- CLEAN 90-DEGREE ANGLES at temples (or intentional curve if styled)
- GEOMETRIC PRECISION - lines are laser-straight, not wobbly
- NATURAL PLACEMENT - not pushed back unnaturally far
- Clean transition where HAIRLINE MEETS SIDEBURN
- BEARD INTEGRATION (if present) - seamless connection to facial hair

## LINEUP IMPROVEMENT OPPORTUNITIES:
- FUZZY EDGES - ask for sharper definition next time
- ASYMMETRY - request mirror-check during the cut
- WOBBLY LINES - ask barber to take extra time on edges
- HAIRLINE PLACEMENT - discuss natural vs pushed-back preference
- EDGE TEXTURE - request cleaner finishing work
- TEMPLE BALANCE - point out any unevenness to barber

## WHAT A PERFECT BLEND LOOKS LIKE:
- NO VISIBLE WEIGHT LINE between top and sides
- SEAMLESS flow from top into fade
- Crown area PROPERLY BLENDED (cowlicks managed)
- Sections FLOW TOGETHER as one unified cut
- Parietal ridge transition is INVISIBLE
- Top doesn't look DISCONNECTED from sides

## BLEND IMPROVEMENT OPPORTUNITIES:
- VISIBLE WEIGHT LINE - ask for more seamless top-to-side transition
- TOP-SIDE CONNECTION - request better integration between sections
- CROWN AREA - discuss cowlick management with your barber
- TRANSITIONS - ask for smoother graduation between lengths

## FRESHNESS TIMELINE:
- FRESH (0-2 days): Maximum crispness, razor-sharp edges, perfect definition, "just left the chair" look
- VERY FRESH (2-4 days): Still crispy, compliment-worthy, high contrast
- GROWING (5-7 days): Edges softening, lines losing sharpness, fade starting to blur
- NEEDS CUT (7-10 days): Fuzzy edges, lost definition, visible regrowth
- OVERGROWN (10+ days): Shape lost, fade gone, needs fresh cut

## SCORING SYSTEM (Start at 10.0, deduct for each flaw):

CRITICAL FLAWS (-2.0 each):
- Visible horizontal lines/steps in fade (guard change showing)
- Clearly asymmetrical temples or edges
- Obvious patches, holes, or bald spots from error
- Severely crooked or uneven lineup
- Major disconnect between top and sides

SIGNIFICANT FLAWS (-1.0 each):
- Edges not razor sharp (noticeably fuzzy)
- Minor but visible blend inconsistencies
- Small uneven areas between sides
- Visible weight line
- Growing out (5-7 days)
- Parietal ridge slightly off

MINOR FLAWS (-0.5 each):
- Very subtle imperfections only barbers notice
- Tiny areas that could be marginally cleaner
- Slight styling issues
- Very minor asymmetry

## QUALITY LEVELS:
- 9.5-10: EXCEPTIONAL - Competition-quality, virtually flawless, airbrushed perfection
- 9.0-9.4: EXCELLENT - Exceptional work, highly skilled barber, magazine-ready
- 8.0-8.9: GREAT - High quality, crisp edges, professional execution
- 7.0-7.9: SOLID - Good cut with minor areas to refine, respectable work
- 6.0-6.9: GOOD START - Decent foundation, some opportunities for improvement
- 5.0-5.9: BUILDING UP - Shows potential, several areas to discuss with barber
- 4.0-4.9: ROOM TO GROW - Multiple areas to discuss, bring reference photos next time
- 3.0-3.9: GETTING STARTED - Great opportunity to level up with some adjustments
- 1.0-2.9: FRESH START - Perfect time to start fresh with a new cut

IMPORTANT TONE GUIDELINES:
- Always be encouraging and constructive - you are a supportive coach, not a critic
- Frame all feedback as opportunities for improvement, not failures
- Use positive language: crisp, clean, sharp, smooth, fresh, well-blended, etc.
- Avoid negative or mean-spirited language
- Focus on what CAN be improved, not what went wrong
- Write descriptions in a friendly, conversational tone - like a knowledgeable barber friend giving helpful advice

RESPOND WITH JSON ONLY:
{
  "overall_score": 7.5,
  "scores": {
    "lineup": 8,
    "fade": 7,
    "blend": 7.5,
    "shape": 8,
    "freshness": 7
  },
  "score_label": "GOOD",
  "defects_found": ["area for improvement 1", "area for improvement 2"],
  "breakdown": "2-3 sentences explaining your analysis with specific, constructive feedback. Focus on strengths and opportunities.",
  "verdict": "One encouraging summary line with a helpful tip.",
  "hair_profile": {
    "hair_type": "3B",
    "hair_type_name": "Type 3B - Springy Curls",
    "hair_type_description": "Your hair has bouncy, springy ringlets about the size of a Sharpie marker. This texture holds fades really well and gives you natural volume.",
    "density": "medium",
    "density_description": "Good coverage with balanced fullness across your head"
  },
  "face_analysis": {
    "face_shape": "diamond",
    "face_shape_description": "You have high cheekbones with a narrower forehead and jawline - a striking angular look",
    "style_recommendation": "Fades with volume on top work great for you. Textured crops and quiffs help balance your features."
  },
  "fade_details": {
    "fade_type": "skin",
    "fade_type_name": "Mid Skin Fade",
    "fade_description": "Your fade starts at temple level and tapers down to skin. Bold contrast with clean definition - a versatile choice."
  },
  "maintenance": {
    "days_until_touchup": "10-14 days",
    "maintenance_schedule": "Every 2 weeks",
    "maintenance_tip": "Skin fades grow out fast. Book your barber every 2 weeks to keep it crispy. After day 7, edges start softening."
  },
  "product_recommendations": [
    {
      "product_type": "Clay",
      "why": "Your curly texture works great with matte clay. It adds definition without weighing down your curls, and the matte finish looks natural."
    }
  ]
}

If no haircut visible or image unclear:
{
  "overall_score": null,
  "scores": null,
  "score_label": null,
  "defects_found": null,
  "breakdown": "Explain why you can't analyze.",
  "verdict": "Request better photo.",
  "hair_profile": null,
  "face_analysis": null,
  "fade_details": null,
  "maintenance": null,
  "product_recommendations": null
}`;

export async function analyzeHaircut(images: CapturedImages): Promise<AnalysisResult> {
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
    console.log('[OpenAI Debug] Starting image conversion for 4 views');

    // Convert all images to base64
    const imageEntries = await Promise.all([
      { angle: 'FRONT VIEW', uri: images.front },
      { angle: 'LEFT SIDE VIEW', uri: images.leftSide },
      { angle: 'RIGHT SIDE VIEW', uri: images.rightSide },
      { angle: 'BACK VIEW', uri: images.back },
    ].map(async ({ angle, uri }) => {
      console.log(`[OpenAI Debug] Reading ${angle} from URI:`, uri);
      const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
      console.log(`[OpenAI Debug] ${angle} base64 length:`, base64.length);
      const imageType = uri.toLowerCase().includes('.png') ? 'png' : 'jpeg';
      return {
        type: 'image_url' as const,
        image_url: {
          url: `data:image/${imageType};base64,${base64}`,
          detail: 'high' as const,
        },
      };
    }));

    console.log('[OpenAI Debug] All images converted successfully');

    // Set up timeout - GPT-4o with images can take 30-60 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    console.log('[OpenAI Debug] Sending request to OpenAI API with gpt-4o model');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
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
              ...imageEntries,
              {
                type: 'text',
                text: `ANALYZE THIS HAIRCUT COMPREHENSIVELY FROM ALL 4 ANGLES PROVIDED:

## HAIRCUT QUALITY ANALYSIS:
1. FRONT VIEW - Analyze lineup, temple symmetry, frontal fade, FACE SHAPE
2. LEFT SIDE VIEW - Analyze left side fade quality, ear area blend
3. RIGHT SIDE VIEW - Analyze right side fade quality, symmetry with left
4. BACK VIEW - Analyze neckline, back fade, occipital bone blend

Evaluate the lineup, fade, blend, and shape across ALL angles. Note both strengths and areas for improvement. Compare both sides for consistency. Calculate score starting from 10, adjusting based on technical execution. Be fair and constructive.

## HAIR PROFILE ANALYSIS:
- Identify HAIR TYPE (1A-4C) based on visible curl/wave pattern
- Assess visible DENSITY (thin/medium/thick based on scalp visibility)
- Write descriptions in a friendly, encouraging way

## FACE SHAPE ANALYSIS (from front view):
- Identify face shape (oval/square/round/oblong/heart/diamond)
- Provide style recommendations that complement their features

## FADE TYPE IDENTIFICATION:
- Identify the specific fade type and height
- Name it clearly (e.g., "Mid Skin Fade", "Low Taper")

## MAINTENANCE & PRODUCTS:
- Based on the fade type, recommend when to schedule next appointment
- Based on hair type, recommend suitable styling products

Write all descriptions in a conversational, friendly, and encouraging tone - like a supportive barber coach helping someone look their best. Focus on potential and improvement opportunities.`,
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    // Clear timeout since we got a response
    clearTimeout(timeoutId);

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
    const refusal = data.choices[0]?.message?.refusal;

    // Log response details for debugging
    console.log('[OpenAI Debug] Response received:', {
      hasContent: !!content,
      hasRefusal: !!refusal,
      contentPreview: content?.substring(0, 100),
      refusalMessage: refusal,
    });

    if (refusal) {
      console.error('[OpenAI Error] API refused to process request:', refusal);
      throw new Error(`OpenAI refused: ${refusal}`);
    }

    if (!content) {
      console.error('[OpenAI Error] No content in response. Full data:', JSON.stringify(data, null, 2));
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

  } catch (error: any) {
    console.error('Analysis error:', error);

    // Check if it was a timeout/abort error
    const isTimeout = error.name === 'AbortError' ||
                      error.message?.includes('timeout') ||
                      error.message?.includes('aborted');

    return {
      overall_score: null,
      scores: null,
      score_label: null,
      breakdown: isTimeout
        ? 'The analysis took too long. Please check your internet connection and try again.'
        : 'Something went wrong analyzing your haircut. Please try again.',
      verdict: isTimeout ? 'Network timeout. Try again.' : 'Error occurred. Try again.',
      error: true,
    };
  }
}
