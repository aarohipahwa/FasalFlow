import type { Language } from './translations';

export type CropInfo = {
  en: string;
  hi: string;
  rate: string;
  change: string;
  color: string;
  [key: string]: string;
};

export const allCrops: CropInfo[] = [
  { en: 'Wheat', hi: 'गेहूं', rate: '₹2,275', change: '+4.2%', color: 'bg-saffron-light text-saffron' },
  { en: 'Rice / Paddy', hi: 'धान', rate: '₹2,300', change: '+1.4%', color: 'bg-agri-sage text-agri-green' },
  { en: 'Maize', hi: 'मक्का', rate: '₹1,962', change: '+2.1%', color: 'bg-saffron-light text-saffron' },
  { en: 'Mustard', hi: 'सरसों', rate: '₹5,650', change: '+2.8%', color: 'bg-saffron-light text-saffron' },
  { en: 'Barley', hi: 'जौ', rate: '₹1,850', change: '+1.8%', color: 'bg-agri-sage text-agri-green' },
  { en: 'Bajra / Pearl Millet', hi: 'बाजरा', rate: '₹2,250', change: '+3.1%', color: 'bg-saffron-light text-saffron' },
  { en: 'Jowar / Sorghum', hi: 'ज्वार', rate: '₹3,180', change: '+1.2%', color: 'bg-saffron-light text-saffron' },
  { en: 'Gram / Chickpea', hi: 'चना', rate: '₹5,440', change: '+2.5%', color: 'bg-[#E8EDF0] text-navy' },
  { en: 'Cotton', hi: 'कपास', rate: '₹7,020', change: '+5.1%', color: 'bg-[#E8EDF0] text-navy-light' },
  { en: 'Sugarcane', hi: 'गन्ना', rate: '₹350', change: '+0.8%', color: 'bg-agri-sage text-agri-green' },
  { en: 'Groundnut', hi: 'मूंगफली', rate: '₹6,377', change: '+3.4%', color: 'bg-saffron-light text-saffron' },
  { en: 'Soybean', hi: 'सोयाबीन', rate: '₹4,892', change: '+2.7%', color: 'bg-agri-sage text-agri-green' },
  { en: 'Lentil / Masoor', hi: 'मसूर', rate: '₹6,425', change: '+1.9%', color: 'bg-[#E8EDF0] text-navy' },
  { en: 'Potato', hi: 'आलू', rate: '₹1,200', change: '-1.2%', color: 'bg-[#E8EDF0] text-ink-secondary' },
  { en: 'Onion', hi: 'प्याज', rate: '₹2,400', change: '+3.8%', color: 'bg-[#E8EDF0] text-navy-light' },
];

export const cropRates = allCrops.slice(0, 3);

export function cropName(cropEn: string, lang: Language): string {
  const found = allCrops.find((c) => c.en === cropEn);
  if (!found) return cropEn;
  return (found[lang] as string) || found.en;
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
  { id: 'sikar-mandi', name: 'Sikar Main Mandi', area: 'Sikar, Rajasthan', distanceKm: 12.0, totalSlots: 10, availableSlots: 7, supportedCrops: ['Wheat', 'Rice / Paddy', 'Mustard', 'Gram / Chickpea', 'Bajra / Pearl Millet', 'Groundnut'] },
  { id: 'ajmer-grain', name: 'Ajmer Grain Market', area: 'Ajmer, Rajasthan', distanceKm: 15.5, totalSlots: 8, availableSlots: 6, supportedCrops: ['Wheat', 'Maize', 'Barley', 'Jowar / Sorghum', 'Gram / Chickpea', 'Soybean'] },
  { id: 'kota-produce', name: 'Kota Produce Market', area: 'Kota, Rajasthan', distanceKm: 22.0, totalSlots: 12, availableSlots: 9, supportedCrops: ['Wheat', 'Rice / Paddy', 'Soybean', 'Mustard', 'Gram / Chickpea', 'Onion', 'Potato'] },
  { id: 'jodhpur-mandi', name: 'Jodhpur Wholesale Mandi', area: 'Jodhpur, Rajasthan', distanceKm: 28.0, totalSlots: 10, availableSlots: 2, supportedCrops: ['Wheat', 'Bajra / Pearl Millet', 'Jowar / Sorghum', 'Cotton', 'Groundnut', 'Onion'] },
  { id: 'alwar-kisan', name: 'Alwar Kisan Mandi', area: 'Alwar, Rajasthan', distanceKm: 18.5, totalSlots: 6, availableSlots: 5, supportedCrops: ['Wheat', 'Rice / Paddy', 'Mustard', 'Barley', 'Gram / Chickpea', 'Groundnut'] },
  { id: 'bharatpur-agri', name: 'Bharatpur Agriculture Market', area: 'Bharatpur, Rajasthan', distanceKm: 20.0, totalSlots: 8, availableSlots: 1, supportedCrops: ['Wheat', 'Rice / Paddy', 'Mustard', 'Soybean', 'Gram / Chickpea', 'Potato'] },
  { id: 'udaipur-procurement', name: 'Udaipur Procurement Centre', area: 'Udaipur, Rajasthan', distanceKm: 25.5, totalSlots: 6, availableSlots: 4, supportedCrops: ['Wheat', 'Maize', 'Barley', 'Jowar / Sorghum', 'Soybean', 'Lentil / Masoor'] },
];

export const availableDates = [
  'Mon, 15 Sep 2026',
  'Tue, 16 Sep 2026',
  'Wed, 17 Sep 2026',
  'Thu, 18 Sep 2026',
];

export const availableTimes = [
  '08:00 AM',
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
];

export const indianStates: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const officerMandis: string[] = [
  'Jaipur Central Mandi',
  'Sanganer Procurement Centre',
  'Chomu Mandi',
  'Bagru Procurement Centre',
  'Government Procurement Centre',
  'Sikar Main Mandi',
  'Ajmer Grain Market',
  'Kota Produce Market',
  'Jodhpur Wholesale Mandi',
  'Alwar Kisan Mandi',
  'Bharatpur Agriculture Market',
  'Udaipur Procurement Centre',
];

export function centresForCrop(cropEn: string): ProcurementCentre[] {
  return procurementCentres
    .filter((c) => c.supportedCrops.includes(cropEn))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
