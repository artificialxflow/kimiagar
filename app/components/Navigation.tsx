'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-background-50 shadow-lg border-b border-border-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo و نام سایت */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-text-50 font-bold text-sm">ک</span>
              </div>
              <span className="text-xl font-bold text-text-900">کیمیاگر</span>
            </Link>
          </div>

          {/* منوی اصلی - دسکتاپ */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  داشبورد
                </Link>
                <Link 
                  href="/trading" 
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  معاملات
                </Link>
                <Link 
                  href="/wallet" 
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  کیف پول
                </Link>
                <Link 
                  href="/profile" 
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  پروفایل
                </Link>
                <Link 
                  href="/support" 
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  پشتیبانی
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/" 
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  صفحه اصلی
                </Link>
                <Link 
                  href="/support" 
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  پشتیبانی
                </Link>
              </>
            )}
          </div>

          {/* بخش کاربر و دکمه‌ها */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-sm text-text-700">
                  <span className="font-medium">خوش آمدید،</span>
                  <span className="mr-1">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-danger px-4 py-2 text-sm font-medium"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                  href="/login"
                  className="text-text-700 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ورود
                </Link>
                <Link
                  href="/login?tab=register"
                  className="btn-primary px-4 py-2 text-sm font-medium"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}

            {/* دکمه منوی موبایل */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-text-700 hover:text-gold-500 p-2 rounded-md"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* منوی موبایل */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-50 border-t border-border-100">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  داشبورد
                </Link>
                <Link
                  href="/trading"
                  className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  معاملات
                </Link>
                <Link
                  href="/wallet"
                  className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  کیف پول
                </Link>
                <Link
                  href="/profile"
                  className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  پروفایل
                </Link>
                <Link
                  href="/support"
                  className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  پشتیبانی
                </Link>
                <div className="border-t border-border-100 pt-4">
                  <div className="px-3 py-2 text-sm text-text-700">
                    <span className="font-medium">خوش آمدید،</span>
                    <span className="mr-1">{user?.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-right btn-danger px-3 py-2 text-base font-medium"
                  >
                    خروج
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  صفحه اصلی
                </Link>
                <Link
                  href="/support"
                  className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  پشتیبانی
                </Link>
                <div className="border-t border-border-100 pt-4 space-y-2">
                  <Link
                    href="/login"
                    className="text-text-700 hover:text-gold-500 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ورود
                  </Link>
                  <Link
                    href="/login?tab=register"
                    className="btn-primary px-3 py-2 text-base font-medium block text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ثبت‌نام
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
