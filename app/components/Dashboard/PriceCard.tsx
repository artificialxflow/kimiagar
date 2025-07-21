import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceCardProps {
  title: string;
  price: string;
  change: string;
  changeType: 'positive' | 'negative';
  unit: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price, change, changeType, unit }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-slate-900">{price}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{unit}</span>
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;