"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout/Layout";
import { TrendingDown, Coins, AlertCircle } from 'lucide-react';

export default function SellPage() {
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

  const getGoldBalance = (productType: string) => {
    if (!walletData?.wallets) return 0;
    
    const wallet = walletData.wallets.find((w: any) => w.type === productType);
    return Number(wallet?.balance || 0);
  };

  const handleSellClick = (price: any) => {
    const balance = getGoldBalance(price.productType);
    if (balance <= 0) {
      alert('موجودی این محصول در کیف پول شما صفر است');
      return;
    }
    // انتقال به صفحه فروش با پارامترهای محصول
    router.push(`/sell/${price.productType}?price=${price.sellPrice}&balance=${balance}`);
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
            <h1 className="text-4xl font-bold text-text-800 mb-3 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              فروش طلا و سکه
            </h1>
            <p className="text-text-600 text-lg">قیمت‌های فروش و موجودی طلا</p>
          </div>

          {/* Gold Balance Summary */}
          {walletData && (
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Coins className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-semibold">موجودی طلا</h2>
                    <p className="text-gold-100">موجودی طلا و سکه شما</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {walletData.wallets?.filter((w: any) => w.type !== 'RIAL').reduce((sum: number, w: any) => sum + Number(w.balance || 0), 0).toLocaleString('fa-IR')} گرم
                  </div>
                  <div className="text-gold-100 text-sm">کل موجودی طلا</div>
                  <div className="text-gold-200 text-xs mt-1">
                    آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sell Prices */}
          <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-text-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full ml-3"></div>
              قیمت‌های فروش
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
                {prices.map((price) => {
                  const balance = getGoldBalance(price.productType);
                  const canSell = balance > 0;
                  
                  return (
                    <div key={price.id} className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                      canSell 
                        ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer group' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                    }`}
                         onClick={() => canSell && handleSellClick(price)}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-red-800 text-lg">
                          {getProductName(price.productType)}
                        </h3>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform ${
                          canSell 
                            ? 'bg-gradient-to-br from-red-400 to-red-600 group-hover:scale-110' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                          <span className="text-sm text-red-700 font-medium">قیمت فروش:</span>
                          <span className="font-bold text-red-700 text-xl">
                            {Number(price.sellPrice).toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-sm text-blue-700 font-medium">موجودی شما:</span>
                          <span className="font-bold text-blue-700">
                            {balance.toLocaleString('fa-IR')} گرم
                          </span>
                        </div>
                        
                        {canSell ? (
                          <div className="text-center">
                            <div className="text-sm text-red-600 mb-2">برای فروش کلیک کنید</div>
                            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-2">موجودی صفر</div>
                            <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                  <li>• فروش فقط از موجودی طلا انجام می‌شود</li>
                  <li>• قیمت‌ها لحظه‌ای و قابل تغییر هستند</li>
                  <li>• پس از تایید فروش، مبلغ به کیف پول ریالی اضافه می‌شود</li>
                  <li>• امکان لغو معامله تا 5 دقیقه پس از تایید وجود دارد</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
