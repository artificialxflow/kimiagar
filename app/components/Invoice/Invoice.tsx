"use client";
import React, { useState, useRef } from 'react';
import { Download, Printer, FileText, Calendar, User, Coins, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceProps {
  transaction: {
    id: string;
    type: 'BUY' | 'SELL';
    productType: string;
    amount: number;
    price: number;
    total: number;
    commission: number;
    finalTotal: number;
    createdAt: Date;
    status: string;
  };
  user: {
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    nationalId: string;
  };
}

export default function Invoice({ transaction, user }: InvoiceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getProductName = (productType: string) => {
    switch (productType) {
      case 'GOLD_18K': return 'طلای 18 عیار';
      case 'COIN_BAHAR_86': return 'سکه بهار آزادی 86';
      case 'COIN_NIM_86': return 'نیم سکه 86';
      case 'COIN_ROBE_86': return 'ربع سکه 86';
      default: return productType;
    }
  };

  const getUnit = (productType: string) => {
    return productType === 'GOLD_18K' ? 'گرم' : 'عدد';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // روش جدید: استفاده از html2canvas برای کیفیت بهتر
      if (invoiceRef.current) {
        const canvas = await html2canvas(invoiceRef.current, { 
          scale: 4, // کیفیت بالا
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 30;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`invoice-${transaction.id}.pdf`);
        setIsGenerating(false);
        return;
      }
      
      // روش قدیمی (fallback)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(212, 175, 55); // Gold color
      pdf.text('کیمیاگر', pageWidth - 20, 20, { align: 'right' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('فاکتور معامله', pageWidth - 20, 35, { align: 'right' });
      
      // Invoice details
      pdf.setFontSize(12);
      pdf.text(`شماره فاکتور: ${transaction.id}`, pageWidth - 20, 50, { align: 'right' });
      pdf.text(`تاریخ: ${formatDate(transaction.createdAt)}`, pageWidth - 20, 60, { align: 'right' });
      pdf.text(`وضعیت: ${transaction.status === 'COMPLETED' ? 'تکمیل شده' : 'در انتظار'}`, pageWidth - 20, 70, { align: 'right' });
      
      // User info
      pdf.text(`نام: ${user.firstName} ${user.lastName}`, pageWidth - 20, 85, { align: 'right' });
      pdf.text(`نام کاربری: ${user.username}`, pageWidth - 20, 95, { align: 'right' });
      pdf.text(`شماره تماس: ${user.phoneNumber}`, pageWidth - 20, 105, { align: 'right' });
      
      // Transaction details
      pdf.setFontSize(14);
      pdf.text('جزئیات معامله', pageWidth - 20, 125, { align: 'right' });
      
      pdf.setFontSize(12);
      pdf.text(`نوع معامله: ${transaction.type === 'BUY' ? 'خرید' : 'فروش'}`, pageWidth - 20, 140, { align: 'right' });
      pdf.text(`محصول: ${getProductName(transaction.productType)}`, pageWidth - 20, 150, { align: 'right' });
      pdf.text(`مقدار: ${transaction.amount} ${getUnit(transaction.productType)}`, pageWidth - 20, 160, { align: 'right' });
      pdf.text(`قیمت واحد: ${transaction.price.toLocaleString('fa-IR')} تومان`, pageWidth - 20, 170, { align: 'right' });
      pdf.text(`قیمت کل: ${transaction.total.toLocaleString('fa-IR')} تومان`, pageWidth - 20, 180, { align: 'right' });
      pdf.text(`کارمزد: ${transaction.commission.toLocaleString('fa-IR')} تومان`, pageWidth - 20, 190, { align: 'right' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(212, 175, 55);
      pdf.text(`مبلغ نهایی: ${transaction.finalTotal.toLocaleString('fa-IR')} تومان`, pageWidth - 20, 205, { align: 'right' });
      
      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('این فاکتور به صورت خودکار تولید شده است', pageWidth / 2, 280, { align: 'center' });
      pdf.text('کیمیاگر - سیستم معاملات طلا و سکه', pageWidth / 2, 290, { align: 'center' });
      
      // Save PDF
      pdf.save(`invoice-${transaction.id}-${Date.now()}.pdf`);
      
    } catch (error) {
      console.error('خطا در تولید PDF:', error);
      alert('خطا در تولید فاکتور PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const printInvoice = () => {
    if (invoiceRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>فاکتور معامله - ${transaction.id}</title>
              <style>
                body { font-family: 'Vazirmatn', Arial, sans-serif; direction: rtl; margin: 20px; }
                .invoice { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .details { margin: 20px 0; }
                .transaction-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .total { font-size: 18px; font-weight: bold; color: #D4AF37; }
                .footer { text-align: center; margin-top: 30px; color: #666; }
              </style>
            </head>
            <body>
              ${invoiceRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 space-x-reverse">
              <FileText className="w-8 h-8 text-gold-500" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">فاکتور معامله</h1>
                <p className="text-slate-600">شماره: {transaction.id}</p>
              </div>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'در حال تولید...' : 'دانلود PDF'}</span>
              </button>
              <button
                onClick={printInvoice}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="bg-white rounded-lg shadow-lg p-8">
          {/* Company Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold-500 mb-2">کیمیاگر</h1>
            <p className="text-slate-600">سیستم معاملات طلا و سکه</p>
            <div className="mt-4 flex justify-center space-x-6 space-x-reverse text-sm text-slate-500">
              <div className="flex items-center space-x-1 space-x-reverse">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <User className="w-4 h-4" />
                <span>{user.firstName} {user.lastName}</span>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">اطلاعات فاکتور</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">شماره فاکتور:</span>
                  <span className="font-medium">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">تاریخ:</span>
                  <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">وضعیت:</span>
                  <span className={`font-medium ${transaction.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {transaction.status === 'COMPLETED' ? 'تکمیل شده' : 'در انتظار'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">اطلاعات مشتری</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">نام:</span>
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">نام کاربری:</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">شماره تماس:</span>
                  <span className="font-medium">{user.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">کد ملی:</span>
                  <span className="font-medium">{user.nationalId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              جزئیات معامله
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">نوع معامله:</span>
                  <span className="font-medium">
                    {transaction.type === 'BUY' ? (
                      <span className="text-green-600">خرید</span>
                    ) : (
                      <span className="text-red-600">فروش</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">محصول:</span>
                  <span className="font-medium">{getProductName(transaction.productType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">مقدار:</span>
                  <span className="font-medium">{transaction.amount} {getUnit(transaction.productType)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">قیمت واحد:</span>
                  <span className="font-medium">{transaction.price.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">قیمت کل:</span>
                  <span className="font-medium">{transaction.total.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">کارمزد:</span>
                  <span className="font-medium text-red-600">{transaction.commission.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gold-50 rounded-lg p-6 border-2 border-gold-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 space-x-reverse">
                <DollarSign className="w-6 h-6 text-gold-600" />
                <span className="text-lg font-semibold text-slate-800">مبلغ نهایی:</span>
              </div>
              <span className="text-2xl font-bold text-gold-600">
                {transaction.finalTotal.toLocaleString('fa-IR')} تومان
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-2">
              این فاکتور به صورت خودکار تولید شده است
            </p>
            <p className="text-sm text-slate-500">
              کیمیاگر - سیستم معاملات طلا و سکه | {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
