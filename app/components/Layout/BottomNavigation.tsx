"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Eye, ShoppingCart, DollarSign, Wallet, ArrowRightLeft } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'داشبورد',
      href: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard'
    },
    {
      name: 'بازار',
      href: '/market',
      icon: Eye,
      isActive: pathname === '/market'
    },
    {
      name: 'خرید',
      href: '/buy',
      icon: ShoppingCart,
      isActive: pathname.startsWith('/buy')
    },
    {
      name: 'فروش',
      href: '/sell',
      icon: DollarSign,
      isActive: pathname.startsWith('/sell')
    },
    {
      name: 'کیف پول',
      href: '/wallet',
      icon: Wallet,
      isActive: pathname === '/wallet'
    },
    {
      name: 'انتقال',
      href: '/transfer',
      icon: ArrowRightLeft,
      isActive: pathname === '/transfer'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-green-500 border-t border-green-400 md:hidden z-50">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                item.isActive
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'text-green-50 hover:text-white hover:bg-green-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${item.isActive ? 'text-white' : 'text-green-100'}`} />
              <span className={`text-xs font-medium ${item.isActive ? 'text-white' : 'text-green-100'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
