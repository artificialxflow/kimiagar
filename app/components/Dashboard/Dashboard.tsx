"use client";
import React, { useState, useEffect } from 'react';
import WalletSummary from './WalletSummary';
import PriceChart from './PriceChart';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import NewsAlerts from './NewsAlerts';
import ExternalPricesList from './ExternalPricesList';
import { RefreshCw } from 'lucide-react';

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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wallet Summary */}
            <WalletSummary 
              wallets={walletData?.wallets || []}
              transactions={walletData?.recentTransactions || []}
            />

            {/* Live Prices Section - فقط قیمت‌های خارجی */}
            <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-800 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
                  قیمت‌های لحظه‌ای طلا و سکه
                </h2>
                <button
                  onClick={refreshPrices}
                  disabled={pricesLoading}
                  className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${pricesLoading ? 'animate-spin' : ''}`} />
                  <span>بروزرسانی</span>
                </button>
              </div>

              {/* External Prices List */}
              <div className="space-y-4">
                {pricesData?.data ? (
                  <ExternalPricesList 
                    externalPrices={pricesData.data}
                    loading={pricesLoading}
                  />
                ) : pricesData?.error ? (
                  // نمایش خطا
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-lg font-medium text-red-600">خطا در دریافت قیمت‌ها</p>
                      <p className="text-sm text-red-500">{pricesData.message}</p>
                    </div>
                  </div>
                ) : (
                  // اگر قیمت‌های خارجی موجود نیست، پیام مناسب نمایش بده
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

              {/* External API Status */}
              {pricesData && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>تعداد قیمت‌ها: {pricesData.count || 0}</span>
                      <span>آخرین بروزرسانی: {pricesData.timestamp ? new Date(pricesData.timestamp).toLocaleTimeString('fa-IR') : 'نامشخص'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>وضعیت API:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        متصل
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-semibold text-text-800 mb-4 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
                نمودار قیمت طلا
              </h2>
              <PriceChart />
            </div>

            {/* Recent Transactions */}
            <RecentTransactions 
              transactions={walletData?.recentTransactions || []}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <QuickActions />

            {/* News & Alerts */}
            <NewsAlerts />
          </div>
        </div>
      </div>
    </div>
  );
}