// سرویس مدیریت SMS اعلان‌ها
export interface SMSNotification {
  phoneNumber: string;
  type: 'TRADE' | 'BALANCE' | 'TRANSFER' | 'WITHDRAWAL' | 'DEPOSIT' | 'DELIVERY';
  data: any;
}

export class SMSService {
  // ارسال اعلان معامله خرید/فروش
  static async sendTradeNotification(phoneNumber: string, tradeData: {
    type: 'BUY' | 'SELL';
    product: string;
    amount: number;
    unit: string;
    price: number;
    total: number;
    commission: number;
  }) {
    const message = this.formatTradeMessage(tradeData);
    
    return this.sendSMS({
      phoneNumber,
      type: 'TRADE',
      data: { ...tradeData, message }
    });
  }

  // ارسال اعلان تغییر موجودی
  static async sendBalanceNotification(phoneNumber: string, balanceData: {
    type: 'GOLD' | 'RIAL';
    oldBalance: number;
    newBalance: number;
    change: number;
    changeType: 'INCREASE' | 'DECREASE';
  }) {
    const message = this.formatBalanceMessage(balanceData);
    
    return this.sendSMS({
      phoneNumber,
      type: 'BALANCE',
      data: { ...balanceData, message }
    });
  }

  // ارسال اعلان تراکنش مالی
  static async sendFinancialNotification(phoneNumber: string, financialData: {
    type: 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    balance: number;
    description?: string;
  }) {
    const message = this.formatFinancialMessage(financialData);
    
    return this.sendSMS({
      phoneNumber,
      type: financialData.type === 'DEPOSIT' ? 'DEPOSIT' : 'WITHDRAWAL',
      data: { ...financialData, message }
    });
  }

  // ارسال اعلان انتقال
  static async sendTransferNotification(phoneNumber: string, transferData: {
    type: 'SENT' | 'RECEIVED';
    amount: number;
    unit: string;
    fromUser?: string;
    toUser?: string;
    description?: string;
  }) {
    const message = this.formatTransferMessage(transferData);
    
    return this.sendSMS({
      phoneNumber,
      type: 'TRANSFER',
      data: { ...transferData, message }
    });
  }

  // ارسال اعلان درخواست تحویل
  static async sendDeliveryNotification(phoneNumber: string, deliveryData: {
    amount: number;
    unit: string;
    estimatedDate: string;
    location: string;
  }) {
    const message = this.formatDeliveryMessage(deliveryData);
    
    return this.sendSMS({
      phoneNumber,
      type: 'DELIVERY',
      data: { ...deliveryData, message }
    });
  }

  // فرمت پیام معامله
  private static formatTradeMessage(data: any): string {
    const { type, product, amount, unit, price, total, commission } = data;
    
    if (type === 'BUY') {
      return `✅ معامله خرید انجام شد\n` +
             `محصول: ${product}\n` +
             `مقدار: ${amount} ${unit}\n` +
             `قیمت هر ${unit}: ${price.toLocaleString('fa-IR')} تومان\n` +
             `قیمت کل: ${total.toLocaleString('fa-IR')} تومان\n` +
             `کارمزد: ${commission.toLocaleString('fa-IR')} تومان\n` +
             `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
             `کیمیاگر`;
    } else {
      return `💰 معامله فروش انجام شد\n` +
             `محصول: ${product}\n` +
             `مقدار: ${amount} ${unit}\n` +
             `قیمت هر ${unit}: ${price.toLocaleString('fa-IR')} تومان\n` +
             `قیمت کل: ${total.toLocaleString('fa-IR')} تومان\n` +
             `کارمزد: ${commission.toLocaleString('fa-IR')} تومان\n` +
             `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
             `کیمیاگر`;
    }
  }

  // فرمت پیام تغییر موجودی
  private static formatBalanceMessage(data: any): string {
    const { type, oldBalance, newBalance, change, changeType } = data;
    
    if (type === 'GOLD') {
      const unit = 'گرم';
      if (changeType === 'INCREASE') {
        return `🟡 موجودی طلای شما افزایش یافت\n` +
               `موجودی قبلی: ${oldBalance} ${unit}\n` +
               `موجودی جدید: ${newBalance} ${unit}\n` +
               `افزایش: +${change} ${unit}\n` +
               `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
               `کیمیاگر`;
      } else {
        return `🔴 موجودی طلای شما کاهش یافت\n` +
               `موجودی قبلی: ${oldBalance} ${unit}\n` +
               `موجودی جدید: ${newBalance} ${unit}\n` +
               `کاهش: -${change} ${unit}\n` +
               `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
               `کیمیاگر`;
      }
    } else {
      if (changeType === 'INCREASE') {
        return `💚 موجودی ریالی شما افزایش یافت\n` +
               `موجودی قبلی: ${oldBalance.toLocaleString('fa-IR')} تومان\n` +
               `موجودی جدید: ${newBalance.toLocaleString('fa-IR')} تومان\n` +
               `افزایش: +${change.toLocaleString('fa-IR')} تومان\n` +
               `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
               `کیمیاگر`;
      } else {
        return `💔 موجودی ریالی شما کاهش یافت\n` +
               `موجودی قبلی: ${oldBalance.toLocaleString('fa-IR')} تومان\n` +
               `موجودی جدید: ${newBalance.toLocaleString('fa-IR')} تومان\n` +
               `کاهش: -${change.toLocaleString('fa-IR')} تومان\n` +
               `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
               `کیمیاگر`;
      }
    }
  }

  // فرمت پیام تراکنش مالی
  private static formatFinancialMessage(data: any): string {
    const { type, amount, balance, description } = data;
    
    if (type === 'DEPOSIT') {
      return `💳 واریز به حساب شما\n` +
             `مبلغ: ${amount.toLocaleString('fa-IR')} تومان\n` +
             `موجودی جدید: ${balance.toLocaleString('fa-IR')} تومان\n` +
             `${description ? `توضیحات: ${description}\n` : ''}` +
             `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
             `کیمیاگر`;
    } else {
      return `💸 برداشت از حساب شما\n` +
             `مبلغ: ${amount.toLocaleString('fa-IR')} تومان\n` +
             `موجودی جدید: ${balance.toLocaleString('fa-IR')} تومان\n` +
             `${description ? `توضیحات: ${description}\n` : ''}` +
             `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
             `کیمیاگر`;
    }
  }

  // فرمت پیام انتقال
  private static formatTransferMessage(data: any): string {
    const { type, amount, unit, fromUser, toUser, description } = data;
    
    if (type === 'SENT') {
      return `📤 انتقال ارسال شد\n` +
             `مقدار: ${amount} ${unit}\n` +
             `به: ${toUser}\n` +
             `${description ? `توضیحات: ${description}\n` : ''}` +
             `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
             `کیمیاگر`;
    } else {
      return `📥 انتقال دریافت شد\n` +
             `مقدار: ${amount} ${unit}\n` +
             `از: ${fromUser}\n` +
             `${description ? `توضیحات: ${description}\n` : ''}` +
             `زمان: ${new Date().toLocaleString('fa-IR')}\n` +
             `کیمیاگر`;
    }
  }

  // فرمت پیام تحویل
  private static formatDeliveryMessage(data: any): string {
    const { amount, unit, estimatedDate, location } = data;
    
    return `📦 درخواست تحویل طلای فیزیکی\n` +
           `مقدار: ${amount} ${unit}\n` +
           `تاریخ تخمینی: ${estimatedDate}\n` +
           `محل تحویل: ${location}\n` +
           `زمان درخواست: ${new Date().toLocaleString('fa-IR')}\n` +
           `کیمیاگر`;
  }

  // ارسال SMS از طریق API
  private static async sendSMS(notification: SMSNotification): Promise<any> {
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: notification.phoneNumber,
          message: notification.data.message,
          type: notification.type
        }),
      });

      if (!response.ok) {
        throw new Error(`خطا در ارسال SMS: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ SMS ${notification.type} ارسال شد:`, result);
      
      return result;
    } catch (error) {
      console.error(`❌ خطا در ارسال SMS ${notification.type}:`, error);
      throw error;
    }
  }
}
