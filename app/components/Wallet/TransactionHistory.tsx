"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const transactions = [
    {
      id: 'TXN001',
      type: 'charge',
      description: 'شارژ کیف پول - درگاه آنلاین',
      amount: 10000000,
      status: 'completed',
      date: '1403/08/15',
      time: '14:30'
    },
    {
      id: 'TXN002',
      type: 'buy',
      description: 'خرید طلا - 2.5 گرم',
      amount: -7125000,
      status: 'completed',
      date: '1403/08/15',
      time: '10:15'
    },
    {
      id: 'TXN003',
      type: 'withdraw',
      description: 'برداشت به حساب ملت',
      amount: -5000000,
      status: 'pending',
      date: '1403/08/14',
      time: '16:45'
    },
    {
      id: 'TXN004',
      type: 'sell',
      description: 'فروش سکه - 1 سکه بهار آزادی',
      amount: 28500000,
      status: 'completed',
      date: '1403/08/13',
      time: '11:20'
    },
    {
      id: 'TXN005',
      type: 'transfer',
      description: 'انتقال طلا به 09121234567',
      amount: -1200000,
      status: 'failed',
      date: '1403/08/12',
      time: '09:30'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'charge': return 'bg-blue-100 text-blue-800';
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'withdraw': return 'bg-orange-100 text-orange-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'تکمیل شده';
      case 'pending': return 'در انتظار';
      case 'failed': return 'ناموفق';
      default: return 'نامشخص';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'charge': return 'شارژ';
      case 'buy': return 'خرید';
      case 'sell': return 'فروش';
      case 'withdraw': return 'برداشت';
      case 'transfer': return 'انتقال';
      default: return 'نامشخص';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو..."
              className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
          >
            <option value="all">همه انواع</option>
            <option value="charge">شارژ</option>
            <option value="buy">خرید</option>
            <option value="sell">فروش</option>
            <option value="withdraw">برداشت</option>
            <option value="transfer">انتقال</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="completed">تکمیل شده</option>
            <option value="pending">در انتظار</option>
            <option value="failed">ناموفق</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center justify-center space-x-2 space-x-reverse bg-gold text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">
            <Download className="w-4 h-4" />
            <span>دانلود</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {getTypeText(transaction.type)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {transaction.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    شناسه: {transaction.id}
                  </div>
                </div>
              </div>
              
              <div className="text-left">
                <div className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} تومان
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-1 space-x-reverse">
                  <Calendar className="w-4 h-4" />
                  <span>{transaction.date} - {transaction.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <div className="text-lg text-gray-600 mb-2">تراکنشی یافت نشد</div>
          <div className="text-sm text-gray-500">
            فیلترهای خود را تغییر دهید یا جستجوی جدیدی انجام دهید
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;