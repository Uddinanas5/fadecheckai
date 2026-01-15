# FadeCheck App Store Compliance Plan

## Executive Summary

Apple rejected FadeCheck under **Guideline 1.2 - Safety - User Generated Content** for "objectifying real people" in a manner similar to "hot-or-not" apps. This plan transforms FadeCheck from a "haircut rating app" into a "personal grooming coach" while maintaining all core functionality.

---

## Core Strategy: Reframe Everything

| Current Framing | New Framing |
|-----------------|-------------|
| "Rate your haircut" | "Analyze your cut" |
| "Rating" | "Analysis" / "Feedback" |
| "Score" | "Quality Grade" / "Assessment" |
| "BOTCHED" | "Needs Attention" |
| "MID" | "Room to Grow" |
| Judgment-focused | Improvement-focused |

---

## Phase 1: Critical Label Changes

### 1.1 Score Labels (constants/Colors.ts)

**Current → New:**
```
ELITE (9.5-10)     → EXPERT LEVEL
FIRE (9.0-9.4)     → EXCELLENT
CLEAN (8.0-8.9)    → GREAT
SOLID (7.0-7.9)    → GOOD
DECENT (6.0-6.9)   → FAIR
MID (5.0-5.9)      → DEVELOPING
ROUGH (4.0-4.9)    → NEEDS WORK
BAD (3.0-3.9)      → NEEDS ATTENTION
BOTCHED (1.0-2.9)  → FRESH START
```

**File:** `constants/Colors.ts` (lines 77-84)

### 1.2 OpenAI System Prompt (services/openai.ts)

**Changes needed:**
1. Replace all grade labels in the prompt (lines 173-182)
2. Change "WHAT A BAD FADE LOOKS LIKE" → "COMMON IMPROVEMENT AREAS"
3. Change "WHAT A BAD LINEUP LOOKS LIKE" → "LINEUP IMPROVEMENT OPPORTUNITIES"
4. Change "WHAT A BAD BLEND LOOKS LIKE" → "BLEND ENHANCEMENT TIPS"
5. Update verdict instruction: "One encouraging summary line with constructive feedback"
6. Add instruction: "Always frame feedback constructively. Focus on potential, not criticism."
7. Remove slang: "cooked" → remove entirely (mean-spirited)

**File:** `services/openai.ts` (lines 6-244)

---

## Phase 2: UI Text & Messaging Changes

### 2.1 App-Wide Terminology Replacement

| Find | Replace With |
|------|--------------|
| "Rate your haircut" | "Analyze your cut" |
| "Rate your cut" | "Get your analysis" |
| "Rating" | "Analysis" |
| "Ratings" | "Analyses" |
| "No Ratings Yet" | "No Analyses Yet" |
| "Rate your first haircut" | "Analyze your first cut" |
| "Share your rating" | "Share your results" |

### 2.2 Files Requiring Text Changes

| File | Line(s) | Current | New |
|------|---------|---------|-----|
| `app.json` | 23 | "rate your haircut" | "analyze your haircut for personalized grooming tips" |
| `app.json` | 24 | "select photos of your haircut" | "select photos for personalized analysis" |
| `app.json` | 57 | "rate your haircut" | "analyze your haircut" |
| `components/CameraView.tsx` | 94 | "rate your haircut" | "analyze your cut" |
| `components/MultiAngleCapture.tsx` | 217 | "rate your haircut" | "analyze your cut" |
| `app/(tabs)/history.tsx` | 147 | "No Ratings Yet" | "No Analyses Yet" |
| `app/(tabs)/history.tsx` | 149 | "Rate your first haircut" | "Analyze your first cut" |
| `app/(tabs)/index.tsx` | 130 | "Rate Your Cut" | "Analyze Your Cut" |
| `components/ResultsDisplay.tsx` | 195 | "Share your rating" | "Share your results" |

---

## Phase 3: Self-Improvement Framing

### 3.1 Add Coaching Language

**Onboarding (components/Onboarding.tsx):**
- Change "Rate your haircut instantly" → "Get personalized grooming feedback"
- Add slide: "Your Personal Barber Coach - Actionable tips to look your best"

### 3.2 Results Display Reframe (components/ResultsDisplay.tsx)

**Current hero section says:** Score prominently displayed
**New approach:**
- Lead with "Your Analysis" not the score
- Show score smaller, with context: "Quality Assessment: 8.5/10"
- Add prominent "Your Personalized Tips" section above the score
- Change "verdict" label to "Coach's Note"

### 3.3 Improvement Tips Enhancement (components/ImprovementTips.tsx)

**Current:** Tips shown only when scores are low (implied criticism)
**New approach:**
- Always show tips section (even for high scores)
- High scores: "Maintenance Tips to Keep This Look Fresh"
- Rename section: "Your Grooming Guide" not "Improvement Tips"
- Positive framing: "Next time, try asking for..." instead of implying failure

---

## Phase 4: Restrict Rating Others

### 4.1 Photo Source Restrictions

**Option A (Recommended): Camera-First with Gallery Restriction**
- Default to camera capture
- If user selects gallery, show disclaimer: "For best results, use photos of your own haircut"
- Add checkbox: "This is a photo of my own haircut"

**Option B: Camera Only**
- Remove gallery option entirely
- Only allow live camera capture
- Prevents uploading photos of others

**Files to modify:**
- `components/CameraView.tsx` - Add disclaimer for gallery
- `components/MultiAngleCapture.tsx` - Add self-photo confirmation

### 4.2 Sharing Restrictions

**Current:** Can share "I got 3.2/10! Your fade is botched"
**New approach:**
- Only share positive/neutral results (score 6+)
- For lower scores, share: "I'm working on my grooming game with FadeCheck!"
- Remove exact score from share text for low scores

**File:** `components/ResultsDisplay.tsx` (lines 185-208)

---

## Phase 5: Required Disclaimers

### 5.1 AI Disclaimer (Strengthen Existing)

**File:** `app/terms-of-service.tsx`

Add/update:
```
AI ANALYSIS DISCLAIMER

FadeCheck uses artificial intelligence to provide grooming feedback
and is intended for personal self-improvement purposes only.

- Results are suggestions, not professional assessments
- AI analysis is not a substitute for professional barber consultation
- This app is designed for analyzing your own haircuts only
- Do not use this app to judge or rate other people

FadeCheck does not provide medical, dermatological, or professional
styling advice. Consult a licensed barber or stylist for professional
guidance.
```

### 5.2 First-Launch Consent

**Add new component:** `components/ConsentModal.tsx`

Before first analysis, user must agree:
- [ ] I understand this is for personal self-improvement
- [ ] I will only analyze photos of my own haircuts
- [ ] I understand results are AI-generated suggestions

### 5.3 Privacy Policy Updates

**File:** `app/privacy-policy.tsx`

Ensure explicit disclosure:
- Photos are sent to OpenAI for analysis
- No biometric data is stored permanently
- Photos are not used for advertising or marketing

---

## Phase 6: App Store Metadata

### 6.1 App Name Consideration

**Current:** FadeCheck
**Options:**
- Keep "FadeCheck" (acceptable)
- Consider: "FadeCoach" (more coaching-focused)
- Consider: "FadeGuide" (emphasizes guidance)

### 6.2 App Store Description (for App Store Connect)

```
FadeCheck - Your Personal Grooming Coach

Get AI-powered feedback on your haircut with personalized tips to
look your best. FadeCheck analyzes your fade, lineup, and blend
quality, then provides actionable grooming guidance.

FEATURES:
• Instant AI Analysis - Understand what's working in your cut
• Personalized Tips - Get specific suggestions for your next barber visit
• Hair Profile - Learn your hair type and best products
• Face Shape Guide - Discover styles that complement your features
• Progress Tracking - See your grooming journey over time

FadeCheck is your knowledgeable barber friend in your pocket,
helping you communicate better with your stylist and maintain
your look between visits.

For personal self-improvement use only. Not a substitute for
professional barber consultation.
```

### 6.3 App Category

**Current:** Unknown
**Recommended:** Lifestyle (same as Umax)

### 6.4 Keywords

Avoid: "rate", "rating", "judge", "score"
Use: "grooming", "barber", "haircut", "tips", "coach", "guide", "analysis"

---

## Phase 7: Appeal Response (Optional)

If implementing changes, prepare this response for Apple:

```
Dear App Review Team,

Thank you for your feedback regarding Guideline 1.2. We have made
significant changes to address your concerns:

1. REFRAMED AS SELF-IMPROVEMENT TOOL
   - Changed all "rating" language to "analysis"
   - Added coaching-focused messaging throughout
   - Removed all potentially mean-spirited labels

2. RESTRICTED TO SELF-ANALYSIS
   - Added consent confirming photos are of user's own haircut
   - Modified sharing to prevent sharing harsh assessments

3. STRENGTHENED DISCLAIMERS
   - Added AI disclaimer stating results are suggestions only
   - Added consent flow before first analysis
   - Clarified app is for personal grooming guidance

4. REMOVED OBJECTIFYING ELEMENTS
   - Replaced judgmental labels (BOTCHED → FRESH START)
   - Reframed all feedback as constructive improvement tips
   - Score presentation de-emphasized in favor of guidance

FadeCheck is now positioned as a personal grooming coach similar
to approved apps like Umax, focused on self-improvement rather
than judgment.

We believe these changes fully address Guideline 1.2 concerns.
```

---

## Implementation Checklist

### Critical (Must Fix)
- [ ] Replace BOTCHED, MID, BAD, ROUGH labels
- [ ] Update OpenAI prompt to use new labels
- [ ] Change all "rate/rating" text to "analyze/analysis"
- [ ] Add self-photo confirmation for gallery uploads
- [ ] Strengthen AI disclaimer

### Important (Should Fix)
- [ ] Add first-launch consent modal
- [ ] Update sharing to be more positive
- [ ] Reframe improvement tips as "Grooming Guide"
- [ ] Update app.json permission descriptions
- [ ] Update App Store description

### Recommended (Nice to Have)
- [ ] De-emphasize numerical scores in UI
- [ ] Add "Tips" section above scores in results
- [ ] Consider app name change to "FadeCoach"
- [ ] Add positive messaging for all score ranges

---

## Files to Modify (Complete List)

| File | Priority | Changes |
|------|----------|---------|
| `constants/Colors.ts` | CRITICAL | Replace all score labels |
| `services/openai.ts` | CRITICAL | Update system prompt, labels, tone |
| `app.json` | CRITICAL | Update permission descriptions |
| `components/ResultsDisplay.tsx` | HIGH | Update sharing, terminology |
| `components/CameraView.tsx` | HIGH | Add gallery disclaimer |
| `components/MultiAngleCapture.tsx` | HIGH | Add self-photo confirmation |
| `app/(tabs)/index.tsx` | HIGH | Change "Rate" to "Analyze" |
| `app/(tabs)/history.tsx` | HIGH | Change "Ratings" to "Analyses" |
| `components/ImprovementTips.tsx` | MEDIUM | Rename, always show, positive framing |
| `components/Onboarding.tsx` | MEDIUM | Update messaging |
| `components/HistoryCard.tsx` | MEDIUM | Update terminology |
| `app/terms-of-service.tsx` | MEDIUM | Strengthen AI disclaimer |
| `app/reveal.tsx` | LOW | Update share message |
| `components/Paywall.tsx` | LOW | Update example display |

---

## Estimated Implementation Time

- Phase 1 (Labels): ~30 minutes
- Phase 2 (UI Text): ~45 minutes
- Phase 3 (Reframing): ~1 hour
- Phase 4 (Restrictions): ~1 hour
- Phase 5 (Disclaimers): ~45 minutes
- Phase 6 (Metadata): ~30 minutes
- Testing: ~1 hour

**Total: ~5-6 hours**

---

## Success Criteria

After implementation, the app should:
1. Pass the "mean-spirited test" - no language that could hurt feelings
2. Clearly present as self-improvement, not judgment
3. Restrict ability to rate others' haircuts
4. Have explicit disclaimers about AI and self-use
5. Use empowering, coaching language throughout
