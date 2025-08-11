// تنظیمات سرویس‌های خارجی
export interface SMSServiceConfig {
  provider: 'kavenegar' | 'melipayamak' | 'ghasedak' | 'custom';
  apiKey: string;
  apiUrl?: string;
  templateId?: string;
}

export interface EmailServiceConfig {
  provider: 'sendgrid' | 'mailgun' | 'smtp' | 'custom';
  apiKey?: string;
  apiUrl?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
}

// کلاس مدیریت سرویس SMS
export class SMSService {
  private config: SMSServiceConfig;

  constructor(config: SMSServiceConfig) {
    this.config = config;
  }

  // ارسال SMS
  async sendSMS(phoneNumber: string, message: string, templateParams?: Record<string, string>): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'kavenegar':
          return await this.sendViaKavenegar(phoneNumber, message, templateParams);
        case 'melipayamak':
          return await this.sendViaMelipayamak(phoneNumber, message);
        case 'ghasedak':
          return await this.sendViaGhasedak(phoneNumber, message);
        case 'custom':
          return await this.sendViaCustom(phoneNumber, message);
        default:
          throw new Error(`SMS provider ${this.config.provider} not supported`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // ارسال OTP
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `کد تایید شما: ${otp}`;
    return await this.sendSMS(phoneNumber, message);
  }

  // ارسال اعلان معامله
  async sendTransactionNotification(phoneNumber: string, transactionType: string, amount: string, status: string): Promise<boolean> {
    const message = `معامله ${transactionType} به مبلغ ${amount} با وضعیت ${status} انجام شد.`;
    return await this.sendSMS(phoneNumber, message);
  }

  // ارسال از طریق کاوه‌نگار
  private async sendViaKavenegar(phoneNumber: string, message: string, templateParams?: Record<string, string>): Promise<boolean> {
    const url = 'https://api.kavenegar.com/v1/sms/send.json';
    const params = new URLSearchParams({
      receptor: phoneNumber,
      message: message,
      ...templateParams
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.return?.status === 200;
    }
    return false;
  }

  // ارسال از طریق ملی پیامک
  private async sendViaMelipayamak(phoneNumber: string, message: string): Promise<boolean> {
    const url = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';
    const body = {
      username: this.config.apiKey,
      password: this.config.apiKey, // در واقع باید password جداگانه باشد
      to: phoneNumber,
      from: '5000xxx', // شماره فرستنده
      text: message
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const result = await response.json();
      return result.Value === 0; // موفقیت
    }
    return false;
  }

  // ارسال از طریق قاصدک
  private async sendViaGhasedak(phoneNumber: string, message: string): Promise<boolean> {
    const url = 'https://api.ghasedak.me/v2/sms/send/simple';
    const body = {
      receptor: phoneNumber,
      message: message,
      linenumber: '10008566' // شماره خط
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': this.config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const result = await response.json();
      return result.result?.code === 200;
    }
    return false;
  }

  // ارسال از طریق سرویس سفارشی
  private async sendViaCustom(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.config.apiUrl) {
      throw new Error('Custom SMS service requires apiUrl configuration');
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message
      })
    });

    return response.ok;
  }
}

// کلاس مدیریت سرویس ایمیل
export class EmailService {
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.config = config;
  }

  // ارسال ایمیل
  async sendEmail(to: string, subject: string, content: string, isHTML: boolean = false): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendViaSendGrid(to, subject, content, isHTML);
        case 'mailgun':
          return await this.sendViaMailgun(to, subject, content, isHTML);
        case 'smtp':
          return await this.sendViaSMTP(to, subject, content, isHTML);
        case 'custom':
          return await this.sendViaCustom(to, subject, content, isHTML);
        default:
          throw new Error(`Email provider ${this.config.provider} not supported`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // ارسال ایمیل خوش‌آمدگویی
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const subject = 'خوش آمدید به کیمیاگر';
    const content = `
      <h2>سلام ${username}!</h2>
      <p>به کیمیاگر خوش آمدید. حساب کاربری شما با موفقیت ایجاد شد.</p>
      <p>از خدمات ما لذت ببرید!</p>
    `;
    return await this.sendEmail(email, subject, content, true);
  }

  // ارسال ایمیل تایید
  async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
    const subject = 'تایید ایمیل - کیمیاگر';
    const content = `
      <h2>تایید ایمیل</h2>
      <p>کد تایید شما: <strong>${verificationCode}</strong></p>
      <p>این کد را در صفحه تایید وارد کنید.</p>
    `;
    return await this.sendEmail(email, subject, content, true);
  }

  // ارسال از طریق SendGrid
  private async sendViaSendGrid(to: string, subject: string, content: string, isHTML: boolean): Promise<boolean> {
    const url = 'https://api.sendgrid.com/v3/mail/send';
    const body = {
      personalizations: [
        {
          to: [{ email: to }]
        }
      ],
      from: { email: 'noreply@kimiagar.com' },
      subject: subject,
      content: [
        {
          type: isHTML ? 'text/html' : 'text/plain',
          value: content
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return response.ok;
  }

  // ارسال از طریق Mailgun
  private async sendViaMailgun(to: string, subject: string, content: string, isHTML: boolean): Promise<boolean> {
    const domain = 'mg.kimiagar.com'; // باید تنظیم شود
    const url = `https://api.mailgun.net/v3/${domain}/messages`;
    
    const formData = new FormData();
    formData.append('from', 'کیمیاگر <noreply@kimiagar.com>');
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', content);
    if (isHTML) {
      formData.append('html', content);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
      },
      body: formData
    });

    return response.ok;
  }

  // ارسال از طریق SMTP
  private async sendViaSMTP(to: string, subject: string, content: string, isHTML: boolean): Promise<boolean> {
    // این بخش نیاز به کتابخانه nodemailer دارد
    // فعلاً false برمی‌گردانیم
    console.log('SMTP email sending not implemented yet');
    return false;
  }

  // ارسال از طریق سرویس سفارشی
  private async sendViaCustom(to: string, subject: string, content: string, isHTML: boolean): Promise<boolean> {
    if (!this.config.apiUrl) {
      throw new Error('Custom email service requires apiUrl configuration');
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        subject,
        content,
        isHTML
      })
    });

    return response.ok;
  }
}

// تنظیمات پیش‌فرض
export const defaultSMSConfig: SMSServiceConfig = {
  provider: 'kavenegar',
  apiKey: process.env.KAVENEGAR_API_KEY || '',
  templateId: process.env.KAVENEGAR_TEMPLATE_ID || ''
};

export const defaultEmailConfig: EmailServiceConfig = {
  provider: 'sendgrid',
  apiKey: process.env.SENDGRID_API_KEY || ''
};

// ایجاد نمونه‌های پیش‌فرض
export const smsService = new SMSService(defaultSMSConfig);
export const emailService = new EmailService(defaultEmailConfig);
