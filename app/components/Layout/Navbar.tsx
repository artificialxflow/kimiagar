"use client";
import React, { useState } from 'react';
import { Menu, X, Bell, User, LogOut, Wallet, ShoppingCart, DollarSign, Eye, ArrowRightLeft, BarChart3, Home, Truck, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigationItems = [
    { name: 'داشبورد', href: '/dashboard', icon: Home },
    { name: 'بازار', href: '/market', icon: Eye },
    { name: 'خرید', href: '/buy', icon: ShoppingCart },
    { name: 'فروش', href: '/sell', icon: DollarSign },
    { name: 'کیف پول', href: '/wallet', icon: Wallet },
    { name: 'انتقال', href: '/transfer', icon: ArrowRightLeft },
    { name: 'گزارش‌ها', href: '/reports', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ک</span>
              </div>
              <span className="text-xl font-bold text-slate-800">کیمیاگر</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Notifications */}
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:block text-sm font-medium">حساب کاربری</span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-800">
                      {user ? `${user.firstName || 'کاربر'} ${user.lastName || ''}` : 'کاربر کیمیاگر'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.username ? `@${user.username}` : 'کاربر عادی'}
                    </p>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>پروفایل</span>
                  </Link>
                  
                  <Link
                    href="/delivery"
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Truck className="w-4 h-4" />
                    <span>تحویل فیزیکی</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>تنظیمات</span>
                  </Link>
                  
                  {user?.isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>پنل ادمین</span>
                    </Link>
                  )}
                  
                  <div className="border-t border-slate-200 mt-2 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>خروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Menu Items */}
              <div className="border-t border-slate-200 pt-2 mt-2">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>پروفایل</span>
                </Link>
                
                <Link
                  href="/delivery"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>تحویل فیزیکی</span>
                </Link>
                
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>تنظیمات</span>
                </Link>
                
                {user?.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>پنل ادمین</span>
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 space-x-reverse text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors w-full text-right"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}