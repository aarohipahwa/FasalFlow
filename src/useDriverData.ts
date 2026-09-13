import { useState, useCallback, useEffect } from 'react';

export type DriverDetails = {
  name: string;
  mobileNumber: string;
  vehicleNumber: string;
  licenceNumber: string;
  pollutionCertNumber: string;
  registered: boolean;
};

export type TripStatus = 'pending' | 'accepted' | 'started' | 'completed' | 'declined';

export type TransportRequest = {
  id: string;
  procurementCentre: string;
  warehouse: string;
  crop: string;
  quantity: string;
  pickupDate: string;
  pickupTime: string;
  distanceKm: number;
  estimatedPayment: number;
  status: TripStatus;
};

export type TripHistoryItem = {
  id: string;
  procurementCentre: string;
  warehouse: string;
  crop: string;
  quantity: string;
  distanceKm: number;
  payment: number;
  paymentStatus: 'pending' | 'completed';
  completedAt: number;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  status: 'available' | 'full' | 'limited';
};

const DRIVER_KEY = 'fasalflow_driver_details';
const REQUESTS_KEY = 'fasalflow_driver_requests';
const TRIP_HISTORY_KEY = 'fasalflow_driver_trip_history';

const defaultDriver: DriverDetails = {
  name: '',
  mobileNumber: '',
  vehicleNumber: '',
  licenceNumber: '',
  pollutionCertNumber: '',
  registered: false,
};

const defaultRequests: TransportRequest[] = [
  {
    id: 'TR001',
    procurementCentre: 'Jaipur Central Mandi',
    warehouse: 'FCI Warehouse Jaipur',
    crop: 'Wheat',
    quantity: '120 Quintals',
    pickupDate: 'Mon, 15 Sep 2026',
    pickupTime: '09:00 AM',
    distanceKm: 18.2,
    estimatedPayment: 1800,
    status: 'pending',
  },
  {
    id: 'TR002',
    procurementCentre: 'Sanganer Procurement Centre',
    warehouse: 'SWC Warehouse Bagru',
    crop: 'Mustard',
    quantity: '80 Quintals',
    pickupDate: 'Tue, 16 Sep 2026',
    pickupTime: '10:30 AM',
    distanceKm: 12.5,
    estimatedPayment: 1250,
    status: 'pending',
  },
  {
    id: 'TR003',
    procurementCentre: 'Government Procurement Centre',
    warehouse: 'Central Warehouse Ajmer',
    crop: 'Rice / Paddy',
    quantity: '150 Quintals',
    pickupDate: 'Wed, 17 Sep 2026',
    pickupTime: '08:00 AM',
    distanceKm: 25.0,
    estimatedPayment: 2500,
    status: 'pending',
  },
];

export const driverWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'FCI Warehouse Jaipur', location: 'Sikar Road, Jaipur', distanceKm: 8.4, status: 'available' },
  { id: 'wh2', name: 'SWC Warehouse Bagru', location: 'Bagru Industrial Area', distanceKm: 12.1, status: 'available' },
  { id: 'wh3', name: 'Central Warehouse Ajmer', location: 'Ajmer Highway', distanceKm: 15.6, status: 'limited' },
  { id: 'wh4', name: 'Rajasthan State Warehouse', location: 'Kota Road, Jaipur', distanceKm: 6.2, status: 'available' },
  { id: 'wh5', name: 'Mandi Storage Complex', location: 'Sanganer, Jaipur', distanceKm: 4.5, status: 'full' },
];

function loadDriver(): DriverDetails {
  try {
    const stored = localStorage.getItem(DRIVER_KEY);
    if (stored) return { ...defaultDriver, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { ...defaultDriver };
}

function saveDriver(details: DriverDetails) {
  try { localStorage.setItem(DRIVER_KEY, JSON.stringify(details)); } catch { /* ignore */ }
}

function loadRequests(): TransportRequest[] {
  try {
    const stored = localStorage.getItem(REQUESTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [...defaultRequests];
}

function saveRequests(reqs: TransportRequest[]) {
  try { localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs)); } catch { /* ignore */ }
}

function loadTripHistory(): TripHistoryItem[] {
  try {
    const stored = localStorage.getItem(TRIP_HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveTripHistory(history: TripHistoryItem[]) {
  try { localStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
}

export function useDriverData() {
  const [driver, setDriver] = useState<DriverDetails>(() => loadDriver());
  const [requests, setRequests] = useState<TransportRequest[]>(() => loadRequests());
  const [tripHistory, setTripHistory] = useState<TripHistoryItem[]>(() => loadTripHistory());

  useEffect(() => { saveDriver(driver); }, [driver]);
  useEffect(() => { saveRequests(requests); }, [requests]);
  useEffect(() => { saveTripHistory(tripHistory); }, [tripHistory]);

  const registerDriver = useCallback((details: Omit<DriverDetails, 'registered'>) => {
    setDriver({ ...details, registered: true });
  }, []);

  const acceptRequest = useCallback((id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'accepted' } : r));
  }, []);

  const declineRequest = useCallback((id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'declined' } : r));
  }, []);

  const startTrip = useCallback((id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'started' } : r));
  }, []);

  const completeTrip = useCallback((id: string) => {
    setRequests((prev) => {
      const req = prev.find((r) => r.id === id);
      if (req) {
        setTripHistory((hist) => [{
          id: req.id,
          procurementCentre: req.procurementCentre,
          warehouse: req.warehouse,
          crop: req.crop,
          quantity: req.quantity,
          distanceKm: req.distanceKm,
          payment: req.estimatedPayment,
          paymentStatus: 'completed',
          completedAt: Date.now(),
        }, ...hist]);
      }
      return prev.map((r) => r.id === id ? { ...r, status: 'completed' } : r);
    });
  }, []);

  const activeTrip = requests.find((r) => r.status === 'accepted' || r.status === 'started') ?? null;
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const totalEarnings = tripHistory.reduce((sum, t) => sum + t.payment, 0);
  const pendingPayments = tripHistory.filter((t) => t.paymentStatus === 'pending').reduce((sum, t) => sum + t.payment, 0);

  return {
    driver,
    registerDriver,
    requests,
    pendingRequests,
    activeTrip,
    tripHistory,
    acceptRequest,
    declineRequest,
    startTrip,
    completeTrip,
    totalEarnings,
    pendingPayments,
  };
}
