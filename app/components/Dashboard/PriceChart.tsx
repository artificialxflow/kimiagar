"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceChart: React.FC = () => {
  const data = [
    { time: '09:00', price: 2800000 },
    { time: '10:00', price: 2820000 },
    { time: '11:00', price: 2815000 },
    { time: '12:00', price: 2835000 },
    { time: '13:00', price: 2850000 },
    { time: '14:00', price: 2840000 },
    { time: '15:00', price: 2860000 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">نمودار قیمت طلا</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-gray-500">آخرین به‌روزرسانی:</span>
          <span className="text-sm font-medium text-slate-900">15:30</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString()} تومان`, 'قیمت']}
              labelFormatter={(label) => `زمان: ${label}`}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#D4AF37" 
              strokeWidth={2}
              dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#D4AF37', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;