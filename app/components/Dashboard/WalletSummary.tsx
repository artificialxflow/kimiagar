"use client";
import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import {
  buildTransactionDescription,
  formatTransactionAmount,
  getTransactionTypeLabel,
  normalizeTransactionMetadata,
  formatRial,
  formatGoldValue,
  formatNumber
} from '@/app/lib/utils';

interface WalletSummaryProps {
  wallets?: any[];
  transactions?: any[];
  coins?: {
    fullCoin: number;
    halfCoin: number;
    quarterCoin: number;
    total?: number;
  };
}

export default function WalletSummary({ wallets = [], transactions = [], coins }: WalletSummaryProps) {
  const rialWallet = wallets.find((w: any) => w.type === 'RIAL') || { balance: 0 };
  const goldWallet = wallets.find((w: any) => w.type === 'GOLD') || { balance: 0 };
  const coinsBalance = coins || { fullCoin: 0, halfCoin: 0, quarterCoin: 0 };

  const totalTransactions = transactions.length;
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-border-100 p-4 hover:shadow-xl transition-all duration-300">
      <h2 className="text-lg font-semibold text-text-800 mb-4 flex items-center">
        <div className="w-1.5 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-2"></div>
        خلاصه کیف پول
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {formatRial(Number(rialWallet.balance))} تومان
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

        </div>

        {/* Coins Wallet */}
        <div className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 rounded-lg p-4 border border-yellow-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-3">
                <Wallet className="w-4 h-4 text-yellow-50" />
              </div>
              <div>
                <h3 className="font-semibold text-text-800 text-sm">کیف پول سکه</h3>
                <p className="text-xs text-text-600">تعداد فعلی</p>
              </div>
            </div>
          </div>
          <div className="text-xl font-bold text-text-800 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-2">
            {formatNumber(coinsBalance.fullCoin + coinsBalance.halfCoin + coinsBalance.quarterCoin)} عدد
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-yellow-100 rounded px-2 py-1">
              <span className="text-yellow-700 font-medium">تمام:</span>
              <span className="font-bold text-yellow-800">{formatNumber(coinsBalance.fullCoin)}</span>
            </div>
            <div className="flex justify-between items-center bg-yellow-100 rounded px-2 py-1">
              <span className="text-yellow-700 font-medium">نیم:</span>
              <span className="font-bold text-yellow-800">{formatNumber(coinsBalance.halfCoin)}</span>
            </div>
            <div className="flex justify-between items-center bg-yellow-100 rounded px-2 py-1">
              <span className="text-yellow-700 font-medium">ربع:</span>
              <span className="font-bold text-yellow-800">{formatNumber(coinsBalance.quarterCoin)}</span>
            </div>
          </div>
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
            recentTransactions.map((transaction: any, index: number) => {
              const metadata = normalizeTransactionMetadata(transaction.metadata);
              const amountText = formatTransactionAmount(
                transaction.amount,
                metadata.productType,
                transaction.wallet?.type
              );
              const typeLabel = getTransactionTypeLabel(transaction.type);
              const descriptionText = buildTransactionDescription(transaction.description, metadata);
              const date = new Date(transaction.createdAt);
              const dateText = date.toLocaleDateString('fa-IR');
              const timeText = date.toLocaleTimeString('fa-IR');

              return (
                <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-background-50 rounded-lg border border-border-100 hover:bg-background-100 transition-all duration-300">
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
                        {typeLabel}
                      </p>
                      <p className="text-xs text-text-600">
                        {descriptionText}
                      </p>
                      <p className="text-[10px] text-text-500 mt-0.5">
                        {dateText} - {timeText}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-800 text-sm">
                      {amountText}
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
              );
            })
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