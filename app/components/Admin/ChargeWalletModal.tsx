'use client';

import { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { formatNumber } from '@/app/lib/utils';

interface ChargeWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentBalance?: {
    rial?: number;
    gold?: number;
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
  const [walletType, setWalletType] = useState<'RIAL' | 'GOLD'>('RIAL');
  const [amount, setAmount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [description, setDescription] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setError('مبلغ باید مثبت باشد');
      return;
    }

    if (parseFloat(amount) > 1000000000000) {
      setError('مبلغ خیلی بزرگ است');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/wallet/charge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          walletType,
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

  const currentBalanceDisplay = walletType === 'RIAL' 
    ? currentBalance?.rial || 0
    : currentBalance?.gold || 0;

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
          <div className="bg-gold px-6 py-4 flex items-center justify-between">
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
                <p className="text-sm text-gray-600">موجودی فعلی ({walletType === 'RIAL' ? 'ریالی' : 'طلایی'}):</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatNumber(currentBalanceDisplay)} {walletType === 'RIAL' ? 'تومان' : 'گرم'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Wallet Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع کیف پول
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="RIAL"
                      checked={walletType === 'RIAL'}
                      onChange={(e) => setWalletType(e.target.value as 'RIAL' | 'GOLD')}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">ریالی</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="GOLD"
                      checked={walletType === 'GOLD'}
                      onChange={(e) => setWalletType(e.target.value as 'RIAL' | 'GOLD')}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">طلایی</span>
                  </label>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ {walletType === 'RIAL' ? '(تومان)' : '(گرم)'}
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثال: 1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
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
                  className="flex-1 px-4 py-2 bg-gold text-white rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

