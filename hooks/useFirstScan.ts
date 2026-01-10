import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_SCAN_KEY = 'fadecheck_first_scan_completed';

/**
 * Hook to track if the user has seen the BeginScan screen.
 * Pro status is now handled by RevenueCat (useRevenueCat hook).
 */
export function useFirstScan() {
  const [hasCompletedFirstScan, setHasCompletedFirstScan] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const firstScanValue = await AsyncStorage.getItem(FIRST_SCAN_KEY);
      setHasCompletedFirstScan(firstScanValue === 'true');
    } catch (error) {
      console.error('Error loading first scan status:', error);
      setHasCompletedFirstScan(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeFirstScan = async () => {
    try {
      await AsyncStorage.setItem(FIRST_SCAN_KEY, 'true');
      setHasCompletedFirstScan(true);
    } catch (error) {
      console.error('Error saving first scan status:', error);
    }
  };

  const resetFirstScan = async () => {
    try {
      await AsyncStorage.removeItem(FIRST_SCAN_KEY);
      setHasCompletedFirstScan(false);
    } catch (error) {
      console.error('Error resetting first scan:', error);
    }
  };

  return {
    hasCompletedFirstScan,
    isLoading,
    completeFirstScan,
    resetFirstScan,
  };
}
