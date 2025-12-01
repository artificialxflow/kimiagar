"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WalletSummary from './WalletSummary';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import { RefreshCw } from 'lucide-react';

// Lazy load heavy components
const PriceChart = dynamic(() => import('./PriceChart'), { 
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center"><p className="text-gray-500">در حال بارگذاری نمودار...</p></div> 
});
const CoinPriceChart = dynamic(() => import('./CoinPriceChart'), { 
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center"><p className="text-gray-500">در حال بارگذاری نمودار سکه...</p></div> 
});
const NewsAlerts = dynamic(() => import('./NewsAlerts'), { 
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center"><p className="text-gray-500">در حال بارگذاری اخبار...</p></div> 
});
const ExternalPricesList = dynamic(() => import('./ExternalPricesList'), { 
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-48 flex items-center justify-center"><p className="text-gray-500">در حال بارگذاری قیمت‌ها...</p></div> 
});

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [pricesData, setPricesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // دریافت اطلاعات کاربر از localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchWalletData(parsedUser.id);
      fetchPricesData();
    } else {
      setError('کاربر یافت نشد');
      setLoading(false);
    }
  }, []);

  const fetchWalletData = async (userId: string) => {
    try {
      const response = await fetch(`/api/wallet/balance?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setWalletData(data);
      } else {
        setError(data.error || 'خطا در دریافت اطلاعات کیف پول');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricesData = async () => {
    setPricesLoading(true);
    try {
      // ابتدا تست اتصال به API خارجی
      console.log('در حال تست اتصال به API خارجی...');
      
      // دریافت قیمت‌های خارجی از API
      const response = await fetch('/api/prices/external');
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setPricesData(data);
        setLastUpdate(new Date().toISOString());
        console.log('قیمت‌های خارجی با موفقیت دریافت شد:', data);
      } else {
        console.error('خطا در دریافت قیمت‌های خارجی:', data.error);
        // نمایش خطا در UI
        setPricesData({ error: data.error, message: data.message });
      }
    } catch (error) {
      console.error('خطا در اتصال به سرور قیمت‌های خارجی:', error);
      // نمایش خطا در UI
      setPricesData({ 
        error: 'خطا در اتصال به سرور', 
        message: 'سرور قیمت‌های خارجی در دسترس نیست' 
      });
    } finally {
      setPricesLoading(false);
    }
  };

  const refreshPrices = async () => {
    await fetchPricesData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-text-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-text-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-gold-500 text-text-50 rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            بازگشت به ورود
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text-800 mb-3 bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">
            خوش آمدید، {user?.firstName || 'کاربر'} {user?.lastName || ''}!
          </h1>
          <p className="text-text-600 text-lg">
            آخرین به‌روزرسانی: {new Date().toLocaleDateString('fa-IR')}
          </p>
        </div>

        {/* Main Grid - Desktop Layout */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-8">
            {/* Wallet Summary */}
            <WalletSummary 
              wallets={walletData?.wallets || []}
              transactions={walletData?.recentTransactions || []}
              coins={walletData?.coins}
            />

            {/* Recent Transactions */}
            <RecentTransactions 
              transactions={walletData?.recentTransactions || []}
            />

              {/* Price Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
                <h2 className="text-xl font-semibold text-text-800 mb-4 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
                  نمودار قیمت طلا
                </h2>
                <PriceChart />
              </div>

              {/* Coin Price Chart */}
              <CoinPriceChart />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <QuickActions />

            {/* News & Alerts */}
            <NewsAlerts />
          </div>
        </div>

        {/* Mobile Layout - New Order */}
        <div className="lg:hidden space-y-8">
          {/* 1. Wallet Summary */}
          <WalletSummary 
            wallets={walletData?.wallets || []}
            transactions={walletData?.recentTransactions || []}
            coins={walletData?.coins}
          />

          {/* 2. Quick Actions */}
          <QuickActions />

          {/* 3. Recent Transactions */}
          <RecentTransactions 
            transactions={walletData?.recentTransactions || []}
          />

            {/* 4. Price Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-semibold text-text-800 mb-4 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
                نمودار قیمت طلا
              </h2>
              <PriceChart />
            </div>

            {/* 5. Coin Price Chart */}
            <CoinPriceChart />

            {/* 6. News & Alerts */}
            <NewsAlerts />
        </div>
      </div>
    </div>
  );
}