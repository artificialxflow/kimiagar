"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout/Layout";
import PhysicalDelivery from "../components/Trading/PhysicalDelivery";

export default function DeliveryPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<any[]>([]);
  const router = useRouter();

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
        console.error('خطا در دریافت قیمت‌ها:', data.error);
      }
    } catch (error) {
      console.error('خطا در اتصال به سرور:', error);
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-text-800 mb-3 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              درخواست تحویل طلا در فروشگاه
            </h1>
            <p className="text-text-600 text-lg">تحویل فیزیکی طلا و سکه در محل فروشگاه</p>
          </div>

          {/* Physical Delivery Component */}
          <div className="bg-white rounded-2xl shadow-lg border border-border-100 overflow-hidden">
            <div className="p-6">
              <PhysicalDelivery prices={prices} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
