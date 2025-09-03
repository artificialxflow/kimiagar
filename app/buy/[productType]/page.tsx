"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Layout from "../../components/Layout/Layout";
import BuyGold from "../../components/Trading/BuyGold";
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function BuyProductPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<any[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const productType = params.productType as string;
  const price = searchParams.get('price');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchPrices();
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/prices');
      const data = await response.json();

      if (response.ok) {
        setPrices(data.prices || []);
      } else {
        setError(data.error || 'خطا در دریافت قیمت‌ها');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    }
  };

  const getProductDisplayName = (productType: string) => {
    switch (productType) {
      case 'GOLD_18K':
        return 'طلای 18 عیار';
      case 'COIN_BAHAR':
        return 'سکه بهار آزادی';
      case 'COIN_NIM':
        return 'نیم سکه';
      case 'COIN_ROBE':
        return 'ربع سکه';
      case 'COIN_BAHAR_86':
        return 'سکه بهار آزادی 86';
      case 'COIN_NIM_86':
        return 'نیم سکه 86';
      case 'COIN_ROBE_86':
        return 'ربع سکه 86';
      default:
        return productType;
    }
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">خطا در بارگذاری</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push('/buy')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              بازگشت به صفحه خرید
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/buy')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            بازگشت به صفحه خرید
          </button>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            خرید {getProductDisplayName(productType)}
          </h1>
          <p className="text-slate-600">
            {price && `قیمت فعلی: ${Number(price).toLocaleString('fa-IR')} تومان`}
          </p>
        </div>

        {/* Buy Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <BuyGold prices={prices} />
        </div>
      </div>
    </Layout>
  );
}
