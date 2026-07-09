// Try-on client.
//
// Sends the user's photo + a style prompt to a Supabase Edge Function which
// proxies OpenAI's gpt-image-1 image edit (the API key stays server-side).
// If no endpoint is configured, we fall back to DEMO MODE so the whole flow is
// still navigable/testable offline — it returns the source photo flagged as a demo.

import { readAsStringAsync, writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy';
import { Haircut, TryOnResult } from '../types';

// Set EXPO_PUBLIC_TRYON_ENDPOINT to your deployed edge function URL, e.g.
// https://<project-ref>.supabase.co/functions/v1/tryon
const TRYON_ENDPOINT = process.env.EXPO_PUBLIC_TRYON_ENDPOINT || '';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export function isTryOnConfigured(): boolean {
  return TRYON_ENDPOINT.length > 0;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

async function persistBase64(base64: string): Promise<string> {
  const path = `${cacheDirectory}tryon-${makeId()}.png`;
  await writeAsStringAsync(path, base64, { encoding: 'base64' });
  return path;
}

export interface TryOnOptions {
  sourceImageUri: string;
  haircut: Haircut;
}

/**
 * Generate a try-on. Resolves to a TryOnResult (never throws for expected
 * conditions — returns a demo result if unconfigured, throws only on genuine
 * runtime/network failure in configured mode).
 */
export async function generateTryOn({ sourceImageUri, haircut }: TryOnOptions): Promise<TryOnResult> {
  const base: Omit<TryOnResult, 'generatedImageUri' | 'demo'> = {
    id: makeId(),
    styleId: haircut.id,
    styleName: haircut.name,
    sourceImageUri,
    createdAt: Date.now(),
  };

  // DEMO MODE — no backend configured.
  if (!isTryOnConfigured()) {
    // Simulate latency so the loading UI is exercised.
    await new Promise((r) => setTimeout(r, 2200));
    return { ...base, generatedImageUri: sourceImageUri, demo: true };
  }

  // REAL MODE — proxy through the edge function.
  const imageBase64 = await readAsStringAsync(sourceImageUri, { encoding: 'base64' });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(TRYON_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON ? { Authorization: `Bearer ${SUPABASE_ANON}` } : {}),
      },
      signal: controller.signal,
      body: JSON.stringify({
        image: imageBase64,
        prompt: haircut.tryOnPrompt,
        styleName: haircut.name,
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let msg = `Try-on failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err.error || err.message || msg;
      } catch {
        // non-JSON error body
      }
      throw new Error(msg);
    }

    const data = await response.json();
    const outB64: string | undefined = data.image || data.b64_json;
    if (!outB64) throw new Error('No image returned from try-on service.');

    const generatedImageUri = await persistBase64(outB64);
    return { ...base, generatedImageUri, demo: false };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('The preview took too long. Check your connection and try again.');
    }
    throw error instanceof Error ? error : new Error('Try-on failed. Please try again.');
  }
}
