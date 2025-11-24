'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import UserWallet from './UserWallet';
import UserTransactions from './UserTransactions';

interface UserWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  token: string;
}

export default function UserWalletModal({
  isOpen,
  onClose,
  userId,
  userName,
  token
}: UserWalletModalProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'transactions'>('wallet');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Header */}
          <div className="bg-gold px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">مشاهده موجودی و تراکنش‌های کاربر</h3>
              <p className="text-sm text-white opacity-90 mt-1">{userName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="-mb-px flex space-x-8 space-x-reverse px-6">
              <button
                onClick={() => setActiveTab('wallet')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'wallet'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                موجودی
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                تراکنش‌ها
              </button>
            </nav>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-4 max-h-[80vh] overflow-y-auto">
            {activeTab === 'wallet' ? (
              <UserWallet userId={userId} token={token} onClose={onClose} />
            ) : (
              <UserTransactions userId={userId} token={token} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

