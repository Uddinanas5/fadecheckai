import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, AnalysisResult } from '../types';

const HISTORY_KEY = 'fadecheck_history';
const MAX_HISTORY_ITEMS = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate parsed data is an array
        if (Array.isArray(parsed)) {
          // Sort by timestamp descending (newest first)
          parsed.sort((a, b) => b.timestamp - a.timestamp);
          setHistory(parsed as HistoryItem[]);
        } else {
          // Corrupted data, reset history
          console.error('Invalid history data format, resetting');
          await AsyncStorage.removeItem(HISTORY_KEY);
          setHistory([]);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = useCallback(async (imageUri: string, result: AnalysisResult) => {
    try {
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        imageUri,
        result,
        timestamp: Date.now(),
      };

      let updatedHistory: HistoryItem[] = [];
      setHistory(prev => {
        updatedHistory = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
        return updatedHistory;
      });
      // Small delay to ensure state has settled before persisting
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return newItem.id;
    } catch (error) {
      console.error('Error saving to history:', error);
      return null;
    }
  }, []);

  const removeFromHistory = useCallback(async (id: string) => {
    try {
      let updatedHistory: HistoryItem[] = [];
      setHistory(prev => {
        updatedHistory = prev.filter(item => item.id !== id);
        return updatedHistory;
      });
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  const getHistoryItem = useCallback((id: string): HistoryItem | undefined => {
    return history.find(item => item.id === id);
  }, [history]);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
    refreshHistory: loadHistory,
  };
}
