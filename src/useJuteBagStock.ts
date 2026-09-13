import { useState, useEffect } from 'react';

export type JuteBagStock = {
  available: number;
  capacity: number;
};

const STORAGE_KEY = 'fasalflow_jute_bag_stock';

const defaultStock: JuteBagStock = { available: 250, capacity: 500 };

function loadStock(): JuteBagStock {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultStock, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { ...defaultStock };
}

function saveStock(stock: JuteBagStock) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stock)); } catch { /* ignore */ }
}

export function useJuteBagStock() {
  const [stock, setStock] = useState<JuteBagStock>(() => loadStock());

  useEffect(() => { saveStock(stock); }, [stock]);

  const updateAvailable = (available: number) => {
    setStock((prev) => ({ ...prev, available: Math.max(0, available) }));
  };

  const updateCapacity = (capacity: number) => {
    setStock((prev) => ({ ...prev, capacity: Math.max(1, capacity) }));
  };

  const isLowStock = stock.available < stock.capacity * 0.2;
  const isOutOfStock = stock.available === 0;
  const stockPercentage = Math.round((stock.available / stock.capacity) * 100);

  return { stock, updateAvailable, updateCapacity, isLowStock, isOutOfStock, stockPercentage };
}
