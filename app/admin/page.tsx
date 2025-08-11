'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { formatNumber } from '@/app/lib/utils';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingOrders: number;
  activeUsers: number;
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

interface Order {
  id: string;
  userId: string;
  type: string;
  productType: string;
  amount: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token, activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'dashboard') {
        const statsResponse = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } else if (activeTab === 'users') {
        const usersResponse = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }
      } else if (activeTab === 'orders') {
        const ordersResponse = await fetch('/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders);
        }
      }
    } catch (error) {
      console.error('خطا در دریافت اطلاعات ادمین:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/orders/status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'وضعیت سفارش با موفقیت به‌روزرسانی شد' });
        setTimeout(() => setMessage(null), 3000);
        fetchAdminData(); // به‌روزرسانی داده‌ها
      } else {
        setMessage({ type: 'error', text: 'خطا در به‌روزرسانی وضعیت سفارش' });
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی سفارش:', error);
      setMessage({ type: 'error', text: 'خطا در به‌روزرسانی سفارش' });
    }
  };

  const getProductTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'GOLD_18K': 'طلای 18 عیار',
      'GOLD_24K': 'طلای 24 عیار',
      'COIN_BAHAR': 'سکه بهار آزادی',
      'COIN_NIM': 'نیم سکه',
      'COIN_ROBE': 'ربع سکه',
      'COIN_BAHAR_86': 'سکه بهار آزادی 86',
      'COIN_NIM_86': 'نیم سکه 86',
      'COIN_ROBE_86': 'ربع سکه 86',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار' },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', text: 'تایید شده' },
      'PROCESSING': { color: 'bg-purple-100 text-purple-800', text: 'در حال پردازش' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'تکمیل شده' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', text: 'لغو شده' },
      'FAILED': { color: 'bg-gray-100 text-gray-800', text: 'ناموفق' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری پنل ادمین...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">پنل مدیریت</h1>
          <p className="text-gray-600">مدیریت کاربران، سفارش‌ها و سیستم</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              {[
                { id: 'dashboard', name: 'داشبورد', icon: '📊' },
                { id: 'users', name: 'کاربران', icon: '👥' },
                { id: 'orders', name: 'سفارش‌ها', icon: '📋' },
                { id: 'system', name: 'سیستم', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-gold text-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="ml-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">کل کاربران</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">کل سفارش‌ها</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">درآمد کل</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalRevenue)} تومان</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">سفارش‌های در انتظار</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingOrders)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">کاربران فعال</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeUsers)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">کل تراکنش‌ها</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalTransactions)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">لیست کاربران</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      کاربر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      شماره موبایل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاریخ عضویت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      آخرین ورود
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            تایید شده
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            در انتظار تایید
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString('fa-IR')
                          : 'هیچ‌گاه'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">لیست سفارش‌ها</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      سفارش
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      کاربر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      محصول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      مبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user.firstName} {order.user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.type === 'BUY' ? 'خرید' : 'فروش'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getProductTypeLabel(order.productType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(order.totalPrice)} تومان
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-gold focus:border-gold"
                        >
                          <option value="PENDING">در انتظار</option>
                          <option value="CONFIRMED">تایید شده</option>
                          <option value="PROCESSING">در حال پردازش</option>
                          <option value="COMPLETED">تکمیل شده</option>
                          <option value="CANCELLED">لغو شده</option>
                          <option value="FAILED">ناموفق</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات سیستم</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">مدیریت کارمزدها</h4>
                  <p className="text-sm text-gray-500">تنظیم نرخ‌های کارمزد برای محصولات مختلف</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gold bg-white border border-gold rounded-md hover:bg-gold hover:text-white transition-colors">
                  مدیریت
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">مدیریت قیمت‌ها</h4>
                  <p className="text-sm text-gray-500">تنظیم قیمت‌های لحظه‌ای محصولات</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gold bg-white border border-gold rounded-md hover:bg-gold hover:text-white transition-colors">
                  مدیریت
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">گزارش‌های سیستم</h4>
                  <p className="text-sm text-gray-500">مشاهده گزارش‌های جامع سیستم</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gold bg-white border border-gold rounded-md hover:bg-gold hover:text-white transition-colors">
                  مشاهده
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">پشتیبان‌گیری</h4>
                  <p className="text-sm text-gray-500">ایجاد نسخه پشتیبان از دیتابیس</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gold bg-white border border-gold rounded-md hover:bg-gold hover:text-white transition-colors">
                  شروع
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
