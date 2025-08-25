import React from 'react';

interface PriceDisplayCardProps {
  title: string;
  buyPrice: number;
  sellPrice: number;
  margin?: number;
  className?: string;
}

const PriceDisplayCard: React.FC<PriceDisplayCardProps> = ({
  title,
  buyPrice,
  sellPrice,
  margin,
  className = ''
}) => {
  // فرمت کردن اعداد به فارسی
  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {margin && (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            حاشیه: {formatNumber(margin)} تومان
          </div>
        )}
      </div>

      {/* Price Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Buy Price */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-red-700">قیمت خرید</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(buyPrice)}
          </div>
          <div className="text-xs text-red-500 mt-1">تومان</div>
        </div>

        {/* Sell Price */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-green-700">قیمت فروش</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(sellPrice)}
          </div>
          <div className="text-xs text-green-500 mt-1">تومان</div>
        </div>
      </div>

      {/* Price Difference */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">تفاوت قیمت:</span>
          <span className="font-medium text-gray-900">
            {formatNumber(sellPrice - buyPrice)} تومان
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceDisplayCard;
