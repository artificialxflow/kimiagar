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
      link: '/buy',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      iconColor: 'text-green-50'
    },
    {
      title: 'فروش طلا',
      description: 'فروش طلا و سکه',
      icon: TrendingUp,
      link: '/sell',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      iconColor: 'text-red-50'
    },
    {
      title: 'تحویل فیزیکی',
      description: 'درخواست تحویل طلا',
      icon: Send,
      link: '/delivery',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      iconColor: 'text-blue-50'
    },
    {
      title: 'شارژ کیف پول',
      description: 'شارژ کیف پول ریالی',
      icon: ArrowUpRight,
      link: '/wallet?tab=charge',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      iconColor: 'text-purple-50'
    },
    {
      title: 'انتقال طلا',
      description: 'انتقال طلا به کاربر دیگر',
      icon: Send,
      link: '/transfer',
      color: 'bg-gradient-to-br from-gold-500 to-gold-600',
      hoverColor: 'hover:from-gold-600 hover:to-gold-700',
      iconColor: 'text-gold-50'
    },
    {
      title: 'سایر موارد',
      description: 'سایر خدمات و درخواست‌ها',
      icon: ArrowUpRight,
      link: '/other-services',
      color: 'bg-gradient-to-br from-gray-500 to-gray-600',
      hoverColor: 'hover:from-gray-600 hover:to-gray-700',
      iconColor: 'text-gray-50'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl font-semibold text-text-800 mb-6 flex items-center">
        <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full ml-3"></div>
        دسترسی سریع
      </h2>
      
      {/* Desktop Layout - Vertical */}
      <div className="hidden md:block space-y-4">
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

      {/* Mobile Layout - Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.link}
                className="flex-shrink-0 w-24 flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-background-50 transition-all duration-300 group border border-transparent hover:border-border-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} ${action.hoverColor} transition-all duration-300 shadow-md group-hover:shadow-lg transform group-hover:scale-105`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-text-800 group-hover:text-gold-600 transition-colors duration-300 leading-tight">
                    {action.title}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;