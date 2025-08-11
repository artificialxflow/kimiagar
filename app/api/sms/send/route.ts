import { NextRequest, NextResponse } from 'next/server';

// در محیط development، فقط console.log می‌کنیم
// در production، به سرویس‌های SMS واقعی متصل می‌شویم

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, type, template, variables } = body;

    // اعتبارسنجی ورودی
    if (!phoneNumber || (!message && !template)) {
      return NextResponse.json(
        { error: 'شماره موبایل و پیام یا قالب الزامی است' },
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

    // اگر template استفاده شده، پیام را تولید کن
    let finalMessage = message;
    if (template && variables) {
      finalMessage = generateMessageFromTemplate(template, variables);
    }

    // در محیط development، فقط log می‌کنیم
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 SMS ارسال شد:');
      console.log('شماره موبایل:', phoneNumber);
      console.log('نوع اعلان:', type);
      console.log('پیام:', finalMessage);
      console.log('زمان:', new Date().toLocaleString('fa-IR'));
      console.log('---');
      
      // شبیه‌سازی تاخیر ارسال
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        message: 'SMS با موفقیت ارسال شد (Development Mode)',
        data: {
          phoneNumber,
          message: finalMessage,
          type,
          template,
          variables,
          timestamp: new Date().toISOString(),
          status: 'sent'
        }
      });
    }

    // در محیط production، به سرویس SMS واقعی متصل می‌شویم
    const smsResponse = await sendRealSMS(phoneNumber, finalMessage, type);
    
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

// تابع تولید پیام از قالب
function generateMessageFromTemplate(template: string, variables: any): string {
  let message = template;
  
  // جایگزینی متغیرها در قالب
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    message = message.replace(regex, variables[key]);
  });
  
  return message;
}

// تابع شبیه‌سازی ارسال SMS واقعی (برای آینده)
async function sendRealSMS(phoneNumber: string, message: string, type?: string) {
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
      sender: smsConfig.sender,
      type: type
    })
  });

  if (!response.ok) {
    throw new Error(`خطا در ارسال SMS: ${response.statusText}`);
  }

  return await response.json();
}
