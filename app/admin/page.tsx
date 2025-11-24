'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { formatNumber, formatCountdown } from '@/app/lib/utils';
import ChargeWalletModal from '@/app/components/Admin/ChargeWalletModal';
import UserWalletModal from '@/app/components/Admin/UserWalletModal';
import { Wallet, Eye, AlertTriangle, AlertCircle, BellRing, Clock } from 'lucide-react';

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
  wallets?: Array<{
    type: string;
    balance: number | string;
    currency: string;
  }>;
}

interface Order {
  id: string;
  userId: string;
  type: string;
  productType: string;
  amount: number;
  totalPrice: number;
  commission?: number;
  status: string;
  createdAt: string;
  priceLockedAt?: string | null;
  expiresAt?: string | null;
  statusReason?: string | null;
  adminNotes?: string | null;
  notes?: string | null;
  user: {
    firstName: string;
    lastName: string;
  };
  userWallet?: {
    rial: number;
    gold: number;
  };
  hasEnoughBalance?: boolean;
  balanceCheck?: {
    type: string;
    current: number;
    required: number;
    shortage: number;
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
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userWalletData, setUserWalletData] = useState<any>(null);
  const [confirmCharge, setConfirmCharge] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [confirmOrderStatus, setConfirmOrderStatus] = useState<{ show: boolean; order: Order | null; newStatus: string; reasonRequired?: boolean; reason?: string }>({ show: false, order: null, newStatus: '', reason: '' });
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const lastPendingOrdersRef = useRef<string[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const titleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitleRef = useRef<string>('');

  const playNotificationSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
      oscillator.stop(audioCtx.currentTime + 1);
      setTimeout(() => audioCtx.close(), 1500);
    } catch (error) {
      console.warn('پخش صدا توسط مرورگر مسدود شد');
    }
  };

  const triggerOrderAlert = (count: number) => {
    setMessage({ type: 'success', text: `${count} سفارش جدید ثبت شد` });
    setTimeout(() => setMessage(null), 4000);
    playNotificationSound();
  };

  const fetchOrders = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!token) return;
      if (!options.silent) setLoading(true);
      try {
        const ordersResponse = await fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders);
          const pendingIds: string[] = (ordersData.orders || [])
            .filter((order: Order) => order.status === 'PENDING')
            .map((order: Order) => order.id);
          setPendingOrdersCount(pendingIds.length);

          const previousPending = new Set(lastPendingOrdersRef.current);
          const newOnes = pendingIds.filter((id: string) => !previousPending.has(id));
          if (newOnes.length > 0) {
            setNewOrderIds(newOnes);
            triggerOrderAlert(newOnes.length);
          }
          lastPendingOrdersRef.current = pendingIds;
        }
      } catch (error) {
        console.error('خطا در دریافت سفارش‌ها:', error);
      } finally {
        if (!options.silent) setLoading(false);
      }
    },
    [token]
  );

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    if (activeTab === 'orders') {
      await fetchOrders();
      return;
    }

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
      }
    } catch (error) {
      console.error('خطا در دریافت اطلاعات ادمین:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchOrders, token]);

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token, fetchAdminData]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }

    if (newOrderIds.length === 0) {
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        titleIntervalRef.current = null;
        document.title = originalTitleRef.current;
      }
      return;
    }

    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
    }

    let toggle = false;
    titleIntervalRef.current = setInterval(() => {
      document.title = toggle ? '🔔 سفارش جدید' : originalTitleRef.current;
      toggle = !toggle;
    }, 1000);

    const highlightTimeout = setTimeout(() => setNewOrderIds([]), 8000);

    return () => {
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        titleIntervalRef.current = null;
        document.title = originalTitleRef.current;
      }
      clearTimeout(highlightTimeout);
    };
  }, [newOrderIds]);

  useEffect(() => {
    if (!token || activeTab !== 'orders') return;
    fetchOrders({ silent: true });
    const interval = setInterval(() => fetchOrders({ silent: true }), 15000);
    return () => clearInterval(interval);
  }, [activeTab, token, fetchOrders]);

  const reasonRequiredStatuses = ['CANCELLED', 'FAILED', 'REJECTED', 'REJECTED_PRICE_CHANGE'];

  const handleOrderStatusChange = (order: Order, newStatus: string) => {
    if (newStatus === order.status) return;

    if (newStatus === 'COMPLETED') {
      if (order.hasEnoughBalance === false) {
        setMessage({
          type: 'error',
          text: `موجودی کافی نیست. ${order.balanceCheck ? `کمبود: ${formatNumber(order.balanceCheck.shortage)} ${order.balanceCheck.type === 'RIAL' ? 'تومان' : 'گرم'}` : ''}`,
        });
        setTimeout(() => setMessage(null), 5000);
        return;
      }
      setConfirmOrderStatus({ show: true, order, newStatus, reasonRequired: false, reason: '' });
      return;
    }

    if (reasonRequiredStatuses.includes(newStatus)) {
      setConfirmOrderStatus({ show: true, order, newStatus, reasonRequired: true, reason: '' });
      return;
    }

    updateOrderStatus(order.id, newStatus);
  };

  const confirmOrderStatusChange = async () => {
    if (!confirmOrderStatus.order) return;

    if (confirmOrderStatus.reasonRequired && !confirmOrderStatus.reason?.trim()) {
      setMessage({ type: 'error', text: 'لطفاً دلیل این تغییر وضعیت را وارد کنید' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    await updateOrderStatus(
      confirmOrderStatus.order.id,
      confirmOrderStatus.newStatus,
      confirmOrderStatus.reason?.trim()
    );
    setConfirmOrderStatus({ show: false, order: null, newStatus: '', reason: '' });
  };

  const updateOrderStatus = async (orderId: string, status: string, reason?: string) => {
    try {
      const response = await fetch('/api/admin/orders/status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status, statusReason: reason }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'وضعیت سفارش با موفقیت به‌روزرسانی شد' });
        setTimeout(() => setMessage(null), 3000);
        fetchAdminData(); // به‌روزرسانی داده‌ها
      } else {
        setMessage({ type: 'error', text: data.error || 'خطا در به‌روزرسانی وضعیت سفارش' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی سفارش:', error);
      setMessage({ type: 'error', text: 'خطا در اتصال به سرور' });
      setTimeout(() => setMessage(null), 5000);
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
      'EXPIRED': { color: 'bg-gray-200 text-gray-800', text: 'منقضی شده' },
      'REJECTED': { color: 'bg-red-100 text-red-800', text: 'رد شده' },
      'REJECTED_PRICE_CHANGE': { color: 'bg-orange-100 text-orange-800', text: 'رد به دلیل قیمت' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRemainingSeconds = (order: Order) => {
    if (!order.expiresAt) return null;
    const expiresTime = new Date(order.expiresAt).getTime();
    return Math.max(0, Math.floor((expiresTime - currentTime) / 1000));
  };

  const handleChargeWallet = async (user: User) => {
    // نمایش Confirmation Dialog
    setConfirmCharge({ show: true, user });
  };

  const confirmChargeAction = async () => {
    if (!confirmCharge.user) return;

    try {
      // دریافت موجودی کاربر
      const response = await fetch(`/api/admin/users/${confirmCharge.user.id}/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserWalletData(data);
        setSelectedUser(confirmCharge.user);
        setChargeModalOpen(true);
        setConfirmCharge({ show: false, user: null });
      } else {
        setMessage({ type: 'error', text: 'خطا در دریافت موجودی کاربر' });
        setConfirmCharge({ show: false, user: null });
      }
    } catch (error) {
      console.error('خطا در دریافت موجودی:', error);
      setMessage({ type: 'error', text: 'خطا در دریافت موجودی کاربر' });
      setConfirmCharge({ show: false, user: null });
    }
  };

  const handleViewWallet = (user: User) => {
    setSelectedUser(user);
    setWalletModalOpen(true);
  };

  const getWalletBalance = (user: User, type: 'RIAL' | 'GOLD') => {
    if (!user.wallets) return 0;
    const wallet = user.wallets.find(w => w.type === type);
    return wallet ? Number(wallet.balance) : 0;
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
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                    {tab.id === 'orders' && pendingOrdersCount > 0 && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          newOrderIds.length
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pendingOrdersCount}
                      </span>
                    )}
                  </span>
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
                      موجودی ریالی
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      موجودی طلایی
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(getWalletBalance(user, 'RIAL'))} تومان
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(getWalletBalance(user, 'GOLD'))} گرم
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              تایید شده
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              در انتظار تایید
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {!user.isVerified && (
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/admin/users', {
                                    method: 'PATCH',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      userId: user.id,
                                      isVerified: true
                                    }),
                                  });

                                  if (response.ok) {
                                    setMessage({ type: 'success', text: 'کاربر با موفقیت تایید شد' });
                                    setTimeout(() => setMessage(null), 3000);
                                    fetchAdminData();
                                  } else {
                                    const data = await response.json();
                                    setMessage({ type: 'error', text: data.error || 'خطا در تایید کاربر' });
                                    setTimeout(() => setMessage(null), 5000);
                                  }
                                } catch (error) {
                                  console.error('خطا در تایید کاربر:', error);
                                  setMessage({ type: 'error', text: 'خطا در اتصال به سرور' });
                                  setTimeout(() => setMessage(null), 5000);
                                }
                              }}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                              title="تایید کاربر"
                            >
                              ✓ تایید
                            </button>
                          )}
                          <button
                            onClick={() => handleViewWallet(user)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors relative group"
                            title="مشاهده موجودی و تراکنش‌های کاربر"
                            aria-label="مشاهده موجودی"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            مشاهده
                            {/* Tooltip */}
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              مشاهده موجودی و تراکنش‌ها
                            </span>
                          </button>
                          <button
                            onClick={() => handleChargeWallet(user)}
                            className="inline-flex items-center px-3 py-1.5 border border-gold rounded-md text-xs text-gold bg-white hover:bg-gold hover:text-white transition-colors relative group"
                            title="شارژ دستی موجودی کاربر"
                            aria-label="شارژ موجودی"
                          >
                            <Wallet className="w-3 h-3 ml-1" />
                            شارژ
                            {/* Tooltip */}
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              شارژ دستی موجودی
                            </span>
                          </button>
                        </div>
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
            {newOrderIds.length > 0 && (
              <div className="mx-6 mt-4 mb-2 flex items-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                <BellRing className="w-4 h-4" />
                <span>
                  {newOrderIds.length} سفارش جدید در انتظار تایید است. لطفاً سریع‌تر بررسی و تایید/رد نمایید.
                </span>
              </div>
            )}
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
                      زمان باقی‌مانده
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      موجودی کاربر
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
                  {orders.map((order) => {
                    const isNewOrder = newOrderIds.includes(order.id);
                    const remainingSeconds = getRemainingSeconds(order);

                    return (
                      <tr key={order.id} className={isNewOrder ? 'bg-yellow-50/70 transition-colors' : ''}>
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
                          <div className="space-y-1">
                            <div>{getProductTypeLabel(order.productType)}</div>
                            {order.notes && (
                              <div className="text-xs text-gray-500">یادداشت کاربر: {order.notes}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{formatNumber(order.totalPrice)} تومان</div>
                            {order.commission && (
                              <div className="text-xs text-gray-500">
                                کارمزد: {formatNumber(order.commission)} تومان
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.status === 'PENDING' && order.expiresAt ? (
                            remainingSeconds && remainingSeconds > 0 ? (
                              <div className={`flex items-center gap-1 font-mono ${remainingSeconds <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                                <Clock className="w-4 h-4" />
                                {formatCountdown(remainingSeconds)}
                              </div>
                            ) : (
                              <span className="text-red-600 text-sm">پایان یافته</span>
                            )
                          ) : order.status === 'EXPIRED' ? (
                            <span className="text-gray-500 text-sm">منقضی شده</span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {order.userWallet ? (
                            <div>
                              {order.type === 'BUY' ? (
                                <>
                                  <div className="text-gray-900">
                                    ریالی: {formatNumber(order.userWallet.rial)} تومان
                                  </div>
                                  {order.status === 'PENDING' && order.hasEnoughBalance === false && (
                                    <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                                      <AlertCircle className="w-3 h-3" />
                                      موجودی کافی نیست
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="text-gray-900">
                                    طلایی: {formatNumber(order.userWallet.gold)} گرم
                                  </div>
                                  {order.status === 'PENDING' && order.hasEnoughBalance === false && (
                                    <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                                      <AlertCircle className="w-3 h-3" />
                                      موجودی کافی نیست
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                            {order.status === 'PENDING' && order.hasEnoughBalance === false && (
                              <div className="relative group">
                                <AlertCircle className="w-4 h-4 text-red-500" aria-label="موجودی کافی نیست" />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  موجودی کافی نیست
                                </span>
                              </div>
                            )}
                          </div>
                          {order.statusReason && (
                            <div className="mt-1 text-xs text-gray-500">
                              علت: {order.statusReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.status}
                            onChange={(e) => handleOrderStatusChange(order, e.target.value)}
                            disabled={order.status === 'COMPLETED' || order.status === 'EXPIRED'}
                            className={`text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-gold focus:border-gold ${
                              order.status === 'PENDING' && order.hasEnoughBalance === false
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                          >
                            <option value="PENDING">در انتظار</option>
                            <option value="CONFIRMED">تایید شده</option>
                            <option value="PROCESSING">در حال پردازش</option>
                            <option value="COMPLETED">تکمیل شده</option>
                            <option value="CANCELLED">لغو شده</option>
                            <option value="FAILED">ناموفق</option>
                            <option value="REJECTED">رد شده</option>
                            <option value="REJECTED_PRICE_CHANGE">معامله بسته نشد (تغییر قیمت)</option>
                            <option value="EXPIRED">منقضی شده</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Confirmation Dialog for Order Status */}
      {confirmOrderStatus.show && confirmOrderStatus.order && (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setConfirmOrderStatus({ show: false, order: null, newStatus: '', reason: '' })}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">تایید تغییر وضعیت سفارش</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      آیا می‌خواهید سفارش <strong>{confirmOrderStatus.order.id.slice(-8)}</strong> را به وضعیت <strong>{confirmOrderStatus.newStatus === 'COMPLETED' ? 'تکمیل شده' : confirmOrderStatus.newStatus}</strong> تغییر دهید؟
                    </p>
                    {confirmOrderStatus.newStatus === 'COMPLETED' && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        <p>⚠️ با تایید این سفارش:</p>
                        {confirmOrderStatus.order.type === 'BUY' ? (
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>{formatNumber(Number(confirmOrderStatus.order.totalPrice))} تومان از موجودی ریالی کاربر کسر می‌شود</li>
                            <li>{formatNumber(Number(confirmOrderStatus.order.amount))} گرم به موجودی طلایی کاربر اضافه می‌شود</li>
                          </ul>
                        ) : (
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>{formatNumber(Number(confirmOrderStatus.order.amount))} گرم از موجودی طلایی کاربر کسر می‌شود</li>
                            <li>{formatNumber(Number(confirmOrderStatus.order.totalPrice) - Number(confirmOrderStatus.order.commission || 0))} تومان به موجودی ریالی کاربر اضافه می‌شود</li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {confirmOrderStatus.reasonRequired && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">دلیل این تغییر</label>
                    <textarea
                      rows={3}
                      value={confirmOrderStatus.reason || ''}
                      onChange={(e) => setConfirmOrderStatus((prev) => ({ ...prev, reason: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:ring-gold"
                      placeholder="مثلاً: قیمت بازار تغییر کرد و امکان خرید با قیمت قبلی وجود نداشت"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setConfirmOrderStatus({ show: false, order: null, newStatus: '', reason: '' })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={confirmOrderStatusChange}
                    className="flex-1 px-4 py-2 bg-gold text-white rounded-md hover:bg-gold-dark transition-colors"
                  >
                    تایید و ادامه
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmCharge.show && confirmCharge.user && (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setConfirmCharge({ show: false, user: null })}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">تایید شارژ موجودی</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      آیا می‌خواهید موجودی کاربر <strong>{confirmCharge.user.firstName} {confirmCharge.user.lastName}</strong> را شارژ کنید؟
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setConfirmCharge({ show: false, user: null })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={confirmChargeAction}
                    className="flex-1 px-4 py-2 bg-gold text-white rounded-md hover:bg-gold-dark transition-colors"
                  >
                    تایید و ادامه
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charge Wallet Modal */}
      {selectedUser && (
        <ChargeWalletModal
          isOpen={chargeModalOpen}
          onClose={() => {
            setChargeModalOpen(false);
            setSelectedUser(null);
            setUserWalletData(null);
          }}
          userId={selectedUser.id}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          currentBalance={{
            rial: userWalletData?.summary?.totalRial || getWalletBalance(selectedUser, 'RIAL'),
            gold: userWalletData?.summary?.totalGold || getWalletBalance(selectedUser, 'GOLD'),
          }}
          onSuccess={() => {
            setMessage({ type: 'success', text: 'موجودی با موفقیت شارژ شد' });
            setTimeout(() => setMessage(null), 3000);
            fetchAdminData(); // به‌روزرسانی لیست کاربران
          }}
          token={token || ''}
        />
      )}

      {/* User Wallet Modal */}
      {selectedUser && (
        <UserWalletModal
          isOpen={walletModalOpen}
          onClose={() => {
            setWalletModalOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          token={token || ''}
        />
      )}
    </div>
  );
}
