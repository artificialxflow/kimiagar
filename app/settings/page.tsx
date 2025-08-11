'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Layout from '@/app/components/Layout/Layout';

interface UserSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  language: string;
  timezone: string;
}

interface CommissionSetting {
  productType: string;
  buyRate: number;
  sellRate: number;
  minAmount: number;
  maxAmount: number;
}

const languages = [
  { value: 'fa', label: 'فارسی' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' }
];

const timezones = [
  { value: 'Asia/Tehran', label: 'تهران (UTC+3:30)' },
  { value: 'UTC', label: 'UTC (UTC+0:00)' },
  { value: 'Europe/London', label: 'لندن (UTC+0:00)' },
  { value: 'America/New_York', label: 'نیویورک (UTC-5:00)' }
];

const productTypes = [
  { value: 'GOLD_18K', label: 'طلای 18 عیار' },
  { value: 'GOLD_24K', label: 'طلای 24 عیار' },
  { value: 'COIN_BAHAR', label: 'سکه بهار آزادی' },
  { value: 'COIN_NIM', label: 'نیم سکه' },
  { value: 'COIN_ROBE', label: 'ربع سکه' },
  { value: 'COIN_BAHAR_86', label: 'سکه بهار آزادی 86' },
  { value: 'COIN_NIM_86', label: 'نیم سکه 86' },
  { value: 'COIN_ROBE_86', label: 'ربع سکه 86' }
];

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    language: 'fa',
    timezone: 'Asia/Tehran'
  });
  const [commissionSettings, setCommissionSettings] = useState<CommissionSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchSettings();
      checkAdminStatus();
      if (isAdmin) {
        fetchCommissionSettings();
      }
    }
  }, [user, token, isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setIsAdmin(response.ok);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('خطا در دریافت تنظیمات:', error);
    }
  };

  const fetchCommissionSettings = async () => {
    try {
      const response = await fetch('/api/settings/commission', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommissionSettings(data.commissions || []);
      }
    } catch (error) {
      console.error('خطا در دریافت تنظیمات کارمزد:', error);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCommissionChange = (index: number, key: keyof CommissionSetting, value: any) => {
    setCommissionSettings(prev => prev.map((item, i) => 
      i === index ? { ...item, [key]: value } : item
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('تنظیمات با موفقیت ذخیره شد');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`خطا: ${error.message}`);
      }
    } catch (error) {
      setMessage('خطا در ذخیره تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommissions = async () => {
    setLoading(true);
    setMessage('');

    try {
      for (const commission of commissionSettings) {
        const response = await fetch('/api/settings/commission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(commission)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
      }

      setMessage('تنظیمات کارمزد با موفقیت ذخیره شد');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`خطا در ذخیره تنظیمات کارمزد: ${error.message}`);
    } finally {
      setLoading(false);
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">تنظیمات</h1>
            <p className="text-gray-600">مدیریت تنظیمات حساب کاربری و اعلانها</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('خطا') 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">تنظیمات اعلانها</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">اعلان های پیامکی</h3>
                    <p className="text-sm text-gray-500">دریافت اعلانها از طریق پیامک</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsEnabled}
                      onChange={(e) => handleSettingChange('smsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">اعلان های ایمیل</h3>
                    <p className="text-sm text-gray-500">دریافت اعلانها از طریق ایمیل</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailEnabled}
                      onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">اعلان های push</h3>
                    <p className="text-sm text-gray-500">دریافت اعلانها در مرورگر</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushEnabled}
                      onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Language and Timezone Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">تنظیمات زبان و منطقه زمانی</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">زبان</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">منطقه زمانی</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">تنظیمات امنیتی</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">تغییر رمز عبور</h3>
                    <p className="text-sm text-gray-500">به‌روزرسانی رمز عبور حساب کاربری</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    تغییر
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">احراز هویت دو مرحله‌ای</h3>
                    <p className="text-sm text-gray-500">افزایش امنیت با 2FA</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">به زودی</span>
                </div>
              </div>
            </div>

            {/* Trading Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">تنظیمات معاملات</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">نمایش کارمزدها</h3>
                    <p className="text-sm text-gray-500">نمایش نرخ کارمزد در معاملات</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">اعلان تغییر قیمت</h3>
                    <p className="text-sm text-gray-500">اعلان تغییرات قیمت طلا</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Settings for Admin */}
          {isAdmin && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">تنظیمات کارمزد (فقط ادمین)</h2>
                  <button
                    onClick={handleSaveCommissions}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'در حال ذخیره...' : 'ذخیره کارمزدها'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع محصول</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نرخ خرید (%)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نرخ فروش (%)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حداقل مبلغ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حداکثر مبلغ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {commissionSettings.map((commission, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {productTypes.find(p => p.value === commission.productType)?.label || commission.productType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              step="0.01"
                              value={commission.buyRate}
                              onChange={(e) => handleCommissionChange(index, 'buyRate', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              step="0.01"
                              value={commission.sellRate}
                              onChange={(e) => handleCommissionChange(index, 'sellRate', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={commission.minAmount}
                              onChange={(e) => handleCommissionChange(index, 'minAmount', parseFloat(e.target.value))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={commission.maxAmount}
                              onChange={(e) => handleCommissionChange(index, 'maxAmount', parseFloat(e.target.value))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
