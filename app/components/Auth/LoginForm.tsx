"use client";
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: (userData: any) => void;
  onPhoneSubmit: (phone: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // اعتبارسنجی فیلدها
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'username':
        if (value.length < 3) return 'یوزرنیم باید حداقل 3 کاراکتر باشد';
        if (value.length > 20) return 'یوزرنیم نمی‌تواند بیش از 20 کاراکتر باشد';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'یوزرنیم فقط می‌تواند شامل حروف، اعداد و _ باشد';
        return '';
      case 'password':
        if (value.length < 6) return 'پسورد باید حداقل 6 کاراکتر باشد';
        if (value.length > 50) return 'پسورد نمی‌تواند بیش از 50 کاراکتر باشد';
        // اعتبارسنجی قوی‌تر برای ثبت‌نام
        if (!isLogin && value.length < 8) return 'پسورد باید حداقل 8 کاراکتر باشد';
        return '';
      case 'firstName':
        if (value.length < 2) return 'نام باید حداقل 2 کاراکتر باشد';
        if (value.length > 30) return 'نام نمی‌تواند بیش از 30 کاراکتر باشد';
        return '';
      case 'lastName':
        if (value.length < 2) return 'نام خانوادگی باید حداقل 2 کاراکتر باشد';
        if (value.length > 30) return 'نام خانوادگی نمی‌تواند بیش از 30 کاراکتر باشد';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // اعتبارسنجی فیلد
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const canSubmit = (): boolean => {
    if (isLogin) {
      return formData.username.length > 0 && formData.password.length > 0;
    } else {
      return formData.username.length > 0 && 
             formData.password.length > 0 && 
             formData.firstName.length > 0 && 
             formData.lastName.length > 0;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('لطفاً تمام فیلدها را به درستی پر کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // ذخیره اطلاعات کاربر در localStorage (فقط برای نمایش)
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || 'خطا در ورود/ثبت‌نام');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field: string, placeholder: string, type: string = 'text', icon?: any) => {
    const value = formData[field as keyof typeof formData];
    const error = validationErrors[field];

    return (
      <div className="space-y-2">
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type === 'password' && showPassword ? 'text' : type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${icon ? 'pr-10' : ''} ${type === 'password' ? 'pr-12' : ''}`}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 pl-3 flex items-center"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {isLogin ? 'ورود به کیمیاگر' : 'ثبت‌نام در کیمیاگر'}
          </h1>
          <p className="text-slate-600">
            {isLogin ? 'اطلاعات ورود خود را وارد کنید' : 'حساب کاربری جدید ایجاد کنید'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* یوزرنیم */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">یوزرنیم</label>
            {renderInput('username', 'یوزرنیم خود را وارد کنید', 'text', <User className="h-5 w-5 text-gray-400" />)}
          </div>

          {/* پسورد */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">پسورد</label>
            {renderInput('password', 'پسورد خود را وارد کنید', 'password', <Lock className="h-5 w-5 text-gray-400" />)}
          </div>

          {/* فیلدهای ثبت‌نام */}
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">نام</label>
                {renderInput('firstName', 'نام خود را وارد کنید')}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">نام خانوادگی</label>
                {renderInput('lastName', 'نام خانوادگی خود را وارد کنید')}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">شماره موبایل</label>
                {renderInput('phoneNumber', '09123456789', 'tel')}
              </div>
            </>
          )}

          {/* ورود با OTP */}
          {isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">شماره موبایل</label>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <div className="flex-1">
                  {renderInput('phoneNumber', '09123456789', 'tel')}
                </div>
                <button
                  onClick={() => {
                    if (formData.phoneNumber && /^09\d{9}$/.test(formData.phoneNumber)) {
                      onPhoneSubmit(formData.phoneNumber);
                    } else {
                      setError('لطفاً شماره موبایل معتبر وارد کنید');
                    }
                  }}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  ورود با OTP
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !canSubmit()}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'در حال پردازش...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
          </button>

          {/* Toggle Login/Register */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setValidationErrors({});
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isLogin ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'قبلاً ثبت‌نام کرده‌اید؟ ورود کنید'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}