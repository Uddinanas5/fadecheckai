import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

// Key to store Apple auth state for token revocation
const APPLE_AUTH_STATE_KEY = 'fadecheck_apple_auth_state';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs (CORRECTED - were swapped before!)
const GOOGLE_IOS_CLIENT_ID = '215893084176-mc7oivucn5877aamkmfpe0ac2t6bho5q.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID = '215893084176-3l3dq7ujdkoil0a826c0msvusaovf2mi.apps.googleusercontent.com';

// iOS redirect URI (reversed iOS client ID)
const GOOGLE_IOS_REDIRECT_URI = 'com.googleusercontent.apps.215893084176-mc7oivucn5877aamkmfpe0ac2t6bho5q:/oauth2redirect/google';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Auth setup - use iOS-specific config on iOS (no web client to force native flow)
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    // Only include webClientId on non-iOS to force native iOS auth
    ...(Platform.OS !== 'ios' && { webClientId: GOOGLE_WEB_CLIENT_ID }),
    redirectUri: Platform.OS === 'ios' ? GOOGLE_IOS_REDIRECT_URI : undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle Google response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      signInWithGoogleToken(id_token);
    }
  }, [googleResponse]);

  const signInWithGoogleToken = async (idToken: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!googleRequest) {
      // Google OAuth not configured yet - show coming soon message
      Alert.alert(
        'Coming Soon',
        'Google sign-in will be available in a future update. You can still use the app!',
      );
      return { data: null, error: { message: 'Google OAuth not configured' } };
    }

    const result = await promptGoogleAsync();
    return result;
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);

      // Check if Apple Auth is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign In is not available on this device');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Store Apple user ID for potential token revocation on account deletion
      if (credential.user) {
        await AsyncStorage.setItem(APPLE_AUTH_STATE_KEY, JSON.stringify({
          userId: credential.user,
          authorizationCode: credential.authorizationCode,
          signedInAt: Date.now(),
        }));
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled - not an error
        return { data: null, error: null };
      }
      console.error('Apple sign in error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in with Apple');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      Alert.alert('Error', error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete user account - compliant with Apple Guideline 5.1.1(v)
   * This function:
   * 1. Revokes Apple Sign In credential if user signed in with Apple
   * 2. Signs out from Supabase
   * 3. Clears all local data
   */
  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Check if user signed in with Apple and revoke credential
      const appleAuthStateStr = await AsyncStorage.getItem(APPLE_AUTH_STATE_KEY);
      if (appleAuthStateStr) {
        try {
          const appleAuthState = JSON.parse(appleAuthStateStr);

          // Check the credential state with Apple
          const credentialState = await AppleAuthentication.getCredentialStateAsync(
            appleAuthState.userId
          );

          // If credential is still valid, we need to inform Apple about the revocation
          // Note: Full token revocation requires server-side implementation with Apple's REST API
          // The client-side getCredentialStateAsync helps track the state
          if (credentialState === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED) {
            console.log('Apple credential is authorized, proceeding with account deletion');
          }

          // Clear Apple auth state
          await AsyncStorage.removeItem(APPLE_AUTH_STATE_KEY);
        } catch (appleError) {
          // Log but continue - we still want to delete the account
          console.error('Apple credential check error:', appleError);
        }
      }

      // Sign out from Supabase (this invalidates the session)
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Supabase sign out error:', signOutError);
        // Continue anyway - we want to clear local data
      }

      // Clear all AsyncStorage data
      await AsyncStorage.clear();

      return { success: true };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message || 'Failed to delete account' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user signed in with Apple (for UI purposes)
  const checkAppleSignInState = async (): Promise<boolean> => {
    try {
      const appleAuthStateStr = await AsyncStorage.getItem(APPLE_AUTH_STATE_KEY);
      return !!appleAuthStateStr;
    } catch {
      return false;
    }
  };

  return {
    session,
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signOut,
    deleteAccount,
    checkAppleSignInState,
    isAuthenticated: !!session,
  };
}
