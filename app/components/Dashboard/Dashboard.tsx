"use client";

import React from 'react';
import PriceCard from './PriceCard';
import WalletSummary from './WalletSummary';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import PriceChart from './PriceChart';
import NewsAlerts from './NewsAlerts';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">داشبورد کیمیاگر</h1>
        <p className="text-gray-300">خوش آمدید! آخرین قیمت‌ها و وضعیت حساب شما</p>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PriceCard
          title="طلای 18 عیار"
          price="2,850,000"
          change="+2.5%"
          changeType="positive"
          unit="تومان/گرم"
        />
        <PriceCard
          title="سکه بهار آزادی"
          price="28,500,000"
          change="-1.2%"
          changeType="negative"
          unit="تومان"
        />
        <PriceCard
          title="نیم سکه"
          price="15,200,000"
          change="+0.8%"
          changeType="positive"
          unit="تومان"
        />
        <PriceCard
          title="ربع سکه"
          price="8,750,000"
          change="+1.5%"
          changeType="positive"
          unit="تومان"
        />
      </div>

      {/* Wallet Summary and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WalletSummary />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Charts and News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceChart />
        <NewsAlerts />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
};

export default Dashboard;