'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { QrCode, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface TransferData {
  recipientUsername: string;
  amount: number;
  type: 'gold' | 'rial';
  description?: string;
}

export function TransferSystem() {
  const { user } = useAuth();
  const [transferData, setTransferData] = useState<TransferData>({
    recipientUsername: '',
    amount: 0,
    type: 'rial',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [walletCode, setWalletCode] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/transfer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(transferData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: `انتقال با موفقیت انجام شد. کد تراکنش: ${result.transactionId}`
        });
        setTransferData({
          recipientUsername: '',
          amount: 0,
          type: 'rial',
          description: ''
        });
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || 'خطا در انجام انتقال'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در ارتباط با سرور'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWalletCode = () => {
    const code = `${user?.username}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setWalletCode(code);
    setShowQR(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({
      type: 'success',
      text: 'کد در کلیپ‌بورد کپی شد'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          سیستم انتقال بین کاربران
        </h2>

        {/* فرم انتقال */}
        <form onSubmit={handleTransfer} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام کاربری گیرنده
              </label>
              <input
                type="text"
                value={transferData.recipientUsername}
                onChange={(e) => setTransferData({ ...transferData, recipientUsername: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="نام کاربری گیرنده را وارد کنید"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع انتقال
              </label>
              <select
                value={transferData.type}
                onChange={(e) => setTransferData({ ...transferData, type: e.target.value as 'gold' | 'rial' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="rial">ریال</option>
                <option value="gold">طلا (گرم)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مبلغ / مقدار
              </label>
              <input
                type="number"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder={transferData.type === 'rial' ? 'مبلغ به تومان' : 'مقدار به گرم'}
                step={transferData.type === 'rial' ? 1000 : 0.1}
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات (اختیاری)
              </label>
              <input
                type="text"
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="توضیحات انتقال"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'در حال انجام...' : 'انجام انتقال'}
            </button>
          </div>
        </form>

        {/* پیام‌های سیستم */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* کد کیف پول */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">کد کیف پول</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-4">
              کد کیف پول خود را برای دریافت انتقال از سایر کاربران به اشتراک بگذارید:
            </p>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={generateWalletCode}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <QrCode className="w-4 h-4 ml-2" />
                تولید کد جدید
              </button>
              
              {walletCode && (
                <button
                  onClick={() => copyToClipboard(walletCode)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  کپی کد
                </button>
              )}
            </div>

            {walletCode && (
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600 mb-2">کد کیف پول شما:</p>
                <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                  {walletCode}
                </code>
              </div>
            )}

            {showQR && walletCode && (
              <div className="mt-4 text-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">QR Code</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* راهنمای استفاده */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">راهنمای استفاده</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• برای انتقال، نام کاربری گیرنده را وارد کنید</li>
              <li>• نوع انتقال (ریال یا طلا) را انتخاب کنید</li>
              <li>• مبلغ یا مقدار را وارد کنید</li>
              <li>• کد کیف پول خود را برای دریافت انتقال به اشتراک بگذارید</li>
              <li>• تمام تراکنش‌ها در سیستم ثبت و قابل پیگیری هستند</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
