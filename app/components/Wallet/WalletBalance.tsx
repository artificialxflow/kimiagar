"use client";
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const WalletBalance: React.FC = () => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [coins, setCoins] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError('');

      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`/api/wallet/balance?userId=${user.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setWallets(data.wallets || []);
        setStatistics(data.statistics || {});
        setCoins(data.coins || { fullCoin: 0, halfCoin: 0, quarterCoin: 0, total: 0 });
      } else {
        setError(data.error || 'خطا در دریافت اطلاعات کیف پول');
      }
    } catch (error: any) {
      console.error('خطا در دریافت موجودی:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const rialWallet = wallets.find(w => w.type === 'RIAL') || { balance: 0 };
  const goldWallet = wallets.find(w => w.type === 'GOLD') || { balance: 0 };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  const formatGold = (value: number) => {
    return new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 3
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-600 mx-auto mb-4" />
          <p className="text-text-600">در حال بارگذاری موجودی...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchWalletData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Riyal Wallet */}
        <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl p-6 border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">ر</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">کیف پول ریالی</h3>
                <p className="text-xs text-slate-600 font-medium">IRR</p>
              </div>
            </div>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 hover:bg-blue-200/50 rounded-lg transition-colors"
              title={balanceVisible ? 'مخفی کردن موجودی' : 'نمایش موجودی'}
            >
              {balanceVisible ? (
                <Eye className="w-5 h-5 text-blue-700" />
              ) : (
                <EyeOff className="w-5 h-5 text-blue-700" />
              )}
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-slate-800">
              {balanceVisible ? formatCurrency(Number(rialWallet.balance)) : '••••••••'}
            </div>
            <div className="text-sm text-slate-600 font-medium">تومان</div>
          </div>
        </div>

        {/* Gold Wallet */}
        <div className="bg-gradient-to-br from-gold-50 via-gold-100 to-gold-200 rounded-2xl p-6 border-2 border-gold-300 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">ط</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">کیف پول طلا</h3>
                <p className="text-xs text-slate-600 font-medium">GOLD</p>
              </div>
            </div>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 hover:bg-gold-200/50 rounded-lg transition-colors"
              title={balanceVisible ? 'مخفی کردن موجودی' : 'نمایش موجودی'}
            >
              {balanceVisible ? (
                <Eye className="w-5 h-5 text-gold-700" />
              ) : (
                <EyeOff className="w-5 h-5 text-gold-700" />
              )}
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-slate-800">
              {balanceVisible ? formatGold(Number(goldWallet.balance)) : '••••••'}
            </div>
            <div className="text-sm text-slate-600 font-medium">گرم</div>
          </div>
        </div>

        {/* Coins Wallet */}
        <div className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 rounded-2xl p-6 border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">س</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">کیف پول سکه‌ها</h3>
                <p className="text-xs text-slate-600 font-medium">COINS</p>
              </div>
            </div>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 hover:bg-yellow-200/50 rounded-lg transition-colors"
              title={balanceVisible ? 'مخفی کردن موجودی' : 'نمایش موجودی'}
            >
              {balanceVisible ? (
                <Eye className="w-5 h-5 text-yellow-700" />
              ) : (
                <EyeOff className="w-5 h-5 text-yellow-700" />
              )}
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-slate-800">
              {balanceVisible ? (coins?.total || 0) : '•••'}
            </div>
            <div className="text-sm text-slate-600 font-medium">سکه</div>
          </div>
          {balanceVisible && coins && (
            <div className="mt-4 pt-4 border-t border-yellow-300 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">تمام:</span>
                <span className="font-bold text-yellow-800">{coins.fullCoin || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">نیم:</span>
                <span className="font-bold text-yellow-800">{coins.halfCoin || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">ربع:</span>
                <span className="font-bold text-yellow-800">{coins.quarterCoin || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/wallet?tab=charge')}
          className="flex items-center justify-center space-x-3 space-x-reverse bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-5 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ArrowUpRight className="w-6 h-6" />
          <span className="font-bold text-lg">شارژ کیف پول</span>
        </button>
        <button
          onClick={() => router.push('/wallet?tab=withdraw')}
          className="flex items-center justify-center space-x-3 space-x-reverse bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl p-5 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ArrowDownRight className="w-6 h-6" />
          <span className="font-bold text-lg">برداشت وجه</span>
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <div className="w-1.5 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
          آمار کلی
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {statistics ? formatCurrency(statistics.totalTransactions || 0) : '0'}
            </div>
            <div className="text-sm text-slate-600 font-medium">کل تراکنش‌ها</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {statistics ? formatCurrency(statistics.totalDeposit || 0) : '0'}
            </div>
            <div className="text-sm text-slate-600 font-medium">کل شارژ (تومان)</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {statistics ? formatCurrency(statistics.totalWithdraw || 0) : '0'}
            </div>
            <div className="text-sm text-slate-600 font-medium">کل برداشت (تومان)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;
