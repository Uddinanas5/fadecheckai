import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from '../types';

const PROGRESS_STORAGE_KEY = '@fadecheck_progress_history';
const MAX_HISTORY_ITEMS = 50;

export interface ProgressEntry {
  id: string;
  timestamp: number;
  imageUri: string;
  result: AnalysisResult;
  barberName?: string;
  notes?: string;
}

export interface ProgressStats {
  totalScans: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  scoreImprovement: number; // Comparing last 5 to first 5
  mostImprovedCategory: string | null;
  consistentStrength: string | null;
  areaToFocus: string | null;
  scanFrequencyDays: number; // Average days between scans
}

export interface ProgressTrend {
  date: string;
  score: number;
  label: string;
}

export class ProgressTracker {
  // Get all progress entries
  static async getHistory(): Promise<ProgressEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting progress history:', error);
    }
    return [];
  }

  // Add a new progress entry
  static async addEntry(
    imageUri: string,
    result: AnalysisResult,
    barberName?: string,
    notes?: string
  ): Promise<void> {
    try {
      const history = await this.getHistory();

      const newEntry: ProgressEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUri,
        result,
        barberName,
        notes,
      };

      // Add to beginning (newest first)
      history.unshift(newEntry);

      // Limit history size
      const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding progress entry:', error);
    }
  }

  // Update an existing entry (e.g., add barber name or notes)
  static async updateEntry(id: string, updates: Partial<ProgressEntry>): Promise<void> {
    try {
      const history = await this.getHistory();
      const index = history.findIndex(entry => entry.id === id);

      if (index !== -1) {
        history[index] = { ...history[index], ...updates };
        await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error updating progress entry:', error);
    }
  }

  // Delete an entry
  static async deleteEntry(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(entry => entry.id !== id);
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting progress entry:', error);
    }
  }

  // Calculate progress statistics
  static async getStats(): Promise<ProgressStats | null> {
    const history = await this.getHistory();

    if (history.length === 0) {
      return null;
    }

    // Filter entries with valid scores
    const validEntries = history.filter(e => e.result.overall_score !== null);

    if (validEntries.length === 0) {
      return null;
    }

    const scores = validEntries.map(e => e.result.overall_score!);

    // Basic stats
    const totalScans = validEntries.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    // Score improvement (compare recent 5 to first 5)
    let scoreImprovement = 0;
    if (validEntries.length >= 5) {
      const recent5Avg = scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const first5Avg = scores.slice(-5).reduce((a, b) => a + b, 0) / 5;
      scoreImprovement = recent5Avg - first5Avg;
    }

    // Analyze category trends
    const categories = ['lineup', 'fade', 'blend', 'shape', 'freshness'];
    let mostImprovedCategory: string | null = null;
    let maxImprovement = 0;
    let consistentStrength: string | null = null;
    let maxAverage = 0;
    let areaToFocus: string | null = null;
    let minAverage = 10;

    for (const category of categories) {
      const categoryScores = validEntries
        .filter(e => e.result.scores)
        .map(e => e.result.scores![category as keyof typeof e.result.scores]);

      if (categoryScores.length >= 3) {
        const avg = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;

        // Find consistent strength
        if (avg > maxAverage) {
          maxAverage = avg;
          consistentStrength = category;
        }

        // Find area to focus
        if (avg < minAverage) {
          minAverage = avg;
          areaToFocus = category;
        }

        // Calculate improvement
        if (categoryScores.length >= 5) {
          const recent3Avg = categoryScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          const first3Avg = categoryScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
          const improvement = recent3Avg - first3Avg;

          if (improvement > maxImprovement) {
            maxImprovement = improvement;
            mostImprovedCategory = category;
          }
        }
      }
    }

    // Calculate scan frequency
    let scanFrequencyDays = 14; // Default
    if (validEntries.length >= 2) {
      const timestamps = validEntries.map(e => e.timestamp);
      const gaps: number[] = [];
      for (let i = 0; i < timestamps.length - 1; i++) {
        const gapDays = (timestamps[i] - timestamps[i + 1]) / (1000 * 60 * 60 * 24);
        gaps.push(gapDays);
      }
      scanFrequencyDays = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }

    return {
      totalScans,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      worstScore,
      scoreImprovement: Math.round(scoreImprovement * 10) / 10,
      mostImprovedCategory,
      consistentStrength,
      areaToFocus,
      scanFrequencyDays,
    };
  }

  // Get trend data for charts
  static async getTrends(limit: number = 10): Promise<ProgressTrend[]> {
    const history = await this.getHistory();

    return history
      .filter(e => e.result.overall_score !== null)
      .slice(0, limit)
      .reverse() // Oldest first for chart
      .map(entry => ({
        date: new Date(entry.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        score: entry.result.overall_score!,
        label: entry.result.score_label || '',
      }));
  }

  // Compare two entries
  static compareEntries(older: ProgressEntry, newer: ProgressEntry): {
    overallChange: number;
    categoryChanges: Record<string, number>;
    improved: string[];
    declined: string[];
  } {
    const overallChange = (newer.result.overall_score || 0) - (older.result.overall_score || 0);

    const categoryChanges: Record<string, number> = {};
    const improved: string[] = [];
    const declined: string[] = [];

    if (older.result.scores && newer.result.scores) {
      const categories = ['lineup', 'fade', 'blend', 'shape', 'freshness'];
      for (const cat of categories) {
        const oldScore = older.result.scores[cat as keyof typeof older.result.scores];
        const newScore = newer.result.scores[cat as keyof typeof newer.result.scores];
        const change = newScore - oldScore;
        categoryChanges[cat] = change;

        if (change > 0.5) improved.push(cat);
        if (change < -0.5) declined.push(cat);
      }
    }

    return {
      overallChange,
      categoryChanges,
      improved,
      declined,
    };
  }

  // Get personalized insights
  static async getInsights(): Promise<string[]> {
    const stats = await this.getStats();
    const history = await this.getHistory();
    const insights: string[] = [];

    if (!stats || history.length < 2) {
      insights.push("Keep scanning to track your progress over time!");
      return insights;
    }

    // Score trend insight
    if (stats.scoreImprovement > 0.5) {
      insights.push(`🔥 Your scores have improved by ${stats.scoreImprovement.toFixed(1)} points on average. Keep it up!`);
    } else if (stats.scoreImprovement < -0.5) {
      insights.push(`📉 Your recent scores are down ${Math.abs(stats.scoreImprovement).toFixed(1)} points. Consider trying a different barber or style.`);
    } else {
      insights.push(`📊 Your scores are consistent around ${stats.averageScore.toFixed(1)}/10. You've found your groove!`);
    }

    // Strength insight
    if (stats.consistentStrength) {
      insights.push(`💪 Your ${stats.consistentStrength} is consistently your strongest area. Your barber nails this every time!`);
    }

    // Improvement area insight
    if (stats.areaToFocus && stats.areaToFocus !== stats.consistentStrength) {
      insights.push(`🎯 Focus area: ${stats.areaToFocus}. Ask your barber to spend extra time here next visit.`);
    }

    // Most improved insight
    if (stats.mostImprovedCategory) {
      insights.push(`📈 Your ${stats.mostImprovedCategory} has improved the most over time. Nice progress!`);
    }

    // Frequency insight
    if (stats.scanFrequencyDays < 10) {
      insights.push(`⚡ You scan every ${stats.scanFrequencyDays} days on average. You're serious about your cuts!`);
    } else if (stats.scanFrequencyDays > 21) {
      insights.push(`📅 You scan about every ${stats.scanFrequencyDays} days. Try scanning more often to track your fade grow-out.`);
    }

    // Milestone insights
    if (stats.totalScans === 5) {
      insights.push(`🎉 5 scans complete! You're building a solid history.`);
    } else if (stats.totalScans === 10) {
      insights.push(`🏆 10 scans! You're a FadeCheck pro now.`);
    } else if (stats.totalScans === 25) {
      insights.push(`👑 25 scans! You're in the top tier of FadeCheck users.`);
    }

    return insights.slice(0, 4); // Return max 4 insights
  }

  // Clear all progress data
  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing progress history:', error);
    }
  }
}

export default ProgressTracker;
