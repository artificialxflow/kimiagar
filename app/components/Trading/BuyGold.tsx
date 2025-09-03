"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calculator, AlertCircle, Scale, DollarSign, CreditCard, Wallet } from 'lucide-react';

interface BuyGoldProps {
  prices?: any[];
}

export default function BuyGold({ prices = [] }: BuyGoldProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [inputType, setInputType] = useState<'weight' | 'money'>('weight');
  const [weightAmount, setWeightAmount] = useState('');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'gateway'>('wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [description, setDescription] = useState('');

  const selectedPrice = prices.find(p => p.productType === selectedProduct);

  // دریافت موجودی کیف پول
  useEffect(() => {
    fetchWalletBalance();
  }, []);

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
    if (!selectedProduct) {
      setError('لطفاً محصول را انتخاب کنید');
      return false;
    }

    if (inputType === 'weight') {
      if (!weightAmount || parseFloat(weightAmount) <= 0) {
        setError('لطفاً مقدار وزن را به درستی وارد کنید');
        return false;
      }
      
      // برای سکه‌ها، تعداد باید صحیح باشد
      if (selectedProduct !== 'GOLD_18K') {
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
    if (paymentMethod === 'wallet' && calculateFinalTotal() > walletBalance) {
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

      if (paymentMethod === 'wallet') {
        // پرداخت از کیف پول
        const response = await fetch('/api/trading/buy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            productType: selectedProduct,
            amount: getAmount(),
            isAutomatic: true,
            description: description.trim() || null
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('سفارش خرید با موفقیت ثبت شد!');
          setSelectedProduct('');
          setWeightAmount('');
          setMoneyAmount('');
          setDescription('');
          fetchWalletBalance(); // به‌روزرسانی موجودی
          // به‌روزرسانی صفحه بعد از 2 ثانیه
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          setError(data.error || 'خطا در ثبت سفارش');
        }
      } else {
        // پرداخت از درگاه
        const response = await fetch('/api/trading/buy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            productType: selectedProduct,
            amount: getAmount(),
            isAutomatic: false,
            description: description.trim() || null
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // ایجاد تراکنش پرداخت
          const paymentResponse = await fetch('/api/payment/gateway', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              orderId: data.order.id,
              amount: calculateFinalTotal(),
              paymentMethod: 'CARD',
              callbackUrl: `${window.location.origin}/trading?tab=buy&payment=success`
            }),
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok) {
            // هدایت به درگاه پرداخت
            window.location.href = paymentData.paymentTransaction.paymentUrl;
          } else {
            setError(paymentData.error || 'خطا در اتصال به درگاه پرداخت');
          }
        } else {
          setError(data.error || 'خطا در ثبت سفارش');
        }
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
    return selectedProduct === 'GOLD_18K' ? 'گرم' : 'عدد';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">خرید طلا</h2>
        <p className="text-slate-600">انتخاب محصول و مقدار مورد نظر</p>
      </div>

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
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            انتخاب محصول
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            required
          >
            <option value="">انتخاب کنید</option>
            {prices.map((price) => (
              <option key={price.id} value={price.productType}>
                {getProductDisplayName(price.productType)}
              </option>
            ))}
          </select>
        </div>

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
                min="0.01"
                step={selectedProduct === 'GOLD_18K' ? "0.01" : "1"}
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
          {selectedProduct && (weightAmount || moneyAmount) && (
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

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            روش پرداخت
          </label>
          <div className="flex space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                paymentMethod === 'wallet'
                  ? 'border-gold bg-gold-50 text-gold'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <Wallet className="w-5 h-5" />
                <span>کیف پول</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('gateway')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                paymentMethod === 'gateway'
                  ? 'border-gold bg-gold-50 text-gold'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <CreditCard className="w-5 h-5" />
                <span>کارت بانکی</span>
              </div>
            </button>
          </div>
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
        {selectedProduct && selectedPrice && (weightAmount || moneyAmount) && (
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
              {paymentMethod === 'wallet' && (
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
              )}
            </div>
          </div>
        )}

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
          disabled={loading || !selectedProduct || (!weightAmount && !moneyAmount) || (paymentMethod === 'wallet' && calculateFinalTotal() > walletBalance)}
          className="w-full bg-gold text-white py-3 px-4 rounded-lg font-semibold hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'در حال پردازش...' : `ثبت سفارش خرید (${paymentMethod === 'wallet' ? 'کیف پول' : 'کارت بانکی'})`}
        </button>
      </form>
    </div>
  );
}