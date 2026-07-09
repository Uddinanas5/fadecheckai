# FadeCheck 2.0 — Megaprompt & Build Spec

> **Autonomous engineering brief.** This document is the single source of truth for
> rebuilding FadeCheck around a new core loop. Run the build in phases, self-verify
> after every phase (typecheck + web export + smoke test), commit continuously, and
> do not stop until every acceptance criterion in §9 is met and verified multiple times.

---

## 1. The Pivot (What we're building)

**Old app:** Capture 4 angles of your haircut → GPT-4o *grades* it (ELITE/SHARP/…) → coaching tips.
It judges the past.

**New app:** *Plan your next cut.*

```
Upload your current photo
        ↓
AI reads your face shape + hair type and RECOMMENDS styles
        ↓
Pick a style — from AI recommendations OR by browsing the full catalog
        ↓
See a curated REFERENCE GALLERY of that style ("show your barber these")
        ↓
Generate an AI TRY-ON: a realistic photo of YOU with that haircut
        ↓
Save / share the picture + "what to ask your barber" notes
```

Tagline: **"See it before you cut it."**

### Locked product decisions (from stakeholder interview)
| Decision | Choice |
|---|---|
| Core output | **Both** — curated reference gallery **and** personalized AI try-on |
| Style selection | **AI recommends** best-fit styles **and** user can **browse the full catalog** |
| Monetization | **Free during rebuild** — remove/bypass the paywall gate, keep RevenueCat code dormant for later |
| Old rating feature | **Keep as a bonus "Rate" tab** — reuse the analysis, drop the paywall gate on it |
| Try-on engine | **OpenAI `gpt-image-1`** (image edit) |
| Reference gallery source | **Bundled curated catalog** (assets shipped with the app; placeholders generated now, real photos swapped in later) |
| Secrets / generation calls | **Supabase Edge Function** — the OpenAI key never ships in the client bundle |
| Delivery | **Autonomous loop** — build, verify, iterate, commit, push to `claude/haircut-app-megaprompt-kr7vd8` |

### Product principle
Keep it **simple and delightful**, not complicated. One obvious primary action per screen.
The "wow" is the try-on. Everything else serves getting the user to a great try-on fast.

---

## 2. Tech Baseline (what already exists — reuse it)

- **Expo SDK 54 / React Native 0.81 / expo-router v6** (typed routes), TypeScript strict-ish.
- Design system: `constants/Colors.ts` (Electric Blue `#0145F2` + dark "liquid glass"), `constants/Styles.ts`.
- Camera/upload: `components/MultiAngleCapture.tsx` (4-angle capture + gallery picker).
- AI analysis: `services/openai.ts` (GPT-4o vision → structured `AnalysisResult`).
- Backend: `services/supabase.ts` (auth, incl. Apple/Google), `contexts/RevenueCatContext.tsx` (subscriptions).
- Storage: AsyncStorage via `hooks/useHistory.ts`, `hooks/useOnboarding.ts`, `hooks/useFirstScan.ts`.
- Screens: `app/(tabs)/{index,history,profile}.tsx`, `app/{results,reveal,paywall,...}.tsx`.
- Consent: `components/AIConsentModal.tsx` (keep — required for App Store).

**Do not break** the App Store compliance posture (privacy policy, AI consent, non-medical framing).

---

## 3. Target Architecture

### 3.1 Navigation (tabs)
Replace the 3-tab layout with **4 tabs** (keep it clean):

| Tab | Route | Purpose |
|---|---|---|
| **Create** | `app/(tabs)/index.tsx` | The new primary loop: photo → recommendations → style → try-on |
| **Styles** | `app/(tabs)/styles.tsx` | Browse the full haircut catalog, filter by category |
| **Rate** | `app/(tabs)/rate.tsx` | Bonus: the old "grade my cut" analysis (paywall removed) |
| **Profile** | `app/(tabs)/profile.tsx` | Settings, saved history (try-ons + ratings), legal, consent |

History (saved try-ons + past ratings) lives inside Profile as a "Your looks" section and/or a
pushed `app/history` screen. Do not create tab clutter.

### 3.2 New screens (stack, presented over tabs)
- `app/recommendations.tsx` — after analysis: "Recommended for you" list + link to catalog.
- `app/style/[id].tsx` — style detail: reference gallery (swipeable), metadata, "Try it on" CTA, "Ask your barber" notes.
- `app/tryon.tsx` — try-on result: generated image (with before/after toggle), save/share, "try another style".

### 3.3 New modules
- `constants/haircuts.ts` — **the catalog**: array of `Haircut` objects (see §4). ~14–18 popular men's styles.
- `services/tryon.ts` — client for the Supabase Edge Function; base64 photo + style prompt → generated image. Includes a **demo/mock mode** so the flow is fully exercisable without a deployed key.
- `services/recommend.ts` — turns an `AnalysisResult` (face shape + hair type) into a ranked list of catalog `styleId`s with reasons. Pure/deterministic matching over catalog metadata; optionally augmented by the model.
- `hooks/useTryOn.ts` — state machine for the generation call (idle/generating/done/error).
- `hooks/useCatalog.ts` — catalog access + filtering + lookup by id.
- `supabase/functions/tryon/index.ts` — Deno edge function proxying `gpt-image-1`.

### 3.4 Data flow
```
Create tab
  → PhotoCapture (single front photo; reuse picker/camera, simplified)
  → services/openai.ts  (reuse: face shape + hair type; scores optional/ignored here)
  → services/recommend.ts (catalog match)  → app/recommendations.tsx
  → app/style/[id].tsx (gallery + CTA)
  → services/tryon.ts → Supabase fn → gpt-image-1 → app/tryon.tsx
  → hooks/useHistory.ts (persist TryOnResult)
```

---

## 4. Data Model (add to `types/index.ts`)

```ts
export type HaircutCategory =
  | 'fade' | 'taper' | 'crop' | 'quiff' | 'pompadour'
  | 'buzz' | 'fringe' | 'curly' | 'long' | 'classic';

export interface Haircut {
  id: string;                 // slug, e.g. 'mid-taper-fade'
  name: string;               // 'Mid Taper Fade'
  category: HaircutCategory;
  tagline: string;            // one-liner
  description: string;        // 2–3 sentences
  bestFaceShapes: FaceShape[];// for matching
  bestHairTypes: HairType[];  // for matching (family match ok, e.g. any '3x')
  maintenance: string;        // e.g. 'Every 2–3 weeks'
  difficulty: 'easy' | 'medium' | 'advanced';
  barberInstructions: string[]; // "what to ask for" bullets
  tryOnPrompt: string;        // instruction fed to gpt-image-1 to apply this cut
  thumbnail: ImageSourcePropType;      // catalog card image (bundled)
  referenceImages: ImageSourcePropType[]; // gallery images (bundled, 3–5 each)
}

export interface StyleRecommendation {
  styleId: string;
  reason: string;   // why it suits this user
  score: number;    // 0–100 match
}

export interface TryOnResult {
  id: string;
  styleId: string;
  styleName: string;
  sourceImageUri: string;
  generatedImageUri: string;
  createdAt: number;
}

// Unified history entry (rating OR try-on)
export type HistoryEntry =
  | { kind: 'rating'; id: string; imageUri: string; result: AnalysisResult; timestamp: number }
  | { kind: 'tryon';  id: string; tryOn: TryOnResult; timestamp: number };
```

Keep the existing `AnalysisResult`, `HairProfile`, `FaceAnalysis`, etc. — the Rate tab and the
recommender both consume them.

---

## 5. The Catalog (`constants/haircuts.ts`)

Ship **14–18** popular, broadly-flattering men's styles spanning categories, e.g.:
Low/Mid/High Taper Fade, Skin Fade, Burst Fade, Textured Crop, French Crop, Buzz Cut,
Crew Cut, Classic Side Part, Quiff, Pompadour, Textured Fringe, Curly Top / Fade,
Two-Block, Mid-Length Flow, Edgar/Caesar.

Each entry fully populated with metadata + a strong `tryOnPrompt`.

### Reference images (bundled)
- Store under `assets/styles/<id>/thumb.png` and `assets/styles/<id>/ref_1..n.png`.
- **Now:** generate branded, on-theme placeholder images with `sharp` (a devDependency) via a
  script `scripts/generate-style-placeholders.js`. Each placeholder shows the style name + category
  on the app's dark/blue gradient so the UI is fully populated and screenshot-ready.
- **Later:** real licensed/approved photos drop into the same paths — no code change.
- Add a short `assets/styles/README.md` explaining the swap.

---

## 6. Try-On Engine

### 6.1 Client `services/tryon.ts`
- Input: source photo URI + `Haircut` (for its `tryOnPrompt`).
- Reads photo → base64, POSTs to `EXPO_PUBLIC_TRYON_ENDPOINT` (the edge function URL).
- Returns `{ imageUri }` (write returned base64/URL to a file via expo-file-system).
- **Demo mode:** if no endpoint is configured, return a deterministic placeholder result
  (e.g. the source photo with a labeled overlay, or a generated "preview unavailable — demo"
  card) so the entire flow is navigable and testable offline. Never crash on missing config.
- Robust: 90s timeout, typed errors, friendly messages (mirror `services/openai.ts` patterns).

### 6.2 Edge function `supabase/functions/tryon/index.ts` (Deno)
- Reads `OPENAI_API_KEY` from `Deno.env` (Supabase secret — **never** in client).
- Accepts `{ image (base64), prompt, size? }`.
- Calls OpenAI **images edit** with model `gpt-image-1`, the user image, and a composed prompt:
  system guardrails ("preserve the person's identity, face, and skin tone; change ONLY the hair to
  match: <tryOnPrompt>; photorealistic, same lighting/background") + the style prompt.
- Returns the generated image (base64). CORS enabled. Basic rate-limit / size guard.
- Include a `supabase/functions/tryon/README.md` with `supabase functions deploy tryon` +
  `supabase secrets set OPENAI_API_KEY=…` instructions and the env var the client needs.

### 6.3 Safety / consent
- Reuse `AIConsentModal` before any upload leaves the device (both Create and Rate flows).
- Try-on screen must carry a subtle "AI-generated preview — results may vary" disclaimer.

---

## 7. Screen-by-screen requirements

**Create (`index.tsx`)** — Hero: "See your next cut." Primary button: *Add your photo* (camera or
library, single front photo, simplified from the 4-angle flow). On submit → consent (if needed) →
analyze → push `recommendations`. Show a friendly analyzing overlay (reuse `AnalyzingOverlay`).

**Recommendations (`recommendations.tsx`)** — "Recommended for you": top 3–5 catalog cards with the
*reason* ("Volume on top balances your diamond face"). Secondary: "Browse all styles" → Styles tab.
Each card → `style/[id]`.

**Styles (`styles.tsx`)** — Grid/list of the whole catalog, category filter chips. Search optional.
Card → `style/[id]`.

**Style detail (`style/[id].tsx`)** — Swipeable reference gallery, name/tagline/description,
maintenance + difficulty chips, "Ask your barber" bullet list, sticky primary CTA **Try it on**.
If the user arrived without a photo, prompt to add one first.

**Try-on (`tryon.tsx`)** — Loading state with progress copy; on success show the generated image with
a **before/after** toggle (source vs generated), Save (media library) + Share (expo-sharing), and
"Try another style". Persist to history. Handle errors gracefully with retry.

**Rate (`rate.tsx`)** — The old multi-angle analysis, **paywall removed**, results shown inline
(reuse `ResultsDisplay`/`ResultsDisplay` components and `services/openai.ts`). Framed as a bonus.

**Profile (`profile.tsx`)** — Account (existing), "Your looks" (saved try-ons + past ratings),
settings, consent toggle, legal links. Keep existing legal/support/settings screens working.

---

## 8. Cleanup / migration rules
- Remove the paywall **gate** from user flows (do not hard-delete RevenueCat context/screens —
  leave them importable but unused so monetization can return). The `reveal`/`paywall` screens may
  remain in the stack but must not block the new Create flow or the Rate tab.
- Rebrand copy from "rate/grade" → "plan your next cut" on primary surfaces; Rate tab keeps grading.
- Update onboarding (`components/Onboarding.tsx`) + `BeginScan` to pitch the new value prop.
- Update `app.json` permission strings if wording no longer fits (keep them accurate for review).
- Keep TypeScript clean (no new `any` unless justified), match existing code style.

---

## 9. Acceptance criteria (Definition of Done — verify ALL, multiple times)
1. `npx tsc --noEmit` passes with **zero** errors.
2. `npx expo export --platform web` completes with **no** bundling/import errors.
3. App boots (web smoke test): onboarding → Create → add photo (library) → analyze → recommendations
   → style detail (gallery renders) → try-on (demo mode returns an image) → saved to history.
4. Styles tab lists the full catalog; category filter works; every card opens detail with images.
5. Rate tab runs the old analysis end-to-end and shows results with **no paywall** interruption.
6. Profile shows saved try-ons + ratings; consent toggle works; legal links open.
7. No dead imports, no red-screen runtime errors in the smoke path, no unhandled promise rejections.
8. Catalog has ≥14 fully-populated styles with placeholder thumbnails + reference images present.
9. Edge function + client compile; demo mode works with no endpoint; real mode documented.
10. Commits are incremental and descriptive; final state pushed to the designated branch.

## 10. Verification loop (run after every phase)
```
npx tsc --noEmit
npx expo export --platform web        # catches import/runtime bundling issues
# smoke: serve web build, drive the happy path (script or manual/playwright), screenshot key screens
```
Fix → re-run → repeat until green. Do at least **two** full clean passes at the end. Log what was
tested and the outcome. Never report done on a failing check.

## 11. Build phases (suggested order)
1. **Foundation** — types, catalog data + placeholder generation, `useCatalog`, colors/copy.
2. **Recommender** — `services/recommend.ts` + `recommendations.tsx`.
3. **Create flow** — simplified single-photo capture, wire analyze → recommendations.
4. **Catalog UI** — `styles.tsx` + `style/[id].tsx` (gallery, detail, CTA).
5. **Try-on** — `services/tryon.ts` (demo mode), `useTryOn`, `tryon.tsx`, edge function + docs.
6. **Rate tab** — port old analysis, strip paywall gate.
7. **Profile/History** — unified history, saved looks.
8. **Onboarding/branding** — new value prop, tab layout, cleanup.
9. **Harden + verify** — two clean verification passes, screenshots, final push.
```
```
