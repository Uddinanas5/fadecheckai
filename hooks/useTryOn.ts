import { useState, useCallback } from 'react';
import { generateTryOn, TryOnOptions } from '../services/tryon';
import { TryOnResult } from '../types';

type Status = 'idle' | 'generating' | 'done' | 'error';

export function useTryOn() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (opts: TryOnOptions): Promise<TryOnResult | null> => {
    setStatus('generating');
    setError(null);
    setResult(null);
    try {
      const r = await generateTryOn(opts);
      setResult(r);
      setStatus('done');
      return r;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, run, reset };
}
