"use client";
import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface WalletSummaryProps {
  wallets?: any[];
  transactions?: any[];
}

export default function WalletSummary({ wallets = [], transactions = [] }: WalletSummaryProps) {
  const rialWallet = wallets.find((w: any) => w.type === 'RIAL') || { balance: 0 };
  const goldWallet = wallets.find((w: any) => w.type === 'GOLD') || { balance: 0 };

  const totalTransactions = transactions.length;
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl font-semibold text-text-800 mb-6 flex items-center">
        <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
        خلاصه کیف پول
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rial Wallet */}
        <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Wallet className="w-6 h-6 text-green-50" />
              </div>
              <div>
                <h3 className="font-semibold text-text-800 text-lg">کیف پول ریالی</h3>
                <p className="text-sm text-text-600">موجودی فعلی</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-text-800 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            {Number(rialWallet.balance).toLocaleString('fa-IR')} تومان
          </div>
        </div>

        {/* Gold Wallet */}
        <div className="bg-gradient-to-br from-gold-50 via-gold-100 to-gold-200 rounded-xl p-6 border border-gold-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Wallet className="w-6 h-6 text-gold-50" />
              </div>
              <div>
                <h3 className="font-semibold text-text-800 text-lg">کیف پول طلایی</h3>
                <p className="text-sm text-text-600">موجودی فعلی</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-text-800 bg-gradient-to-r from-gold-600 to-gold-700 bg-clip-text text-transparent">
            {Number(goldWallet.balance).toFixed(2)} گرم
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="font-semibold text-text-800 mb-4 flex items-center">
          <div className="w-1.5 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-2"></div>
          فعالیت اخیر
        </h3>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background-50 rounded-xl border border-border-100 hover:bg-background-100 transition-all duration-300">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                    transaction.type === 'DEPOSIT' ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
                  }`}>
                    {transaction.type === 'DEPOSIT' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-800">
                      {transaction.type === 'DEPOSIT' ? 'واریز' : 'برداشت'}
                    </p>
                    <p className="text-sm text-text-600">
                      {new Date(transaction.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-800">
                    {Number(transaction.amount).toLocaleString('fa-IR')} تومان
                  </p>
                  <p className={`text-sm px-3 py-1 rounded-full ${
                    transaction.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}>
                    {transaction.status === 'COMPLETED' ? 'تکمیل شده' : 'در انتظار'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-text-500 bg-background-50 rounded-xl border border-border-100">
              <div className="w-16 h-16 bg-background-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-text-400" />
              </div>
              <p className="text-text-600">هنوز تراکنشی ثبت نشده است</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}