"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout/Layout";
import { ArrowRight, Wallet, Coins, AlertCircle, CheckCircle } from 'lucide-react';

export default function TransferPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transferData, setTransferData] = useState({
    fromWallet: '',
    toWallet: '',
    amount: '',
    description: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchWallets(parsedUser.id);
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const fetchWallets = async (userId: string) => {
    try {
      const response = await fetch(`/api/wallet/balance?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setWallets(data.wallets || []);
      } else {
        setError(data.error || 'خطا در دریافت اطلاعات کیف پول');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTransferData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!transferData.fromWallet || !transferData.toWallet || !transferData.amount) {
      setError('لطفاً تمام فیلدها را پر کنید');
      return false;
    }

    if (transferData.fromWallet === transferData.toWallet) {
      setError('کیف پول مبدا و مقصد نمی‌تواند یکسان باشد');
      return false;
    }

    const amount = parseFloat(transferData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('مبلغ باید عدد مثبت باشد');
      return false;
    }

    const fromWallet = wallets.find(w => w.id === transferData.fromWallet);
    if (fromWallet && amount > parseFloat(fromWallet.balance)) {
      setError('موجودی کافی نیست');
      return false;
    }

    return true;
  };

  const handleTransfer = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...transferData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('انتقال با موفقیت انجام شد');
        setTransferData({
          fromWallet: '',
          toWallet: '',
          amount: '',
          description: ''
        });
        // به‌روزرسانی موجودی‌ها
        fetchWallets(user.id);
      } else {
        setError(data.error || 'خطا در انجام انتقال');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setProcessing(false);
    }
  };

  const getWalletDisplayName = (wallet: any) => {
    if (wallet.type === 'RIAL') {
      return `کیف پول ریالی - ${parseFloat(wallet.balance).toLocaleString()} تومان`;
    } else {
      return `کیف پول طلایی - ${parseFloat(wallet.balance)} گرم`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">انتقال بین کیف پول‌ها</h1>
          <p className="text-slate-600">انتقال وجه بین کیف پول‌های ریالی و طلایی</p>
        </div>

        {/* Transfer Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">انتقال وجه</h2>
                <p className="text-white/80">انتقال بین کیف پول‌های خود</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 space-x-reverse">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Transfer Form */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* From Wallet */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
                  <Wallet className="w-5 h-5 text-red-500" />
                  <span>کیف پول مبدا</span>
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">انتخاب کیف پول</label>
                  <select
                    value={transferData.fromWallet}
                    onChange={(e) => handleInputChange('fromWallet', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">انتخاب کنید</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {getWalletDisplayName(wallet)}
                      </option>
                    ))}
                  </select>
                </div>

                {transferData.fromWallet && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">موجودی فعلی:</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {(() => {
                        const wallet = wallets.find(w => w.id === transferData.fromWallet);
                        if (wallet?.type === 'RIAL') {
                          return `${parseFloat(wallet.balance).toLocaleString()} تومان`;
                        } else {
                          return `${parseFloat(wallet.balance)} گرم طلا`;
                        }
                      })()}
                    </p>
                  </div>
                )}
              </div>

              {/* To Wallet */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
                  <Coins className="w-5 h-5 text-green-500" />
                  <span>کیف پول مقصد</span>
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">انتخاب کیف پول</label>
                  <select
                    value={transferData.toWallet}
                    onChange={(e) => handleInputChange('toWallet', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">انتخاب کنید</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {getWalletDisplayName(wallet)}
                      </option>
                    ))}
                  </select>
                </div>

                {transferData.toWallet && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">موجودی فعلی:</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {(() => {
                        const wallet = wallets.find(w => w.id === transferData.toWallet);
                        if (wallet?.type === 'RIAL') {
                          return `${parseFloat(wallet.balance).toLocaleString()} تومان`;
                        } else {
                          return `${parseFloat(wallet.balance)} گرم طلا`;
                        }
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Amount and Description */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">مبلغ انتقال</label>
                <input
                  type="number"
                  value={transferData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="مبلغ را وارد کنید"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {transferData.fromWallet && (() => {
                    const wallet = wallets.find(w => w.id === transferData.fromWallet);
                    return wallet?.type === 'RIAL' ? 'مبلغ به تومان وارد کنید' : 'مقدار به گرم وارد کنید';
                  })()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">توضیحات (اختیاری)</label>
                <textarea
                  value={transferData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="توضیحات انتقال"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleTransfer}
                disabled={processing || !transferData.fromWallet || !transferData.toWallet || !transferData.amount}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 space-x-reverse"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>در حال پردازش...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    <span>انجام انتقال</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">نکات مهم:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• انتقال بین کیف پول‌های ریالی و طلایی امکان‌پذیر است</li>
            <li>• مبلغ انتقال باید از موجودی کیف پول مبدا کمتر باشد</li>
            <li>• عملیات انتقال غیرقابل بازگشت است</li>
            <li>• تراکنش‌های انتقال در تاریخچه ثبت می‌شوند</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 