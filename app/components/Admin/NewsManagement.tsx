"use client";
import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info, TrendingUp, Calendar, X } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'trend';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  isActive: boolean;
}

export default function NewsManagement() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    priority: 'medium' as const
  });

  // Mock data برای اخبار
  useEffect(() => {
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'نوسان قیمت طلا',
        content: 'امروز قیمت طلا نوسانات شدیدی دارد. لطفاً در معاملات احتیاط کنید.',
        type: 'warning',
        priority: 'high',
        createdAt: new Date(),
        isActive: true
      },
      {
        id: '2',
        title: 'به‌روزرسانی سیستم',
        content: 'سیستم کیمیاگر با ویژگی‌های جدید به‌روزرسانی شد.',
        type: 'info',
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000), // 1 روز پیش
        isActive: true
      },
      {
        id: '3',
        title: 'روند صعودی بازار',
        content: 'قیمت سکه‌ها در حال افزایش است. فرصت مناسبی برای فروش.',
        type: 'trend',
        priority: 'medium',
        createdAt: new Date(Date.now() - 172800000), // 2 روز پیش
        isActive: true
      }
    ];
    setNewsItems(mockNews);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success': return <AlertCircle className="w-5 h-5 text-green-600" />;
      case 'trend': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'trend': return 'bg-blue-50 border-blue-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAddNews = () => {
    if (!newNews.title || !newNews.content) {
      alert('لطفاً عنوان و محتوا را پر کنید');
      return;
    }

    const newsItem: NewsItem = {
      id: Date.now().toString(),
      ...newNews,
      createdAt: new Date(),
      isActive: true
    };

    setNewsItems(prev => [newsItem, ...prev]);
    setNewNews({ title: '', content: '', type: 'info', priority: 'medium' });
    setIsAdding(false);
  };

  const toggleNewsStatus = (id: string) => {
    setNewsItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const deleteNews = (id: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این خبر را حذف کنید؟')) {
      setNewsItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Bell className="w-8 h-8 text-gold-500" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">مدیریت اخبار و اطلاعیه‌ها</h2>
            <p className="text-slate-600">مدیریت اخبار و اطلاعیه‌های سیستم</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
        >
          افزودن خبر جدید
        </button>
      </div>

      {/* Add News Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">افزودن خبر جدید</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">عنوان</label>
              <input
                type="text"
                value={newNews.title}
                onChange={(e) => setNewNews(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="عنوان خبر را وارد کنید"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">محتوا</label>
              <textarea
                value={newNews.content}
                onChange={(e) => setNewNews(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                rows={4}
                placeholder="محتوای خبر را وارد کنید"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نوع</label>
                <select
                  value={newNews.type}
                  onChange={(e) => setNewNews(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="info">اطلاعات</option>
                  <option value="warning">هشدار</option>
                  <option value="success">موفقیت</option>
                  <option value="trend">روند بازار</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اولویت</label>
                <select
                  value={newNews.priority}
                  onChange={(e) => setNewNews(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="low">پایین</option>
                  <option value="medium">متوسط</option>
                  <option value="high">بالا</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleAddNews}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                افزودن خبر
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="space-y-4">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border p-4 transition-all duration-200 ${
              item.isActive ? getTypeColor(item.type) : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3 space-x-reverse flex-1">
                {getTypeIcon(item.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'high' ? 'بالا' : item.priority === 'medium' ? 'متوسط' : 'پایین'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-2">{item.content}</p>
                  <div className="flex items-center space-x-2 space-x-reverse text-xs text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{item.createdAt.toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => toggleNewsStatus(item.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    item.isActive 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {item.isActive ? 'غیرفعال' : 'فعال'}
                </button>
                <button
                  onClick={() => deleteNews(item.id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {newsItems.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">هنوز خبری اضافه نشده است</p>
        </div>
      )}
    </div>
  );
}
