"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "./components/Layout";
import { 
  Shield, 
  Coins, 
  TrendingUp, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Lock
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-gold-500" />,
      title: "امنیت کامل",
      description: "تمام معاملات شما با بالاترین استانداردهای امنیتی محافظت می‌شود"
    },
    {
      icon: <Coins className="w-8 h-8 text-gold-500" />,
      title: "نگهداری در خزانه امن",
      description: "طلای شما در خزانه‌های امن و تحت نظارت بانک مرکزی نگهداری می‌شود"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-gold-500" />,
      title: "قیمت‌های لحظه‌ای",
      description: "دسترسی به قیمت‌های به‌روز و دقیق طلا و سکه در هر لحظه"
    },
    {
      icon: <Users className="w-8 h-8 text-gold-500" />,
      title: "پشتیبانی 24/7",
      description: "تیم پشتیبانی ما در تمام ساعات شبانه‌روز آماده خدمت‌رسانی است"
    }
  ];

  const stats = [
    { number: "50,000+", label: "کاربر فعال" },
    { number: "100 میلیارد", label: "تومان معاملات" },
    { number: "99.9%", label: "رضایت کاربران" },
    { number: "5 سال", label: "تجربه موفق" }
  ];

  const services = [
    {
      title: "خرید و فروش طلا",
      description: "خرید و فروش طلای 18 عیار با بهترین قیمت‌ها",
      icon: <Coins className="w-6 h-6 text-gold-500" />
    },
    {
      title: "معاملات سکه",
      description: "خرید و فروش سکه بهار آزادی، نیم سکه و ربع سکه",
      icon: <TrendingUp className="w-6 h-6 text-gold-500" />
    },
    {
      title: "کیف پول دیجیتال",
      description: "مدیریت موجودی ریالی و طلایی در یک مکان",
      icon: <Shield className="w-6 h-6 text-gold-500" />
    },
    {
      title: "انتقال بین کاربران",
      description: "انتقال آسان طلا و پول بین کاربران",
      icon: <Users className="w-6 h-6 text-gold-500" />
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background-50 via-background-100 to-background-200">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-text-800 mb-6">
              مدیریت طلا و کیف پول دیجیتال
            </h1>
            <p className="text-xl text-text-600 mb-8 max-w-3xl mx-auto">
              پلتفرم امن و قابل اعتماد برای خرید و فروش طلا و سکه با بهترین قیمت‌ها
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="btn-primary px-8 py-4 text-lg font-semibold"
              >
                شروع کنید
              </button>
              <button
                onClick={() => router.push('/support')}
                className="px-8 py-4 border-2 border-gold-500 text-gold-500 rounded-lg hover:bg-gold-500 hover:text-text-50 transition-colors text-lg font-semibold"
              >
                اطلاعات بیشتر
              </button>
            </div>
          </div>
        </section>



      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
                      <h2 className="text-3xl font-bold text-text-800 mb-4">چرا کیمیاگر؟</h2>
          <p className="text-lg text-text-600">ویژگی‌های منحصر به فرد ما</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-background-100 hover:bg-gold-50 transition-colors cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                                  <h3 className="text-xl font-semibold text-text-800 mb-3">{feature.title}</h3>
                  <p className="text-text-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gold-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
                              <div key={index}>
                  <div className="text-4xl font-bold text-gold-500 mb-2">{stat.number}</div>
                  <div className="text-text-600">{stat.label}</div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
                      <h2 className="text-3xl font-bold text-text-800 mb-4">خدمات ما</h2>
          <p className="text-lg text-text-600">تمام آنچه برای معاملات طلا نیاز دارید</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="p-6 rounded-2xl bg-background-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-800 mb-2">{service.title}</h3>
                <p className="text-text-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-background-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-800 mb-4">اعتمادسازی</h2>
            <p className="text-lg text-text-600">ما متعهد به امنیت و شفافیت هستیم</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-status-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-status-success" />
              </div>
              <h3 className="text-xl font-semibold text-text-800 mb-3">پرداخت امن</h3>
              <p className="text-text-600">تمام تراکنش‌های مالی با بالاترین استانداردهای امنیتی انجام می‌شود</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-status-info/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-status-info" />
              </div>
              <h3 className="text-xl font-semibold text-text-800 mb-3">نگهداری در خزانه</h3>
              <p className="text-text-600">طلای شما در خزانه‌های امن و تحت نظارت نگهداری می‌شود</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-800 mb-3">ثبت معاملات</h3>
              <p className="text-text-600">تمام معاملات در سامانه ثبت و قابل پیگیری است</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-text-50 mb-6">آماده شروع هستید؟</h2>
          <p className="text-gold-50 mb-8 text-lg">
            همین حالا ثبت‌نام کنید و از خدمات ما بهره‌مند شوید
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary px-8 py-4 text-lg font-semibold hover:bg-gold-600 transition-colors"
          >
            ثبت‌نام رایگان
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-text-800 to-text-900 text-text-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-text-50" />
                </div>
                <h3 className="text-xl font-bold text-text-50">کیمیاگر</h3>
              </div>
              <p className="text-text-200">
                پلتفرم امن و قابل اعتماد برای خرید و فروش طلا و سکه
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-text-50">خدمات</h4>
              <ul className="space-y-2 text-text-200">
                <li>خرید و فروش طلا</li>
                <li>معاملات سکه</li>
                <li>کیف پول دیجیتال</li>
                <li>انتقال بین کاربران</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-text-50">پشتیبانی</h4>
              <ul className="space-y-2 text-text-200">
                <li>سوالات متداول</li>
                <li>راهنمای کاربر</li>
                <li>تماس با ما</li>
                <li>درباره ما</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-text-50">تماس</h4>
              <div className="space-y-2 text-text-200">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Phone className="w-4 h-4" />
                  <span>021-12345678</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Mail className="w-4 h-4" />
                  <span>info@kimiagar.com</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MapPin className="w-4 h-4" />
                  <span>تهران، ایران</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-text-600 mt-12 pt-8 text-center text-text-300">
            <p>&copy; 1403 کیمیاگر. تمام حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
      </div>
    </PublicLayout>
  );
}
