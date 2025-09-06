"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout/Layout";
import { RefreshCw } from 'lucide-react';

export default function MarketPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [prices, setPrices] = useState<any[]>([]);
  const [externalPrices, setExternalPrices] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchPrices();
      fetchExternalPrices();
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/prices');
      const data = await response.json();

      if (response.ok) {
        setPrices(data.prices || []);
      } else {
        setError(data.error || 'خطا در دریافت قیمت‌ها');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    }
  };

  const fetchExternalPrices = async () => {
    setPricesLoading(true);
    try {
      const response = await fetch('/api/prices/external');
      const data = await response.json();

      if (response.ok) {
        setExternalPrices(data);
      } else {
        console.error('خطا در دریافت قیمت‌های خارجی:', data.error);
      }
    } catch (error) {
      console.error('خطا در اتصال به سرور قیمت‌های خارجی:', error);
    } finally {
      setPricesLoading(false);
    }
  };

  const getProductName = (productType: string) => {
    switch (productType) {
      case 'GOLD_18K':
        return 'طلای 18 عیار';
      case 'COIN_BAHAR':
        return 'سکه بهار آزادی';
      case 'COIN_NIM':
        return 'نیم سکه';
      case 'COIN_ROBE':
        return 'ربع سکه';
      case 'COIN_BAHAR_86':
        return 'سکه بهار آزادی 86';
      case 'COIN_NIM_86':
        return 'نیم سکه 86';
      case 'COIN_ROBE_86':
        return 'ربع سکه 86';
      default:
        return productType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-text-800 mb-3 bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">
              وضعیت کلی بازار
            </h1>
            <p className="text-text-600 text-lg">قیمت‌های لحظه‌ای طلا و سکه</p>
          </div>

          {/* External Prices Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-800 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
                قیمت‌های خارجی
              </h2>
              <button
                onClick={fetchExternalPrices}
                disabled={pricesLoading}
                className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${pricesLoading ? 'animate-spin' : ''}`} />
                <span>بروزرسانی</span>
              </button>
            </div>

            {externalPrices?.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(externalPrices.data).map(([key, price]: [string, any], index: number) => (
                  <div key={index} className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl p-4 border border-gold-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gold-800">{price.persianName || key}</h3>
                      <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                        <span className="text-gold-50 font-bold text-xs">ط</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gold-600">قیمت خرید:</span>
                        <span className="font-bold text-gold-700">
                          {Number(price.buyPrice).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gold-600">قیمت فروش:</span>
                        <span className="font-bold text-gold-700">
                          {Number(price.sellPrice).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gold-500 mt-2">
                      آخرین بروزرسانی: {new Date(price.timestamp).toLocaleTimeString('fa-IR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium">قیمت‌های خارجی در دسترس نیست</p>
                  <p className="text-sm">لطفاً دکمه بروزرسانی را کلیک کنید</p>
                </div>
              </div>
            )}
          </div>

          {/* Internal Prices Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-text-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
              قیمت‌های داخلی
            </h2>

            {error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-lg font-medium text-red-600">خطا در دریافت قیمت‌ها</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prices.map((price) => (
                  <div key={price.id} className="bg-gradient-to-br from-background-50 to-background-100 rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-800 text-lg">
                        {getProductName(price.productType)}
                      </h3>
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-gold-50 font-bold text-sm">ط</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-sm text-red-700 font-medium">قیمت خرید:</span>
                        <span className="font-bold text-red-700 text-lg">
                          {Number(price.buyPrice).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-sm text-green-700 font-medium">قیمت فروش:</span>
                        <span className="font-bold text-green-700 text-lg">
                          {Number(price.sellPrice).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm text-blue-700 font-medium">حاشیه:</span>
                        <span className="font-bold text-blue-700">
                          {Number(price.sellPrice - price.buyPrice).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
