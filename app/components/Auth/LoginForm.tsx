"use client";

import React, { useState } from 'react';
import { Smartphone, Shield, CreditCard, CheckCircle, MapPin } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    nationalId: '',
    bankAccount: '',
    postalCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      onLogin();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    {
      title: 'شماره موبایل',
      description: 'شماره موبایل خود را وارد کنید',
      icon: Smartphone,
      field: 'phoneNumber',
      placeholder: '09xxxxxxxxx'
    },
    {
      title: 'کد تأیید',
      description: 'کد ارسال شده به موبایل خود را وارد کنید',
      icon: Shield,
      field: 'otp',
      placeholder: 'کد 6 رقمی'
    },
    {
      title: 'کد ملی',
      description: 'کد ملی خود را وارد کنید',
      icon: CreditCard,
      field: 'nationalId',
      placeholder: 'کد ملی 10 رقمی'
    },
    {
      title: 'شماره شبا',
      description: 'شماره شبا حساب بانکی خود را وارد کنید',
      icon: CreditCard,
      field: 'bankAccount',
      placeholder: 'IR123456789012345678901234'
    },
    {
      title: 'کد پستی',
      description: 'کد پستی محل سکونت خود را وارد کنید',
      icon: MapPin,
      field: 'postalCode',
      placeholder: 'کد پستی 10 رقمی'
    }
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-slate-900 font-bold text-2xl">ک</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">کیمیاگر</h1>
            <p className="text-gray-600">ورود به حساب کاربری</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    num <= step
                      ? 'bg-gold text-slate-900'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {num < step ? <CheckCircle className="w-4 h-4" /> : num}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gold h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-gold" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {currentStep.title}
              </h2>
              <p className="text-gray-600 text-sm">{currentStep.description}</p>
            </div>

            <div>
              <input
                type="text"
                value={formData[currentStep.field as keyof typeof formData]}
                onChange={(e) => handleInputChange(currentStep.field, e.target.value)}
                placeholder={currentStep.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold to-yellow-500 text-slate-900 py-3 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-gold transition-all duration-200 transform hover:scale-[1.02]"
            >
              {step === 5 ? 'ورود' : 'ادامه'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              با ورود به سیستم، شما{' '}
              <a href="#" className="text-gold hover:underline">
                قوانین و مقررات
              </a>{' '}
              را می‌پذیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;