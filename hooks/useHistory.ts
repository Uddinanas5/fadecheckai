import { useState, useEffect, useCallback, useRef } from 'react';
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
  // Mirror of `entries` so mutators can compute the next value without relying
  // on the (possibly deferred) state-updater callback running synchronously.
  const entriesRef = useRef<HistoryEntry[]>([]);

  const apply = useCallback((next: HistoryEntry[]) => {
    entriesRef.current = next;
    setEntries(next);
  }, []);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          apply(normalized);
        } else {
          await AsyncStorage.removeItem(HISTORY_KEY);
          apply([]);
        }
      } else {
        apply([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      apply([]);
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
      const next = [entry, ...entriesRef.current].slice(0, MAX_HISTORY_ITEMS);
      apply(next);
      await persist(next);
      return entry.id;
    },
    [apply, persist],
  );

  const addTryOn = useCallback(
    async (tryOn: TryOnResult) => {
      const entry: HistoryEntry = {
        kind: 'tryon',
        id: tryOn.id,
        tryOn,
        timestamp: tryOn.createdAt,
      };
      const next = [entry, ...entriesRef.current].slice(0, MAX_HISTORY_ITEMS);
      apply(next);
      await persist(next);
      return entry.id;
    },
    [apply, persist],
  );

  const removeEntry = useCallback(
    async (id: string) => {
      const next = entriesRef.current.filter((e) => e.id !== id);
      apply(next);
      await persist(next);
    },
    [apply, persist],
  );

  const clearHistory = useCallback(async () => {
    apply([]);
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, [apply]);

  const getEntry = useCallback((id: string) => entriesRef.current.find((e) => e.id === id), []);

  return {
    entries,
    ratings: entries.filter(
      (e): e is Extract<HistoryEntry, { kind: 'rating' }> => e.kind === 'rating',
    ),
    tryOns: entries.filter(
      (e): e is Extract<HistoryEntry, { kind: 'tryon' }> => e.kind === 'tryon',
    ),
    isLoading,
    addRating,
    addTryOn,
    removeEntry,
    clearHistory,
    getEntry,
    refreshHistory: loadHistory,
  };
}
