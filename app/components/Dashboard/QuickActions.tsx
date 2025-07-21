"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, TrendingUp, ArrowUpRight, Send } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'خرید طلا',
      description: 'خرید طلا و سکه',
      icon: ShoppingCart,
      link: '/trading?tab=buy',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'فروش طلا',
      description: 'فروش طلا و سکه',
      icon: TrendingUp,
      link: '/trading?tab=sell',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'شارژ کیف پول',
      description: 'شارژ کیف پول ریالی',
      icon: ArrowUpRight,
      link: '/wallet?tab=charge',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'انتقال طلا',
      description: 'انتقال طلا به کاربر دیگر',
      icon: Send,
      link: '/transfer',
      color: 'bg-gold hover:bg-yellow-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">دسترسی سریع</h2>
      
      <div className="space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.link}
              className="flex items-center space-x-4 space-x-reverse p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} transition-colors duration-200`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 group-hover:text-gold transition-colors duration-200">
                  {action.title}
                </div>
                <div className="text-xs text-gray-500">
                  {action.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;