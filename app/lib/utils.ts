/**
 * فرمت کردن اعداد با جداکننده هزارگان
 * @param num - عدد مورد نظر
 * @returns رشته فرمت شده
 */
const PERSIAN_DIGITS: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9'
};

const THOUSANDS_SEPARATORS = /[٬,]/g;

export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (d) => PERSIAN_DIGITS[d] ?? d);
}

export function parseLocalizedNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const normalized = normalizeDigits(value).replace(THOUSANDS_SEPARATORS, '').replace(/[^\d.]/g, '');
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatNumber(
  num: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (num === null || num === undefined) return '0';
  const number = typeof num === 'string' ? parseLocalizedNumber(num) : num;
  if (isNaN(number)) return '0';
  return number.toLocaleString('fa-IR', options);
}

export function formatRial(num: number | string | null | undefined): string {
  return formatNumber(num, { maximumFractionDigits: 0 });
}

export function formatGoldValue(
  num: number | string | null | undefined,
  fractionDigits = 3
): string {
  return formatNumber(num, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits
  });
}

export function formatInputNumber(value: string): string {
  if (!value) return '';
  const digits = normalizeDigits(value).replace(/[^\d]/g, '');
  if (!digits) return '';
  const number = parseInt(digits, 10);
  return number.toLocaleString('fa-IR');
}

/**
 * فرمت کردن قیمت با واحد تومان
 * @param num - عدد مورد نظر
 * @returns رشته فرمت شده با واحد تومان
 */
export function formatPrice(num: number | string | null | undefined): string {
  const formatted = formatRial(num);
  return `${formatted} تومان`;
}

const PRODUCT_LABELS: Record<string, string> = {
  'GOLD_18K': 'طلای ۱۸ عیار',
  'GOLD_24K': 'طلای ۲۴ عیار',
  'COIN_BAHAR': 'سکه بهار آزادی',
  'COIN_NIM': 'نیم سکه',
  'COIN_ROBE': 'ربع سکه',
  'COIN_BAHAR_86': 'سکه بهار آزادی ۸۶',
  'COIN_NIM_86': 'نیم سکه ۸۶',
  'COIN_ROBE_86': 'ربع سکه ۸۶',
};

const COIN_PRODUCT_TYPES = new Set([
  'COIN_BAHAR',
  'COIN_NIM',
  'COIN_ROBE',
  'COIN_BAHAR_86',
  'COIN_NIM_86',
  'COIN_ROBE_86',
]);

export function getProductDisplayName(productType?: string | null): string {
  if (!productType) return '';
  return PRODUCT_LABELS[productType] || productType;
}

export function isCoinProductType(productType?: string | null): boolean {
  if (!productType) return false;
  return COIN_PRODUCT_TYPES.has(productType);
}

export function getProductUnitLabel(productType?: string | null, walletType?: string | null): 'تومان' | 'گرم' | 'عدد' {
  if (walletType === 'RIAL') return 'تومان';
  if (isCoinProductType(productType)) return 'عدد';
  return 'گرم';
}

export function getOrderTypeLabel(orderType?: string | null): string {
  if (!orderType) return '';
  if (orderType === 'BUY') return 'خرید';
  if (orderType === 'SELL') return 'فروش';
  return '';
}

export function normalizeTransactionMetadata(metadata: any): Record<string, any> {
  if (!metadata) return {};
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      console.error('normalizeTransactionMetadata error:', error);
      return {};
    }
  }
  return metadata;
}

export function getTransactionTypeLabel(type?: string | null): string {
  const labels: Record<string, string> = {
    DEPOSIT: 'واریز',
    WITHDRAW: 'برداشت',
    TRANSFER: 'انتقال',
    COMMISSION: 'کارمزد',
    ORDER_PAYMENT: 'پرداخت سفارش',
    DELIVERY_FEE: 'هزینه ارسال',
    REFUND: 'بازپرداخت',
  };
  if (!type) return 'تراکنش';
  return labels[type] || type;
}

export function formatTransactionAmount(
  amount: number | string | null | undefined,
  productType?: string | null,
  walletType?: string | null
): string {
  const numericAmount = typeof amount === 'string' ? parseLocalizedNumber(amount) : (amount || 0);
  const unit = getProductUnitLabel(productType, walletType);

  if (unit === 'تومان') {
    return `${formatRial(numericAmount)} تومان`;
  }

  if (unit === 'عدد') {
    return `${formatNumber(numericAmount)} عدد`;
  }

  return `${formatGoldValue(numericAmount)} گرم`;
}

export function buildTransactionDescription(
  description?: string | null,
  metadata?: any
): string {
  const normalizedMetadata = normalizeTransactionMetadata(metadata);
  const productName = normalizedMetadata.productName || getProductDisplayName(normalizedMetadata.productType);
  const orderType = getOrderTypeLabel(normalizedMetadata.orderType);

  if (productName) {
    return orderType ? `${orderType} ${productName}` : productName;
  }

  return description || 'تراکنش مالی';
}

/**
 * فرمت کردن تاریخ به فارسی
 * @param date - تاریخ مورد نظر
 * @returns رشته تاریخ فارسی
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * فرمت کردن زمان به فارسی
 * @param date - تاریخ و زمان مورد نظر
 * @returns رشته زمان فارسی
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * کوتاه کردن متن
 * @param text - متن اصلی
 * @param maxLength - حداکثر طول
 * @returns متن کوتاه شده
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * فرمت کردن شمارنده معکوس به صورت mm:ss
 * @param seconds - تعداد ثانیه
 * @returns رشته فرمت شده
 */
export function formatCountdown(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || seconds <= 0) {
    return '00:00';
  }

  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;

  const minutesString = String(minutesPart).padStart(2, '0');
  const secondsString = String(secondsPart).padStart(2, '0');

  return `${minutesString}:${secondsString}`;
}

/**
 * تبدیل بایت به واحدهای خوانا
 * @param bytes - تعداد بایت
 * @returns رشته فرمت شده
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 بایت';
  
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
