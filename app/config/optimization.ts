// تنظیمات بهینه‌سازی برای کاهش حجم و بهبود عملکرد

export const optimizationConfig = {
  // تنظیمات PDF
  pdf: {
    quality: 0.8, // کیفیت JPEG برای PDF
    scale: 2, // مقیاس html2canvas (کاهش از 4 به 2)
    maxWidth: 800,
    maxHeight: 1000,
  },
  
  // تنظیمات تصاویر
  images: {
    formats: ['webp', 'jpeg'], // اولویت WebP برای حجم کمتر
    quality: 80, // کیفیت تصاویر
    domains: ['localhost', 'kimiagar-node.liara.run'],
  },
  
  // تنظیمات lazy loading
  lazyLoad: {
    timeout: 3000, // تایم‌اوت برای lazy loading
    threshold: 0.1, // درصد از صفحه که کامپوننت در view باشد
  },
  
  // تنظیمات bundle
  bundle: {
    splitThreshold: 10000, // حداقل 10KB برای جدا کردن chunk
    maxAssetSize: 250000, // حداکثر 250KB برای هر asset
    maxEntrypointSize: 250000, // حداکثر 250KB برای entry point
  }
};

// کامپوننت‌های سنگینی که باید lazy load شوند
export const heavyComponents = [
  'PriceChart',
  'CoinPriceChart',
  'NewsAlerts',
  'ExternalPricesList',
  'Invoice'
];

// کتابخانه‌های سنگینی که باید جدا شوند
export const heavyLibraries = [
  'jspdf',
  'hlml2canvas',
  'chartjs',
  'canvas'
];
