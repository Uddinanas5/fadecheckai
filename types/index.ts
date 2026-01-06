export interface HaircutScores {
  lineup: number;
  fade: number;
  blend: number;
  shape: number;
  freshness: number;
}

export interface AnalysisResult {
  overall_score: number | null;
  scores: HaircutScores | null;
  score_label: string | null;
  defects_found?: string[] | null;
  breakdown: string;
  verdict: string;
  error?: boolean;
}

export interface HistoryItem {
  id: string;
  imageUri: string;
  result: AnalysisResult;
  timestamp: number;
}

export type ScoreCategory = keyof HaircutScores;
