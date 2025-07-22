"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout/Layout";
import { User, Phone, CreditCard, MapPin, Edit, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        phoneNumber: parsedUser.phoneNumber || '',
        nationalId: parsedUser.nationalId || '',
        bankAccount: parsedUser.bankAccount || '',
        postalCode: parsedUser.postalCode || ''
      });
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      nationalId: user?.nationalId || '',
      bankAccount: user?.bankAccount || '',
      postalCode: user?.postalCode || ''
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...editData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, ...editData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        setSuccess('اطلاعات با موفقیت به‌روزرسانی شد');
      } else {
        setError(data.error || 'خطا در به‌روزرسانی اطلاعات');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">پروفایل کاربری</h1>
          <p className="text-slate-600">مدیریت اطلاعات شخصی</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold to-yellow-500 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-white/80">کاربر کیمیاگر</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 space-x-reverse bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>ویرایش</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Profile Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">اطلاعات شخصی</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">نام</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-800">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">نام خانوادگی</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-800">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">کد ملی</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.nationalId}
                      onChange={(e) => handleInputChange('nationalId', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-800">{user.nationalId}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">اطلاعات تماس</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">شماره موبایل</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-800">{user.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">شماره شبا</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.bankAccount}
                      onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-800">{user.bankAccount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">کد پستی</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-800">{user.postalCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 space-x-reverse mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>انصراف</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 space-x-reverse px-6 py-2 bg-gold text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 