"use client";
import React, { useState } from 'react';
import { ArrowUpRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function ChargeWallet() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('مبلغ معتبر وارد کنید');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // دریافت اطلاعات کاربر از localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('کاربر یافت نشد');
        return;
      }

      const user = JSON.parse(userData);

      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(amount),
          description: description || 'واریز به کیف پول'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setAmount('');
        setDescription('');
        // به‌روزرسانی صفحه بعد از 2 ثانیه
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'خطا در واریز');
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">شارژ کیف پول</h1>
            <p className="text-slate-600">واریز مبلغ به کیف پول ریالی</p>
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
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="مبلغ را وارد کنید"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="1000"
                    step="1000"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    تومان
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  حداقل مبلغ: 1,000 تومان
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
                  placeholder="توضیحات واریز"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <p className="text-green-600 text-sm">واریز با موفقیت انجام شد!</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'در حال پردازش...' : 'واریز مبلغ'}
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">نکات مهم:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• مبلغ بلافاصله به کیف پول ریالی شما اضافه می‌شود</li>
              <li>• تراکنش در تاریخچه کیف پول ثبت می‌شود</li>
              <li>• از این مبلغ برای خرید طلا و سکه استفاده کنید</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}