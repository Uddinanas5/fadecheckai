// Supabase Edge Function: tryon
//
// Proxies OpenAI's gpt-image-1 image edit so the API key stays server-side.
// Deploy: supabase functions deploy tryon
// Secret:  supabase secrets set OPENAI_API_KEY=sk-...
//
// Request  JSON: { image: <base64 png/jpeg>, prompt: string, styleName?: string, size?: string }
// Response JSON: { image: <base64 png> }  |  { error: string }

// @ts-nocheck  (Deno runtime — types differ from the RN app's tsconfig)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const MODEL = 'gpt-image-1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// Identity-preserving guardrails wrapped around the per-style prompt.
function composePrompt(stylePrompt: string): string {
  return [
    'Edit this photo of a person to change ONLY their hairstyle.',
    `Give them ${stylePrompt}.`,
    'Preserve their exact face, facial features, skin tone, expression, and identity.',
    'Keep the same background, lighting, framing, and clothing.',
    'Photorealistic result, natural-looking hair, high quality.',
  ].join(' ');
}

// Decode a base64 string into bytes (for building multipart form data).
function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(',') ? b64.split(',')[1] : b64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!OPENAI_API_KEY) return json({ error: 'Server not configured: missing OPENAI_API_KEY.' }, 500);

  let payload: { image?: string; prompt?: string; size?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { image, prompt, size } = payload;
  if (!image || !prompt) return json({ error: 'Missing image or prompt.' }, 400);

  // Guard against oversized payloads (~ base64 of a large image).
  if (image.length > 12_000_000) return json({ error: 'Image too large.' }, 413);

  try {
    const form = new FormData();
    form.append('model', MODEL);
    form.append('prompt', composePrompt(prompt));
    form.append('size', size ?? '1024x1024');
    form.append(
      'image',
      new Blob([base64ToBytes(image)], { type: 'image/png' }),
      'source.png',
    );

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!res.ok) {
      let msg = `OpenAI error (${res.status})`;
      try {
        const err = await res.json();
        msg = err.error?.message ?? msg;
      } catch {
        // ignore
      }
      return json({ error: msg }, 502);
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return json({ error: 'No image returned by model.' }, 502);

    return json({ image: b64 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected server error.' }, 500);
  }
});
