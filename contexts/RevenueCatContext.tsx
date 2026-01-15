import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PACKAGE_TYPE,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your RevenueCat API key (Production)
const REVENUECAT_API_KEY = 'appl_yKjFjZloSoLiZneNHPAHhnWRETt';

// Your entitlement identifier from RevenueCat dashboard
const ENTITLEMENT_ID = 'Fadecheck Pro';

interface RevenueCatContextType {
  // User state
  isProUser: boolean;
  customerInfo: CustomerInfo | null;

  // Products
  packages: PurchasesPackage[];
  currentOffering: PurchasesOffering | null;

  // Loading states
  isLoading: boolean;
  isPurchasing: boolean;

  // Actions
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;

  // Helpers
  getPackageByType: (type: 'weekly' | 'monthly' | 'yearly' | 'lifetime') => PurchasesPackage | undefined;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

interface RevenueCatProviderProps {
  children: ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const [isProUser, setIsProUser] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Check for VIP access from local storage
  const checkVipAccess = async () => {
    try {
      const vipAccess = await AsyncStorage.getItem('vip_access');
      if (vipAccess === 'true') {
        setIsVipUser(true);
        setIsProUser(true); // VIP users get Pro access
        console.log('VIP access detected - Pro features unlocked');
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error checking VIP access:', error);
      return false;
    }
  };

  // Initialize RevenueCat
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // Check for VIP access first
        await checkVipAccess();

        // Enable debug logs in development
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        // Configure RevenueCat
        if (Platform.OS === 'ios') {
          await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        } else if (Platform.OS === 'android') {
          // Add Android key if needed
          await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        }

        // Load initial data
        await Promise.all([
          loadCustomerInfo(),
          loadOfferings(),
        ]);

        // Sync any locally saved attributes from onboarding
        await syncLocalAttributes();
      } catch (error) {
        console.error('RevenueCat init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Sync locally saved referral code and gender to RevenueCat
    const syncLocalAttributes = async () => {
      try {
        const attributes: Record<string, string> = {};

        // Get locally saved referral code
        const referralCode = await AsyncStorage.getItem('referral_code');
        if (referralCode) {
          attributes['referral_code'] = referralCode;
          attributes['referred_by'] = referralCode;
        }

        // Get locally saved gender
        const gender = await AsyncStorage.getItem('user_gender');
        if (gender) {
          attributes['gender'] = gender;
        }

        // Sync to RevenueCat if we have any attributes
        if (Object.keys(attributes).length > 0) {
          await Purchases.setAttributes(attributes);
          console.log('Synced attributes to RevenueCat:', attributes);
        }
      } catch (error) {
        console.log('Could not sync attributes to RevenueCat:', error);
      }
    };

    initRevenueCat();

    // Listen for customer info updates
    Purchases.addCustomerInfoUpdateListener((info) => {
      updateCustomerInfo(info);
    });
  }, []);

  // Load customer info
  const loadCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      updateCustomerInfo(info);
    } catch (error) {
      console.error('Error loading customer info:', error);
    }
  };

  // Update customer info and pro status
  const updateCustomerInfo = async (info: CustomerInfo) => {
    setCustomerInfo(info);

    // Check if user has the pro entitlement from RevenueCat
    const hasProEntitlement = info.entitlements.active[ENTITLEMENT_ID] !== undefined;

    // Also check for VIP access (local override)
    const vipAccess = await AsyncStorage.getItem('vip_access');
    const hasVipAccess = vipAccess === 'true';

    // User is Pro if they have either RevenueCat entitlement OR VIP access
    setIsProUser(hasProEntitlement || hasVipAccess);
    setIsVipUser(hasVipAccess);
  };

  // Load available offerings/packages
  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current) {
        setCurrentOffering(offerings.current);
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  // Purchase a package
  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    setIsPurchasing(true);

    try {
      const { customerInfo: newCustomerInfo } = await Purchases.purchasePackage(pkg);
      updateCustomerInfo(newCustomerInfo);

      // Check if purchase was successful
      if (newCustomerInfo.entitlements.active[ENTITLEMENT_ID]) {
        return true;
      }

      return false;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
        Alert.alert(
          'Purchase Failed',
          error.message || 'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  // Restore purchases
  const restorePurchases = async (): Promise<boolean> => {
    setIsPurchasing(true);

    try {
      const restoredInfo = await Purchases.restorePurchases();
      updateCustomerInfo(restoredInfo);

      if (restoredInfo.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert(
          'Purchases Restored',
          'Your subscription has been restored successfully!',
          [{ text: 'OK' }]
        );
        return true;
      } else {
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any previous purchases to restore.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert(
        'Restore Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  // Refresh customer info
  const refreshCustomerInfo = async () => {
    await loadCustomerInfo();
  };

  // Get package by type
  const getPackageByType = (type: 'weekly' | 'monthly' | 'yearly' | 'lifetime'): PurchasesPackage | undefined => {
    const packageTypeMap: Record<string, string> = {
      weekly: '$rc_weekly',
      monthly: '$rc_monthly',
      yearly: '$rc_annual',
      lifetime: '$rc_lifetime',
    };

    return packages.find(pkg => pkg.packageType === packageTypeMap[type]);
  };

  const value: RevenueCatContextType = {
    isProUser,
    customerInfo,
    packages,
    currentOffering,
    isLoading,
    isPurchasing,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
    getPackageByType,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}

// Hook to use RevenueCat
export function useRevenueCat() {
  const context = useContext(RevenueCatContext);

  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }

  return context;
}

// Simple hook just for checking pro status
export function useIsProUser() {
  const { isProUser, isLoading } = useRevenueCat();
  return { isProUser, isLoading };
}
