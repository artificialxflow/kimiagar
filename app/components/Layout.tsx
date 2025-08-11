'use client';

import React from 'react';
import { Navigation } from './Navigation';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export function Layout({ children, showNavigation = true }: LayoutProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && <Navigation />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// Layout برای صفحات احراز هویت شده
export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout showNavigation={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </Layout>
  );
}

// Layout برای صفحات عمومی
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout showNavigation={true}>
      {children}
    </Layout>
  );
}

// Layout برای صفحات بدون Navigation
export function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout showNavigation={false}>
      {children}
    </Layout>
  );
}
