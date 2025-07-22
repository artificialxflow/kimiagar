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
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">خلاصه کیف پول</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rial Wallet */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">کیف پول ریالی</h3>
                <p className="text-sm text-slate-600">موجودی فعلی</p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {Number(rialWallet.balance).toLocaleString('fa-IR')} تومان
          </div>
        </div>

        {/* Gold Wallet */}
        <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mr-3">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">کیف پول طلایی</h3>
                <p className="text-sm text-slate-600">موجودی فعلی</p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {Number(goldWallet.balance).toFixed(2)} گرم
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h3 className="font-semibold text-slate-800 mb-3">فعالیت اخیر</h3>
        <div className="space-y-2">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    transaction.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'DEPOSIT' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {transaction.type === 'DEPOSIT' ? 'واریز' : 'برداشت'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(transaction.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">
                    {Number(transaction.amount).toLocaleString('fa-IR')} تومان
                  </p>
                  <p className={`text-sm ${
                    transaction.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {transaction.status === 'COMPLETED' ? 'تکمیل شده' : 'در انتظار'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p>هنوز تراکنشی ثبت نشده است</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}