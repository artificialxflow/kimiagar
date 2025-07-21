import React, { useState } from 'react';
import { CreditCard, Upload, Building, AlertCircle, Check } from 'lucide-react';

const ChargeWallet: React.FC = () => {
  const [chargeMethod, setChargeMethod] = useState('online');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const chargeMethods = [
    {
      id: 'online',
      name: 'درگاه آنلاین',
      description: 'پرداخت آنلاین با کارت بانکی',
      icon: CreditCard,
      color: 'bg-blue-500'
    },
    {
      id: 'transfer',
      name: 'کارت به کارت',
      description: 'واریز به شماره کارت',
      icon: Building,
      color: 'bg-green-500'
    },
    {
      id: 'receipt',
      name: 'فیش واریزی',
      description: 'بارگذاری فیش واریز بانکی',
      icon: Upload,
      color: 'bg-gold'
    }
  ];

  const handleCharge = () => {
    // Charge logic here
    console.log('Charge wallet:', { chargeMethod, amount, file });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      {/* Charge Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">روش شارژ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chargeMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setChargeMethod(method.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  chargeMethod === method.id
                    ? 'border-gold bg-gold/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-medium text-slate-900 mb-1">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">مبلغ شارژ</h3>
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
            {[1000000, 5000000, 10000000, 20000000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                {quickAmount.toLocaleString()} تومان
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Method Specific Content */}
      {chargeMethod === 'online' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">درگاه آنلاین</span>
          </div>
          <p className="text-sm text-blue-700">
            پس از کلیک روی "شارژ کیف پول"، به درگاه پرداخت منتقل می‌شوید.
          </p>
        </div>
      )}

      {chargeMethod === 'transfer' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <Building className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">کارت به کارت</span>
          </div>
          <div className="space-y-2 text-sm text-green-700">
            <p>شماره کارت: <span className="font-mono">6037-9919-1234-5678</span></p>
            <p>بانک: ملت</p>
            <p>نام صاحب حساب: شرکت کیمیاگر</p>
          </div>
        </div>
      )}

      {chargeMethod === 'receipt' && (
        <div className="space-y-4">
          <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <Upload className="w-5 h-5 text-gold" />
              <span className="font-medium text-gold">بارگذاری فیش</span>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              فیش واریز بانکی خود را بارگذاری کنید. فیش باید شامل مبلغ، تاریخ و شماره حساب مقصد باشد.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'انتخاب فایل یا بکشید و رها کنید'}
                </span>
              </label>
            </div>
            
            {file && (
              <div className="mt-3 flex items-center space-x-2 space-x-reverse text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">فایل با موفقیت انتخاب شد</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            {chargeMethod === 'online' 
              ? 'درگاه آنلاین امن است و کارمزد نداردد.'
              : chargeMethod === 'transfer'
              ? 'پس از واریز، تا 24 ساعت زمان نیاز است.'
              : 'فیش واریزی باید توسط اپراتور تایید شود.'}
          </span>
        </div>
      </div>

      {/* Charge Button */}
      <button
        onClick={handleCharge}
        disabled={!amount || (chargeMethod === 'receipt' && !file)}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        شارژ کیف پول
      </button>
    </div>
  );
};

export default ChargeWallet;