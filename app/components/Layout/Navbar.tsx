import React, { useState } from 'react';
import { Menu, X, Bell, User, LogOut, Wallet, TrendingUp, History } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // حذف useLocation چون در Next.js کاربرد ندارد

  const navigationItems = [
    { name: 'داشبورد', path: '/dashboard', icon: TrendingUp },
    { name: 'کیف پول', path: '/wallet', icon: Wallet },
    { name: 'خرید و فروش', path: '/trading', icon: TrendingUp },
    { name: 'تاریخچه', path: '/history', icon: History },
  ];

  // حذف isActive چون در Next.js باید از usePathname استفاده شود (در صورت نیاز بعداً اضافه می‌شود)

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">ک</span>
              </div>
              <span className="text-white text-xl font-bold">کیمیاگر</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 space-x-reverse">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center px-3 py-2 rounded-lg text-white hover:bg-slate-700 transition-colors"
                >
                  <Icon className="w-5 h-5 ml-2" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-5 h-5 ml-2" /> خروج
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center px-3 py-2 rounded-lg text-white hover:bg-slate-700 transition-colors"
              >
                <Icon className="w-5 h-5 ml-2" />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-5 h-5 ml-2" /> خروج
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;