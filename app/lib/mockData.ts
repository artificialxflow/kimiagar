// Development mode helper for mock data
export const isDevelopment = process.env.NODE_ENV === 'development';

export const mockPrices = {
  internal: [
    {
      id: 'mock_1',
      productType: 'GOLD_18K',
      buyPrice: 2500000,
      sellPrice: 2550000,
      margin: 50000,
      source: 'internal',
      isActive: true,
      validFrom: new Date(),
      validTo: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'mock_2',
      productType: 'GOLD_24K',
      buyPrice: 3000000,
      sellPrice: 3050000,
      margin: 50000,
      source: 'internal',
      isActive: true,
      validFrom: new Date(),
      validTo: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  external: {
    GOLD_18K: {
      buyPrice: 2500000,
      sellPrice: 2550000,
      timestamp: new Date().toISOString(),
      persianName: 'طلای 18 عیار'
    },
    GOLD_24K: {
      buyPrice: 3000000,
      sellPrice: 3050000,
      timestamp: new Date().toISOString(),
      persianName: 'طلای 24 عیار'
    }
  },
  combined: [
    {
      id: 'mock_1',
      productType: 'GOLD_18K',
      buyPrice: 2500000,
      sellPrice: 2550000,
      margin: 50000,
      source: 'internal',
      isActive: true,
      validFrom: new Date(),
      validTo: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'mock_2',
      productType: 'GOLD_24K',
      buyPrice: 3000000,
      sellPrice: 3050000,
      margin: 50000,
      source: 'internal',
      isActive: true,
      validFrom: new Date(),
      validTo: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

export const mockUser = {
  id: 'mock_user_1',
  username: 'emami',
  firstName: 'Ziya',
  lastName: 'Emami',
  phoneNumber: '09123456789',
  nationalId: '1234567890',
  bankAccount: 'IR123456789012345678901234',
  postalCode: '1234567890',
  isVerified: true
};

export const mockWallets = [
  {
    id: 'mock_wallet_1',
    type: 'GOLD',
    balance: 0.00,
    currency: 'IRR',
    createdAt: new Date(),
    // اضافه کردن موجودی سکه‌ها
    coins: {
      fullCoin: 0,      // سکه تمام
      halfCoin: 0,     // نیم سکه
      quarterCoin: 0    // ربع سکه
    }
  },
  {
    id: 'mock_wallet_2',
    type: 'RIAL',
    balance: 0,
    currency: 'IRR',
    createdAt: new Date()
  }
];

export const mockTransactions = [
  {
    id: 'mock_transaction_1',
    type: 'DEPOSIT',
    amount: 1000000,
    description: 'واریز اولیه',
    status: 'COMPLETED',
    createdAt: new Date()
  }
];
