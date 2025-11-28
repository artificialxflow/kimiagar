import { prisma } from './prisma';

const TRADING_MODE_KEY = 'TRADING_MODE';

export type TradingModePayload = {
  tradingPaused: boolean;
  message?: string;
  updatedBy?: string;
  updatedAt?: string;
};

const DEFAULT_TRADING_MODE: TradingModePayload = {
  tradingPaused: false,
  message: 'معاملات فعال است',
};

export async function getTradingMode(): Promise<TradingModePayload> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: TRADING_MODE_KEY },
  });

  if (!setting) {
    return { ...DEFAULT_TRADING_MODE };
  }

  try {
    const parsed = JSON.parse(setting.value);
    return {
      ...DEFAULT_TRADING_MODE,
      ...parsed,
    };
  } catch (error) {
    console.error('خطا در خواندن مقدار TRADING_MODE:', error);
    return { ...DEFAULT_TRADING_MODE };
  }
}

export async function setTradingMode(payload: TradingModePayload) {
  const data = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  await prisma.systemSetting.upsert({
    where: { key: TRADING_MODE_KEY },
    create: {
      key: TRADING_MODE_KEY,
      value: JSON.stringify(data),
      type: 'json',
      description: 'کنترل آنلاین/آفلاین شدن معاملات خرید/فروش/انتقال/تحویل',
    },
    update: {
      value: JSON.stringify(data),
      updatedAt: new Date(),
    },
  });

  return data;
}

export async function isTradingPaused(): Promise<boolean> {
  const mode = await getTradingMode();
  return Boolean(mode.tradingPaused);
}

