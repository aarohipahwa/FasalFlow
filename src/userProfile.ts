import { createContext, useContext } from 'react';

export type UserProfile = {
  fullName: string;
  phoneNumber: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  pinCode: string;
  isSetupComplete: boolean;
};

export const defaultUserProfile: UserProfile = {
  fullName: '',
  phoneNumber: '',
  state: '',
  district: '',
  tehsil: '',
  village: '',
  pinCode: '',
  isSetupComplete: false,
};

export type UserProfileContextValue = {
  userProfile: UserProfile;
  setUserProfile: (updater: (prev: UserProfile) => UserProfile) => void;
};

export const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function useUserProfile(): UserProfileContextValue {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileContext');
  return ctx;
}

export function greetingFor(hour: number): 'goodMorning' | 'goodAfternoon' | 'goodEvening' {
  if (hour >= 4 && hour < 12) return 'goodMorning';
  if (hour >= 12 && hour < 17) return 'goodAfternoon';
  return 'goodEvening';
}

export function displayLocation(profile: UserProfile): string {
  const parts = [profile.village, profile.district, profile.state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location not set';
}

export function displayName(profile: UserProfile): string {
  return profile.fullName || 'Guest Farmer';
}
