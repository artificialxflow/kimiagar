'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { formatNumber, formatDateTime } from '@/app/lib/utils';

interface UserWalletProps {
  userId: string;
  token: string;
  onClose?: () => void;
}

interface UserWalletData {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  wallets: Array<{
    id: string;
    type: string;
    balance: number | string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  summary: {
    totalRial: number;
    totalGold: number;
    walletCount: number;
  };
  recentTransactions?: Array<{
    id: string;
    type: string;
    amount: number | string;
    description: string | null;
    status: string;
    referenceId: string | null;
    metadata: any;
    createdAt: string;
    wallet: {
      type: string;
    };
  }>;
}

export default function UserWallet({ userId, token, onClose }: UserWalletProps) {
  const [data, setData] = useState<UserWalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, [userId, token]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/admin/users/${userId}/wallet?includeTransactions=true&transactionLimit=10`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const walletData = await response.json();
        setData(walletData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'خطا در دریافت موجودی');
      }
    } catch (error) {
      console.error('خطا در دریافت موجودی:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'DEPOSIT': 'واریز',
      'WITHDRAW': 'برداشت',
      'TRANSFER': 'انتقال',
      'COMMISSION': 'کارمزد',
      'ORDER_PAYMENT': 'پرداخت سفارش',
      'DELIVERY_FEE': 'کارمزد تحویل',
      'REFUND': 'بازپرداخت',
    };
    return labels[type] || type;
  };

  const getTransactionStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'تکمیل شده' },
      'FAILED': { color: 'bg-red-100 text-red-800', text: 'ناموفق' },
      'CANCELLED': { color: 'bg-gray-100 text-gray-800', text: 'لغو شده' },
      'REFUNDED': { color: 'bg-blue-100 text-blue-800', text: 'بازپرداخت شده' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const rialWallet = data.wallets.find(w => w.type === 'RIAL');
  const goldWallet = data.wallets.find(w => w.type === 'GOLD');

  return (
    <div className="space-y-6" dir="rtl">
      {/* User Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">اطلاعات کاربر</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">نام و نام خانوادگی</p>
            <p className="text-base font-medium text-gray-900">
              {data.user.firstName} {data.user.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">نام کاربری</p>
            <p className="text-base font-medium text-gray-900">{data.user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">شماره موبایل</p>
            <p className="text-base font-medium text-gray-900">{data.user.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RIAL Wallet */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">کیف پول ریالی</h3>
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">موجودی</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(rialWallet?.balance || 0)} تومان
              </p>
            </div>
            {rialWallet && (
              <div className="text-xs text-gray-500">
                <p>وضعیت: {rialWallet.isActive ? 'فعال' : 'غیرفعال'}</p>
                <p>آخرین به‌روزرسانی: {formatDateTime(rialWallet.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* GOLD Wallet */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">کیف پول طلایی</h3>
            <Wallet className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">موجودی</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(goldWallet?.balance || 0)} گرم
              </p>
            </div>
            {goldWallet && (
              <div className="text-xs text-gray-500">
                <p>وضعیت: {goldWallet.isActive ? 'فعال' : 'غیرفعال'}</p>
                <p>آخرین به‌روزرسانی: {formatDateTime(goldWallet.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {data.recentTransactions && data.recentTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">آخرین تراکنش‌ها</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    توضیحات
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {getTransactionTypeLabel(transaction.type)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(transaction.amount)} {transaction.wallet.type === 'RIAL' ? 'تومان' : 'گرم'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getTransactionStatusBadge(transaction.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-gold to-yellow-500 rounded-lg shadow-sm p-6 text-white">
        <h3 className="text-lg font-medium mb-4">خلاصه موجودی</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">موجودی ریالی کل</p>
            <p className="text-2xl font-bold">{formatNumber(data.summary.totalRial)} تومان</p>
          </div>
          <div>
            <p className="text-sm opacity-90">موجودی طلایی کل</p>
            <p className="text-2xl font-bold">{formatNumber(data.summary.totalGold)} گرم</p>
          </div>
        </div>
      </div>
    </div>
  );
}

