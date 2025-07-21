import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BuyGold from './BuyGold';
import SellGold from './SellGold';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Trading: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'buy';
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'buy', name: 'خرید', icon: TrendingUp, color: 'text-green-600' },
    { id: 'sell', name: 'فروش', icon: TrendingDown, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">خرید و فروش طلا</h1>
        <p className="text-gray-300">خرید و فروش طلا و سکه با بهترین قیمت‌ها</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-1 space-x-reverse mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'buy' && <BuyGold />}
          {activeTab === 'sell' && <SellGold />}
        </div>
      </div>
    </div>
  );
};

export default Trading;