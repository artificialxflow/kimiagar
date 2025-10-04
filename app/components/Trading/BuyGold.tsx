"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calculator, AlertCircle, Scale, DollarSign, Wallet, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';

interface BuyGoldProps {
  prices?: any[];
}

export default function BuyGold({ prices = [] }: BuyGoldProps) {
  const params = useParams();
  const productType = params.productType as string;
  
  const [inputType, setInputType] = useState<'weight' | 'money'>('weight');
  const [weightAmount, setWeightAmount] = useState('');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [description, setDescription] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [volatilityMessage, setVolatilityMessage] = useState('');

  const selectedPrice = prices.find(p => p.productType === productType);

  // دریافت موجودی کیف پول
  useEffect(() => {
    fetchWalletBalance();
    checkVolatility();
  }, []);

  // شمارنده معکوس
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const checkVolatility = () => {
    // شبیه‌سازی بررسی نوسان - در واقعیت باید از API دریافت شود
    const isHighVolatility = Math.random() > 0.7; // 30% احتمال نوسان بالا
    if (isHighVolatility) {
      setVolatilityMessage('⚠️ امروز روز پرنوسانی است. قیمت‌ها ممکن است تغییر کنند.');
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`/api/wallet/balance?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        const rialWallet = data.wallets.find((w: any) => w.type === 'RIAL');
        if (rialWallet) {
          setWalletBalance(Number(rialWallet.balance));
        }
      }
    } catch (error) {
      console.error('خطا در دریافت موجودی کیف پول:', error);
    }
  };

  // محاسبه مقدار بر اساس نوع ورودی
  const getAmount = () => {
    if (inputType === 'weight') {
      return parseFloat(weightAmount) || 0;
    } else {
      if (!selectedPrice) return 0;
      return (parseFloat(moneyAmount) || 0) / Number(selectedPrice.buyPrice);
    }
  };

  // محاسبه مبلغ بر اساس نوع ورودی
  const getMoneyAmount = () => {
    if (inputType === 'weight') {
      if (!selectedPrice) return 0;
      return (parseFloat(weightAmount) || 0) * Number(selectedPrice.buyPrice);
    } else {
      return parseFloat(moneyAmount) || 0;
    }
  };

  // محاسبه کل
  const calculateTotal = () => {
    return getMoneyAmount();
  };

  // محاسبه کارمزد
  const calculateCommission = () => {
    const total = calculateTotal();
    // کارمزد 1% برای خرید
    return total * 0.01;
  };

  // محاسبه قیمت نهایی
  const calculateFinalTotal = () => {
    return calculateTotal() + calculateCommission();
  };

  // تبدیل خودکار بین وزن و مبلغ
  useEffect(() => {
    if (selectedPrice && inputType === 'weight' && weightAmount) {
      const weight = parseFloat(weightAmount);
      if (weight > 0) {
        const money = weight * Number(selectedPrice.buyPrice);
        setMoneyAmount(money.toFixed(0));
      }
    }
  }, [weightAmount, selectedPrice, inputType]);

  useEffect(() => {
    if (selectedPrice && inputType === 'money' && moneyAmount) {
      const money = parseFloat(moneyAmount);
      if (money > 0) {
        const weight = money / Number(selectedPrice.buyPrice);
        setWeightAmount(weight.toFixed(2));
      }
    }
  }, [moneyAmount, selectedPrice, inputType]);

  // اعتبارسنجی ورودی
  const validateInput = () => {
    if (!productType) {
      setError('محصول مشخص نشده است');
      return false;
    }

    if (inputType === 'weight') {
      if (!weightAmount || parseFloat(weightAmount) <= 0) {
        setError('لطفاً مقدار وزن را به درستی وارد کنید');
        return false;
      }
      
      // برای سکه‌ها، تعداد باید صحیح باشد
      if (productType !== 'GOLD_18K') {
        const amount = parseFloat(weightAmount);
        if (amount !== Math.floor(amount)) {
          setError('برای سکه‌ها، تعداد باید عدد صحیح باشد');
          return false;
        }
      }
    } else {
      if (!moneyAmount || parseFloat(moneyAmount) <= 0) {
        setError('لطفاً مبلغ را به درستی وارد کنید');
        return false;
      }
    }

    // بررسی موجودی کیف پول
    if (calculateFinalTotal() > walletBalance) {
      setError('موجودی کیف پول کافی نیست');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) {
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

      // پرداخت از کیف پول
      const response = await fetch('/api/trading/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productType: productType,
          amount: getAmount(),
          isAutomatic: true,
          description: description.trim() || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsOrderPlaced(true);
        setCountdown(180); // 3 دقیقه شمارنده معکوس
        setWeightAmount('');
        setMoneyAmount('');
        setDescription('');
        fetchWalletBalance(); // به‌روزرسانی موجودی
        
        // نمایش پیام موفقیت و لینک فاکتور
        const transactionId = data.transactionId || 'mock_transaction_' + Date.now();
        setTimeout(() => {
          if (confirm('معامله با موفقیت انجام شد! آیا می‌خواهید فاکتور را مشاهده کنید؟')) {
            window.open(`/invoice?id=${transactionId}`, '_blank');
          }
          window.location.href = '/dashboard';
        }, 2000); // 2 ثانیه تاخیر برای نمایش پیام
      } else {
        setError(data.error || 'خطا در ثبت سفارش');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const getProductDisplayName = (productType: string) => {
    switch (productType) {
      case 'GOLD_18K': return 'طلای 18 عیار';
      case 'COIN_BAHAR': return 'سکه بهار آزادی';
      case 'COIN_NIM': return 'نیم سکه';
      case 'COIN_ROBE': return 'ربع سکه';
      case 'COIN_BAHAR_86': return 'سکه بهار آزادی 86';
      case 'COIN_NIM_86': return 'نیم سکه 86';
      case 'COIN_ROBE_86': return 'ربع سکه 86';
      default: return productType;
    }
  };

  const getUnit = () => {
    return productType === 'GOLD_18K' ? 'گرم' : 'عدد';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          خرید {getProductDisplayName(productType)}
        </h2>
        <p className="text-slate-600">مقدار مورد نظر خود را وارد کنید</p>
      </div>

      {/* پیام نوسان */}
      {volatilityMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 text-sm">{volatilityMessage}</p>
          </div>
        </div>
      )}

      {/* شمارنده معکوس */}
      {isOrderPlaced && countdown > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">در حال انجام معامله لطفا صبور باشید</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-green-600 text-sm mt-1">زمان باقی‌مانده تا تکمیل معامله</p>
          </div>
        </div>
      )}

      {/* موجودی کیف پول */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">موجودی کیف پول ریالی:</span>
          </div>
          <span className="font-bold text-blue-800">
            {walletBalance.toLocaleString('fa-IR')} تومان
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Input Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            روش ورود مقدار
          </label>
          <div className="flex space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={() => setInputType('weight')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                inputType === 'weight'
                  ? 'border-gold bg-gold-50 text-gold'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <Scale className="w-5 h-5" />
                <span>بر اساس وزن</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setInputType('money')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                inputType === 'money'
                  ? 'border-gold bg-gold-50 text-gold'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <DollarSign className="w-5 h-5" />
                <span>بر اساس مبلغ</span>
              </div>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {inputType === 'weight' ? 'مقدار' : 'مبلغ'}
          </label>
          
          {inputType === 'weight' ? (
            <div className="relative">
              <input
                type="number"
                value={weightAmount}
                onChange={(e) => setWeightAmount(e.target.value)}
                placeholder={`مقدار را به ${getUnit()} وارد کنید`}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
                min={productType === 'GOLD_18K' ? "0.01" : "1"}
                step={productType === 'GOLD_18K' ? "0.01" : "1"}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                {getUnit()}
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="مبلغ را به تومان وارد کنید"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
                min="1000"
                step="1000"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                تومان
              </div>
            </div>
          )}

          {/* Conversion Display */}
          {selectedPrice && (weightAmount || moneyAmount) && (
            <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <div className="flex justify-between">
                <span>معادل:</span>
                <span>
                  {inputType === 'weight' 
                    ? `${getMoneyAmount().toLocaleString('fa-IR')} تومان`
                    : `${getAmount().toFixed(2)} ${getUnit()}`
                  }
                </span>
              </div>
            </div>
          )}
        </div>


        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            توضیحات (اختیاری)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات اضافی برای سفارش خود وارد کنید..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-slate-500 mt-1 text-left">
            {description.length}/500 کاراکتر
          </div>
        </div>

        {/* Price Calculation */}
        {productType && selectedPrice && (weightAmount || moneyAmount) && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-slate-800 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              محاسبه قیمت
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">قیمت واحد:</span>
                <span className="font-medium">
                  {Number(selectedPrice.buyPrice).toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">مقدار:</span>
                <span className="font-medium">
                  {getAmount().toFixed(2)} {getUnit()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">قیمت کل:</span>
                <span className="font-medium">
                  {calculateTotal().toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">کارمزد (1%):</span>
                <span className="font-medium text-red-600">
                  {calculateCommission().toLocaleString('fa-IR')} تومان
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

              {/* موجودی کافی یا ناکافی */}
              <div className={`mt-3 p-2 rounded-lg text-sm ${
                calculateFinalTotal() <= walletBalance
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {calculateFinalTotal() <= walletBalance
                  ? '✅ موجودی کافی است'
                  : '❌ موجودی کافی نیست'
                }
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-yellow-800 text-sm">
              <p className="font-semibold mb-1">تایید موجودی:</p>
              <p>امکا نی لغو معامله پس از تایید وجود ندارد. لطفاً قبل از تأیید نهایی، موجودی کیف پول خود را بررسی کنید.</p>
            </div>
          </div>
        </div>

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
          disabled={loading || !productType || (!weightAmount && !moneyAmount) || calculateFinalTotal() > walletBalance || isOrderPlaced}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'در حال پردازش...' : isOrderPlaced ? 'سفارش ثبت شده' : 'ثبت سفارش خرید (کیف پول)'}
        </button>
      </form>
    </div>
  );
}