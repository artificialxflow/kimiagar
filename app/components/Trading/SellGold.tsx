"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Calculator, AlertCircle, Scale, Clock, PauseCircle } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTradingMode } from '@/app/hooks/useTradingMode';
import { useFormattedRialInput } from '@/app/hooks/useFormattedRialInput';
import { getProductDisplayName, isCoinProductType, parseLocalizedNumber } from '@/app/lib/utils';

interface SellGoldProps {
  prices?: any[];
}

const COIN_BALANCE_KEY_MAP: Record<string, 'fullCoin' | 'halfCoin' | 'quarterCoin'> = {
  COIN_BAHAR_86: 'fullCoin',
  COIN_NIM_86: 'halfCoin',
  COIN_ROBE_86: 'quarterCoin',
  COIN_BAHAR: 'fullCoin',
  COIN_NIM: 'halfCoin',
  COIN_ROBE: 'quarterCoin'
};

export default function SellGold({ prices = [] }: SellGoldProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const productType = params.productType as string;
  
  const [inputType, setInputType] = useState<'weight' | 'money'>('weight');
  const [weightAmount, setWeightAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [lockVisible, setLockVisible] = useState(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REJECTED' | 'REJECTED_PRICE_CHANGE' | null>(null);
  const [finalStatusMessage, setFinalStatusMessage] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [volatilityMessage, setVolatilityMessage] = useState('');
  const finalStatusRef = useRef<'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REJECTED' | 'REJECTED_PRICE_CHANGE' | null>(null);
  const [availableBalance, setAvailableBalance] = useState(() => {
    const initial = Number(searchParams.get('balance'));
    return isNaN(initial) ? 0 : initial;
  });
  const { mode: tradingMode } = useTradingMode(15000);
  
  // به‌روزرسانی ref همزمان با state
  useEffect(() => {
    finalStatusRef.current = finalStatus;
  }, [finalStatus]);

  const selectedPrice = prices.find(p => p.productType === productType);
  const isCoinProduct = isCoinProductType(productType);
  const {
    value: moneyAmount,
    onChange: handleMoneyInputChange,
    setFormattedValue: setMoneyAmount,
    numericValue: moneyValue,
    reset: resetMoneyAmount
  } = useFormattedRialInput();

  // جلوگیری از تغییر ورودی به مبلغ برای سکه‌ها
  useEffect(() => {
    if (isCoinProduct && inputType === 'money') {
      setInputType('weight');
    }
  }, [isCoinProduct, inputType]);

  // دریافت موجودی و بررسی نوسان
  useEffect(() => {
    fetchAvailableBalance();
    checkVolatility();
  }, [productType]);

  // شمارنده معکوس
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // توقف شمارنده اگر وضعیت نهایی تنظیم شده
    if (finalStatus) {
      if (countdown > 0) {
        setCountdown(0); // توقف فوری شمارنده
      }
      return;
    }
    
    // توقف شمارنده اگر به صفر رسیده
    if (countdown <= 0) {
      if (lockVisible && !finalStatus) {
        // اگر تایمر تمام شد ولی هنوز وضعیت نهایی نیامده، پیام انتظار نمایش بده
        setLockMessage('درخواست فروش شما در صف بررسی ادمین است. لطفاً تا تعیین تکلیف نهایی منتظر بمانید.');
      }
      return;
    }
    
    // شروع شمارنده فقط اگر وضعیت نهایی تنظیم نشده و countdown > 0
    if (countdown > 0 && !finalStatus) {
      interval = setInterval(() => {
        setCountdown(prev => {
          // بررسی وضعیت نهایی با استفاده از ref برای دسترسی به آخرین مقدار
          if (finalStatusRef.current) {
            return 0;
          }
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown, lockVisible, finalStatus]);

  // پولینگ وضعیت سفارش تا خروج از PENDING
  useEffect(() => {
    if (!activeOrderId) return;

    let polling: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch(`/api/orders/status?id=${activeOrderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        const status = data.order?.status as string;

        // بررسی تمام وضعیت‌های غیر PENDING
        if (status && status !== 'PENDING') {
          // توقف فوری شمارنده
          setCountdown(0);
          setFinalStatus(status as 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REJECTED' | 'REJECTED_PRICE_CHANGE');

          // تنظیم پیام مناسب برای هر وضعیت
          switch (status) {
            case 'COMPLETED':
              setFinalStatusMessage('معامله با موفقیت ثبت شد. مبلغ آن به کیف پول ریالی شما اضافه می‌شود.');
              break;
            case 'FAILED':
              setFinalStatusMessage(data.order?.adminMessage || 'معامله رد شد.');
              break;
            case 'EXPIRED':
              setFinalStatusMessage('معامله منقضی شد.');
              break;
            case 'CANCELLED':
              setFinalStatusMessage('معامله لغو شد.');
              break;
            case 'REJECTED':
              setFinalStatusMessage(data.order?.adminMessage || 'معامله رد شد.');
              break;
            case 'REJECTED_PRICE_CHANGE':
              setFinalStatusMessage('معامله به دلیل تغییر قیمت رد شد.');
              break;
            default:
              setFinalStatusMessage('وضعیت سفارش تغییر کرده است.');
          }

          setTimeout(() => {
            setLockVisible(false);
            setActiveOrderId(null);
            window.location.href = '/dashboard';
          }, 4000);
        }
      } catch (err) {
        console.error('خطا در دریافت وضعیت سفارش فروش:', err);
      }
    };

    polling = setInterval(pollStatus, 5000);
    pollStatus();

    return () => clearInterval(polling);
  }, [activeOrderId]);

  const fetchAvailableBalance = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`/api/wallet/balance?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        if (isCoinProductType(productType)) {
          const coins = data.coins || {};
          const balanceKey = COIN_BALANCE_KEY_MAP[productType] || null;
          const coinBalance = balanceKey ? Number(coins[balanceKey] || 0) : 0;
          setAvailableBalance(coinBalance);
          return;
        }

        const goldWallet = data.wallets?.find((w: any) => w.type === 'GOLD');
        setAvailableBalance(Number(goldWallet?.balance || 0));
      } else {
        setAvailableBalance(0);
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
      return moneyValue / Number(selectedPrice.sellPrice);
    }
  };

  // محاسبه مبلغ بر اساس نوع ورودی
  const getMoneyAmount = () => {
    if (inputType === 'weight') {
      if (!selectedPrice) return 0;
      return (parseFloat(weightAmount) || 0) * Number(selectedPrice.sellPrice);
    } else {
      return moneyValue;
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
    if (!selectedPrice || inputType !== 'weight') {
      return;
    }

    if (weightAmount) {
      const weight = parseFloat(weightAmount);
      if (weight > 0) {
        const money = weight * Number(selectedPrice.sellPrice);
        setMoneyAmount(money.toFixed(0));
        return;
      }
    }

    setMoneyAmount('');
  }, [weightAmount, selectedPrice, inputType, setMoneyAmount]);

  useEffect(() => {
    if (!selectedPrice || inputType !== 'money') {
      return;
    }

    if (moneyValue > 0) {
      const weight = moneyValue / Number(selectedPrice.sellPrice);
      setWeightAmount(weight.toFixed(isCoinProduct ? 0 : 2));
    } else {
      setWeightAmount('');
    }
  }, [moneyValue, selectedPrice, inputType, isCoinProduct]);

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
      if (isCoinProduct) {
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
      if (moneyValue <= 0) {
        setError('لطفاً مبلغ را به درستی وارد کنید');
        return false;
      }

      // بررسی موجودی کافی بر اساس مبلغ
      const requiredAmount = moneyValue / Number(selectedPrice.sellPrice);
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

    if (tradingMode.tradingPaused) {
      setError(tradingMode.message || 'در حال حاضر امکان ثبت سفارش وجود ندارد.');
      setLoading(false);
      return;
    }

    try {
      // دریافت اطلاعات کاربر از localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('کاربر یافت نشد');
        setLoading(false);
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
        setLockVisible(true);
        setLockMessage('درخواست فروش شما ثبت شد، لطفاً تا پایان شمارنده و بررسی ادمین منتظر بمانید.');
        setCountdown(180); // 3 دقیقه شمارنده معکوس
        setWeightAmount('');
        resetMoneyAmount();
        fetchAvailableBalance(); // به‌روزرسانی موجودی

        const orderId = data.order?.id || data.orderId;
        if (orderId) {
          setActiveOrderId(orderId);
        }
      } else {
        setError(data.error || 'خطا در ثبت سفارش فروش');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const getUnit = () => {
    return isCoinProduct ? 'عدد' : 'گرم';
  };

  const hasValidInput = inputType === 'weight'
    ? parseFloat(weightAmount) > 0
    : moneyValue > 0;

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

      {/* پیام نوسان / توقف معاملات */}
      {tradingMode.tradingPaused && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <PauseCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-1">مدیر آفلاین است</p>
            <p>{tradingMode.message || 'معاملات به صورت موقت متوقف شده‌اند. لطفاً بعداً تلاش کنید.'}</p>
          </div>
        </div>
      )}

      {!tradingMode.tradingPaused && volatilityMessage && (
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
            {isCoinProduct ? availableBalance.toLocaleString('fa-IR') : availableBalance.toLocaleString('fa-IR')} {getUnit()}
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
            {!isCoinProduct && (
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
            )}
          </div>
          {isCoinProduct && (
            <p className="text-xs text-slate-500 mt-2">
              برای فروش سکه، فقط تعداد سکه مورد نظر را وارد کنید.
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {inputType === 'weight' ? 'مقدار' : 'مبلغ'}
          </label>
          
          {inputType === 'weight' ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={weightAmount}
                onChange={(e) => setWeightAmount(e.target.value)}
                placeholder={`مقدار را به ${getUnit()} وارد کنید`}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
                min={productType === 'GOLD_18K' ? "0.01" : "1"}
                step={productType === 'GOLD_18K' ? "0.01" : "1"}
              />
              <span className="text-slate-500 whitespace-nowrap">
                {getUnit()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={moneyAmount}
                onChange={handleMoneyInputChange}
                placeholder="مبلغ را به تومان وارد کنید"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              />
              <span className="text-slate-500 whitespace-nowrap">
                تومان
              </span>
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
              <p>امکان لغو معامله پس از تایید وجود ندارد. لطفاً قبل از تأیید نهایی، موجودی طلا و سکه خود را بررسی کنید.</p>
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
          disabled={
            tradingMode.tradingPaused ||
            loading ||
            !productType ||
            !hasValidInput ||
            isOrderPlaced ||
            availableBalance <= 0
          }
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {tradingMode.tradingPaused
            ? 'معاملات متوقف است'
            : loading
            ? 'در حال پردازش...'
            : isOrderPlaced
            ? 'سفارش ثبت شده'
            : availableBalance <= 0
            ? 'موجودی صفر'
            : 'ثبت سفارش فروش'}
        </button>
      </form>

      {/* لایه فول‌اسکرین قفل معاملات */}
      {lockVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Clock className="w-10 h-10 text-gold" />
              <h2 className="text-lg font-bold text-slate-900">
                درخواست فروش شما در حال پردازش است
              </h2>
              {lockMessage && (
                <p className="text-sm text-slate-600">{lockMessage}</p>
              )}

              {countdown > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">
                    زمان باقی‌مانده تا انقضای قیمت
                  </p>
                  <div className="text-3xl font-mono font-bold text-slate-900">
                    {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              {finalStatusMessage && (
                <div
                  className={`mt-3 w-full rounded-lg p-3 text-sm ${
                    finalStatus === 'COMPLETED'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {finalStatusMessage}
                </div>
              )}

              <p className="text-xs text-slate-400 mt-2">
                تا زمان تعیین وضعیت سفارش، امکان انجام عملیات دیگر (خرید، فروش، برداشت و انتقال) وجود ندارد.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}