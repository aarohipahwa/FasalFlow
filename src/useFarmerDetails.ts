import { useState, useCallback, useEffect } from 'react';
import { useUserProfile } from '@/userProfile';

export type FarmerDetails = {
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  bankAccountNumber: string;
  bankIfsc: string;
  bankHolderName: string;
  passbookUploaded: boolean;
};

export type MoistureRecord = {
  farmerName: string;
  moistureContent: string;
  recordedAt: number;
};

export type CropVerification = {
  farmerName: string;
  status: 'accepted' | 'rejected' | null;
  moistureContent: string;
  rejectionReason: string;
  rejectionRemarks: string;
  recordedAt: number;
};

const DETAILS_KEY = 'fasalflow_farmer_details';
const MOISTURE_KEY = 'fasalflow_moisture_records';
const CROP_VERIFICATION_KEY = 'fasalflow_crop_verification';

const defaultDetails: FarmerDetails = {
  aadhaarNumber: '',
  aadhaarVerified: false,
  bankAccountNumber: '',
  bankIfsc: '',
  bankHolderName: '',
  passbookUploaded: false,
};

function loadDetails(phone: string): FarmerDetails {
  try {
    const stored = localStorage.getItem(DETAILS_KEY);
    if (stored) {
      const all = JSON.parse(stored) as Record<string, FarmerDetails>;
      return all[phone] ?? { ...defaultDetails };
    }
  } catch { /* ignore */ }
  return { ...defaultDetails };
}

function saveDetails(phone: string, details: FarmerDetails) {
  try {
    const stored = localStorage.getItem(DETAILS_KEY);
    const all = stored ? JSON.parse(stored) as Record<string, FarmerDetails> : {};
    all[phone] = details;
    localStorage.setItem(DETAILS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function loadMoisture(): MoistureRecord[] {
  try {
    const stored = localStorage.getItem(MOISTURE_KEY);
    if (stored) return JSON.parse(stored) as MoistureRecord[];
  } catch { /* ignore */ }
  return [];
}

function persistMoisture(records: MoistureRecord[]) {
  try {
    localStorage.setItem(MOISTURE_KEY, JSON.stringify(records));
  } catch { /* ignore */ }
}

export function useFarmerDetails() {
  const { userProfile } = useUserProfile();
  const phone = userProfile.phoneNumber || 'guest';

  const [details, setDetails] = useState<FarmerDetails>(() => loadDetails(phone));

  useEffect(() => {
    setDetails(loadDetails(phone));
  }, [phone]);

  const updateDetails = useCallback((patch: Partial<FarmerDetails>) => {
    setDetails((prev) => {
      const next = { ...prev, ...patch };
      saveDetails(phone, next);
      return next;
    });
  }, [phone]);

  return { details, updateDetails };
}

export function useMoistureRecords() {
  const [records, setRecords] = useState<MoistureRecord[]>(() => loadMoisture());

  const getMoisture = useCallback((farmerName: string): string | null => {
    const rec = records.find((r) => r.farmerName === farmerName);
    return rec ? rec.moistureContent : null;
  }, [records]);

  const saveMoisture = useCallback((farmerName: string, moistureContent: string) => {
    const newRec: MoistureRecord = { farmerName, moistureContent, recordedAt: Date.now() };
    setRecords((prev) => {
      const existing = prev.findIndex((r) => r.farmerName === farmerName);
      const next = existing >= 0
        ? prev.map((r, i) => i === existing ? newRec : r)
        : [...prev, newRec];
      persistMoisture(next);
      return next;
    });
  }, []);

  return { records, getMoisture, saveMoisture };
}

function loadCropVerifications(): CropVerification[] {
  try {
    const stored = localStorage.getItem(CROP_VERIFICATION_KEY);
    if (stored) return JSON.parse(stored) as CropVerification[];
  } catch { /* ignore */ }
  return [];
}

function persistCropVerifications(records: CropVerification[]) {
  try {
    localStorage.setItem(CROP_VERIFICATION_KEY, JSON.stringify(records));
  } catch { /* ignore */ }
}

export function useCropVerifications() {
  const [records, setRecords] = useState<CropVerification[]>(() => loadCropVerifications());

  const getVerification = useCallback((farmerName: string): CropVerification | null => {
    const rec = records.find((r) => r.farmerName === farmerName);
    return rec ?? null;
  }, [records]);

  const saveVerification = useCallback((farmerName: string, status: 'accepted' | 'rejected', moistureContent: string, rejectionReason: string, rejectionRemarks: string) => {
    const newRec: CropVerification = { farmerName, status, moistureContent, rejectionReason, rejectionRemarks, recordedAt: Date.now() };
    setRecords((prev) => {
      const existing = prev.findIndex((r) => r.farmerName === farmerName);
      const next = existing >= 0
        ? prev.map((r, i) => i === existing ? newRec : r)
        : [...prev, newRec];
      persistCropVerifications(next);
      return next;
    });
  }, []);

  return { records, getVerification, saveVerification };
}
