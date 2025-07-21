import React, { useState } from 'react';
import { ArrowDownRight, Shield, AlertCircle, CreditCard } from 'lucide-react';

const WithdrawWallet: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleWithdraw = () => {
    // Withdraw logic here
    console.log('Withdraw:', { amount, bankAccount, twoFactorCode });
  };

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-700">موجودی قابل برداشت</div>
            <div className="text-2xl font-bold text-blue-900">45,250,000 تومان</div>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">ر</span>
          </div>
        </div>
      </div>

      {/* Withdraw Amount */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">مبلغ برداشت</h3>
        <div className="space-y-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مبلغ به تومان"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
          />
          
          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {[1000000, 5000000, 10000000, 'all'].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount === 'all' ? '45250000' : quickAmount.toString())}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                {quickAmount === 'all' ? 'تمام موجودی' : `${quickAmount.toLocaleString()} تومان`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">حساب مقصد</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="شماره شبا (IR123456789012345678901234)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
          />
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">حساب پیش‌فرض</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>شماره شبا: IR123456789012345678901234</p>
              <p>بانک: ملت</p>
              <p>صاحب حساب: علی احمدی</p>
            </div>
            <button
              onClick={() => setBankAccount('IR123456789012345678901234')}
              className="mt-2 text-sm text-gold hover:text-yellow-600"
            >
              استفاده از این حساب
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">تایید دو مرحله‌ای</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="کد تایید 6 رقمی"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            />
            <button className="px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              ارسال کد
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                کد تایید به شماره موبایل 09121234567 ارسال شد
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">خلاصه برداشت</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">مبلغ برداشت:</span>
            <span className="font-medium">{amount ? parseInt(amount).toLocaleString() : '0'} تومان</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">کارمزد:</span>
            <span className="font-medium">5,000 تومان</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>قابل پرداخت:</span>
            <span className="text-red-600">
              {amount ? (parseInt(amount) - 5000).toLocaleString() : '0'} تومان
            </span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              زمان پردازش برداشت 24 تا 48 ساعت کاری است
            </span>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">
              حداقل مبلغ برداشت 100,000 تومان است
            </span>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={!amount || !bankAccount || !twoFactorCode || parseInt(amount) < 100000}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 space-x-reverse"
      >
        <ArrowDownRight className="w-5 h-5" />
        <span>درخواست برداشت</span>
      </button>
    </div>
  );
};

export default WithdrawWallet;