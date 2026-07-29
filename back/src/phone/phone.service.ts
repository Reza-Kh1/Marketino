/**
 * PhoneService - سرویس ارسال SMS
 * در محیط development کد را console log می‌کند
 * برای production می‌توان از Kavenegar, Ghasedak, Twilio و... استفاده کرد
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name);
  private readonly smsProvider: string;

  constructor(private readonly configService: ConfigService) {
    this.smsProvider = this.configService.get('SMS_PROVIDER', 'mock');
    this.logger.log(`SMS provider: ${this.smsProvider}`);
  }

  /**
   * ارسال کد OTP از طریق SMS
   * در حالت mock، کد در console.log نمایش داده می‌شود
   */
  async sendOTP(phone: string, code: string, lang: string = 'fa'): Promise<void> {
    const message = lang === 'fa'
      ? `کد تأیید بازارچه: ${code}\nاین کد ۵ دقیقه اعتبار دارد`
      : `Bazarche verification code: ${code}\nThis code expires in 5 minutes`;

    if (this.smsProvider === 'mock') {
      this.logger.log(`[SMS MOCK] To: ${phone} | Message: ${message}`);
      return;
    }

    if (this.smsProvider === 'kavenegar') {
      await this.sendViaKavenegar(phone, message);
      return;
    }

    if (this.smsProvider === 'twilio') {
      await this.sendViaTwilio(phone, message);
      return;
    }

    // Fallback
    this.logger.warn(`Unknown SMS provider: ${this.smsProvider}, using mock`);
    this.logger.log(`[SMS MOCK] To: ${phone} | Code: ${code}`);
  }

  /**
   * پیامک سفارش جدید به فروشنده
   */
  async sendOrderNotification(phone: string, orderNumber: string, lang: string = 'fa'): Promise<void> {
    const message = lang === 'fa'
      ? `سفارش جدید! شماره سفارش: ${orderNumber}\nبرای مشاهده به پنل فروشنده مراجعه کنید`
      : `New Order! Order #${orderNumber}\nCheck your seller panel`;

    if (this.smsProvider === 'mock') {
      this.logger.log(`[SMS MOCK] Order Notification To: ${phone} | Order: ${orderNumber}`);
      return;
    }

    try {
      await this.sendSMS(phone, message);
    } catch (err) {
      this.logger.error(`Failed to send order notification: ${(err as Error).message}`);
    }
  }

  private async sendSMS(phone: string, message: string): Promise<void> {
    if (this.smsProvider === 'kavenegar') {
      await this.sendViaKavenegar(phone, message);
    } else if (this.smsProvider === 'twilio') {
      await this.sendViaTwilio(phone, message);
    } else {
      this.logger.log(`[SMS MOCK] To: ${phone} | Message: ${message}`);
    }
  }

  private async sendViaKavenegar(phone: string, message: string): Promise<void> {
    const apiKey = this.configService.get('KAVENEGAR_API_KEY', '');
    if (!apiKey) {
      this.logger.warn('KAVENEGAR_API_KEY not set');
      this.logger.log(`[SMS MOCK] Kavenegar: ${phone} | ${message}`);
      return;
    }

    const receptor = phone.startsWith('0') ? phone : `0${phone}`;
    // Remove +98 or 98 prefix if exists
    const cleanPhone = receptor.replace(/^(\+98|98)/, '0');

    try {
      const response = await fetch(`https://api.kavenegar.com/v1/${apiKey}/sms/send.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          receptor: cleanPhone,
          message,
        }).toString(),
      });
      const result = await response.json();
      this.logger.log(`Kavenegar SMS sent to ${cleanPhone}: ${JSON.stringify(result)}`);
    } catch (err) {
      this.logger.error(`Kavenegar error: ${(err as Error).message}`);
    }
  }

  private async sendViaTwilio(phone: string, message: string): Promise<void> {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID', '');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN', '');
    const from = this.configService.get('TWILIO_PHONE_NUMBER', '');

    if (!accountSid || !authToken || !from) {
      this.logger.warn('Twilio not configured');
      this.logger.log(`[SMS MOCK] Twilio: ${phone} | ${message}`);
      return;
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          },
          body: new URLSearchParams({ From: from, To: phone, Body: message }).toString(),
        },
      );
      const result = await response.json();
      this.logger.log(`Twilio SMS sent to ${phone}: ${JSON.stringify(result)}`);
    } catch (err) {
      this.logger.error(`Twilio error: ${(err as Error).message}`);
    }
  }
}
