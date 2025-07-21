"use client";

import React from 'react';
import { AlertCircle, TrendingUp, Info } from 'lucide-react';

const NewsAlerts: React.FC = () => {
  const alerts = [
    {
      type: 'info',
      title: 'تغییر ساعات کاری',
      message: 'ساعات کاری سیستم در روز جمعه از 9 تا 14 خواهد بود.',
      time: '2 ساعت پیش',
      icon: Info
    },
    {
      type: 'warning',
      title: 'نوسان قیمت طلا',
      message: 'قیمت طلا در بازار جهانی با نوسان همراه است.',
      time: '5 ساعت پیش',
      icon: AlertCircle
    },
    {
      type: 'success',
      title: 'رشد قیمت سکه',
      message: 'قیمت سکه بهار آزادی امروز 2.5 درصد رشد کرد.',
      time: '1 روز پیش',
      icon: TrendingUp
    }
  ];

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">اخبار و اطلاعیه‌ها</h2>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getAlertStyle(alert.type)}`}
            >
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className={`p-2 rounded-lg ${getIconColor(alert.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900 mb-1">
                    {alert.title}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {alert.message}
                  </div>
                  <div className="text-xs text-gray-500">
                    {alert.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsAlerts;