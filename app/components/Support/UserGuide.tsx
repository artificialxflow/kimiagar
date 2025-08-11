"use client";
import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle, ArrowRight, Download, Video, FileText } from 'lucide-react';

interface GuideStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    title: 'ثبت‌نام و احراز هویت',
    description: 'ایجاد حساب کاربری و تایید هویت',
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    details: [
      'روی دکمه "ثبت‌نام" کلیک کنید',
      'اطلاعات شخصی خود را وارد کنید',
      'شماره تلفن خود را تایید کنید',
      'رمز عبور قوی انتخاب کنید',
      'احراز هویت دو مرحله‌ای را فعال کنید'
    ]
  },
  {
    id: 2,
    title: 'شارژ کیف پول ریالی',
    description: 'افزودن پول به کیف پول برای خرید طلا',
    icon: <Download className="w-6 h-6 text-blue-600" />,
    details: [
      'به بخش "کیف پول" بروید',
      'روی "شارژ کیف پول" کلیک کنید',
      'مبلغ مورد نظر را وارد کنید',
      'کارت بانکی خود را انتخاب کنید',
      'پرداخت را تکمیل کنید'
    ]
  },
  {
    id: 3,
    title: 'خرید طلا و سکه',
    description: 'انتخاب محصول و انجام معامله',
    icon: <Play className="w-6 h-6 text-gold" />,
    details: [
      'به بخش "خرید و فروش" بروید',
      'محصول مورد نظر را انتخاب کنید',
      'مقدار یا مبلغ را وارد کنید',
      'روش پرداخت را انتخاب کنید',
      'سفارش را تایید کنید'
    ]
  },
  {
    id: 4,
    title: 'مدیریت موجودی',
    description: 'مشاهده و مدیریت طلا و پول',
    icon: <FileText className="w-6 h-6 text-purple-600" />,
    details: [
      'موجودی کیف پول‌ها را مشاهده کنید',
      'تاریخچه معاملات را بررسی کنید',
      'گزارش‌های مالی را دریافت کنید',
      'موجودی را به‌روزرسانی کنید'
    ]
  },
  {
    id: 5,
    title: 'فروش طلا',
    description: 'فروش طلا و دریافت پول',
    icon: <ArrowRight className="w-6 h-6 text-red-600" />,
    details: [
      'به بخش "فروش" بروید',
      'محصول مورد نظر را انتخاب کنید',
      'مقدار فروش را وارد کنید',
      'سفارش فروش را ثبت کنید',
      'پول به کیف پول ریالی واریز می‌شود'
    ]
  },
  {
    id: 6,
    title: 'درخواست تحویل فیزیکی',
    description: 'تحویل طلا در محل مورد نظر',
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    details: [
      'به بخش "تحویل فیزیکی" بروید',
      'محصول و مقدار را انتخاب کنید',
      'آدرس و زمان تحویل را مشخص کنید',
      'درخواست را ثبت کنید',
      'کارشناسان با شما تماس می‌گیرند'
    ]
  }
];

const videoTutorials = [
  {
    id: 1,
    title: 'آموزش ثبت‌نام',
    duration: '3:45',
    thumbnail: '/tutorials/register.jpg',
    url: '#'
  },
  {
    id: 2,
    title: 'آموزش خرید طلا',
    duration: '5:20',
    thumbnail: '/tutorials/buy-gold.jpg',
    url: '#'
  },
  {
    id: 3,
    title: 'آموزش شارژ کیف پول',
    duration: '2:30',
    thumbnail: '/tutorials/charge-wallet.jpg',
    url: '#'
  },
  {
    id: 4,
    title: 'آموزش تحویل فیزیکی',
    duration: '4:15',
    thumbnail: '/tutorials/physical-delivery.jpg',
    url: '#'
  }
];

export default function UserGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const toggleStep = (id: number) => {
    setActiveStep(activeStep === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">راهنمای کاربر</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            آموزش کامل استفاده از کیمیاگر از ثبت‌نام تا معاملات
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">راهنمای سریع شروع</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideSteps.map((step) => (
              <div key={step.id} className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {step.icon}
                  <h3 className="text-lg font-semibold text-slate-800 mr-3">{step.title}</h3>
                </div>
                
                <p className="text-slate-600 mb-4">{step.description}</p>
                
                <button
                  onClick={() => toggleStep(step.id)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                >
                  مشاهده جزئیات
                  {activeStep === step.id ? (
                    <ChevronRight className="w-4 h-4 mr-1 transform rotate-90" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1" />
                  )}
                </button>

                {activeStep === step.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <ul className="space-y-2">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-start text-sm text-slate-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">آموزش‌های ویدیویی</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((tutorial) => (
              <div key={tutorial.id} className="bg-slate-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="w-full h-32 bg-slate-200 flex items-center justify-center">
                    <Video className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-slate-800 mb-2">{tutorial.title}</h3>
                  <button className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    مشاهده ویدیو
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downloadable Resources */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">دانلود منابع آموزشی</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">راهنمای کامل کاربر</h3>
              <p className="text-slate-600 text-sm mb-4">PDF جامع آموزش تمام بخش‌ها</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                دانلود PDF
              </button>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">چک‌لیست امنیت</h3>
              <p className="text-slate-600 text-sm mb-4">نکات مهم برای امنیت حساب</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                دانلود چک‌لیست
              </button>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">واژه‌نامه اصطلاحات</h3>
              <p className="text-slate-600 text-sm mb-4">معنی اصطلاحات تخصصی طلا</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                دانلود واژه‌نامه
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">نیاز به کمک بیشتری دارید؟</h2>
          <p className="text-blue-100 mb-6">
            کارشناسان ما آماده کمک به شما هستند
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              تماس با پشتیبانی
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              چت آنلاین
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
