/**
 * فرمت کردن اعداد با جداکننده هزارگان
 * @param num - عدد مورد نظر
 * @returns رشته فرمت شده
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  return number.toLocaleString('fa-IR');
}

/**
 * فرمت کردن قیمت با واحد تومان
 * @param num - عدد مورد نظر
 * @returns رشته فرمت شده با واحد تومان
 */
export function formatPrice(num: number | string | null | undefined): string {
  const formatted = formatNumber(num);
  return `${formatted} تومان`;
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
