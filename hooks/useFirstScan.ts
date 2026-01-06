import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_SCAN_KEY = 'fadecheck_first_scan_completed';
const PRO_USER_KEY = 'fadecheck_pro_user';

export function useFirstScan() {
  const [hasCompletedFirstScan, setHasCompletedFirstScan] = useState<boolean | null>(null);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const [firstScanValue, proValue] = await Promise.all([
        AsyncStorage.getItem(FIRST_SCAN_KEY),
        AsyncStorage.getItem(PRO_USER_KEY),
      ]);
      setHasCompletedFirstScan(firstScanValue === 'true');
      setIsProUser(proValue === 'true');
    } catch (error) {
      console.error('Error loading first scan status:', error);
      setHasCompletedFirstScan(false);
      setIsProUser(false);
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

  const setProStatus = async (isPro: boolean) => {
    try {
      await AsyncStorage.setItem(PRO_USER_KEY, isPro ? 'true' : 'false');
      setIsProUser(isPro);
    } catch (error) {
      console.error('Error saving pro status:', error);
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
    isProUser,
    isLoading,
    completeFirstScan,
    setProStatus,
    resetFirstScan,
  };
}
