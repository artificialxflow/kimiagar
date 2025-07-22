"use client";
import React, { useState } from 'react';
import { Smartphone, Shield, CreditCard, CheckCircle, MapPin, User, UserCheck } from 'lucide-react';

interface LoginFormProps {
  onLogin: (userData: any) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '', 
    otp: '', 
    nationalId: '', 
    bankAccount: '', 
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const steps = [
    { id: 1, title: 'اطلاعات شخصی', icon: User, field: 'firstName' },
    { id: 2, title: 'شماره موبایل', icon: Smartphone, field: 'phoneNumber' },
    { id: 3, title: 'کد تایید', icon: Shield, field: 'otp' },
    { id: 4, title: 'کد ملی', icon: UserCheck, field: 'nationalId' },
    { id: 5, title: 'شماره شبا', icon: CreditCard, field: 'bankAccount' },
    { id: 6, title: 'کد پستی', icon: MapPin, field: 'postalCode' }
  ];

  // اعتبارسنجی فیلدها
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
        return value.length < 2 ? 'نام باید حداقل 2 کاراکتر باشد' : '';
      case 'lastName':
        return value.length < 2 ? 'نام خانوادگی باید حداقل 2 کاراکتر باشد' : '';
      case 'phoneNumber':
        return !/^09\d{9}$/.test(value) ? 'شماره موبایل باید 11 رقم و با 09 شروع شود' : '';
      case 'otp':
        return !/^\d{6}$/.test(value) ? 'کد تایید باید 6 رقم باشد' : '';
      case 'nationalId':
        return !/^\d{10}$/.test(value) ? 'کد ملی باید 10 رقم باشد' : '';
      case 'bankAccount':
        return !/^IR\d{22}$/.test(value) ? 'شماره شبا باید 24 کاراکتر و با IR شروع شود' : '';
      case 'postalCode':
        return !/^\d{10}$/.test(value) ? 'کد پستی باید 10 رقم باشد' : '';
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

  const canProceed = (currentStep: number): boolean => {
    const currentField = steps[currentStep - 1]?.field;
    if (!currentField) return false;
    
    const value = formData[currentField as keyof typeof formData];
    const error = validateField(currentField, value);
    
    return value.length > 0 && error === '';
  };

  const handleNext = () => {
    if (canProceed(step)) {
      setStep(step + 1);
      setError('');
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!canProceed(step)) {
      setError('لطفاً تمام فیلدها را به درستی پر کنید');
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
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          nationalId: formData.nationalId,
          bankAccount: formData.bankAccount,
          postalCode: formData.postalCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || 'خطا در ثبت‌نام');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field: string, placeholder: string, type: string = 'text') => {
    const value = formData[field as keyof typeof formData];
    const error = validationErrors[field];

    return (
      <div className="space-y-2">
        <input
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
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
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ثبت‌نام در کیمیاگر</h1>
          <p className="text-slate-600">اطلاعات خود را وارد کنید</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > s.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 text-center">
            مرحله {step} از {steps.length}: {steps[step - 1]?.title}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Step 1: اطلاعات شخصی */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نام</label>
                {renderInput('firstName', 'نام خود را وارد کنید')}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نام خانوادگی</label>
                {renderInput('lastName', 'نام خانوادگی خود را وارد کنید')}
              </div>
            </div>
          )}

          {/* Step 2: شماره موبایل */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">شماره موبایل</label>
              {renderInput('phoneNumber', '09123456789')}
              <p className="text-xs text-slate-500 mt-1">شماره موبایل 11 رقمی وارد کنید</p>
            </div>
          )}

          {/* Step 3: کد تایید */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">کد تایید</label>
              {renderInput('otp', '123456', 'text')}
              <p className="text-xs text-slate-500 mt-1">کد 6 رقمی ارسال شده را وارد کنید</p>
            </div>
          )}

          {/* Step 4: کد ملی */}
          {step === 4 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">کد ملی</label>
              {renderInput('nationalId', '1234567890')}
              <p className="text-xs text-slate-500 mt-1">کد ملی 10 رقمی وارد کنید</p>
            </div>
          )}

          {/* Step 5: شماره شبا */}
          {step === 5 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">شماره شبا</label>
              {renderInput('bankAccount', 'IR123456789012345678901234')}
              <p className="text-xs text-slate-500 mt-1">شماره شبا 24 کاراکتری وارد کنید</p>
            </div>
          )}

          {/* Step 6: کد پستی */}
          {step === 6 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">کد پستی</label>
              {renderInput('postalCode', '1234567890')}
              <p className="text-xs text-slate-500 mt-1">کد پستی 10 رقمی وارد کنید</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                قبلی
              </button>
            )}
            
            {step < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!canProceed(step)}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                بعدی
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed(step)}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}