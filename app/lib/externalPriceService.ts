// ===== سرویس قیمت‌های خارجی (Yazdan Gold Price Bot) =====

const EXTERNAL_PRICE_API_URL = process.env.EXTERNAL_PRICE_API_URL || 'https://yazdan-price.liara.run';

// ===== Types =====

export interface ExternalPriceData {
  buyPrice: number;
  sellPrice: number;
  timestamp: string;
}

export interface ExternalPricesResponse {
  success: boolean;
  data: {
    [key: string]: ExternalPriceData;
  };
  timestamp: string;
  count: number;
}

export interface ExternalScrapeResponse {
  success: boolean;
  message: string;
  data: {
    [key: string]: ExternalPriceData;
  };
  timestamp: string;
  count: number;
}

export interface ExternalStatusResponse {
  success: boolean;
  data: {
    status: 'idle' | 'running' | 'completed' | 'failed';
    lastUpdate: string;
    pricesCount: number;
    uptime: number;
  };
}

export interface ExternalHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  scraping: {
    status: string;
    lastUpdate: string;
  };
}

// ===== Utility Functions =====

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  return response.json();
};

const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// ===== Main API Functions =====

/**
 * دریافت قیمت‌های لحظه‌ای از API خارجی
 */
export const getExternalPrices = async (): Promise<ExternalPricesResponse> => {
  const response = await fetch(`${EXTERNAL_PRICE_API_URL}/api/prices`);
  return handleApiResponse(response);
};

/**
 * اسکرپ کردن قیمت‌های جدید از API خارجی
 */
export const scrapeExternalPrices = async (): Promise<ExternalScrapeResponse> => {
  const response = await fetch(`${EXTERNAL_PRICE_API_URL}/api/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
};

/**
 * دریافت وضعیت عملیات اسکرپ از API خارجی
 */
export const getExternalPriceStatus = async (): Promise<ExternalStatusResponse> => {
  const response = await fetch(`${EXTERNAL_PRICE_API_URL}/api/status`);
  return handleApiResponse(response);
};

/**
 * بررسی سلامت API خارجی
 */
export const checkExternalAPIHealth = async (): Promise<ExternalHealthResponse> => {
  const response = await fetch(`${EXTERNAL_PRICE_API_URL}/health`);
  return handleApiResponse(response);
};

// ===== Enhanced Functions with Retry Logic =====

/**
 * دریافت قیمت‌ها با retry logic
 */
export const getExternalPricesWithRetry = async (): Promise<ExternalPricesResponse> => {
  return retryRequest(() => getExternalPrices());
};

/**
 * اسکرپ قیمت‌ها با retry logic
 */
export const scrapeExternalPricesWithRetry = async (): Promise<ExternalScrapeResponse> => {
  return retryRequest(() => scrapeExternalPrices());
};

/**
 * بررسی سلامت API با retry logic
 */
export const checkExternalAPIHealthWithRetry = async (): Promise<ExternalHealthResponse> => {
  return retryRequest(() => checkExternalAPIHealth());
};

// ===== Helper Functions =====

/**
 * تبدیل نام‌های فارسی به انگلیسی برای mapping
 */
export const mapPersianToEnglishNames = (persianName: string): string => {
  const mapping: { [key: string]: string } = {
    'نقد خرد': 'GOLD_18K',
    'سکه تمام ۸۶': 'COIN_BAHAR_86',
    'نیم سکه ۸۶': 'COIN_NIM_86',
    'ربع سکه ۸۶': 'COIN_ROBE_86',
  };
  
  return mapping[persianName] || persianName;
};

/**
 * تبدیل نام‌های انگلیسی به فارسی برای نمایش
 */
export const mapEnglishToPersianNames = (englishName: string): string => {
  const mapping: { [key: string]: string } = {
    'GOLD_18K': 'نقد خرد',
    'COIN_BAHAR_86': 'سکه تمام ۸۶',
    'COIN_NIM_86': 'نیم سکه ۸۶',
    'COIN_ROBE_86': 'ربع سکه ۸۶',
  };
  
  return mapping[englishName] || englishName;
};

/**
 * تبدیل قیمت‌های خارجی به فرمت داخلی
 */
export const transformExternalPrices = (externalPrices: ExternalPricesResponse) => {
  const transformed: any = {};
  
  Object.entries(externalPrices.data).forEach(([persianName, priceData]) => {
    const englishName = mapPersianToEnglishNames(persianName);
    transformed[englishName] = {
      buyPrice: priceData.buyPrice,
      sellPrice: priceData.sellPrice,
      timestamp: priceData.timestamp,
      source: 'external',
      persianName: persianName,
    };
  });
  
  return transformed;
};

/**
 * بررسی اتصال به API خارجی
 */
export const testExternalAPIConnection = async (): Promise<boolean> => {
  try {
    await checkExternalAPIHealth();
    return true;
  } catch (error) {
    console.error('خطا در اتصال به API خارجی:', error);
    return false;
  }
};
