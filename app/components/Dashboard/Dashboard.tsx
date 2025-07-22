"use client";
import React, { useState, useEffect } from 'react';
import WalletSummary from './WalletSummary';
import PriceChart from './PriceChart';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import NewsAlerts from './NewsAlerts';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // دریافت اطلاعات کاربر از localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchWalletData(parsedUser.id);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-600 transition-colors"
          >
            بازگشت به ورود
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            خوش آمدید، {user?.firstName || 'کاربر'} {user?.lastName || ''}!
          </h1>
          <p className="text-slate-600">
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

            {/* Price Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">نمودار قیمت طلا</h2>
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