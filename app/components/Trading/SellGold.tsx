import React, { useState } from 'react';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';

const SellGold: React.FC = () => {
  const [selectedType, setSelectedType] = useState('gold');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('automatic');

  const goldTypes = [
    { id: 'gold', name: 'طلای 18 عیار', price: 2800000, unit: 'تومان/گرم', available: 12.5 },
    { id: 'coin_bahar', name: 'سکه بهار آزادی', price: 28000000, unit: 'تومان', available: 2 },
    { id: 'coin_half', name: 'نیم سکه', price: 14800000, unit: 'تومان', available: 1 },
    { id: 'coin_quarter', name: 'ربع سکه', price: 8500000, unit: 'تومان', available: 0 }
  ];

  const selectedGold = goldTypes.find(g => g.id === selectedType);
  const totalPrice = selectedGold ? selectedGold.price * (parseFloat(amount) || 0) : 0;

  const handleSell = () => {
    // Sell logic here
    console.log('Sell order:', { selectedType, amount, orderType, totalPrice });
  };

  return (
    <div className="space-y-6">
      {/* Gold Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">انتخاب نوع طلا</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goldTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              disabled={type.available === 0}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedType === type.id
                  ? 'border-gold bg-gold/10'
                  : type.available === 0
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-right">
                <div className="font-medium text-slate-900 mb-1">{type.name}</div>
                <div className="text-lg font-bold text-red-600 mb-1">
                  {type.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mb-1">{type.unit}</div>
                <div className="text-xs text-gray-600">
                  موجودی: {type.available} {type.id === 'gold' ? 'گرم' : 'عدد'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">مقدار فروش</h3>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex-1">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={selectedGold?.id === 'gold' ? 'مقدار به گرم' : 'تعداد سکه'}
              max={selectedGold?.available}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            />
          </div>
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-gold" />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          حداکثر قابل فروش: {selectedGold?.available} {selectedGold?.id === 'gold' ? 'گرم' : 'عدد'}
        </div>
      </div>

      {/* Order Type */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">نوع سفارش</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 space-x-reverse">
            <input
              type="radio"
              value="automatic"
              checked={orderType === 'automatic'}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-4 h-4 text-gold focus:ring-gold"
            />
            <div>
              <div className="font-medium text-slate-900">فروش اتوماتیک</div>
              <div className="text-sm text-gray-500">سفارش فوری با قیمت فعلی</div>
            </div>
          </label>
          <label className="flex items-center space-x-3 space-x-reverse">
            <input
              type="radio"
              value="manual"
              checked={orderType === 'manual'}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-4 h-4 text-gold focus:ring-gold"
            />
            <div>
              <div className="font-medium text-slate-900">فروش دستی</div>
              <div className="text-sm text-gray-500">سفارش با تایید اپراتور</div>
            </div>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">خلاصه سفارش</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">نوع طلا:</span>
            <span className="font-medium">{selectedGold?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">مقدار:</span>
            <span className="font-medium">{amount || '0'} {selectedGold?.id === 'gold' ? 'گرم' : 'عدد'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">قیمت واحد:</span>
            <span className="font-medium">{selectedGold?.price.toLocaleString()} تومان</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>مجموع:</span>
            <span className="text-red-600">{totalPrice.toLocaleString()} تومان</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            در صورت فروش، مبلغ به کیف پول ریالی شما واریز می‌شود
          </span>
        </div>
      </div>

      {/* Sell Button */}
      <button
        onClick={handleSell}
        disabled={!amount || totalPrice === 0 || parseFloat(amount) > (selectedGold?.available || 0)}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 space-x-reverse"
      >
        <TrendingUp className="w-5 h-5" />
        <span>ثبت سفارش فروش</span>
      </button>
    </div>
  );
};

export default SellGold;