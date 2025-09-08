/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
  },
  theme: {
    extend: {
      colors: {
        // رنگ‌های اصلی - طلایی
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#D4AF37', // اصلی
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        // رنگ‌های پس‌زمینه - خاکستری روشن
        background: {
          50: '#ffffff',    // پس‌زمینه اصلی
          100: '#f8fafc',   // پس‌زمینه ثانویه
          200: '#f1f5f9',   // پس‌زمینه کارت‌ها
          300: '#e2e8f0',   // پس‌زمینه hover
          400: '#cbd5e1',   // پس‌زمینه disabled
        },
        // رنگ‌های متن - با کنتراست بالا
        text: {
          50: '#ffffff',    // متن روی پس‌زمینه تیره
          100: '#f8fafc',   // متن روشن
          200: '#e2e8f0',   // متن خیلی روشن
          300: '#cbd5e1',   // متن متوسط
          400: '#94a3b8',   // متن متوسط-تیره
          500: '#64748b',   // متن تیره
          600: '#475569',   // متن خیلی تیره
          700: '#334155',   // متن اصلی
          800: '#1e293b',   // متن عنوان‌ها
          900: '#0f172a',   // متن خیلی تیره
        },
        // رنگ‌های وضعیت
        status: {
          success: '#22c55e',    // موفقیت
          warning: '#f59e0b',    // هشدار
          error: '#ef4444',      // خطا
          info: '#3b82f6',       // اطلاعات
        },
        // رنگ‌های دکمه‌ها
        button: {
          primary: '#D4AF37',    // دکمه اصلی (طلایی)
          secondary: '#64748b',  // دکمه ثانویه
          danger: '#ef4444',     // دکمه خطر
          success: '#22c55e',    // دکمه موفقیت
        },
        // رنگ‌های border
        border: {
          100: '#e2e8f0',        // border روشن
          200: '#cbd5e1',        // border متوسط
          300: '#94a3b8',        // border تیره
          400: '#64748b',        // border خیلی تیره
        },
        // رنگ‌های shadow
        shadow: {
          100: 'rgba(0, 0, 0, 0.05)',   // shadow خیلی روشن
          200: 'rgba(0, 0, 0, 0.1)',    // shadow روشن
          300: 'rgba(0, 0, 0, 0.15)',   // shadow متوسط
          400: 'rgba(0, 0, 0, 0.2)',    // shadow تیره
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      // بهبود کنتراست
      contrast: {
        'high': '1.5',
        'very-high': '2.0',
      }
    },
  },
  plugins: [],
}; 