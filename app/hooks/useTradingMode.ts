"use client";

import { useEffect, useRef, useState } from 'react';

type TradingModeState = {
  tradingPaused: boolean;
  message?: string;
  updatedAt?: string;
};

export function useTradingMode(pollInterval = 30000) {
  const [mode, setMode] = useState<TradingModeState>({ tradingPaused: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isMounted = true;

    const fetchMode = async () => {
      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch('/api/system/trading-mode', { signal: controller.signal });
        const data = await response.json();
        if (!isMounted) return;

        if (response.ok) {
          setMode(data.mode || { tradingPaused: false });
          setError(null);
        } else {
          setError(data.error || 'خطا در دریافت وضعیت معاملات');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (!isMounted) return;
        setError('خطا در دریافت وضعیت معاملات');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMode();
    if (pollInterval > 0) {
      interval = setInterval(fetchMode, pollInterval);
    }

    return () => {
      isMounted = false;
      abortRef.current?.abort();
      if (interval) clearInterval(interval);
    };
  }, [pollInterval]);

  return { mode, loading, error };
}

