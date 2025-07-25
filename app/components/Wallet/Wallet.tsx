"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import WalletBalance from './WalletBalance';
import ChargeWallet from './ChargeWallet';
import WithdrawWallet from './WithdrawWallet';
import TransactionHistory from './TransactionHistory';

const Wallet: React.FC = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('balance');

  // دریافت tab از URL در useEffect
  useEffect(() => {
    const tab = searchParams.get('tab') || 'balance';
    setActiveTab(tab);
  }, [searchParams]);

  const tabs = [
    { id: 'balance', name: 'موجودی', icon: WalletIcon },
    { id: 'charge', name: 'شارژ', icon: ArrowUpRight },
    { id: 'withdraw', name: 'برداشت', icon: ArrowDownRight },
    { id: 'history', name: 'تاریخچه', icon: History }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">کیف پول</h1>
        <p className="text-gray-300">مدیریت کیف پول ریالی و طلایی</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-1 space-x-reverse mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'balance' && <WalletBalance />}
          {activeTab === 'charge' && <ChargeWallet />}
          {activeTab === 'withdraw' && <WithdrawWallet />}
          {activeTab === 'history' && <TransactionHistory />}
        </div>
      </div>
    </div>
  );
};

export default Wallet;