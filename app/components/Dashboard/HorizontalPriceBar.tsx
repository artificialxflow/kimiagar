import React from 'react';

interface HorizontalPriceBarProps {
  title: string;
  buyPrice: number;
  sellPrice: number;
  margin?: number;
  className?: string;
}

const HorizontalPriceBar: React.FC<HorizontalPriceBarProps> = ({
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
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="text-right min-w-[120px]">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {margin && (
            <p className="text-xs text-gray-500 mt-1">حاشیه: {formatNumber(margin)} تومان</p>
          )}
        </div>

        {/* Price Bar */}
        <div className="flex-1 flex items-center space-x-2 mr-4">
          <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden relative">
            {/* Buy Price Bar (Red) */}
            <div 
              className="h-full bg-red-500 flex items-center justify-center"
              style={{ width: '50%' }}
            >
              <span className="text-white text-sm font-medium">
                {formatNumber(buyPrice)}
              </span>
            </div>
            
            {/* Sell Price Bar (Green) */}
            <div 
              className="h-full bg-green-500 flex items-center justify-center"
              style={{ width: '50%' }}
            >
              <span className="text-white text-sm font-medium">
                {formatNumber(sellPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Price Labels */}
        <div className="flex flex-col items-end space-y-2 min-w-[100px]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">خرید</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">فروش</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalPriceBar;
