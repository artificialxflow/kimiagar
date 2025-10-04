"use client";
import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, AlertCircle, Scale, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';

interface SellGoldProps {
  prices?: any[];
}

export default function SellGold({ prices = [] }: SellGoldProps) {
  const params = useParams();
  const productType = params.productType as string;
  
  const [inputType, setInputType] = useState<'weight' | 'money'>('weight');
  const [weightAmount, setWeightAmount] = useState('');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [volatilityMessage, setVolatilityMessage] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);

  const selectedPrice = prices.find(p => p.productType === productType);

  // دریافت موجودی و بررسی نوسان
  useEffect(() => {
    fetchAvailableBalance();
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

  const fetchAvailableBalance = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`/api/wallet/balance?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        // پیدا کردن کیف پول مناسب بر اساس نوع producto
        let wallet = null;
        
        if (productType === 'GOLD_18K') {
          // برای طلای 18 عیار، کیف پول GOLD را پیدا کن
          wallet = data.wallets.find((w: any) => w.type === 'GOLD');
        } else if (['COIN_BAHAR_86', 'COIN_NIM_86', 'COIN_ROBE_86'].includes(productType)) {
          // برای سکه‌ها، کوال پول GOLD و موجودی سکه‌ها را بررسی کن
          wallet = data.wallets.find((w: any) => w.type === 'GOLD');
          if (wallet && wallet.coins) {
            // موجودی سکه‌ها را محاسبه کن
            let coinBalance = 0;
            if (productType === 'COIN_BAHAR_86') {
              coinBalance = wallet.coins.fullCoin || 0;
            } else if (productType === 'COIN_NIM_86') {
              coinBalance = wallet.coins.halfCoin || 0;
            } else if (productType === 'COIN_ROBE_86') {
              coinBalance = wallet.coins.quarterCoin || 0;
            }
            setAvailableBalance(coinBalance);
            return;
          }
        }
        
        setAvailableBalance(Number(wallet?.balance || 0));
      }
    } catch (error) {
      console.error('خطا در دریافت موجودی:', error);
    }
  };

  const checkVolatility = () => {
    // شبیه‌سازی بررسی نوسان - در واقعیت باید از API دریافت شود
    const isHighVolatility = Math.random() > 0.7; // 30% احتمال نوسان بالا
    if (isHighVolatility) {
      setVolatilityMessage('⚠️ امروز روز پرنوسانی است. قیمت‌ها ممکن است تغییر کنند.');
    }
  };

  // محاسبه مقدار بر اساس نوع ورودی
  const getAmount = () => {
    if (inputType === 'weight') {
      return parseFloat(weightAmount) || 0;
    } else {
      if (!selectedPrice) return 0;
      return (parseFloat(moneyAmount) || 0) / Number(selectedPrice.sellPrice);
    }
  };

  // محاسبه مبلغ بر اساس نوع ورودی
  const getMoneyAmount = () => {
    if (inputType === 'weight') {
      if (!selectedPrice) return 0;
      return (parseFloat(weightAmount) || 0) * Number(selectedPrice.sellPrice);
    } else {
      return parseFloat(moneyAmount) || 0;
    }
  };

  const calculateTotal = () => {
    return getMoneyAmount();
  };

  const calculateCommission = () => {
    const total = calculateTotal();
    // کارمزد 0.5% برای فروش
    return total * 0.005;
  };

  const calculateFinalTotal = () => {
    return calculateTotal() - calculateCommission();
  };

  // تبدیل خودکار بین وزن و مبلغ
  useEffect(() => {
    if (selectedPrice && inputType === 'weight' && weightAmount) {
      const weight = parseFloat(weightAmount);
      if (weight > 0) {
        const money = weight * Number(selectedPrice.sellPrice);
        setMoneyAmount(money.toFixed(0));
      }
    }
  }, [weightAmount, selectedPrice, inputType]);

  useEffect(() => {
    if (selectedPrice && inputType === 'money' && moneyAmount) {
      const money = parseFloat(moneyAmount);
      if (money > 0) {
        const weight = money / Number(selectedPrice.sellPrice);
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

      // بررسی موجودی کافی
      if (parseFloat(weightAmount) > availableBalance) {
        setError('موجودی کافی نیست');
        return false;
      }
    } else {
      if (!moneyAmount || parseFloat(moneyAmount) <= 0) {
        setError('لطفاً مبلغ را به درستی وارد کنید');
        return false;
      }

      // بررسی موجودی کافی بر اساس مبلغ
      const requiredAmount = parseFloat(moneyAmount) / Number(selectedPrice.sellPrice);
      if (requiredAmount > availableBalance) {
        setError('موجودی کافی نیست');
        return false;
      }
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

      const response = await fetch('/api/trading/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productType: productType,
          amount: getAmount(),
          isAutomatic: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsOrderPlaced(true);
        setCountdown(180); // 3 دقیقه شمارنده معکوس
        setWeightAmount('');
        setMoneyAmount('');
        fetchAvailableBalance(); // به‌روزرسانی موجودی
        
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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          فروش {getProductDisplayName(productType)}
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

      {/* موجودی موجود */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">موجودی موجود:</span>
          </div>
          <span className="font-bold text-blue-800">
            {availableBalance.toLocaleString('fa-IR')} {getUnit()}
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
                  {Number(selectedPrice.sellPrice).toLocaleString('fa-IR')} تومان
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
                <span className="text-slate-600">کارمزد (0.5%):</span>
                <span className="font-medium text-red-600">
                  -{calculateCommission().toLocaleString('fa-IR')} تومان
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
            </div>
          </div>
        )}

        {/* Confirmation Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-yellow-800 text-sm">
              <p className="font-semibold mb-1">تایید موجودی:</p>
              <p>امکا نی لغو معامله پس از تایید وجود ندارد. لطفاً قبل از تأیید نهایی، موجودی طلا و سکه خود را بررسی کنید.</p>
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
          disabled={loading || !productType || (!weightAmount && !moneyAmount) || isOrderPlaced || availableBalance <= 0}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'در حال پردازش...' : isOrderPlaced ? 'سفارش ثبت شده' : availableBalance <= 0 ? 'موجودی صفر' : 'ثبت سفارش فروش'}
        </button>
      </form>
    </div>
  );
}