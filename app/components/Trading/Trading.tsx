"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BuyGold from './BuyGold';
import SellGold from './SellGold';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Trading() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // خواندن tab از URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'buy';
    setActiveTab(tab as 'buy' | 'sell');
  }, [searchParams]);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/prices');
      const data = await response.json();

      if (response.ok) {
        setPrices(data.prices || []);
      } else {
        setError(data.error || 'خطا در دریافت قیمت‌ها');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productType: string) => {
    switch (productType) {
      case 'GOLD_18K':
        return 'طلای 18 عیار';
      case 'COIN_BAHAR':
        return 'سکه بهار آزادی';
      case 'COIN_NIM':
        return 'نیم سکه';
      case 'COIN_ROBE':
        return 'ربع سکه';
      case 'COIN_BAHAR_86':
        return 'سکه بهار آزادی 86';
      case 'COIN_NIM_86':
        return 'نیم سکه 86';
      case 'COIN_ROBE_86':
        return 'ربع سکه 86';
      default:
        return productType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-slate-600">در حال بارگذاری قیمت‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">خرید و فروش طلا</h1>
          <p className="text-slate-600">قیمت‌های لحظه‌ای و معاملات</p>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {prices.map((price) => (
            <div key={price.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">
                  {getProductName(price.productType)}
                </h3>
                <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
                  <span className="text-gold font-bold text-sm">ط</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">قیمت خرید:</span>
                  <span className="font-semibold text-green-600">
                    {Number(price.buyPrice).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">قیمت فروش:</span>
                  <span className="font-semibold text-red-600">
                    {Number(price.sellPrice).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">حاشیه:</span>
                  <span className="font-semibold text-slate-800">
                    {Number(price.margin).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trading Tabs */}
        <div className="bg-white rounded-2xl shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab('buy');
                // به‌روزرسانی URL
                window.history.pushState({}, '', '/trading?tab=buy');
              }}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'buy'
                  ? 'text-gold border-b-2 border-gold bg-gold-50'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                خرید طلا
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('sell');
                // به‌روزرسانی URL
                window.history.pushState({}, '', '/trading?tab=sell');
              }}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'sell'
                  ? 'text-gold border-b-2 border-gold bg-gold-50'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center justify-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                فروش طلا
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'buy' ? (
              <BuyGold prices={prices} />
            ) : (
              <SellGold prices={prices} />
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}