"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout/Layout";
import { ArrowRight, Wallet, Coins, AlertCircle, CheckCircle, User, Phone, Search, PauseCircle } from 'lucide-react';
import { useTradingMode } from '@/app/hooks/useTradingMode';
import { formatRial } from '@/app/lib/utils';

export default function TransferPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transferData, setTransferData] = useState({
    fromWallet: '',
    toPhone: '',
    amount: '',
    description: ''
  });
  const [recipientInfo, setRecipientInfo] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searching, setSearching] = useState(false);
  const [transferType, setTransferType] = useState<'RIAL' | 'GOLD'>('RIAL');
  const [goldType, setGoldType] = useState<'GOLD_18K' | 'COIN_BAHAR_86' | 'COIN_NIM_86' | 'COIN_ROBE_86'>('GOLD_18K');
  const router = useRouter();
  const { mode: tradingMode } = useTradingMode(15000);

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

  // محاسبه کارمزد انتقال
  const calculateTransferCommission = () => {
    const amount = parseFloat(transferData.amount) || 0;
    if (amount <= 0) return 0;
    
    // کارمزد 0.5% برای انتقال
    return amount * 0.005;
  };

  // محاسبه مبلغ نهایی
  const calculateFinalAmount = () => {
    const amount = parseFloat(transferData.amount) || 0;
    const commission = calculateTransferCommission();
    return amount + commission;
  };

  const handleInputChange = (field: string, value: string) => {
    setTransferData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
    
    // اگر شماره تلفن تغییر کرد، اطلاعات گیرنده را پاک کن
    if (field === 'toPhone') {
      setRecipientInfo(null);
    }
  };

  const searchRecipient = async () => {
    if (!transferData.toPhone || transferData.toPhone.length < 10) {
      setError('لطفاً شماره تلفن معتبر وارد کنید');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/users/search?phone=${transferData.toPhone}`);
      const data = await response.json();

      if (response.ok && data.user) {
        setRecipientInfo(data.user);
      } else {
        setError('کاربری با این شماره تلفن یافت نشد');
        setRecipientInfo(null);
      }
    } catch (error) {
      setError('خطا در جستجوی کاربر');
      setRecipientInfo(null);
    } finally {
      setSearching(false);
    }
  };

  const validateForm = () => {
    if (tradingMode.tradingPaused) {
      setError(tradingMode.message || 'در حال حاضر امکان ثبت سفارش وجود ندارد.');
      return false;
    }

    if (!transferData.toPhone || !transferData.amount) {
      setError('لطفاً تمام فیلدها را پر کنید');
      return false;
    }

    if (!recipientInfo) {
      setError('لطفاً ابتدا گیرنده را جستجو کنید');
      return false;
    }

    const amount = parseFloat(transferData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('مبلغ باید عدد مثبت باشد');
      return false;
    }

    const wallet = wallets.find(w => w.type === transferType);
    if (!wallet) {
      setError('کیف پول مورد نظر یافت نشد');
      return false;
    }

    let balance = 0;
    if (transferType === 'RIAL') {
      balance = parseFloat(wallet.balance);
    } else {
      if (goldType === 'GOLD_18K') {
        balance = parseFloat(wallet.balance);
      } else {
        balance = wallet.coins && (
          (goldType === 'COIN_BAHAR_86' ? wallet.coins.fullCoin || 0 :
           goldType === 'COIN_NIM_86' ? wallet.coins.halfCoin || 0 :
           goldType === 'COIN_ROBE_86' ? wallet.coins.quarterCoin || 0 : 0)
        ) || 0;
      }
    }

    const finalAmount = calculateFinalAmount();
    if (finalAmount > balance) {
      setError('موجودی کافی نیست (شامل کارمزد)');
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
      const wallet = wallets.find(w => w.type === transferType);
      
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          recipientId: recipientInfo.id,
          fromWallet: wallet?.id,
          toPhone: transferData.toPhone,
          amount: transferData.amount,
          description: transferData.description,
          transferType,
          goldType: transferType === 'GOLD' ? goldType : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('انتقال با موفقیت انجام شد');
        setTransferData(prev => ({
          ...prev,
          toPhone: '',
          amount: '',
          description: ''
        }));
        setRecipientInfo(null);
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
      return `کیف پول ریالی - ${formatRial(parseFloat(wallet.balance))} تومان`;
    } else {
      return `کیف پول طلایی - ${parseFloat(wallet.balance)} گرم`;
    }
  };

  const getGoldTypeName = (type: string) => {
    switch (type) {
      case 'GOLD_18K': return 'طلای 18 عیار';
      case 'COIN_BAHAR_86': return 'سکه 86';
      case 'COIN_NIM_86': return 'نیم سکه 86';
      case 'COIN_ROBE_86': return 'ربع سکه 86';
      default: return type;
    }
  };

  const getGoldTypeUnit = (type: string) => {
    return type === 'GOLD_18K' ? 'گرم' : 'عدد';
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">انتقال بین دو نفر</h1>
          <p className="text-slate-600">انتقال طلا و وجه به کاربران دیگر</p>
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
            {tradingMode.tradingPaused && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <PauseCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-700 font-semibold mb-1">مدیر آفلاین است</p>
                  <p className="text-red-600 text-sm">{tradingMode.message || 'معاملات به صورت موقت متوقف شده‌اند. لطفاً بعداً تلاش کنید.'}</p>
                </div>
              </div>
            )}
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
            <div className="space-y-6">
              {/* Transfer Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  نوع انتقال
                </label>
                <div className="flex space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setTransferType('RIAL')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      transferType === 'RIAL'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <Wallet className="w-5 h-5" />
                      <span>انتقال ریالی</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferType('GOLD')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      transferType === 'GOLD'
                        ? 'border-gold bg-gold-50 text-gold-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <Coins className="w-5 h-5" />
                      <span>انتقال طلا</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Gold Type Selection (only for GOLD transfer) */}
              {transferType === 'GOLD' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    نوع طلا
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGoldType('GOLD_18K')}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        goldType === 'GOLD_18K'
                          ? 'border-gold bg-gold-50 text-gold-700'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">طلای 18 عیار</div>
                        <div className="text-xs text-slate-500">گرم</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoldType('COIN_BAHAR_86')}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        goldType === 'COIN_BAHAR_86'
                          ? 'border-gold bg-gold-50 text-gold-700'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">سکه 86</div>
                        <div className="text-xs text-slate-500">عدد</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoldType('COIN_NIM_86')}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        goldType === 'COIN_NIM_86'
                          ? 'border-gold bg-gold-50 text-gold-700'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">نیم سکه 86</div>
                        <div className="text-xs text-slate-500">عدد</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoldType('COIN_ROBE_86')}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        goldType === 'COIN_ROBE_86'
                          ? 'border-gold bg-gold-50 text-gold-700'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">ربع سکه 86</div>
                        <div className="text-xs text-slate-500">عدد</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Wallet Balance Display */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
                  <Wallet className="w-5 h-5 text-blue-500" />
                  <span>موجودی کیف پول</span>
                </h3>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {transferType === 'RIAL' ? (
                        <Wallet className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Coins className="w-5 h-5 text-yellow-600" />
                      )}
                      <span className="font-medium text-slate-700">
                        {transferType === 'RIAL' ? 'کیف پول ریالی' : `کیف پول طلا (${getGoldTypeName(goldType)})`}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-slate-800">
                      {(() => {
                        const wallet = wallets.find(w => w.type === transferType);
                        if (!wallet) return '0';
                        
                        if (transferType === 'RIAL') {
                          return `${parseFloat(wallet.balance).toLocaleString()} تومان`;
                        } else {
                          // برای طلا، موجودی سکه‌ها یا گرم طلا
                          if (goldType === 'GOLD_18K') {
                            return `${parseFloat(wallet.balance)} گرم طلا`;
                          } else {
                            // برای سکه‌های مختلف
                            const coinBalance = wallet.coins && (
                              (goldType === 'COIN_BAHAR_86' ? wallet.coins.fullCoin || 0 :
                               goldType === 'COIN_NIM_86' ? wallet.coins.halfCoin || 0 :
                               goldType === 'COIN_ROBE_86' ? wallet.coins.quarterCoin || 0 : 0)
                            );
                            return `${coinBalance || 0} ${getGoldTypeUnit(goldType)}`;
                          }
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient Search */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
                  <User className="w-5 h-5 text-green-500" />
                  <span>گیرنده</span>
                </h3>
                
                <div className="flex space-x-3 space-x-reverse">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">شماره تلفن گیرنده</label>
                    <input
                      type="tel"
                      value={transferData.toPhone}
                      onChange={(e) => handleInputChange('toPhone', e.target.value)}
                      placeholder="شماره تلفن گیرنده را وارد کنید"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={searchRecipient}
                      disabled={searching || !transferData.toPhone}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 space-x-reverse"
                    >
                      <Search className="w-4 h-4" />
                      <span>{searching ? 'جستجو...' : 'جستجو'}</span>
                    </button>
                  </div>
                </div>

                {recipientInfo && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">
                          {recipientInfo.firstName} {recipientInfo.lastName}
                        </p>
                        <p className="text-sm text-green-600">
                          {recipientInfo.phone}
                        </p>
                        {recipientInfo.username && (
                          <p className="text-xs text-green-500">
                            @{recipientInfo.username}
                          </p>
                        )}
                      </div>
                    </div>
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
                    if (wallet?.type === 'RIAL') {
                      return 'مبلغ به تومان وارد کنید';
                    } else {
                      return `مقدار به ${getGoldTypeUnit(goldType)} وارد کنید`;
                    }
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

            {/* Commission Calculation */}
            {transferData.amount && parseFloat(transferData.amount) > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-slate-800 mb-3">محاسبه انتقال</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">مبلغ انتقال:</span>
                    <span className="font-medium">
                      {parseFloat(transferData.amount).toLocaleString('fa-IR')} 
                      {transferType === 'RIAL' ? ' تومان' : ` ${getGoldTypeUnit(goldType)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">کارمزد (0.5%):</span>
                    <span className="font-medium text-red-600">
                      {calculateTransferCommission().toLocaleString('fa-IR')} 
                      {transferType === 'RIAL' ? ' تومان' : ` ${getGoldTypeUnit(goldType)}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-800">کل مبلغ کسر شده:</span>
                      <span className="font-bold text-lg text-slate-800">
                        {calculateFinalAmount().toLocaleString('fa-IR')} 
                        {transferType === 'RIAL' ? ' تومان' : ` ${getGoldTypeUnit(goldType)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleTransfer}
                disabled={tradingMode.tradingPaused || processing || !recipientInfo || !transferData.amount || !transferData.toPhone}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 space-x-reverse"
              >
                {tradingMode.tradingPaused ? (
                  <>
                    <PauseCircle className="w-5 h-5" />
                    <span>معاملات متوقف است</span>
                  </>
                ) : processing ? (
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
        <div className="mt-6 space-y-4">
          {/* Physical Delivery Info */}
          {transferType === 'GOLD' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <Coins className="w-4 h-4 mr-2" />
                تحویل فیزیکی
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• تحویل فیزیکی طلا امکان‌پذیر است</li>
                <li>• زمان تحویل: 1 هفته تا 10 روز کاری</li>
                <li>• هزینه تحویل بر عهده گیرنده است</li>
                <li>• برای درخواست تحویل فیزیکی با پشتیبانی تماس بگیرید</li>
              </ul>
            </div>
          )}

          {/* General Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">نکات مهم:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• انتقال بین کاربران مختلف امکان‌پذیر است</li>
              <li>• مبلغ انتقال باید از موجودی کیف پول مبدا کمتر باشد</li>
              <li>• عملیات انتقال غیرقابل بازگشت است</li>
              <li>• تراکنش‌های انتقال در تاریخچه ثبت می‌شوند</li>
              <li>• گیرنده باید در سیستم ثبت‌نام کرده باشد</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
} 