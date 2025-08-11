"use client";
import React, { useState } from 'react';
import FAQ from './FAQ';
import UserGuide from './UserGuide';
import { HelpCircle, BookOpen, MessageCircle, Phone, Mail, ChevronRight } from 'lucide-react';

type SupportTab = 'faq' | 'guide' | 'contact';

export default function SupportPanel() {
  const [activeTab, setActiveTab] = useState<SupportTab>('faq');

  const tabs = [
    {
      id: 'faq' as SupportTab,
      title: 'سوالات متداول',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'پاسخ سوالات رایج شما'
    },
    {
      id: 'guide' as SupportTab,
      title: 'راهنمای کاربر',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'آموزش کامل استفاده از سیستم'
    },
    {
      id: 'contact' as SupportTab,
      title: 'تماس با پشتیبانی',
      icon: <MessageCircle className="w-5 h-5" />,
      description: 'ارتباط مستقیم با کارشناسان'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return <FAQ />;
      case 'guide':
        return <UserGuide />;
      case 'contact':
        return <ContactSupport setActiveTab={setActiveTab} />;
      default:
        return <FAQ />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">پنل پشتیبانی</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              ما اینجا هستیم تا به شما کمک کنیم
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 space-x-reverse overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 space-x-reverse py-4 px-6 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <div className="text-right">
                  <div className="font-medium">{tab.title}</div>
                  <div className="text-sm opacity-75">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {renderTabContent()}
      </div>
    </div>
  );

  // Contact Support Component
  function ContactSupport({ setActiveTab }: { setActiveTab: (tab: SupportTab) => void }) {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">اطلاعات تماس</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-800">تلفن پشتیبانی</div>
                      <div className="text-slate-600">۰۲۱-۱۲۳۴۵۶۷۸</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-800">ایمیل پشتیبانی</div>
                      <div className="text-slate-600">support@kimiagar.com</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">ساعات کاری</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between">
                      <span className="text-slate-600">شنبه تا چهارشنبه:</span>
                      <span className="font-medium">۸:۰۰ - ۱۷:۰۰</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">پنجشنبه:</span>
                      <span className="font-medium">۸:۰۰ - ۱۳:۰۰</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">جمعه:</span>
                      <span className="font-medium">تعطیل</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">فرم تماس</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    شماره تلفن
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="شماره تلفن خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    موضوع
                  </label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">انتخاب کنید</option>
                    <option value="technical">مشکل فنی</option>
                    <option value="billing">مشکل مالی</option>
                    <option value="trading">مشکل معاملات</option>
                    <option value="delivery">مشکل تحویل</option>
                    <option value="other">سایر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    پیام
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  ارسال پیام
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="bg-white rounded-lg p-8 border border-slate-200 mt-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">سوالات پرتکرار</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('faq')}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-right"
              >
                <span className="font-medium text-slate-800">حداقل مقدار خرید طلا چقدر است؟</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-right"
              >
                <span className="font-medium text-slate-800">کارمزد معاملات چقدر است؟</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-right"
              >
                <span className="font-medium text-slate-800">چگونه کیف پول را شارژ کنم؟</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-right"
              >
                <span className="font-medium text-slate-800">آیا امکان تحویل فیزیکی وجود دارد؟</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
