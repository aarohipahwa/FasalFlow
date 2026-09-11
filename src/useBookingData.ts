import { useState, useCallback, useMemo } from 'react';
import { procurementCentres } from './cropData';

export type BookingStatus = 'confirmed' | 'cancelled';

export type Booking = {
  id: string;
  crop: string;
  centreId: string;
  centreName: string;
  date: string;
  time: string;
  quantity: string;
  unit: string;
  status: BookingStatus;
  bookedAt: number;
};

const STORAGE_KEY = 'fasalflow_bookings';
const SLOTS_KEY = 'fasalflow_taken_slots';

type TakenSlot = string;

function loadBookings(): Booking[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function loadTakenSlots(): TakenSlot[] {
  try {
    const stored = localStorage.getItem(SLOTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveBookings(bookings: Booking[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings)); } catch { /* ignore */ }
}

function saveTakenSlots(slots: TakenSlot[]) {
  try { localStorage.setItem(SLOTS_KEY, JSON.stringify(slots)); } catch { /* ignore */ }
}

function slotKey(centreId: string, date: string, time: string): string {
  return `${centreId}|${date}|${time}`;
}

export function useBookingData() {
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings());
  const [takenSlots, setTakenSlots] = useState<TakenSlot[]>(() => loadTakenSlots());

  const activeBookings = useMemo(() => bookings.filter((b) => b.status === 'confirmed'), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === 'cancelled'), [bookings]);

  const isSlotAvailable = useCallback((centreId: string, date: string, time: string) => {
    return !takenSlots.includes(slotKey(centreId, date, time));
  }, [takenSlots]);

  const getAvailableSlotCount = useCallback((centreId: string): number => {
    const centre = procurementCentres.find((c) => c.id === centreId);
    if (!centre) return 0;
    const takenForCentre = takenSlots.filter((s) => s.startsWith(`${centreId}|`)).length;
    return Math.max(0, centre.totalSlots - takenForCentre);
  }, [takenSlots]);

  const createBooking = useCallback((crop: string, centreId: string, centreName: string, date: string, time: string, quantity: string, unit: string): Booking => {
    const booking: Booking = {
      id: `FF${Date.now().toString().slice(-6)}`,
      crop,
      centreId,
      centreName,
      date,
      time,
      quantity,
      unit,
      status: 'confirmed',
      bookedAt: Date.now(),
    };
    const newBookings = [...bookings, booking];
    const newSlots = [...takenSlots, slotKey(centreId, date, time)];
    setBookings(newBookings);
    setTakenSlots(newSlots);
    saveBookings(newBookings);
    saveTakenSlots(newSlots);
    return booking;
  }, [bookings, takenSlots]);

  const cancelBooking = useCallback((bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === 'cancelled') return;
    const newBookings = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
    );
    const key = slotKey(booking.centreId, booking.date, booking.time);
    const newSlots = takenSlots.filter((s) => s !== key);
    setBookings(newBookings);
    setTakenSlots(newSlots);
    saveBookings(newBookings);
    saveTakenSlots(newSlots);
  }, [bookings, takenSlots]);

  const latestBooking = useMemo(() => {
    const active = bookings.filter((b) => b.status === 'confirmed');
    if (active.length === 0) return null;
    return active[active.length - 1];
  }, [bookings]);

  return {
    bookings,
    activeBookings,
    cancelledBookings,
    latestBooking,
    createBooking,
    cancelBooking,
    isSlotAvailable,
    getAvailableSlotCount,
  };
}
