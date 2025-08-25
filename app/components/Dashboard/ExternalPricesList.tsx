import React from 'react';
import PriceDisplayCard from './PriceDisplayCard';

interface ExternalPricesListProps {
  externalPrices: any;
  loading?: boolean;
}

const ExternalPricesList: React.FC<ExternalPricesListProps> = ({
  externalPrices,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!externalPrices || Object.keys(externalPrices).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">قیمت‌های خارجی در دسترس نیست</p>
          <p className="text-sm">لطفاً دکمه بروزرسانی را کلیک کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* نقد خرد */}
      {externalPrices.GOLD_18K && (
        <PriceDisplayCard
          title="نقد خرد"
          buyPrice={externalPrices.GOLD_18K.buyPrice}
          sellPrice={externalPrices.GOLD_18K.sellPrice}
          margin={externalPrices.GOLD_18K.sellPrice - externalPrices.GOLD_18K.buyPrice}
        />
      )}

      {/* سکه تمام ۸۶ */}
      {externalPrices.COIN_BAHAR_86 && (
        <PriceDisplayCard
          title="سکه تمام ۸۶"
          buyPrice={externalPrices.COIN_BAHAR_86.buyPrice}
          sellPrice={externalPrices.COIN_BAHAR_86.sellPrice}
          margin={externalPrices.COIN_BAHAR_86.sellPrice - externalPrices.COIN_BAHAR_86.buyPrice}
        />
      )}

      {/* نیم سکه ۸۶ */}
      {externalPrices.COIN_NIM_86 && (
        <PriceDisplayCard
          title="نیم سکه ۸۶"
          buyPrice={externalPrices.COIN_NIM_86.buyPrice}
          sellPrice={externalPrices.COIN_NIM_86.sellPrice}
          margin={externalPrices.COIN_NIM_86.sellPrice - externalPrices.COIN_NIM_86.buyPrice}
        />
      )}

      {/* ربع سکه ۸۶ */}
      {externalPrices.COIN_ROBE_86 && (
        <PriceDisplayCard
          title="ربع سکه ۸۶"
          buyPrice={externalPrices.COIN_ROBE_86.buyPrice}
          sellPrice={externalPrices.COIN_ROBE_86.sellPrice}
          margin={externalPrices.COIN_ROBE_86.sellPrice - externalPrices.COIN_ROBE_86.buyPrice}
        />
      )}
    </div>
  );
};

export default ExternalPricesList;
