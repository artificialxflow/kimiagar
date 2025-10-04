"use client";
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface RecentTransactionsProps {
  transactions?: any[];
}

export default function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedTransactions = transactions.slice(0, 3);
  const hasMoreTransactions = transactions.length > 3;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'تکمیل شده';
      case 'PENDING':
        return 'در انتظار';
      case 'FAILED':
        return 'ناموفق';
      default:
        return 'نامشخص';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'واریز';
      case 'WITHDRAW':
        return 'برداشت';
      case 'TRANSFER':
        return 'انتقال';
      case 'COMMISSION':
        return 'کارمزد';
      case 'ORDER_PAYMENT':
        return 'پرداخت سفارش';
      default:
        return 'سایر';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">فعالیت اخیر</h2>
        {hasMoreTransactions && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-gold hover:text-gold-600 text-sm font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                <span className="ml-1">بستن</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="ml-1">مشاهده همه ({transactions.length})</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* نمایش 3 مورد اول */}
      <div className="space-y-4">
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map((transaction: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  transaction.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'DEPOSIT' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {getTypeText(transaction.type)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {transaction.description || 'تراکنش مالی'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(transaction.createdAt).toLocaleDateString('fa-IR')} - {new Date(transaction.createdAt).toLocaleTimeString('fa-IR')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {Number(transaction.amount).toLocaleString('fa-IR')} تومان
                </p>
                <div className="flex items-center justify-end mt-1">
                  {getStatusIcon(transaction.status)}
                  <span className="text-xs text-slate-600 mr-1">
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 mb-2">هنوز تراکنشی ثبت نشده است</p>
            <p className="text-sm text-slate-400">پس از انجام تراکنش، اینجا نمایش داده می‌شود</p>
          </div>
        )}
      </div>

      {/* نمایش بقیه تراکنش‌ها زمانی که کشو باز است */}
      {isExpanded && transactions.length > 3 && (
        <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
          {transactions.slice(3).map((transaction: any, index: number) => (
            <div key={index + 3} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  transaction.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'DEPOSIT' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {getTypeText(transaction.type)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {transaction.description || 'تراکنش مالی'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(transaction.createdAt).toLocaleDateString('fa-IR')} - {new Date(transaction.createdAt).toLocaleTimeString('fa-IR')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {Number(transaction.amount).toLocaleString('fa-IR')} تومان
                </p>
                <div className="flex items-center justify-end mt-1">
                  {getStatusIcon(transaction.status)}
                  <span className="text-xs text-slate-600 mr-1">
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}