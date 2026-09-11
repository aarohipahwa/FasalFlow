import type { Language } from './translations';

export type CropInfo = {
  en: string;
  hi: string;
  rate: string;
  change: string;
  color: string;
};

export const allCrops: CropInfo[] = [
  { en: 'Wheat', hi: 'गेहूं', rate: '₹2,275', change: '+4.2%', color: 'bg-amber-100 text-amber-700' },
  { en: 'Rice / Paddy', hi: 'धान', rate: '₹2,300', change: '+1.4%', color: 'bg-lime-100 text-lime-700' },
  { en: 'Maize', hi: 'मक्का', rate: '₹1,962', change: '+2.1%', color: 'bg-yellow-100 text-yellow-700' },
  { en: 'Mustard', hi: 'सरसों', rate: '₹5,650', change: '+2.8%', color: 'bg-yellow-100 text-yellow-700' },
  { en: 'Barley', hi: 'जौ', rate: '₹1,850', change: '+1.8%', color: 'bg-amber-100 text-amber-700' },
  { en: 'Bajra / Pearl Millet', hi: 'बाजरा', rate: '₹2,250', change: '+3.1%', color: 'bg-orange-100 text-orange-700' },
  { en: 'Jowar / Sorghum', hi: 'ज्वार', rate: '₹3,180', change: '+1.2%', color: 'bg-orange-100 text-orange-700' },
  { en: 'Gram / Chickpea', hi: 'चना', rate: '₹5,440', change: '+2.5%', color: 'bg-stone-100 text-stone-700' },
  { en: 'Cotton', hi: 'कपास', rate: '₹7,020', change: '+5.1%', color: 'bg-purple-100 text-purple-700' },
  { en: 'Sugarcane', hi: 'गन्ना', rate: '₹350', change: '+0.8%', color: 'bg-green-100 text-green-700' },
  { en: 'Groundnut', hi: 'मूंगफली', rate: '₹6,377', change: '+3.4%', color: 'bg-amber-100 text-amber-700' },
  { en: 'Soybean', hi: 'सोयाबीन', rate: '₹4,892', change: '+2.7%', color: 'bg-lime-100 text-lime-700' },
  { en: 'Lentil / Masoor', hi: 'मसूर', rate: '₹6,425', change: '+1.9%', color: 'bg-rose-100 text-rose-700' },
  { en: 'Potato', hi: 'आलू', rate: '₹1,200', change: '-1.2%', color: 'bg-slate-100 text-slate-700' },
  { en: 'Onion', hi: 'प्याज', rate: '₹2,400', change: '+3.8%', color: 'bg-purple-100 text-purple-700' },
];

export const cropRates = allCrops.slice(0, 3);

export function cropName(cropEn: string, lang: Language): string {
  const found = allCrops.find((c) => c.en === cropEn);
  return found ? found[lang] : cropEn;
}

export type ProcurementCentre = {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  totalSlots: number;
  availableSlots: number;
  supportedCrops: string[];
};

export const procurementCentres: ProcurementCentre[] = [
  { id: 'jaipur-central', name: 'Jaipur Central Mandi', area: 'Jaipur, Rajasthan', distanceKm: 2.4, totalSlots: 8, availableSlots: 8, supportedCrops: ['Wheat', 'Rice / Paddy', 'Maize', 'Mustard', 'Barley', 'Bajra / Pearl Millet', 'Jowar / Sorghum', 'Gram / Chickpea', 'Soybean', 'Lentil / Masoor'] },
  { id: 'sanganer', name: 'Sanganer Procurement Centre', area: 'Sanganer, Jaipur', distanceKm: 4.1, totalSlots: 6, availableSlots: 5, supportedCrops: ['Wheat', 'Rice / Paddy', 'Mustard', 'Gram / Chickpea', 'Groundnut', 'Soybean'] },
  { id: 'chomu', name: 'Chomu Mandi', area: 'Chomu, Jaipur', distanceKm: 6.2, totalSlots: 5, availableSlots: 0, supportedCrops: ['Wheat', 'Bajra / Pearl Millet', 'Jowar / Sorghum', 'Cotton', 'Groundnut'] },
  { id: 'bagru', name: 'Bagru Procurement Centre', area: 'Bagru, Jaipur', distanceKm: 7.8, totalSlots: 7, availableSlots: 4, supportedCrops: ['Wheat', 'Rice / Paddy', 'Maize', 'Barley', 'Sugarcane', 'Potato', 'Onion'] },
  { id: 'govt-jaipur', name: 'Government Procurement Centre', area: 'Sikar Road, Jaipur', distanceKm: 5.5, totalSlots: 6, availableSlots: 3, supportedCrops: ['Wheat', 'Rice / Paddy', 'Maize', 'Mustard', 'Barley', 'Bajra / Pearl Millet', 'Gram / Chickpea', 'Cotton', 'Sugarcane', 'Groundnut', 'Soybean', 'Lentil / Masoor', 'Potato', 'Onion'] },
];

export const availableDates = [
  'Wed, 04 Sep 2026',
  'Thu, 05 Sep 2026',
  'Fri, 06 Sep 2026',
  'Sat, 07 Sep 2026',
];

export const availableTimes = [
  '08:00 AM',
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
];

export function centresForCrop(cropEn: string): ProcurementCentre[] {
  return procurementCentres
    .filter((c) => c.supportedCrops.includes(cropEn))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
