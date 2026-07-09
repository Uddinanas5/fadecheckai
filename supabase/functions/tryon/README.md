# `tryon` edge function

Proxies OpenAI `gpt-image-1` image edits so the OpenAI key never ships in the
app bundle. The app calls this function; the function calls OpenAI.

## Deploy

```bash
# 1. Log in and link your project (once)
supabase login
supabase link --project-ref <your-project-ref>

# 2. Set the OpenAI key as a secret (server-side only)
supabase secrets set OPENAI_API_KEY=sk-...

# 3. Deploy
supabase functions deploy tryon
```

The deployed URL looks like:
`https://<your-project-ref>.supabase.co/functions/v1/tryon`

## Wire it to the app

Set these env vars for the Expo app (e.g. in an `.env` file or your EAS build
env). They are read in `services/tryon.ts` and `services/supabase.ts`:

```
EXPO_PUBLIC_TRYON_ENDPOINT=https://<your-project-ref>.supabase.co/functions/v1/tryon
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>   # sent as the Authorization bearer
```

If `EXPO_PUBLIC_TRYON_ENDPOINT` is unset, the app runs in **demo mode**: the
try-on flow still works end-to-end but returns the source photo labeled as a
demo instead of a generated image. This keeps the app fully usable offline and
during development.

## Contract

Request (POST, JSON):

```json
{ "image": "<base64 png/jpeg>", "prompt": "a mid taper fade ...", "styleName": "Mid Taper Fade" }
```

Response (JSON):

```json
{ "image": "<base64 png>" }
```

On error: `{ "error": "message" }` with a non-2xx status.

## Notes / hardening ideas
- Add auth/JWT verification if you want to restrict callers.
- Add per-user rate limiting (e.g. via a Supabase table) to control cost.
- Consider storing generated images in Supabase Storage and returning a URL
  instead of base64 for large images.
