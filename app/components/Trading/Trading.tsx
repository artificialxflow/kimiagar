"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BuyGold from './BuyGold';
import SellGold from './SellGold';
import PhysicalDelivery from './PhysicalDelivery';
import { TrendingUp, TrendingDown, Truck } from 'lucide-react';

export default function Trading() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'delivery'>('buy');
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // خواندن tab از URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'buy';
    setActiveTab(tab as 'buy' | 'sell' | 'delivery');
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
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-text-600">در حال بارگذاری قیمت‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text-800 mb-3 bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">
            خرید و فروش طلا
          </h1>
          <p className="text-text-600 text-lg">قیمت‌های لحظه‌ای و معاملات</p>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {prices.map((price) => (
            <div key={price.id} className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-800 text-lg">
                  {getProductName(price.productType)}
                </h3>
                <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-gold-50 font-bold text-sm">ط</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-green-700 font-medium">قیمت خرید:</span>
                  <span className="font-bold text-green-700 text-lg">
                    {Number(price.buyPrice).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm text-red-700 font-medium">قیمت فروش:</span>
                  <span className="font-bold text-red-700 text-lg">
                    {Number(price.sellPrice).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm text-blue-700 font-medium">حاشیه:</span>
                  <span className="font-bold text-blue-700">
                    {Number(price.sellPrice - price.buyPrice).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-border-100 overflow-hidden">
          <div className="flex border-b border-border-100">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
                activeTab === 'buy'
                  ? 'bg-gold-50 text-gold-700 border-b-2 border-gold-500'
                  : 'text-text-600 hover:text-gold-600 hover:bg-background-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <TrendingUp className="w-5 h-5" />
                <span>خرید طلا</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
                activeTab === 'sell'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
                  : 'text-text-600 hover:text-red-600 hover:bg-background-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <TrendingDown className="w-5 h-5" />
                <span>فروش طلا</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
                activeTab === 'delivery'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-text-600 hover:text-blue-600 hover:bg-background-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <Truck className="w-5 h-5" />
                <span>تحویل فیزیکی</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'buy' && <BuyGold prices={prices} />}
            {activeTab === 'sell' && <SellGold prices={prices} />}
            {activeTab === 'delivery' && <PhysicalDelivery prices={prices} />}
          </div>
        </div>
      </div>
    </div>
  );
}