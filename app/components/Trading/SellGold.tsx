"use client";
import React, { useState } from 'react';
import { DollarSign, Calculator, AlertCircle } from 'lucide-react';

interface SellGoldProps {
  prices?: any[];
}

export default function SellGold({ prices = [] }: SellGoldProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPrice = prices.find(p => p.productType === selectedProduct);

  const calculateTotal = () => {
    if (!selectedPrice || !amount) return 0;
    const numAmount = parseFloat(amount);
    return numAmount * Number(selectedPrice.sellPrice);
  };

  const calculateCommission = () => {
    const total = calculateTotal();
    // کمیسیون 0.5% برای فروش
    return total * 0.005;
  };

  const calculateFinalTotal = () => {
    return calculateTotal() - calculateCommission();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !amount) {
      setError('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // دریافت اطلاعات کاربر از localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('کاربر یافت نشد');
        return;
      }

      const user = JSON.parse(userData);

      const response = await fetch('/api/trading/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productType: selectedProduct,
          amount: parseFloat(amount),
          isAutomatic
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('سفارش فروش با موفقیت ثبت شد!');
        setSelectedProduct('');
        setAmount('');
        // به‌روزرسانی صفحه بعد از 2 ثانیه
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError(data.error || 'خطا در ثبت سفارش');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">فروش طلا</h2>
        <p className="text-slate-600">انتخاب محصول و مقدار مورد نظر</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            انتخاب محصول
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            required
          >
            <option value="">انتخاب کنید</option>
            {prices.map((price) => (
              <option key={price.id} value={price.productType}>
                {price.productType === 'GOLD_18K' && 'طلای 18 عیار'}
                {price.productType === 'COIN_BAHAR' && 'سکه بهار آزادی'}
                {price.productType === 'COIN_NIM' && 'نیم سکه'}
                {price.productType === 'COIN_ROBE' && 'ربع سکه'}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            مقدار
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مقدار را وارد کنید"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              required
              min="0.01"
              step="0.01"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              {selectedProduct === 'GOLD_18K' ? 'گرم' : 'عدد'}
            </div>
          </div>
        </div>

        {/* Automatic/Manual Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <h3 className="font-medium text-slate-800">نوع معامله</h3>
            <p className="text-sm text-slate-600">
              {isAutomatic ? 'اتوماتیک (فوری)' : 'دستی (تایید اپراتور)'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAutomatic(!isAutomatic)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAutomatic ? 'bg-gold' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAutomatic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Price Calculation */}
        {selectedProduct && selectedPrice && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-slate-800 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              محاسبه قیمت
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">قیمت واحد:</span>
                <span className="font-medium">
                  {Number(selectedPrice.sellPrice).toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">قیمت کل:</span>
                <span className="font-medium">
                  {calculateTotal().toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">کمیسیون (0.5%):</span>
                <span className="font-medium text-red-600">
                  -{calculateCommission().toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">قیمت نهایی:</span>
                  <span className="font-bold text-lg text-slate-800">
                    {calculateFinalTotal().toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedProduct || !amount}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'در حال پردازش...' : 'ثبت سفارش فروش'}
        </button>
      </form>
    </div>
  );
}