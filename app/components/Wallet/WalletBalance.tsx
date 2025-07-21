import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Eye } from 'lucide-react';

const WalletBalance: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Riyal Wallet */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">ر</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">کیف پول ریالی</h3>
                <p className="text-sm text-gray-600">IRR</p>
              </div>
            </div>
            <button className="p-2 hover:bg-blue-200 rounded-lg transition-colors">
              <Eye className="w-5 h-5 text-blue-600" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">45,250,000</div>
            <div className="text-sm text-gray-600">تومان</div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse mt-4">
            <div className="flex items-center space-x-1 space-x-reverse text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+2.5%</span>
            </div>
            <span className="text-sm text-gray-500">نسبت به ماه گذشته</span>
          </div>
        </div>

        {/* Gold Wallet */}
        <div className="bg-gradient-to-br from-gold/10 to-yellow-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center">
                <span className="text-slate-900 font-bold text-lg">ط</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">کیف پول طلا</h3>
                <p className="text-sm text-gray-600">GOLD</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gold/20 rounded-lg transition-colors">
              <Eye className="w-5 h-5 text-gold" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">12.5</div>
            <div className="text-sm text-gray-600">گرم</div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse mt-4">
            <div className="flex items-center space-x-1 space-x-reverse text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+1.8%</span>
            </div>
            <span className="text-sm text-gray-500">نسبت به ماه گذشته</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="flex items-center justify-center space-x-3 space-x-reverse bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl p-4 transition-colors duration-200">
          <ArrowUpRight className="w-6 h-6 text-green-600" />
          <span className="text-green-800 font-semibold">شارژ کیف پول</span>
        </button>
        <button className="flex items-center justify-center space-x-3 space-x-reverse bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl p-4 transition-colors duration-200">
          <ArrowDownRight className="w-6 h-6 text-red-600" />
          <span className="text-red-800 font-semibold">برداشت وجه</span>
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">آمار کلی</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">127</div>
            <div className="text-sm text-gray-600">کل تراکنش‌ها</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">85,250,000</div>
            <div className="text-sm text-gray-600">کل شارژ (تومان)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">40,000,000</div>
            <div className="text-sm text-gray-600">کل برداشت (تومان)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;