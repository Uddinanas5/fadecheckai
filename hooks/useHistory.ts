import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry, AnalysisResult, TryOnResult } from '../types';

const HISTORY_KEY = 'fadecheck_history';
const MAX_HISTORY_ITEMS = 60;

// Migrate legacy entries (pre-2.0 shape had no `kind` and were all ratings).
function normalize(raw: any): HistoryEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.kind === 'rating' || raw.kind === 'tryon') return raw as HistoryEntry;
  // legacy rating: { id, imageUri, result, timestamp }
  if (raw.imageUri && raw.result) {
    return {
      kind: 'rating',
      id: raw.id ?? `${raw.timestamp ?? Date.now()}`,
      imageUri: raw.imageUri,
      result: raw.result,
      timestamp: raw.timestamp ?? Date.now(),
    };
  }
  return null;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map(normalize)
            .filter((e): e is HistoryEntry => e !== null)
            .sort((a, b) => b.timestamp - a.timestamp);
          setEntries(normalized);
        } else {
          await AsyncStorage.removeItem(HISTORY_KEY);
          setEntries([]);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const persist = useCallback(async (next: HistoryEntry[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }, []);

  const addRating = useCallback(
    async (imageUri: string, result: AnalysisResult) => {
      const entry: HistoryEntry = {
        kind: 'rating',
        id: makeId(),
        imageUri,
        result,
        timestamp: Date.now(),
      };
      let next: HistoryEntry[] = [];
      setEntries((prev) => {
        next = [entry, ...prev].slice(0, MAX_HISTORY_ITEMS);
        return next;
      });
      await persist(next);
      return entry.id;
    },
    [persist],
  );

  const addTryOn = useCallback(
    async (tryOn: TryOnResult) => {
      const entry: HistoryEntry = {
        kind: 'tryon',
        id: tryOn.id,
        tryOn,
        timestamp: tryOn.createdAt,
      };
      let next: HistoryEntry[] = [];
      setEntries((prev) => {
        next = [entry, ...prev].slice(0, MAX_HISTORY_ITEMS);
        return next;
      });
      await persist(next);
      return entry.id;
    },
    [persist],
  );

  const removeEntry = useCallback(
    async (id: string) => {
      let next: HistoryEntry[] = [];
      setEntries((prev) => {
        next = prev.filter((e) => e.id !== id);
        return next;
      });
      await persist(next);
    },
    [persist],
  );

  const clearHistory = useCallback(async () => {
    setEntries([]);
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  const getEntry = useCallback(
    (id: string) => entries.find((e) => e.id === id),
    [entries],
  );

  return {
    entries,
    ratings: entries.filter((e): e is Extract<HistoryEntry, { kind: 'rating' }> => e.kind === 'rating'),
    tryOns: entries.filter((e): e is Extract<HistoryEntry, { kind: 'tryon' }> => e.kind === 'tryon'),
    isLoading,
    addRating,
    addTryOn,
    removeEntry,
    clearHistory,
    getEntry,
    refreshHistory: loadHistory,
  };
}
