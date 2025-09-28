"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CoinPriceChartProps {
  data?: any[];
}

export default function CoinPriceChart({ data = [] }: CoinPriceChartProps) {
  // Mock data برای نمودار قیمت سکه‌ها
  const mockData = [
    { name: '08:00', bahar86: 8500000, nim86: 4250000, robe86: 2125000 },
    { name: '09:00', bahar86: 8520000, nim86: 4260000, robe86: 2130000 },
    { name: '10:00', bahar86: 8480000, nim86: 4240000, robe86: 2120000 },
    { name: '11:00', bahar86: 8550000, nim86: 4275000, robe86: 2137500 },
    { name: '12:00', bahar86: 8600000, nim86: 4300000, robe86: 2150000 },
    { name: '13:00', bahar86: 8580000, nim86: 4290000, robe86: 2145000 },
    { name: '14:00', bahar86: 8620000, nim86: 4310000, robe86: 2155000 },
    { name: '15:00', bahar86: 8650000, nim86: 4325000, robe86: 2162500 },
    { name: '16:00', bahar86: 8630000, nim86: 4315000, robe86: 2157500 },
    { name: '17:00', bahar86: 8670000, nim86: 4335000, robe86: 2167500 },
  ];

  const chartData = data.length > 0 ? data : mockData;

  const formatPrice = (value: number) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'bahar86' && 'سکه 86:'} 
              {entry.dataKey === 'nim86' && 'نیم سکه 86:'} 
              {entry.dataKey === 'robe86' && 'ربع سکه 86:'} 
              {entry.value.toLocaleString('fa-IR')} تومان
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border-100 p-6 hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl font-semibold text-text-800 mb-6 flex items-center">
        <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full ml-3"></div>
        نمودار قیمت سکه‌ها
      </h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="bahar86" 
              stroke="#D4AF37" 
              strokeWidth={3}
              dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#D4AF37', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="nim86" 
              stroke="#F59E0B" 
              strokeWidth={3}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="robe86" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 space-x-reverse mt-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-3 h-3 bg-gold-500 rounded-full"></div>
          <span className="text-sm text-slate-600">سکه 86</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-slate-600">نیم سکه 86</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-slate-600">ربع سکه 86</span>
        </div>
      </div>

      {/* Current Prices */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gold-50 rounded-lg">
          <div className="text-sm text-gold-600 mb-1">سکه 86</div>
          <div className="font-bold text-gold-700">
            {chartData[chartData.length - 1]?.bahar86?.toLocaleString('fa-IR')} تومان
          </div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm text-yellow-600 mb-1">نیم سکه 86</div>
          <div className="font-bold text-yellow-700">
            {chartData[chartData.length - 1]?.nim86?.toLocaleString('fa-IR')} تومان
          </div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-sm text-red-600 mb-1">ربع سکه 86</div>
          <div className="font-bold text-red-700">
            {chartData[chartData.length - 1]?.robe86?.toLocaleString('fa-IR')} تومان
          </div>
        </div>
      </div>
    </div>
  );
}
