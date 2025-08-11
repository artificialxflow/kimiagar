'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

interface Commission {
  id: string;
  productType: string;
  buyRate: number;
  sellRate: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommissionForm {
  productType: string;
  buyRate: number;
  sellRate: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
}

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

export default function CommissionsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<CommissionForm>({
    productType: '',
    buyRate: 0.01,
    sellRate: 0.01,
    minAmount: 100000,
    maxAmount: 1000000000,
    isActive: true
  });

  useEffect(() => {
    if (token) {
      fetchCommissions();
    }
  }, [token]);

  // بررسی دسترسی ادمین
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/commissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions || []);
      } else if (response.status === 403) {
        router.push('/dashboard');
      } else {
        setMessage({ type: 'error', text: 'خطا در دریافت کارمزدها' });
      }
    } catch (error) {
      console.error('خطا در دریافت کارمزدها:', error);
      setMessage({ type: 'error', text: 'خطا در اتصال به سرور' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CommissionForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (commission: Commission) => {
    setEditingId(commission.id);
    setFormData({
      productType: commission.productType,
      buyRate: commission.buyRate,
      sellRate: commission.sellRate,
      minAmount: commission.minAmount,
      maxAmount: commission.maxAmount,
      isActive: commission.isActive
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      productType: '',
      buyRate: 0.01,
      sellRate: 0.01,
      minAmount: 100000,
      maxAmount: 1000000000,
      isActive: true
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message });
        setShowForm(false);
        setEditingId(null);
        setFormData({
          productType: '',
          buyRate: 0.01,
          sellRate: 0.01,
          minAmount: 100000,
          maxAmount: 1000000000,
          isActive: true
        });
        fetchCommissions();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'خطا در ذخیره کارمزد' });
      }
    } catch (error) {
      console.error('خطا در ذخیره کارمزد:', error);
      setMessage({ type: 'error', text: 'خطا در اتصال به سرور' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commissionId: string) => {
    if (!confirm('آیا از حذف این کارمزد اطمینان دارید؟')) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/commissions?id=${commissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'کارمزد با موفقیت حذف شد' });
        fetchCommissions();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'خطا در حذف کارمزد' });
      }
    } catch (error) {
      console.error('خطا در حذف کارمزد:', error);
      setMessage({ type: 'error', text: 'خطا در اتصال به سرور' });
    } finally {
      setSaving(false);
    }
  };

  const getProductTypeLabel = (type: string) => {
    return productTypes.find(p => p.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت کارمزدها</h1>
          <p className="text-gray-600">تنظیم نرخ‌های کارمزد برای محصولات مختلف</p>
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

        {/* Add Commission Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gold hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
          >
            <Plus className="ml-2 h-4 w-4" />
            اضافه کردن کارمزد جدید
          </button>
        </div>

        {/* Commission Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">کارمزد جدید</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع محصول</label>
                <select
                  value={formData.productType}
                  onChange={(e) => handleInputChange('productType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="">انتخاب کنید</option>
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نرخ خرید (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.buyRate * 100}
                  onChange={(e) => handleInputChange('buyRate', parseFloat(e.target.value) / 100)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نرخ فروش (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.sellRate * 100}
                  onChange={(e) => handleInputChange('sellRate', parseFloat(e.target.value) / 100)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حداقل مبلغ (تومان)</label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => handleInputChange('minAmount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حداکثر مبلغ (تومان)</label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => handleInputChange('maxAmount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                  />
                  <span className="mr-2 text-sm text-gray-700">فعال</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <X className="ml-2 h-4 w-4" />
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.productType}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gold hover:bg-gold-700 disabled:opacity-50"
              >
                <Save className="ml-2 h-4 w-4" />
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
            </div>
          </div>
        )}

        {/* Commissions Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">لیست کارمزدها</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع محصول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نرخ خرید</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نرخ فروش</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حداقل مبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حداکثر مبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getProductTypeLabel(commission.productType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(commission.buyRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(commission.sellRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.minAmount.toLocaleString()} تومان
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.maxAmount.toLocaleString()} تومان
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {commission.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="ml-1 h-3 w-3" />
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="ml-1 h-3 w-3" />
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(commission)}
                          className="text-gold hover:text-gold-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(commission.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Commission Form */}
        {editingId && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">ویرایش کارمزد</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع محصول</label>
                    <select
                      value={formData.productType}
                      onChange={(e) => handleInputChange('productType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      disabled
                    >
                      {productTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نرخ خرید (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.buyRate * 100}
                      onChange={(e) => handleInputChange('buyRate', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نرخ فروش (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.sellRate * 100}
                      onChange={(e) => handleInputChange('sellRate', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حداقل مبلغ (تومان)</label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => handleInputChange('minAmount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حداکثر مبلغ (تومان)</label>
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => handleInputChange('maxAmount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                      />
                      <span className="mr-2 text-sm text-gray-700">فعال</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gold hover:bg-gold-700 disabled:opacity-50"
                  >
                    <Save className="ml-2 h-4 w-4" />
                    {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
