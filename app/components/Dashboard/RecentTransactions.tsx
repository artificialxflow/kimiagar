"use client";

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Send, Download } from 'lucide-react';

const RecentTransactions: React.FC = () => {
  const transactions = [
    {
      id: 1,
      type: 'buy',
      title: 'خرید طلا',
      amount: '2.5 گرم',
      value: '7,125,000 تومان',
      date: '1403/08/15',
      time: '14:30',
      status: 'completed',
      icon: ArrowDownRight
    },
    {
      id: 2,
      type: 'charge',
      title: 'شارژ کیف پول',
      amount: '10,000,000 تومان',
      value: '',
      date: '1403/08/15',
      time: '10:15',
      status: 'completed',
      icon: ArrowUpRight
    },
    {
      id: 3,
      type: 'sell',
      title: 'فروش سکه',
      amount: '1 سکه',
      value: '28,500,000 تومان',
      date: '1403/08/14',
      time: '16:45',
      status: 'completed',
      icon: ArrowUpRight
    },
    {
      id: 4,
      type: 'transfer',
      title: 'انتقال طلا',
      amount: '1.2 گرم',
      value: 'به کاربر 09121234567',
      date: '1403/08/13',
      time: '11:20',
      status: 'pending',
      icon: Send
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده';
      case 'pending':
        return 'در انتظار';
      case 'failed':
        return 'ناموفق';
      default:
        return 'نامشخص';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-600';
      case 'sell':
        return 'bg-red-100 text-red-600';
      case 'charge':
        return 'bg-blue-100 text-blue-600';
      case 'transfer':
        return 'bg-gold/20 text-gold';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">آخرین تراکنش‌ها</h2>
        <button className="flex items-center space-x-2 space-x-reverse text-gold hover:text-yellow-600 transition-colors duration-200">
          <Download className="w-4 h-4" />
          <span className="text-sm">دانلود گزارش</span>
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => {
          const Icon = transaction.icon;
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {transaction.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {transaction.amount}
                  </div>
                  {transaction.value && (
                    <div className="text-xs text-gray-500">
                      {transaction.value}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-left">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusText(transaction.status)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {transaction.date} - {transaction.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;