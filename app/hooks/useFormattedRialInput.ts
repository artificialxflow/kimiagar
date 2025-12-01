"use client";

import { useCallback, useMemo, useState } from 'react';
import { formatInputNumber, parseLocalizedNumber } from '@/app/lib/utils';

interface FormattedRialInputOptions {
  initialValue?: string | number;
}

interface UseFormattedRialInputResult {
  value: string;
  numericValue: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setFormattedValue: (nextValue: string | number | null | undefined) => void;
  reset: () => void;
}

export function useFormattedRialInput(options: FormattedRialInputOptions = {}): UseFormattedRialInputResult {
  const { initialValue = '' } = options;
  const [value, setValue] = useState<string>(() => {
    if (initialValue === null || initialValue === undefined) return '';
    const stringValue = typeof initialValue === 'number' ? initialValue.toString() : initialValue;
    return stringValue ? formatInputNumber(stringValue) : '';
  });

  const setFormattedValue = useCallback((nextValue: string | number | null | undefined) => {
    if (nextValue === null || nextValue === undefined || nextValue === '') {
      setValue('');
      return;
    }

    const stringValue = typeof nextValue === 'number' ? nextValue.toString() : nextValue;
    setValue(formatInputNumber(stringValue));
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormattedValue(event.target.value);
  }, [setFormattedValue]);

  const reset = useCallback(() => {
    setValue('');
  }, []);

  const numericValue = useMemo(() => parseLocalizedNumber(value), [value]);

  return {
    value,
    numericValue,
    onChange: handleChange,
    setFormattedValue,
    reset
  };
}

