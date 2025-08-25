import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink, Database } from 'lucide-react';

interface PriceCardProps {
  title: string;
  price: string;
  change: string;
  changeType: 'positive' | 'negative';
  unit: string;
  source?: 'internal' | 'external';
  externalData?: {
    timestamp: string;
    persianName: string;
    source: string;
  };
  lastUpdate?: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ 
  title, 
  price, 
  change, 
  changeType, 
  unit, 
  source = 'internal',
  externalData,
  lastUpdate 
}) => {
  const isPositive = changeType === 'positive';
  const isExternal = source === 'external';
  
  // تبدیل timestamp به زمان قابل خواندن
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'نامشخص';
    }
  };

  // نمایش منبع قیمت
  const renderSourceBadge = () => {
    if (isExternal) {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded-lg">
          <ExternalLink className="w-3 h-3 text-blue-600" />
          <span className="text-xs text-blue-600 font-medium">خارجی</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg">
        <Database className="w-3 h-3 text-gray-600" />
        <span className="text-xs text-gray-600 font-medium">داخلی</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {renderSourceBadge()}
        </div>
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
        
        {/* اطلاعات اضافی برای قیمت‌های خارجی */}
        {isExternal && externalData && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>نام فارسی:</span>
                <span className="font-medium text-gray-700">{externalData.persianName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>آخرین بروزرسانی:</span>
                <span className="font-medium text-gray-700">
                  {formatTimestamp(externalData.timestamp)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* نمایش زمان آخرین بروزرسانی */}
        {lastUpdate && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              <span>بروزرسانی:</span>
              <span className="font-medium text-gray-700 mr-1">
                {formatTimestamp(lastUpdate)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCard;