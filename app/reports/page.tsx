'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { formatNumber } from '@/app/lib/utils';
import Layout from '@/app/components/Layout/Layout';

interface ReportData {
  transactions: {
    total: number;
    count: number;
    monthly: { month: string; amount: number }[];
  };
  orders: {
    total: number;
    count: number;
    monthly: { month: string; amount: number }[];
    topProducts: { product: string; count: number; amount: number }[];
  };
  wallet: {
    balance: number;
    monthly: { month: string; balance: number }[];
  };
}

export default function ReportsPage() {
  const { user, token } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90, 365
  const [reportType, setReportType] = useState('all'); // all, transactions, orders, wallet

  useEffect(() => {
    if (user && token) {
      fetchReports();
    }
  }, [user, token, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('خطا در دریافت گزارش‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeLabel = (days: string) => {
    switch (days) {
      case '7': return '7 روز گذشته';
      case '30': return '30 روز گذشته';
      case '90': return '90 روز گذشته';
      case '365': return 'یک سال گذشته';
      default: return '30 روز گذشته';
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">لطفاً ابتدا وارد شوید</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">گزارش‌ها</h1>
            <p className="text-gray-600">مشاهده آمار و گزارش‌های مالی</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">بازه زمانی</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">7 روز گذشته</option>
                  <option value="30">30 روز گذشته</option>
                  <option value="90">90 روز گذشته</option>
                  <option value="365">یک سال گذشته</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع گزارش</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">همه</option>
                  <option value="transactions">تراکنش‌ها</option>
                  <option value="orders">سفارش‌ها</option>
                  <option value="wallet">کیف پول</option>
                </select>
              </div>

              <div className="ml-auto">
                <button
                  onClick={fetchReports}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'در حال بارگذاری...' : 'به‌روزرسانی'}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال بارگذاری گزارش‌ها...</p>
            </div>
          ) : reportData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Summary Cards */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">کل تراکنش‌ها</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.transactions.total)} تومان</p>
                    <p className="text-sm text-gray-500">{reportData.transactions.count} تراکنش</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">کل سفارش‌ها</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.orders.total)} تومان</p>
                    <p className="text-sm text-gray-500">{reportData.orders.count} سفارش</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">موجودی کیف پول</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.wallet.balance)} تومان</p>
                    <p className="text-sm text-gray-500">موجودی فعلی</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Trends */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">روند ماهانه تراکنش‌ها</h3>
                <div className="space-y-3">
                  {reportData.transactions.monthly.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((item.amount / Math.max(...reportData.transactions.monthly.map(m => m.amount))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-20 text-left">
                          {formatNumber(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">محصولات محبوب</h3>
                <div className="space-y-3">
                  {reportData.orders.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{product.product}</p>
                        <p className="text-sm text-gray-500">{product.count} سفارش</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatNumber(product.amount)} تومان
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Tables */}
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">جزئیات تراکنش‌ها</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ماه</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مبلغ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">درصد</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.transactions.monthly.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.month}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(item.amount)} تومان</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {((item.amount / reportData.transactions.total) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">هیچ گزارشی یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
