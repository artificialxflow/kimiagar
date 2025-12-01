"use client";
import React, { useState, useEffect } from 'react';
import { ArrowDownRight, Shield, AlertCircle, CreditCard, CheckCircle } from 'lucide-react';
import { formatRial } from '@/app/lib/utils';
import { useFormattedRialInput } from '@/app/hooks/useFormattedRialInput';

export default function WithdrawWallet() {
  const {
    value: amount,
    numericValue,
    onChange: handleAmountChange,
    setFormattedValue: setAmount,
    reset: resetAmount,
  } = useFormattedRialInput();
  const [bankAccount, setBankAccount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // دریافت موجودی کیف پول
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        const response = await fetch(`/api/wallet/balance?userId=${user.id}`);
        const data = await response.json();

        if (response.ok && data.wallets) {
          const rialWallet = data.wallets.find((w: any) => w.type === 'RIAL');
          if (rialWallet) {
            setWalletBalance(Number(rialWallet.balance));
          }
        }
      } catch (error) {
        console.error('خطا در دریافت موجودی:', error);
      }
    };

    fetchBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bankAccount) {
      setError('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    if (numericValue < 10000) {
      setError('حداقل مبلغ برداشت 10,000 تومان است');
      return;
    }

    if (numericValue > walletBalance) {
      setError('موجودی کافی نیست');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('کاربر یافت نشد');
        return;
      }

      const user = JSON.parse(userData);

      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: numericValue,
          bankAccount,
          description: description || `برداشت به حساب ${bankAccount}`
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        resetAmount();
        setBankAccount('');
        setDescription('');
        // به‌روزرسانی موجودی
        setWalletBalance(prev => prev - numericValue);
        // به‌روزرسانی صفحه بعد از 3 ثانیه
        setTimeout(() => {
          window.location.href = '/wallet';
        }, 3000);
      } else {
        setError(data.error || 'خطا در ثبت درخواست');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowDownRight className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">برداشت از کیف پول</h1>
            <p className="text-slate-600">برداشت مبلغ از کیف پول ریالی</p>
          </div>

          {/* Current Balance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700">موجودی قابل برداشت</div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatRial(walletBalance)} تومان
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">ر</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  مبلغ (تومان)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="مبلغ را وارد کنید"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    تومان
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  حداقل مبلغ: 10,000 تومان
                </p>
                
                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[100000, 500000, 1000000, walletBalance].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                    >
                      {quickAmount === walletBalance ? 'تمام موجودی' : formatRial(quickAmount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Account Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  شماره شبا
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="IR123456789012345678901234"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  شماره شبا 24 رقمی را وارد کنید
                </p>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات برداشت"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Display */}
              {success && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-600 text-sm">درخواست برداشت با موفقیت ثبت شد!</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !amount ||
                  !bankAccount ||
                  numericValue < 10000 ||
                  numericValue > walletBalance
                }
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'در حال پردازش...' : 'درخواست برداشت'}
              </button>
            </form>
          </div>

          {/* Info Cards */}
          <div className="mt-6 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">نکات مهم:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• زمان پردازش برداشت 24 تا 48 ساعت کاری است</li>
                <li>• حداقل مبلغ برداشت 10,000 تومان است</li>
                <li>• کارمزد برداشت 5,000 تومان است</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">امنیت:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• تمام تراکنش‌ها رمزگذاری شده‌اند</li>
                <li>• درخواست‌ها توسط اپراتور بررسی می‌شوند</li>
                <li>• در صورت مشکوک بودن، تراکنش لغو می‌شود</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}