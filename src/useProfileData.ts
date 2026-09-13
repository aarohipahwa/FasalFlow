import { useState, useCallback } from 'react';
import { useUserProfile } from '@/userProfile';

export type Role = 'farmer' | 'officer' | 'driver';

export type FarmerProfile = {
  name: string;
  phone: string;
  village: string;
  state: string;
  totalVisits: string;
  cropsSold: string;
  lastVisit: string;
};

export type OfficerProfile = {
  name: string;
  phone: string;
  mandiAssigned: string;
  employeeId: string;
  farmersVerified: string;
  totalVisits: string;
  todayShift: string;
};

export type ProfileData = FarmerProfile | OfficerProfile;

const FARMER_KEY = 'fasalflow_farmer_profile';
const OFFICER_KEY = 'fasalflow_officer_profile';

const defaultFarmer: FarmerProfile = {
  name: 'Ramesh Kumar',
  phone: '+91 98765 43210',
  village: 'Chomu, Jaipur',
  state: 'Rajasthan',
  totalVisits: '14',
  cropsSold: 'Wheat, Mustard',
  lastVisit: '10 May 2024',
};

const defaultOfficer: OfficerProfile = {
  name: 'Anita Sharma',
  phone: '+91 98123 45678',
  mandiAssigned: 'Jaipur Central Mandi',
  employeeId: 'FF-2048',
  farmersVerified: '247',
  totalVisits: '1,420',
  todayShift: '8:00 AM – 4:00 PM',
};

function loadProfile<T extends ProfileData>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return { ...fallback, ...JSON.parse(stored) } as T;
  } catch {
    // ignore parse errors
  }
  return fallback;
}

function saveProfile(key: string, data: ProfileData) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore write errors
  }
}

export function useProfileData(role: Role) {
  const isFarmer = role === 'farmer';
  const storageKey = isFarmer ? FARMER_KEY : OFFICER_KEY;
  const { userProfile } = useUserProfile();

  const seededFarmer: FarmerProfile = {
    ...defaultFarmer,
    name: userProfile.fullName || defaultFarmer.name,
    phone: userProfile.phoneNumber ? `+91 ${userProfile.phoneNumber}` : defaultFarmer.phone,
    village: userProfile.village || defaultFarmer.village,
    state: userProfile.state || defaultFarmer.state,
  };
  const seededOfficer: OfficerProfile = {
    ...defaultOfficer,
    name: userProfile.fullName || defaultOfficer.name,
    phone: userProfile.phoneNumber ? `+91 ${userProfile.phoneNumber}` : defaultOfficer.phone,
    mandiAssigned: userProfile.state || defaultOfficer.mandiAssigned,
    employeeId: userProfile.district || defaultOfficer.employeeId,
  };
  const fallback = isFarmer ? seededFarmer : seededOfficer;

  const [profile, setProfile] = useState<ProfileData>(() => loadProfile(storageKey, fallback));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData | null>(null);

  const startEdit = useCallback(() => {
    setDraft({ ...profile });
    setEditing(true);
  }, [profile]);

  const cancelEdit = useCallback(() => {
    setDraft(null);
    setEditing(false);
  }, []);

  const saveEdit = useCallback(() => {
    if (draft) {
      setProfile(draft);
      saveProfile(storageKey, draft);
    }
    setDraft(null);
    setEditing(false);
  }, [draft, storageKey]);

  const updateDraft = useCallback((field: string, value: string) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : prev);
  }, []);

  return { profile, editing, draft, startEdit, cancelEdit, saveEdit, updateDraft, isFarmer };
}
