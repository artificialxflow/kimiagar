'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatNumber, formatDateTime } from '@/app/lib/utils';

interface UserTransactionsProps {
  userId: string;
  token: string;
  page?: number;
  limit?: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number | string;
  description: string | null;
  status: string;
  referenceId: string | null;
  metadata: any;
  createdAt: string;
  wallet: {
    id: string;
    type: string;
    currency: string;
  };
}

export default function UserTransactions({ userId, token, page: initialPage = 1, limit: initialLimit = 20 }: UserTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchTransactions();
  }, [userId, token, page, typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: initialLimit.toString(),
      });

      if (typeFilter) {
        params.append('type', typeFilter);
      }

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/users/${userId}/transactions?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'خطا در دریافت تراکنش‌ها');
      }
    } catch (error) {
      console.error('خطا در دریافت تراکنش‌ها:', error);
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

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filter changes
    fetchTransactions();
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              فیلتر بر اساس نوع
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="">همه</option>
              <option value="DEPOSIT">واریز</option>
              <option value="WITHDRAW">برداشت</option>
              <option value="TRANSFER">انتقال</option>
              <option value="COMMISSION">کارمزد</option>
              <option value="ORDER_PAYMENT">پرداخت سفارش</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              فیلتر بر اساس وضعیت
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="">همه</option>
              <option value="PENDING">در انتظار</option>
              <option value="COMPLETED">تکمیل شده</option>
              <option value="FAILED">ناموفق</option>
              <option value="CANCELLED">لغو شده</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setTypeFilter('');
                setStatusFilter('');
                setPage(1);
                fetchTransactions();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            تراکنش‌ها ({formatNumber(total)})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
            <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>تراکنشی یافت نشد</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      مبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      توضیحات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      شماره فیش
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاریخ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTransactionTypeLabel(transaction.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatNumber(transaction.amount)} {transaction.wallet.type === 'RIAL' ? 'تومان' : 'گرم'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.referenceId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTransactionStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  نمایش {((page - 1) * initialLimit) + 1} تا {Math.min(page * initialLimit, total)} از {formatNumber(total)} تراکنش
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    قبلی
                  </button>
                  <div className="px-4 py-2 text-sm text-gray-700">
                    صفحه {page} از {totalPages}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    بعدی
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

