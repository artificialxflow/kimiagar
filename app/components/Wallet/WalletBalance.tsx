import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Eye } from 'lucide-react';

const WalletBalance: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Riyal Wallet */}
        <div className="bg-gradient-to-br from-background-100 to-background-200 rounded-xl p-6 border border-border-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-status-info rounded-xl flex items-center justify-center">
                <span className="text-text-50 font-bold text-lg">ر</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-800">کیف پول ریالی</h3>
                <p className="text-sm text-text-600">IRR</p>
              </div>
            </div>
            <button className="p-2 hover:bg-status-info/20 rounded-lg transition-colors">
              <Eye className="w-5 h-5 text-status-info" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-text-800">45,250,000</div>
            <div className="text-sm text-text-600">تومان</div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse mt-4">
            <div className="flex items-center space-x-1 space-x-reverse text-status-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+2.5%</span>
            </div>
            <span className="text-sm text-text-500">نسبت به ماه گذشته</span>
          </div>
        </div>

        {/* Gold Wallet */}
        <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl p-6 border border-gold-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gold-500 rounded-xl flex items-center justify-center">
                <span className="text-text-50 font-bold text-lg">ط</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-800">کیف پول طلا</h3>
                <p className="text-sm text-text-600">GOLD</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gold-200 rounded-lg transition-colors">
              <Eye className="w-5 h-5 text-gold-600" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-text-800">12.5</div>
            <div className="text-sm text-text-600">گرم</div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse mt-4">
            <div className="flex items-center space-x-1 space-x-reverse text-status-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+1.8%</span>
            </div>
            <span className="text-sm text-text-500">نسبت به ماه گذشته</span>
          </div>
        </div>

        {/* Coins Wallet */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-text-50 font-bold text-lg">س</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-800">کیف پول سکه‌ها</h3>
                <p className="text-sm text-text-600">COINS</p>
              </div>
            </div>
            <button className="p-2 hover:bg-yellow-200 rounded-lg transition-colors">
              <Eye className="w-5 h-5 text-yellow-600" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-text-800">5</div>
            <div className="text-sm text-text-600">سکه</div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-600">تمام:</span>
              <span className="font-semibold text-yellow-700">2</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-600">نیم:</span>
              <span className="font-semibold text-yellow-700">2</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-600">ربع:</span>
              <span className="font-semibold text-yellow-700">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="flex items-center justify-center space-x-3 space-x-reverse bg-status-success/10 hover:bg-status-success/20 border-2 border-status-success/30 rounded-xl p-4 transition-colors duration-200">
          <ArrowUpRight className="w-6 h-6 text-status-success" />
          <span className="text-status-success font-semibold">شارژ کیف پول</span>
        </button>
        <button className="flex items-center justify-center space-x-3 space-x-reverse bg-status-error/10 hover:bg-status-error/20 border-2 border-status-error/30 rounded-xl p-4 transition-colors duration-200">
          <ArrowDownRight className="w-6 h-6 text-status-error" />
          <span className="text-status-error font-semibold">برداشت وجه</span>
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="bg-background-100 rounded-xl p-6 border border-border-100">
        <h3 className="text-lg font-semibold text-text-800 mb-4">آمار کلی</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-800">127</div>
            <div className="text-sm text-text-600">کل تراکنش‌ها</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-success">85,250,000</div>
            <div className="text-sm text-text-600">کل شارژ (تومان)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-error">40,000,000</div>
            <div className="text-sm text-text-600">کل برداشت (تومان)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;