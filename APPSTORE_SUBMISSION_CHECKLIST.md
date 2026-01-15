# FadeCheck App Store Submission Checklist

## Understanding the Rejection

**Rejection Reason:** Guideline 1.2 - Safety - User Generated Content
> "includes features that appear to objectify real people, which could be interpreted as being offensive or mean-spirited"

**Root Cause:** Apple interpreted the app as a "hot-or-not" style rating system that objectifies real people.

**Solution:** Reframe as a **personal grooming coach** for self-improvement only.

---

## Pre-Submission Checklist

### 1. App Store Connect Metadata (CRITICAL)

- [ ] **App Name:** Keep "FadeCheck" but consider subtitle like "Your Grooming Coach"
- [ ] **Subtitle:** Use "Personal Haircut Coach" or "AI Grooming Assistant"
- [ ] **Description:** Must emphasize:
  - Self-improvement focus
  - Personal grooming guidance
  - Users analyze their OWN haircuts only
  - Constructive feedback, not judgment
  - Medical disclaimer

**Suggested Description:**
```
FadeCheck is your personal AI grooming coach that helps you understand and improve your haircut.

Get personalized feedback on your fade, lineup, and blend quality. Learn what makes a great haircut and receive actionable tips to communicate better with your barber.

KEY FEATURES:
• AI-powered haircut analysis
• Personalized grooming tips
• Face shape analysis for style recommendations
• Hair type identification
• Product recommendations for your hair type
• Maintenance schedule reminders

FOR SELF-IMPROVEMENT ONLY:
FadeCheck is designed to help you improve your own grooming. Analyze photos of YOUR haircuts to track your progress and get better results at the barbershop.

IMPORTANT DISCLAIMERS:
• This app is for personal use only
• Results are AI-generated suggestions, not professional advice
• Consult a licensed barber for professional guidance
• Do not use to analyze photos of others
```

- [ ] **Keywords:** Use self-improvement focused keywords
  - grooming, haircut coach, fade tips, barber tips, personal grooming, self-improvement
  - AVOID: rate, rating, score, hot, judge

- [ ] **What's New:** Mention the self-improvement focus

- [ ] **Age Rating:** Set appropriately (4+ should be fine for grooming app)

- [ ] **Privacy Policy URL:** Must be valid and accessible

- [ ] **Support URL:** Must be valid and accessible

### 2. App Review Notes (CRITICAL)

Write a clear note to the reviewer explaining:

```
Dear App Review Team,

FadeCheck is a personal grooming assistant designed exclusively for self-improvement. Key points:

1. SELF-USE ONLY: Users analyze photos of their own haircuts. We explicitly prohibit analyzing photos of others through:
   - First-launch consent modal requiring users to confirm they will only analyze their own photos
   - Terms of Service explicitly stating "do not use it to judge or rate other people"
   - Prohibited uses section in ToS forbidding "photos of others without their consent"

2. COACHING, NOT JUDGING: Our AI acts as a supportive grooming coach, providing:
   - Constructive feedback using positive language
   - Actionable tips for improvement
   - Hair type and face shape analysis for style recommendations
   - Product recommendations

3. NO "HOT-OR-NOT" FUNCTIONALITY:
   - No comparison between users
   - No social features or public sharing of scores
   - No leaderboards or rankings
   - Analysis is private to the individual user

4. DISCLAIMER: All results are clearly marked as AI-generated suggestions, not professional advice.

Thank you for your consideration.
```

### 3. In-App Compliance (VERIFY ALL)

#### Consent & Disclaimers
- [x] First-launch AI consent modal with self-use confirmation
- [x] Terms of Service with explicit self-use restriction
- [x] Terms of Service prohibits analyzing photos of others
- [x] AI disclaimer stating results are suggestions, not professional advice
- [x] Privacy Policy accessible in app

#### Language & Tone
- [x] Score labels are positive: EXPERT LEVEL, EXCELLENT, GREAT, FAIR, DEVELOPING, FRESH START
- [x] No mean-spirited labels (removed: ELITE, FIRE, MID, BOTCHED)
- [x] AI prompt frames as "supportive coach, not a critic"
- [x] Tips are coaching-focused ("Your Grooming Guide")
- [x] All "rate/rating" changed to "analyze/analysis" in UI

#### Sharing Features
- [x] Low scores share generic positive message, not the actual score
- [x] High scores can share actual results
- [x] No public leaderboards or comparisons

#### Permission Descriptions
- [x] Camera: "analyze your haircut and provide personalized grooming tips"
- [x] Photo Library: "analyze photos of your haircut"

### 4. Screenshots & Preview (IMPORTANT)

- [ ] Screenshots should show:
  - Positive/encouraging feedback
  - Self-improvement messaging
  - Grooming tips and recommendations
  - Face shape analysis
  - Hair type identification
- [ ] Avoid showing:
  - Low scores prominently
  - Any "judging" language
  - Multiple people being compared

### 5. Technical Checks

- [x] TypeScript compiles without errors
- [ ] Test all flows work correctly
- [ ] Verify consent modal appears on first launch
- [ ] Test camera and photo picker permissions
- [ ] Test subscription flows (RestorePurchases)
- [ ] No crashes or placeholder content
- [ ] All links work (Privacy Policy, Terms, Support)

---

## Additional Recommendations

### Consider Adding:
1. **Content Reporting:** Method to report if someone misuses the app
2. **Block Feature:** Ability to block/report inappropriate use
3. **Age Verification:** Simple age gate (optional but shows good faith)

### In Your Appeal/Resubmission Message:
Explain specifically what changes were made:
- Changed from "rating" to "analysis" framing
- Added explicit self-use only consent
- Updated Terms of Service to prohibit analyzing others
- Changed AI from "judge" to "supportive coach"
- Updated all score labels to positive language
- Added medical/professional disclaimers

---

## Sources & Guidelines Referenced

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Guideline 1.2: User Generated Content - Prohibits "hot-or-not" and objectification
- Guideline 1.1.1: Mean-spirited content prohibition
- [Umax App](https://apps.apple.com/us/app/umax-become-hot/id6471026798) - Reference for approved similar app

---

## Final Verification Before Submit

1. [ ] All metadata updated in App Store Connect
2. [ ] App Review notes written and added
3. [ ] Test app thoroughly on device
4. [ ] Verify consent modal works
5. [ ] Check all links work
6. [ ] Build and upload new binary
7. [ ] Submit for review
