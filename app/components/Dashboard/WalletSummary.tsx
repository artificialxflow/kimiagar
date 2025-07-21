import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const WalletSummary: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">خلاصه کیف پول</h2>
        <Wallet className="w-6 h-6 text-gold" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Riyal Wallet */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">کیف پول ریالی</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">ر</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-900">45,250,000</div>
            <div className="text-sm text-gray-600">تومان</div>
          </div>
        </div>

        {/* Gold Wallet */}
        <div className="bg-gradient-to-br from-gold/10 to-yellow-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">کیف پول طلا</h3>
            <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
              <span className="text-gold font-bold text-sm">ط</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-900">12.5</div>
            <div className="text-sm text-gray-600">گرم</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">آخرین فعالیت‌ها</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">شارژ کیف پول</div>
                <div className="text-xs text-gray-500">امروز، 14:30</div>
              </div>
            </div>
            <div className="text-sm font-medium text-green-600">+5,000,000 تومان</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-gold" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">خرید طلا</div>
                <div className="text-xs text-gray-500">دیروز، 10:15</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gold">+2.5 گرم</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSummary;