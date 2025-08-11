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
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      iconColor: 'text-green-50'
    },
    {
      title: 'فروش طلا',
      description: 'فروش طلا و سکه',
      icon: TrendingUp,
      link: '/trading?tab=sell',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      iconColor: 'text-red-50'
    },
    {
      title: 'شارژ کیف پول',
      description: 'شارژ کیف پول ریالی',
      icon: ArrowUpRight,
      link: '/wallet?tab=charge',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      iconColor: 'text-blue-50'
    },
    {
      title: 'انتقال طلا',
      description: 'انتقال طلا به کاربر دیگر',
      icon: Send,
      link: '/transfer',
      color: 'bg-gradient-to-br from-gold-500 to-gold-600',
      hoverColor: 'hover:from-gold-600 hover:to-gold-700',
      iconColor: 'text-gold-50'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl font-semibold text-text-800 mb-6 flex items-center">
        <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
        دسترسی سریع
      </h2>
      
      <div className="space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.link}
              className="flex items-center space-x-4 space-x-reverse p-4 rounded-xl hover:bg-background-50 transition-all duration-300 group border border-transparent hover:border-border-200"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} ${action.hoverColor} transition-all duration-300 shadow-md group-hover:shadow-lg transform group-hover:scale-105`}>
                <Icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-800 group-hover:text-gold-600 transition-colors duration-300">
                  {action.title}
                </div>
                <div className="text-xs text-text-600">
                  {action.description}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="w-4 h-4 text-gold-500" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;