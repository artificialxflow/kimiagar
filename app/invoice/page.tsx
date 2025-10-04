"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout/Layout';
import { ArrowLeft, FileText } from 'lucide-react';

// Lazy load Invoice component
const Invoice = dynamic(() => import('../components/Invoice/Invoice'), {
  loading: () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
        <p className="mt-4 text-slate-600">در حال بارگذاری فاکتور...</p>
      </div>
    </div>
  )
});

function InvoiceContent() {
  const [user, setUser] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      if (transactionId) {
        fetchTransaction(transactionId);
      } else {
        setError('شناسه معامله مشخص نشده است');
        setLoading(false);
      }
    } else {
      router.push('/login');
    }
  }, [transactionId, router]);

  const fetchTransaction = async (id: string) => {
    try {
      // در development mode از mock data استفاده کن
      if (process.env.NODE_ENV === 'development') {
        // شبیه‌سازی داده معامله
        const mockTransaction = {
          id: id,
          type: 'BUY',
          productType: 'GOLD_18K',
          amount: 2.5,
          price: 2500000,
          total: 6250000,
          commission: 62500,
          finalTotal: 6312500,
          createdAt: new Date(),
          status: 'COMPLETED'
        };
        setTransaction(mockTransaction);
        setLoading(false);
        return;
      }

      // در production mode از API استفاده کن
      const response = await fetch(`/api/transactions/${id}`);
      const data = await response.json();

      if (response.ok) {
        setTransaction(data.transaction);
      } else {
        setError(data.error || 'خطا در دریافت اطلاعات معامله');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-slate-600">در حال بارگذاری فاکتور...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">خطا در بارگذاری فاکتور</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>بازگشت</span>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!transaction || !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">فاکتور یافت نشد</h2>
            <p className="text-slate-600 mb-6">اطلاعات معامله یا کاربر یافت نشد</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>بازگشت به داشبورد</span>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Invoice transaction={transaction} user={user} />
    </Layout>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-slate-600">در حال بارگذاری...</p>
          </div>
        </div>
      </Layout>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
