"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Smartphone, Clock } from 'lucide-react';

interface OTPFormProps {
  phoneNumber: string;
  onVerification: (userData: any) => void;
  onBack: () => void;
}

export default function OTPForm({ phoneNumber, onVerification, onBack }: OTPFormProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 دقیقه
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // فقط یک کاراکتر
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // حرکت به فیلد بعدی
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('لطفاً کد 6 رقمی را کامل وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otpCode: code
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ذخیره اطلاعات کاربر در localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken || '');
        onVerification(data.user);
      } else {
        setError(data.error || 'کد OTP اشتباه است');
        // پاک کردن کد در صورت خطا
        setOtpCode(['', '', '', '', '', '']);
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(300); // 5 دقیقه
        setCanResend(false);
        setOtpCode(['', '', '', '', '', '']);
        setError('');
      } else {
        setError(data.error || 'خطا در ارسال مجدد کد');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            تایید شماره موبایل
          </h1>
          <p className="text-slate-600 mb-2">
            کد ارسال شده به شماره زیر را وارد کنید
          </p>
          <p className="text-slate-800 font-medium">
            {phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3')}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
              کد 6 رقمی
            </label>
            <div className="flex justify-center space-x-2 rtl:space-x-reverse">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  data-index={index}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-semibold"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4 ml-1" />
              <span className="text-sm">
                {canResend ? 'زمان انقضا تمام شده' : `زمان باقی‌مانده: ${formatTime(countdown)}`}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || otpCode.join('').length !== 6}
            className="w-full mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                تایید کد
                <ArrowLeft className="w-4 h-4 mr-2" />
              </>
            )}
          </button>

          {/* Resend OTP */}
          <button
            onClick={handleResendOTP}
            disabled={loading || !canResend}
            className="w-full mb-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ارسال مجدد کد
          </button>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            بازگشت به ورود
          </button>
        </div>
      </div>
    </div>
  );
}
