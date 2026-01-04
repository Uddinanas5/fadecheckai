import { useState, useCallback } from 'react';
import { analyzeHaircut } from '../services/openai';
import { AnalysisResult } from '../types';

interface UseAnalyzeResult {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  analyze: (imageUri: string) => Promise<AnalysisResult | null>;
  reset: () => void;
}

export function useAnalyze(): UseAnalyzeResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (imageUri: string): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Add minimum delay for better UX (show animation)
      const [analysisResult] = await Promise.all([
        analyzeHaircut(imageUri),
        new Promise(resolve => setTimeout(resolve, 2500)), // Minimum 2.5s
      ]);

      if (analysisResult.error) {
        setError(analysisResult.breakdown);
        setResult(null);
        return null;
      }

      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setResult(null);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    result,
    error,
    analyze,
    reset,
  };
}
