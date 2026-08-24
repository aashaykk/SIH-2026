import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './keys';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'officer' | 'worker';
}

/**
 * Save user session details
 */
export async function saveSession(token: string, profile: UserProfile): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token),
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile)),
    ]);
  } catch (error) {
    console.error('Error saving session to AsyncStorage:', error);
    throw error;
  }
}

/**
 * Get saved JWT token
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}

/**
 * Get saved user profile
 */
export async function getSessionProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting session profile:', error);
    return null;
  }
}

/**
 * Clear session data (Logout)
 */
export async function clearSession(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
    ]);
  } catch (error) {
    console.error('Error clearing session:', error);
    throw error;
  }
}
