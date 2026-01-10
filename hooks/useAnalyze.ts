import { useState, useCallback } from 'react';
import { analyzeHaircut } from '../services/openai';
import { AnalysisResult, CapturedImages } from '../types';

interface UseAnalyzeResult {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  analyze: (images: CapturedImages) => Promise<AnalysisResult | null>;
  reset: () => void;
}

export function useAnalyze(): UseAnalyzeResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (images: CapturedImages): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Add minimum delay for better UX (show animation)
      const [analysisResult] = await Promise.all([
        analyzeHaircut(images),
        new Promise(resolve => setTimeout(resolve, 3000)), // Minimum 3s for multi-image
      ]);

      if (analysisResult.error) {
        setError(analysisResult.breakdown);
        setResult(analysisResult);
        return analysisResult; // Return the error result so it can be displayed
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
