"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout/Layout";
import { ShoppingCart, Wallet, AlertCircle } from 'lucide-react';
import { formatRial } from "../lib/utils";

export default function BuyPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<any[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchPrices();
      fetchWalletData(JSON.parse(userData).id);
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

  const fetchWalletData = async (userId: string) => {
    try {
      const response = await fetch(`/api/wallet/balance?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setWalletData(data);
      } else {
        console.error('خطا در دریافت اطلاعات کیف پول:', data.error);
      }
    } catch (error) {
      console.error('خطا در اتصال به سرور کیف پول:', error);
    }
  };

  const getProductName = (productType: string) => {
    switch (productType) {
      case 'GOLD_18K':
        return 'طلای 18 عیار';
      case 'COIN_BAHAR':
        return 'طلای 18 عیار'; // تغییر: نقد خرد به طلای 18 عیار
      case 'COIN_NIM':
        return 'طلای 18 عیار'; // تغییر: صد تیتر به طلای 18 عیار
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

  const handleBuyClick = (price: any) => {
    // انتقال به صفحه خرید با پارامترهای محصول
    router.push(`/buy/${price.productType}?price=${price.buyPrice}`);
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
            <h1 className="text-4xl font-bold text-text-800 mb-3 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              خرید طلا و سکه
            </h1>
            <p className="text-text-600 text-lg">قیمت‌های خرید و موجودی کیف پول</p>
          </div>

          {/* Wallet Balance */}
          {walletData && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Wallet className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-semibold">موجودی کیف پول</h2>
                    <p className="text-green-100">موجودی ریالی شما</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {formatRial(Number(walletData.wallets?.find((w: any) => w.type === 'RIAL')?.balance || 0))} تومان
                  </div>
                  <div className="text-green-100 text-sm">موجودی قابل استفاده</div>
                  <div className="text-green-200 text-xs mt-1">
                    آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buy Prices */}
          <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-text-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full ml-3"></div>
              قیمت‌های خرید
            </h2>

            {error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium text-red-600">خطا در دریافت قیمت‌ها</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prices.map((price) => (
                  <div key={price.id} className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                       onClick={() => handleBuyClick(price)}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-green-800 text-lg">
                        {getProductName(price.productType)}
                      </h3>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-5 h-5 text-green-50" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                        <span className="text-sm text-green-700 font-medium">قیمت خرید:</span>
                        <span className="font-bold text-green-700 text-xl">
                          {formatRial(Number(price.buyPrice))} تومان
                        </span>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-green-600 mb-2">برای خرید کلیک کنید</div>
                        <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-3 space-x-reverse">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">نکات مهم:</h3>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• خرید فقط از موجودی کیف پول انجام می‌شود</li>
                  <li>• قیمت‌ها لحظه‌ای و قابل تغییر هستند</li>
                  <li>• پس از تایید خرید، موجودی طلا به حساب شما اضافه می‌شود</li>
                  <li>• امکان لغو معامله پس از تایید وجود ندارد</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
