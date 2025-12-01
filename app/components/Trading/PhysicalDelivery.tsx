"use client";
import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Calendar, Clock, Phone, AlertCircle, CheckCircle, PauseCircle } from 'lucide-react';
import { useTradingMode } from '@/app/hooks/useTradingMode';

interface PhysicalDeliveryProps {
  prices?: any[];
}

export default function PhysicalDelivery({ prices = [] }: PhysicalDeliveryProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [amount, setAmount] = useState('');
  // const [deliveryAddress, setDeliveryAddress] = useState(''); // غیرفعال شده
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [deliveryRequests, setDeliveryRequests] = useState<any[]>([]);
  const [deliveryCommissionRate, setDeliveryCommissionRate] = useState(0.02); // 2% پیش‌فرض
  const { mode: tradingMode } = useTradingMode(15000);

  const selectedPrice = prices.find(p => p.productType === selectedProduct);

  // دریافت نرخ کارمزد تحویل از API
  useEffect(() => {
    const fetchDeliveryCommission = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        const token = localStorage.getItem('token');
        
        if (!token) return;

        const response = await fetch('/api/settings/commission', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // جستجوی کارمزد تحویل فیزیکی
          const deliveryCommission = data.commissions?.find((c: any) => c.productType === 'DELIVERY');
          if (deliveryCommission) {
            setDeliveryCommissionRate(deliveryCommission.sellRate || 0.02);
          }
        }
      } catch (error) {
        console.error('خطا در دریافت نرخ کارمزد تحویل:', error);
        // در صورت خطا، از نرخ پیش‌فرض استفاده کن
        setDeliveryCommissionRate(0.02);
      }
    };

    fetchDeliveryCommission();
  }, []);

  // دریافت لیست درخواست‌های تحویل کاربر برای نمایش وضعیت
  useEffect(() => {
    const fetchUserDeliveryRequests = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        const response = await fetch(`/api/delivery/request?userId=${user.id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setDeliveryRequests(data.deliveryRequests || []);
        }
      } catch (error) {
        console.error('خطا در دریافت لیست درخواست‌های تحویل:', error);
      }
    };

    fetchUserDeliveryRequests();
  }, []);

  // محاسبه کارمزد تحویل
  const calculateDeliveryFee = () => {
    if (!selectedProduct || !amount || !selectedPrice) return 0;
    
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) return 0;
    
    if (selectedProduct === 'GOLD_18K') {
      // کارمزد برای تحویل طلا (بر اساس وزن - 2% از وزن)
      return numAmount * deliveryCommissionRate;
    } else {
      // کارمزد برای سکه‌ها (بر اساس تعداد × قیمت سکه)
      const totalValue = numAmount * Number(selectedPrice.sellPrice);
      return totalValue * deliveryCommissionRate;
    }
  };

  // اعتبارسنجی ورودی
  const validateInput = () => {
    if (tradingMode.tradingPaused) {
      setError(tradingMode.message || 'در حال حاضر امکان ثبت درخواست وجود ندارد.');
      return false;
    }

    if (!selectedProduct) {
      setError('لطفاً محصول را انتخاب کنید');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('لطفاً مقدار را به درستی وارد کنید');
      return false;
    }

    // برای سکه‌ها، تعداد باید صحیح باشد
    if (selectedProduct !== 'GOLD_18K') {
      const numAmount = parseFloat(amount);
      if (numAmount !== Math.floor(numAmount)) {
        setError('برای سکه‌ها، تعداد باید عدد صحیح باشد');
        return false;
      }
    }

    // بررسی حداقل مقدار تحویل (5 گرم)
    if (selectedProduct === 'GOLD_18K' && parseFloat(amount) < 5) {
      setError('حداقل مقدار تحویل طلا 5 گرم است');
      return false;
    }

    // if (!deliveryAddress.trim()) {
    //   setError('لطفاً آدرس تحویل را وارد کنید');
    //   return false;
    // }

    if (!deliveryDate) {
      setError('لطفاً تاریخ تحویل را انتخاب کنید');
      return false;
    }

    if (!deliveryTime) {
      setError('لطفاً زمان تحویل را انتخاب کنید');
      return false;
    }

    if (!contactPhone.trim()) {
      setError('لطفاً شماره تماس را وارد کنید');
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

      const response = await fetch('/api/delivery/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productType: selectedProduct,
          amount: parseFloat(amount),
          deliveryAddress: 'تحویل در فروشگاه', // آدرس ثابت
          deliveryDate,
          deliveryTime,
          contactPhone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // پاک کردن فرم
        setSelectedProduct('');
        setAmount('');
        // setDeliveryAddress(''); // غیرفعال شده
        setDeliveryDate('');
        setDeliveryTime('');
        setContactPhone('');

        // رفرش لیست وضعیت‌ها
        try {
          const listResponse = await fetch(`/api/delivery/request?userId=${user.id}`);
          const listData = await listResponse.json();
          if (listResponse.ok && listData.success) {
            setDeliveryRequests(listData.deliveryRequests || []);
          }
        } catch (e) {
          console.error('خطا در بروزرسانی لیست تحویل:', e);
        }
        
        // بازگشت به حالت عادی بعد از 5 ثانیه
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(data.error || 'خطا در ثبت درخواست تحویل');
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

  // تنظیم تاریخ حداقل (امروز)
  const today = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">درخواست تحویل ثبت شد!</h2>
        <p className="text-green-600 mb-6">
          درخواست تحویل طلای فیزیکی شما با موفقیت ثبت شد. 
          کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="font-medium text-green-800 mb-2">مراحل بعدی:</h3>
          <ul className="text-sm text-green-700 space-y-1 text-right">
            <li>• تایید درخواست توسط کارشناس</li>
            <li>• تعیین زمان و مکان دقیق تحویل</li>
            <li>• تحویل طلا در محل تعیین شده</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">درخواست تحویل طلا در فروشگاه</h2>
        <p className="text-slate-600">تحویل فیزیکی طلا و سکه در محل فروشگاه</p>
      </div>

      {tradingMode.tradingPaused && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <PauseCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-1">مدیر آفلاین است</p>
            <p>{tradingMode.message || 'معاملات به صورت موقت متوقف شده‌اند. لطفاً بعداً تلاش کنید.'}</p>
          </div>
        </div>
      )}

      {/* قوانین تحویل */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          قوانین تحویل
        </h3>
        <ul className="text-sm text-blue-700 space-y-1 text-right">
          <li>• حداقل مقدار تحویل طلا: 5 گرم</li>
          <li>• کارمزد تحویل طلا: {(deliveryCommissionRate * 100).toFixed(1)}% از وزن (به گرم)</li>
          <li>• کارمزد تحویل سکه: {(deliveryCommissionRate * 100).toFixed(1)}% از ارزش سکه (به تومان)</li>
          <li>• تحویل در فروشگاه: 24-48 ساعت کاری</li>
          <li>• مراجعه حضوری به فروشگاه برای تحویل</li>
        </ul>
      </div>

      {/* لیست وضعیت درخواست‌های تحویل کاربر */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-slate-800 mb-3">وضعیت درخواست‌های تحویل شما</h3>
        {deliveryRequests.length === 0 ? (
          <p className="text-sm text-slate-600">
            تاکنون هیچ درخواست تحویلی ثبت نکرده‌اید.
          </p>
        ) : (
          <div className="space-y-3">
            {deliveryRequests.map((req) => {
              const statusLabel =
                req.status === 'PENDING'
                  ? 'در انتظار تایید'
                  : req.status === 'APPROVED'
                  ? 'تایید شده'
                  : req.status === 'PROCESSING'
                  ? 'در حال آماده‌سازی'
                  : req.status === 'READY'
                  ? 'آماده تحویل'
                  : req.status === 'DELIVERED'
                  ? 'تحویل شده'
                  : 'لغو شده';

              return (
                <div
                  key={req.id}
                  className="border border-slate-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {getProductDisplayName(req.productType)} -{' '}
                      {req.productType === 'GOLD_18K'
                        ? `${req.amount} گرم`
                        : `${req.amount} عدد`}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      ثبت: {new Date(req.requestedAt).toLocaleString('fa-IR')}
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : req.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : req.status === 'PROCESSING'
                          ? 'bg-indigo-100 text-indigo-800'
                          : req.status === 'READY'
                          ? 'bg-purple-100 text-purple-800'
                          : req.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {statusLabel}
                    </span>
                    {req.status === 'READY' && (
                      <span className="text-xs text-green-700">
                        لطفاً برای تحویل به فروشگاه مراجعه کنید.
                      </span>
                    )}
                    {req.status === 'DELIVERED' && (
                      <span className="text-xs text-slate-500">
                        تحویل نهایی انجام شده است.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            مقدار
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`مقدار را به ${getUnit()} وارد کنید`}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              required
              min={selectedProduct === 'GOLD_18K' ? "5" : "1"}
              step={selectedProduct === 'GOLD_18K' ? "0.01" : "1"}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              {getUnit()}
            </div>
          </div>
        </div>

        {/* Delivery Address - غیرفعال شده */}
        {/* <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            آدرس تحویل
          </label>
          <div className="relative">
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="آدرس کامل محل تحویل را وارد کنید"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              rows={3}
              required
            />
            <div className="absolute left-3 top-3 text-slate-500">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </div> */}

        {/* Delivery Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              تاریخ تحویل
            </label>
            <div className="relative">
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              زمان تحویل
            </label>
            <div className="relative">
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              >
                <option value="">انتخاب کنید</option>
                <option value="09:00-12:00">9 صبح تا 12 ظهر</option>
                <option value="12:00-15:00">12 ظهر تا 3 بعدازظهر</option>
                <option value="15:00-18:00">3 تا 6 بعدازظهر</option>
                <option value="18:00-21:00">6 تا 9 شب</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            شماره تماس
          </label>
          <div className="relative">
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="شماره تماس برای هماهنگی تحویل"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              required
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              <Phone className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Delivery Fee Calculation */}
        {selectedProduct && amount && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-slate-800">محاسبه کارمزد تحویل</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">مقدار:</span>
                <span className="font-medium">
                  {parseFloat(amount).toFixed(2)} {getUnit()}
                </span>
              </div>
              
              {selectedProduct !== 'GOLD_18K' && selectedPrice && (
                <div className="flex justify-between">
                  <span className="text-slate-600">ارزش کل:</span>
                  <span className="font-medium">
                    {(parseFloat(amount) * Number(selectedPrice.sellPrice)).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-slate-600">
                  کارمزد تحویل ({(deliveryCommissionRate * 100).toFixed(1)}%):
                  {selectedProduct === 'GOLD_18K' ? ' از وزن' : ' از ارزش'}
                </span>
                <span className="font-medium text-red-600">
                  {selectedProduct === 'GOLD_18K' 
                    ? `${calculateDeliveryFee().toFixed(2)} گرم` 
                    : `${calculateDeliveryFee().toLocaleString('fa-IR')} تومان`
                  }
                </span>
              </div>
              
              <div className="border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">کل کارمزد:</span>
                  <span className="font-bold text-lg text-slate-800">
                    {selectedProduct === 'GOLD_18K' 
                      ? `${calculateDeliveryFee().toFixed(2)} گرم` 
                      : `${calculateDeliveryFee().toLocaleString('fa-IR')} تومان`
                    }
                  </span>
                </div>
              </div>
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
          disabled={tradingMode.tradingPaused || loading || !selectedProduct || !amount || !deliveryDate || !deliveryTime || !contactPhone}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {tradingMode.tradingPaused
            ? 'معاملات متوقف است'
            : loading
            ? 'در حال پردازش...'
            : 'ثبت درخواست تحویل'}
        </button>
      </form>
    </div>
  );
}
