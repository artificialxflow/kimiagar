"use client";
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onRegister: (userData: any) => void;
  onSwitchToLogin: () => void;
  onSwitchToOTP: () => void;
}

export default function RegisterForm({ onRegister, onSwitchToLogin, onSwitchToOTP }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // اعتبارسنجی فیلدها
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'username':
        if (value.length < 3) return 'نام کاربری باید حداقل 3 کاراکتر باشد';
        if (value.length > 20) return 'نام کاربری نمی‌تواند بیش از 20 کاراکتر باشد';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد';
        return '';
      case 'password':
        if (value.length < 8) return 'رمز عبور باید حداقل 8 کاراکتر باشد';
        if (value.length > 50) return 'رمز عبور نمی‌تواند بیش از 50 کاراکتر باشد';
        // اعتبارسنجی پیچیدگی پسورد
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'رمز عبور باید شامل حروف کوچک، بزرگ و اعداد باشد';
        }
        return '';
      case 'confirmPassword':
        if (value !== formData.password) return 'رمز عبور و تایید رمز عبور مطابقت ندارند';
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

    // اعتبارسنجی مجدد confirmPassword اگر password تغییر کرده
    if (field === 'password') {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const canSubmit = (): boolean => {
    return formData.username.length > 0 && 
           formData.password.length > 0 && 
           formData.confirmPassword.length > 0 &&
           formData.firstName.length > 0 && 
           formData.lastName.length > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('لطفاً فیلدهای الزامی را به درستی پر کنید');
      return;
    }

    // بررسی خطاهای اعتبارسنجی
    const hasErrors = Object.values(validationErrors).some(error => error.length > 0);
    if (hasErrors) {
      setError('لطفاً خطاهای اعتبارسنجی را برطرف کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // ذخیره اطلاعات کاربر در localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken || '');
        onRegister(data.user);
      } else {
        setError(data.error || 'خطا در ثبت‌نام');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field: string, placeholder: string, type: string = 'text', icon?: any, required: boolean = false) => {
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
            type={type === 'password' && (field === 'password' ? showPassword : showConfirmPassword) ? 'text' : type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            required={required}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${icon ? 'pr-10' : ''} ${type === 'password' ? 'pl-12' : ''}`}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => {
                if (field === 'password') {
                  setShowPassword(!showPassword);
                } else {
                  setShowConfirmPassword(!showConfirmPassword);
                }
              }}
              className="absolute inset-y-0 left-0 pl-3 flex items-center"
            >
              {(field === 'password' ? showPassword : showConfirmPassword) ? 
                <EyeOff className="h-5 w-5 text-gray-400" /> : 
                <Eye className="h-5 w-5 text-gray-400" />
              }
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
    <div className="min-h-screen bg-background-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gold-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-800 mb-2">
            ثبت‌نام در کیمیاگر
          </h1>
          <p className="text-text-600">
            حساب کاربری جدید ایجاد کنید
          </p>
        </div>

        {/* Form */}
        <div className="bg-background-50 rounded-2xl shadow-lg p-6 border border-border-100">
          {/* فیلدهای الزامی */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-800 mb-4">اطلاعات الزامی</h3>
            
            {/* نام کاربری */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-700 mb-2">
                نام کاربری <span className="text-red-500">*</span>
              </label>
              {renderInput('username', 'نام کاربری خود را وارد کنید', 'text', <User className="h-5 w-5 text-gray-400" />, true)}
            </div>

            {/* نام */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-700 mb-2">
                نام <span className="text-red-500">*</span>
              </label>
              {renderInput('firstName', 'نام خود را وارد کنید', 'text', undefined, true)}
            </div>

            {/* نام خانوادگی */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-700 mb-2">
                نام خانوادگی <span className="text-red-500">*</span>
              </label>
              {renderInput('lastName', 'نام خانوادگی خود را وارد کنید', 'text', undefined, true)}
            </div>

            {/* رمز عبور */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-700 mb-2">
                رمز عبور <span className="text-red-500">*</span>
              </label>
              {renderInput('password', 'رمز عبور خود را وارد کنید', 'password', <Lock className="h-5 w-5 text-gray-400" />, true)}
            </div>

            {/* تایید رمز عبور */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-700 mb-2">
                تایید رمز عبور <span className="text-red-500">*</span>
              </label>
              {renderInput('confirmPassword', 'رمز عبور خود را مجدداً وارد کنید', 'password', <Lock className="h-5 w-5 text-gray-400" />, true)}
            </div>
          </div>

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
            className="w-full mt-6 px-6 py-3 btn-primary text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'در حال پردازش...' : 'ثبت‌نام'}
          </button>

          {/* Alternative Options */}
          <div className="mt-6 space-y-3">
            {/* OTP Login Button */}
            <button
              onClick={onSwitchToOTP}
              className="w-full px-6 py-3 border border-gold-300 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors flex items-center justify-center"
            >
              <span>ورود با کد تایید (OTP)</span>
            </button>

            {/* Login Link */}
            <div className="text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-gold-600 hover:text-gold-700 text-sm"
              >
                قبلاً ثبت‌نام کرده‌اید؟ ورود کنید
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
