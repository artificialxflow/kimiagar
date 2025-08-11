import { NextRequest, NextResponse } from 'next/server';

// در محیط development، فقط console.log می‌کنیم
// در production، به سرویس‌های SMS واقعی متصل می‌شویم

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, type } = body;

    // اعتبارسنجی ورودی
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'شماره موبایل و پیام الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره موبایل
    if (!/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل نامعتبر است' },
        { status: 400 }
      );
    }

    // در محیط development، فقط log می‌کنیم
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 SMS ارسال شد:');
      console.log('شماره موبایل:', phoneNumber);
      console.log('نوع اعلان:', type);
      console.log('پیام:', message);
      console.log('زمان:', new Date().toLocaleString('fa-IR'));
      console.log('---');
      
      // شبیه‌سازی تاخیر ارسال
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        message: 'SMS با موفقیت ارسال شد (Development Mode)',
        data: {
          phoneNumber,
          message,
          type,
          timestamp: new Date().toISOString(),
          status: 'sent'
        }
      });
    }

    // در محیط production، به سرویس SMS واقعی متصل می‌شویم
    // این بخش بعداً پیاده‌سازی می‌شود
    const smsResponse = await sendRealSMS(phoneNumber, message);
    
    return NextResponse.json({
      success: true,
      message: 'SMS با موفقیت ارسال شد',
      data: smsResponse
    });

  } catch (error) {
    console.error('خطا در ارسال SMS:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال SMS' },
      { status: 500 }
    );
  }
}

// تابع شبیه‌سازی ارسال SMS واقعی (برای آینده)
async function sendRealSMS(phoneNumber: string, message: string) {
  // این تابع بعداً با سرویس‌های واقعی SMS پیاده‌سازی می‌شود
  // مثال: کاوه‌سامانه، ملی پیامک، و غیره
  
  const smsConfig = {
    apiKey: process.env.SMS_API_KEY,
    apiSecret: process.env.SMS_API_SECRET,
    sender: process.env.SMS_SENDER || 'کیمیاگر',
    endpoint: process.env.SMS_ENDPOINT
  };

  // شبیه‌سازی درخواست به سرویس SMS
  const response = await fetch(smsConfig.endpoint || 'https://api.sms-service.com/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${smsConfig.apiKey}`
    },
    body: JSON.stringify({
      to: phoneNumber,
      message: message,
      sender: smsConfig.sender
    })
  });

  if (!response.ok) {
    throw new Error(`خطا در ارسال SMS: ${response.statusText}`);
  }

  return await response.json();
}
