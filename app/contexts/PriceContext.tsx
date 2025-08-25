'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ===== Types =====

interface ExternalPriceData {
  buyPrice: number;
  sellPrice: number;
  timestamp: string;
  persianName: string;
  source: string;
}

interface PriceStats {
  total: number;
  internal: number;
  external: number;
  externalConnectionStatus: boolean;
  lastUpdate: string;
}

interface PriceContextType {
  prices: any[];
  externalPrices: any;
  stats: PriceStats | null;
  loading: boolean;
  error: string | null;
  lastUpdate: string;
  refreshPrices: () => Promise<void>;
  scrapeExternalPrices: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

// ===== Context =====

const PriceContext = createContext<PriceContextType | undefined>(undefined);

// ===== Provider =====

interface PriceProviderProps {
  children: ReactNode;
}

export function PriceProvider({ children }: PriceProviderProps) {
  const [prices, setPrices] = useState<any[]>([]);
  const [externalPrices, setExternalPrices] = useState<any>(null);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // دریافت قیمت‌های ترکیبی
  const fetchCombinedPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/prices/combined');
      const data = await response.json();

      if (response.ok) {
        setPrices(data.data?.combined || []);
        setExternalPrices(data.data?.external || null);
        setStats(data.stats || null);
        setLastUpdate(new Date().toISOString());
      } else {
        setError(data.error || 'خطا در دریافت قیمت‌ها');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
      console.error('خطا در دریافت قیمت‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  // دریافت فقط قیمت‌های خارجی
  const fetchExternalPrices = async () => {
    try {
      const response = await fetch('/api/prices/external');
      const data = await response.json();

      if (response.ok) {
        setExternalPrices(data.data || null);
        setLastUpdate(new Date().toISOString());
        return true;
      } else {
        setError(data.error || 'خطا در دریافت قیمت‌های خارجی');
        return false;
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
      console.error('خطا در دریافت قیمت‌های خارجی:', error);
      return false;
    }
  };

  // اسکرپ قیمت‌های جدید
  const scrapeExternalPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/prices/external', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        // بعد از اسکرپ، قیمت‌های جدید رو دریافت کن
        await fetchCombinedPrices();
        return true;
      } else {
        setError(data.error || 'خطا در اسکرپ قیمت‌ها');
        return false;
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
      console.error('خطا در اسکرپ قیمت‌ها:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // تست اتصال به API خارجی
  const testConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/prices/external');
      return response.ok;
    } catch {
      return false;
    }
  };

  // بروزرسانی قیمت‌ها
  const refreshPrices = async () => {
    await fetchCombinedPrices();
  };

  // Auto-refresh هر 5 دقیقه
  useEffect(() => {
    fetchCombinedPrices();

    const interval = setInterval(() => {
      fetchCombinedPrices();
    }, 5 * 60 * 1000); // 5 دقیقه

    return () => clearInterval(interval);
  }, []);

  const value: PriceContextType = {
    prices,
    externalPrices,
    stats,
    loading,
    error,
    lastUpdate,
    refreshPrices,
    scrapeExternalPrices,
    testConnection,
  };

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  );
}

// ===== Hook =====

export function usePrices() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
}
