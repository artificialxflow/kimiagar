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
    <div className="bg-white rounded-xl shadow-lg border border-border-100 p-4 hover:shadow-xl transition-all duration-300">
      <h2 className="text-lg font-semibold text-text-800 mb-4 flex items-center">
        <div className="w-1.5 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-2"></div>
        خلاصه کیف پول
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rial Wallet */}
        <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 rounded-lg p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <Wallet className="w-4 h-4 text-green-50" />
              </div>
              <div>
                <h3 className="font-semibold text-text-800 text-sm">کیف پول ریالی</h3>
                <p className="text-xs text-text-600">موجودی فعلی</p>
              </div>
            </div>
          </div>
          <div className="text-xl font-bold text-text-800 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            {Number(rialWallet.balance).toLocaleString('fa-IR')} تومان
          </div>
        </div>

        {/* Gold Wallet */}
        <div className="bg-gradient-to-br from-gold-50 via-gold-100 to-gold-200 rounded-lg p-4 border border-gold-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center mr-3">
                <Wallet className="w-4 h-4 text-gold-50" />
              </div>
              <div>
                <h3 className="font-semibold text-text-800 text-sm">کیف پول طلایی</h3>
                <p className="text-xs text-text-600">موجودی فعلی</p>
              </div>
            </div>
          </div>
          
          {/* موجودی طلا */}
          <div className="text-lg font-bold text-text-800 bg-gradient-to-r from-gold-600 to-gold-700 bg-clip-text text-transparent mb-2">
            {Number(goldWallet.balance).toFixed(2)} گرم طلا
          </div>

          {/* موجودی سکه‌ها */}
          {goldWallet.coins && (
            <div className="space-y-1">
              <div className="text-xs text-text-600 mb-1">موجودی سکه‌ها:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gold-100 rounded px-2 py-1 text-center">
                  <div className="font-semibold text-gold-700">{goldWallet.coins.fullCoin || 0}</div>
                  <div className="text-gold-600">تمام</div>
                </div>
                <div className="bg-gold-100 rounded px-2 py-1 text-center">
                  <div className="font-semibold text-gold-700">{goldWallet.coins.halfCoin || 0}</div>
                  <div className="text-gold-600">نیم</div>
                </div>
                <div className="bg-gold-100 rounded px-2 py-1 text-center">
                  <div className="font-semibold text-gold-700">{goldWallet.coins.quarterCoin || 0}</div>
                  <div className="text-gold-600">ربع</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h3 className="font-semibold text-text-800 mb-3 flex items-center">
          <div className="w-1 h-4 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-2"></div>
          فعالیت اخیر
        </h3>
        <div className="space-y-2">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background-50 rounded-lg border border-border-100 hover:bg-background-100 transition-all duration-300">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    transaction.type === 'DEPOSIT' ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
                  }`}>
                    {transaction.type === 'DEPOSIT' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-800 text-sm">
                      {transaction.type === 'DEPOSIT' ? 'واریز' : 'برداشت'}
                    </p>
                    <p className="text-xs text-text-600">
                      {new Date(transaction.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-800 text-sm">
                    {Number(transaction.amount).toLocaleString('fa-IR')} تومان
                  </p>
                  <p className={`text-xs px-2 py-1 rounded-full ${
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
            <div className="text-center py-4 text-text-500 bg-background-50 rounded-lg border border-border-100">
              <div className="w-12 h-12 bg-background-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wallet className="w-6 h-6 text-text-400" />
              </div>
              <p className="text-text-600 text-sm">هنوز تراکنشی ثبت نشده است</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}