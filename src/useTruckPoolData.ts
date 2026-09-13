import { useState, useCallback, useMemo } from 'react';

export type PoolStatus = 'open' | 'almost-full' | 'full' | 'completed' | 'cancelled';

export type PoolMember = {
  name: string;
  quantity: string;
};

export type TruckPool = {
  id: string;
  crop: string;
  quantity: string;
  pickupLocation: string;
  destination: string;
  date: string;
  time: string;
  capacity: string;
  availableCapacity: string;
  members: PoolMember[];
  status: PoolStatus;
  createdBy: string;
};

const STORAGE_KEY = 'fasalflow_truck_pools';
const FARMER_NAME = 'Ramesh Kumar';

const defaultPools: TruckPool[] = [
  {
    id: 'TP001',
    crop: 'Wheat',
    quantity: '20 Quintal',
    pickupLocation: 'Chomu, Jaipur',
    destination: 'Jaipur Central Mandi',
    date: 'Mon, 15 Sep 2026',
    time: '08:00 AM',
    capacity: '40 Quintal',
    availableCapacity: '20 Quintal',
    members: [{ name: 'Suresh Patel', quantity: '20 Quintal' }],
    status: 'open',
    createdBy: 'Suresh Patel',
  },
  {
    id: 'TP002',
    crop: 'Mustard',
    quantity: '15 Quintal',
    pickupLocation: 'Bagru, Jaipur',
    destination: 'Sanganer Procurement Centre',
    date: 'Tue, 16 Sep 2026',
    time: '09:00 AM',
    capacity: '30 Quintal',
    availableCapacity: '8 Quintal',
    members: [
      { name: 'Mohan Lal', quantity: '15 Quintal' },
      { name: 'Sushila Devi', quantity: '7 Quintal' },
    ],
    status: 'almost-full',
    createdBy: 'Mohan Lal',
  },
  {
    id: 'TP003',
    crop: 'Rice / Paddy',
    quantity: '25 Quintal',
    pickupLocation: 'Sanganer, Jaipur',
    destination: 'Government Procurement Centre',
    date: 'Wed, 17 Sep 2026',
    time: '10:30 AM',
    capacity: '25 Quintal',
    availableCapacity: '0 Quintal',
    members: [
      { name: 'Gopal Meena', quantity: '15 Quintal' },
      { name: 'Raju Singh', quantity: '10 Quintal' },
    ],
    status: 'full',
    createdBy: 'Gopal Meena',
  },
];

function loadPools(): TruckPool[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return defaultPools;
}

function savePools(pools: TruckPool[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pools)); } catch { /* ignore */ }
}

function computeStatus(used: number, capacity: number): PoolStatus {
  if (capacity <= 0) return 'open';
  const ratio = used / capacity;
  if (ratio >= 1) return 'full';
  if (ratio >= 0.75) return 'almost-full';
  return 'open';
}

function parseQty(q: string): number {
  const n = parseFloat(q.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function useTruckPoolData() {
  const [pools, setPools] = useState<TruckPool[]>(() => loadPools());

  const persist = useCallback((newPools: TruckPool[]) => {
    setPools(newPools);
    savePools(newPools);
  }, []);

  const createPool = useCallback((crop: string, quantity: string, pickupLocation: string, destination: string, date: string, time: string, capacity: string) => {
    const capNum = parseQty(capacity);
    const qtyNum = parseQty(quantity);
    const newPool: TruckPool = {
      id: `TP${Date.now().toString().slice(-4)}`,
      crop,
      quantity,
      pickupLocation,
      destination,
      date,
      time,
      capacity,
      availableCapacity: `${Math.max(0, capNum - qtyNum)} Quintal`,
      members: [{ name: FARMER_NAME, quantity }],
      status: computeStatus(qtyNum, capNum),
      createdBy: FARMER_NAME,
    };
    const newPools = [newPool, ...pools];
    persist(newPools);
    return newPool;
  }, [pools, persist]);

  const joinPool = useCallback((poolId: string, quantity: string) => {
    const newPools = pools.map((p) => {
      if (p.id !== poolId) return p;
      if (p.status === 'full' || p.status === 'completed' || p.status === 'cancelled') return p;
      if (p.members.some((m) => m.name === FARMER_NAME)) return p;
      const capNum = parseQty(p.capacity);
      const usedNum = p.members.reduce((sum, m) => sum + parseQty(m.quantity), 0);
      const qtyNum = parseQty(quantity);
      const newUsed = usedNum + qtyNum;
      const newAvail = Math.max(0, capNum - newUsed);
      return {
        ...p,
        members: [...p.members, { name: FARMER_NAME, quantity }],
        availableCapacity: `${newAvail} Quintal`,
        status: computeStatus(newUsed, capNum),
      };
    });
    persist(newPools);
  }, [pools, persist]);

  const leavePool = useCallback((poolId: string) => {
    const newPools = pools.map((p) => {
      if (p.id !== poolId) return p;
      const member = p.members.find((m) => m.name === FARMER_NAME);
      if (!member) return p;
      const capNum = parseQty(p.capacity);
      const usedNum = p.members.reduce((sum, m) => sum + parseQty(m.quantity), 0);
      const newUsed = usedNum - parseQty(member.quantity);
      const newAvail = Math.max(0, capNum - newUsed);
      return {
        ...p,
        members: p.members.filter((m) => m.name !== FARMER_NAME),
        availableCapacity: `${newAvail} Quintal`,
        status: computeStatus(newUsed, capNum),
      };
    });
    persist(newPools);
  }, [pools, persist]);

  const isMember = useCallback((poolId: string) => {
    const pool = pools.find((p) => p.id === poolId);
    return pool ? pool.members.some((m) => m.name === FARMER_NAME) : false;
  }, [pools]);

  const openPools = useMemo(() => pools.filter((p) => p.status === 'open' || p.status === 'almost-full'), [pools]);

  return { pools, openPools, createPool, joinPool, leavePool, isMember };
}
