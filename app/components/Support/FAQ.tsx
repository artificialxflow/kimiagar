"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'trading' | 'wallet' | 'delivery' | 'security';
}

const faqData: FAQItem[] = [
  // سوالات عمومی
  {
    id: 1,
    question: 'کیمیاگر چیست و چه خدماتی ارائه می‌دهد؟',
    answer: 'کیمیاگر یک پلتفرم معاملات طلا و سکه است که امکان خرید، فروش و نگهداری طلا را به صورت دیجیتال فراهم می‌کند. خدمات ما شامل معاملات آنلاین، نگهداری امن طلا در خزانه و تحویل فیزیکی است.',
    category: 'general'
  },
  {
    id: 2,
    question: 'آیا کیمیاگر مجوزهای لازم را دارد؟',
    answer: 'بله، کیمیاگر دارای تمام مجوزهای لازم از بانک مرکزی و سازمان‌های مربوطه است. طلای شما در خزانه‌های امن و تحت نظارت نگهداری می‌شود.',
    category: 'general'
  },
  {
    id: 3,
    question: 'چگونه می‌توانم در کیمیاگر ثبت‌نام کنم؟',
    answer: 'برای ثبت‌نام، روی دکمه "ثبت‌نام" کلیک کرده و اطلاعات شخصی خود را وارد کنید. پس از تایید شماره تلفن، حساب کاربری شما فعال خواهد شد.',
    category: 'general'
  },

  // سوالات معاملات
  {
    id: 4,
    question: 'حداقل مقدار خرید طلا چقدر است؟',
    answer: 'حداقل مقدار خرید طلا 0.1 گرم است. برای سکه‌ها، حداقل 1 عدد می‌باشد.',
    category: 'trading'
  },
  {
    id: 5,
    question: 'کارمزد معاملات چقدر است؟',
    answer: 'کارمزد خرید طلا 1% و کارمزد فروش 0.5% است. این کارمزدها از قیمت معامله محاسبه می‌شود.',
    category: 'trading'
  },
  {
    id: 6,
    question: 'قیمت‌ها چگونه تعیین می‌شود؟',
    answer: 'قیمت‌ها بر اساس نرخ لحظه‌ای بازار طلا و سکه تعیین می‌شود و هر لحظه به‌روزرسانی می‌شود.',
    category: 'trading'
  },
  {
    id: 7,
    question: 'آیا می‌توانم طلا را با کارت بانکی بخرم؟',
    answer: 'بله، شما می‌توانید از طریق درگاه پرداخت با کارت بانکی طلا خریداری کنید یا از موجودی کیف پول ریالی خود استفاده کنید.',
    category: 'trading'
  },

  // سوالات کیف پول
  {
    id: 8,
    question: 'کیف پول ریالی چیست؟',
    answer: 'کیف پول ریالی محل نگهداری پول شما برای خرید طلا است. می‌توانید از طریق واریز بانکی آن را شارژ کنید.',
    category: 'wallet'
  },
  {
    id: 9,
    question: 'کیف پول طلایی چیست؟',
    answer: 'کیف پول طلایی محل نگهداری طلا و سکه‌های خریداری شده شما است. موجودی آن بر حسب گرم (برای طلا) یا عدد (برای سکه) نمایش داده می‌شود.',
    category: 'wallet'
  },
  {
    id: 10,
    question: 'چگونه می‌توانم کیف پول ریالی را شارژ کنم؟',
    answer: 'از طریق بخش "شارژ کیف پول" می‌توانید مبلغ مورد نظر را وارد کرده و با کارت بانکی شارژ کنید.',
    category: 'wallet'
  },
  {
    id: 11,
    question: 'آیا می‌توانم از کیف پول طلایی برداشت کنم؟',
    answer: 'بله، می‌توانید طلا را بفروشید و مبلغ آن به کیف پول ریالی شما واریز شود.',
    category: 'wallet'
  },

  // سوالات تحویل
  {
    id: 12,
    question: 'آیا امکان تحویل فیزیکی طلا وجود دارد؟',
    answer: 'بله، امکان تحویل فیزیکی طلا در محل مورد نظر شما وجود دارد. حداقل مقدار تحویل 5 گرم است.',
    category: 'delivery'
  },
  {
    id: 13,
    question: 'کارمزد تحویل فیزیکی چقدر است؟',
    answer: 'کارمزد تحویل طلا 2% از مقدار و برای سکه‌ها 50,000 تومان است.',
    category: 'delivery'
  },
  {
    id: 14,
    question: 'زمان تحویل فیزیکی چقدر است؟',
    answer: 'در تهران 24-48 ساعت کاری و در شهرستان‌ها 3-5 روز کاری است.',
    category: 'delivery'
  },

  // سوالات امنیت
  {
    id: 15,
    question: 'اطلاعات من چقدر امن است؟',
    answer: 'تمام اطلاعات شما با رمزگذاری پیشرفته محافظت می‌شود. ما از استانداردهای امنیتی بالایی استفاده می‌کنیم.',
    category: 'security'
  },
  {
    id: 16,
    question: 'آیا طلای من در خزانه امن نگهداری می‌شود؟',
    answer: 'بله، طلای شما در خزانه‌های امن و تحت نظارت نگهداری می‌شود و بیمه کامل دارد.',
    category: 'security'
  },
  {
    id: 17,
    question: 'چگونه می‌توانم حساب کاربری خود را امن کنم؟',
    answer: 'از رمز عبور قوی استفاده کنید، احراز هویت دو مرحله‌ای را فعال کنید و اطلاعات ورود خود را در اختیار دیگران قرار ندهید.',
    category: 'security'
  }
];

const categoryNames = {
  general: 'عمومی',
  trading: 'معاملات',
  wallet: 'کیف پول',
  delivery: 'تحویل فیزیکی',
  security: 'امنیت'
};

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<'all' | keyof typeof categoryNames>('all');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">سوالات متداول</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            پاسخ سوالات رایج شما درباره کیمیاگر و خدمات آن
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              همه سوالات
            </button>
            {Object.entries(categoryNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as keyof typeof categoryNames)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="text-lg font-medium text-slate-800">{item.question}</span>
                {expandedItems.includes(item.id) ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </button>
              
              {expandedItems.includes(item.id) && (
                <div className="px-6 pb-4 border-t border-slate-100">
                  <p className="text-slate-600 leading-relaxed mt-3">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">هنوز سوالی دارید؟</h2>
            <p className="text-slate-600">با کارشناسان ما در تماس باشید</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">تماس تلفنی</h3>
              <p className="text-slate-600 text-sm mb-3">شنبه تا چهارشنبه</p>
              <p className="text-blue-600 font-semibold">021-12345678</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">چت آنلاین</h3>
              <p className="text-slate-600 text-sm mb-3">24/7 در دسترس</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                شروع چت
              </button>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">ایمیل</h3>
              <p className="text-slate-600 text-sm mb-3">پاسخ در 24 ساعت</p>
              <p className="text-purple-600 font-semibold">support@kimiagar.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
