'use client';

import { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/app/lib/apiClient';
import {
  formatGoldValue,
  formatInputNumber,
  formatRial,
  normalizeDigits,
  parseLocalizedNumber
} from '@/app/lib/utils';

interface ChargeWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentBalance?: {
    rial?: number;
    gold?: number;
    coins?: {
      fullCoin: number;
      halfCoin: number;
      quarterCoin: number;
    };
  };
  onSuccess?: () => void;
  token: string;
}

export default function ChargeWalletModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentBalance,
  onSuccess,
  token
}: ChargeWalletModalProps) {
  const [walletType, setWalletType] = useState<'RIAL' | 'GOLD' | 'COIN_FULL' | 'COIN_HALF' | 'COIN_QUARTER'>('RIAL');
  const [amount, setAmount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [description, setDescription] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sanitizeGoldInput = (value: string) => {
    const normalized = normalizeDigits(value).replace(/[^0-9.]/g, '');
    const parts = normalized.split('.');
    if (parts.length <= 1) return normalized;
    return `${parts[0]}.${parts.slice(1).join('')}`;
  };

  const numericAmount =
    walletType === 'RIAL'
      ? parseLocalizedNumber(amount)
      : walletType === 'GOLD'
      ? parseFloat(sanitizeGoldInput(amount)) || 0
      : parseInt(amount.replace(/[^0-9]/g, '')) || 0;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setReceiptNumber('');
      setDescription('');
      setAdminNotes('');
      setError('');
      setSuccess(false);
      setWalletType('RIAL');
    }
  }, [isOpen]);

  // Fetch coin balance when coin type is selected
  useEffect(() => {
    if (isOpen && (walletType === 'COIN_FULL' || walletType === 'COIN_HALF' || walletType === 'COIN_QUARTER')) {
      // Coin balance should be passed via currentBalance prop
      // This is handled by the parent component
    }
  }, [isOpen, walletType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!amount || numericAmount <= 0) {
      setError(walletType.startsWith('COIN') ? 'تعداد باید مثبت باشد' : 'مبلغ باید مثبت باشد');
      return;
    }

    if (walletType === 'RIAL' && numericAmount > 1000000000000) {
      setError('مبلغ خیلی بزرگ است');
      return;
    }

    if (walletType.startsWith('COIN') && !Number.isInteger(numericAmount)) {
      setError('تعداد باید عدد صحیح باشد');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/admin/wallet/charge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: numericAmount,
          walletType: walletType.startsWith('COIN') ? 'COIN' : walletType,
          coinType: walletType.startsWith('COIN') ? walletType : undefined,
          description: description || undefined,
          receiptNumber: receiptNumber || undefined,
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'خطا در شارژ موجودی');
      }
    } catch (error) {
      console.error('خطا در شارژ موجودی:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getCurrentBalanceDisplay = () => {
    if (walletType === 'RIAL') return currentBalance?.rial || 0;
    if (walletType === 'GOLD') return currentBalance?.gold || 0;
    if (walletType === 'COIN_FULL') return currentBalance?.coins?.fullCoin || 0;
    if (walletType === 'COIN_HALF') return currentBalance?.coins?.halfCoin || 0;
    if (walletType === 'COIN_QUARTER') return currentBalance?.coins?.quarterCoin || 0;
    return 0;
  };

  const currentBalanceDisplay = getCurrentBalanceDisplay();
  
  const getWalletTypeLabel = () => {
    if (walletType === 'RIAL') return 'ریالی';
    if (walletType === 'GOLD') return 'طلایی';
    if (walletType === 'COIN_FULL') return 'تمام سکه';
    if (walletType === 'COIN_HALF') return 'نیم سکه';
    if (walletType === 'COIN_QUARTER') return 'ربع سکه';
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gold-500 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">شارژ موجودی</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-4">
            {/* User Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">کاربر:</p>
              <p className="text-base font-medium text-gray-900">{userName}</p>
            </div>

            {/* Current Balance */}
            {currentBalanceDisplay !== undefined && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">موجودی فعلی ({getWalletTypeLabel()}):</p>
                <p className="text-lg font-bold text-blue-900">
                  {walletType === 'RIAL'
                    ? `${formatRial(currentBalanceDisplay)} تومان`
                    : walletType === 'GOLD'
                    ? `${formatGoldValue(currentBalanceDisplay)} گرم`
                    : `${currentBalanceDisplay} عدد`}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Wallet Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع کیف پول
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="RIAL"
                      checked={walletType === 'RIAL'}
                      onChange={(e) => {
                        setWalletType(e.target.value as 'RIAL' | 'GOLD' | 'COIN_FULL' | 'COIN_HALF' | 'COIN_QUARTER');
                        setAmount('');
                      }}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">ریالی</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="GOLD"
                      checked={walletType === 'GOLD'}
                      onChange={(e) => {
                        setWalletType(e.target.value as 'RIAL' | 'GOLD' | 'COIN_FULL' | 'COIN_HALF' | 'COIN_QUARTER');
                        setAmount('');
                      }}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">طلایی</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="COIN_FULL"
                      checked={walletType === 'COIN_FULL'}
                      onChange={(e) => {
                        setWalletType(e.target.value as 'RIAL' | 'GOLD' | 'COIN_FULL' | 'COIN_HALF' | 'COIN_QUARTER');
                        setAmount('');
                      }}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">تمام سکه</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="COIN_HALF"
                      checked={walletType === 'COIN_HALF'}
                      onChange={(e) => {
                        setWalletType(e.target.value as 'RIAL' | 'GOLD' | 'COIN_FULL' | 'COIN_HALF' | 'COIN_QUARTER');
                        setAmount('');
                      }}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">نیم سکه</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="COIN_QUARTER"
                      checked={walletType === 'COIN_QUARTER'}
                      onChange={(e) => {
                        setWalletType(e.target.value as 'RIAL' | 'GOLD' | 'COIN_FULL' | 'COIN_HALF' | 'COIN_QUARTER');
                        setAmount('');
                      }}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">ربع سکه</span>
                  </label>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  {walletType.startsWith('COIN') ? 'تعداد' : walletType === 'RIAL' ? 'مبلغ (تومان)' : 'مبلغ (گرم)'}
                </label>
                {walletType === 'RIAL' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(formatInputNumber(e.target.value))}
                      placeholder="مثال: 1,000,000"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      required
                      disabled={loading}
                    />
                    <span className="text-gray-500 text-sm whitespace-nowrap">
                      تومان
                    </span>
                  </div>
                ) : walletType === 'GOLD' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(sanitizeGoldInput(e.target.value))}
                      placeholder="مثال: 10.5"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      required
                      disabled={loading}
                    />
                    <span className="text-gray-500 text-sm whitespace-nowrap">
                      گرم
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="مثال: 5"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      required
                      disabled={loading}
                    />
                    <span className="text-gray-500 text-sm whitespace-nowrap">
                      عدد
                    </span>
                  </div>
                )}
              </div>

              {/* Receipt Number */}
              <div>
                <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  شماره فیش (اختیاری)
                </label>
                <input
                  type="text"
                  id="receiptNumber"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="مثال: RECEIPT-12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات مربوط به شارژ..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  یادداشت ادمین (اختیاری)
                </label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="یادداشت‌های داخلی..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">موجودی با موفقیت شارژ شد</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      در حال پردازش...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      شارژ موجودی
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

