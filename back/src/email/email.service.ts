/**
 * EmailService - سرویس ارسال ایمیل با Nodemailer
 * پشتیبانی از SMTP سفارشی و fallback به console log در محیط development
 *
 * Supported email types:
 *   - OTP / Verification code
 *   - Welcome (new user registration)
 *   - Password reset
 *   - Order confirmation
 *   - Order status update
 *   - Shipping notification
 *   - Seller approval / rejection
 *   - Custom generic email
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: {
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }[];
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  currency?: string;
  orderDate?: string;
}

export interface ShippingEmailData {
  orderId: string;
  customerName: string;
  trackingNumber: string;
  carrier?: string;
  estimatedDelivery?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  // -----------------------------------------------------------------------
  // Initialisation
  // -----------------------------------------------------------------------

  private initTransporter(): void {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      this.logger.log('✅ Email transporter initialised');
    } else {
      this.logger.warn('⚠  SMTP not configured – emails will be logged to console');
    }
  }

  // -----------------------------------------------------------------------
  // Public API – send any custom email
  // -----------------------------------------------------------------------

  /**
   * ارسال ایمیل سفارشی (عمومی)
   * هر جای برنامه می‌تواند از این متد برای ارسال ایمیل با محتوای دلخواه استفاده کند.
   */
  async send(options: SendMailOptions): Promise<boolean> {
    const from = this.configService.get('SMTP_FROM', 'noreply@marketplace.com');

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: options.to,
          cc: options.cc,
          bcc: options.bcc,
          subject: options.subject,
          html: options.html,
          attachments: options.attachments,
        });
        this.logger.log(`📧 Email sent → ${options.to} | ${options.subject}`);
        return true;
      } catch (err) {
        this.logger.error(`❌ Failed to send email to ${options.to}: ${(err as Error).message}`);
        return false;
      }
    }

    // Fallback: log to console
    this.logger.log(`[EMAIL MOCK] To: ${options.to} | Subject: ${options.subject}`);
    return true;
  }

  // -----------------------------------------------------------------------
  // OTP / Verification
  // -----------------------------------------------------------------------

  async sendOTPEmail(email: string, code: string, lang: string = 'fa'): Promise<void> {
    const isPersian = lang === 'fa';
    const subject = isPersian
      ? `کد تأیید: ${code} - بازارچه آنلاین`
      : `Verification Code: ${code} - Bazarche Online`;

    const html = isPersian
      ? this.otpTemplateFa(email, code)
      : this.otpTemplateEn(email, code);

    await this.send({ to: email, subject, html });
  }

  // -----------------------------------------------------------------------
  // Welcome
  // -----------------------------------------------------------------------

  async sendWelcomeEmail(email: string, username: string, lang: string = 'fa'): Promise<void> {
    const isPersian = lang === 'fa';
    const subject = isPersian
      ? 'به بازارچه آنلاین خوش آمدید! 🎉'
      : 'Welcome to Bazarche Online! 🎉';

    const html = this.welcomeTemplate(username, isPersian);
    await this.send({ to: email, subject, html });
  }

  // -----------------------------------------------------------------------
  // Password Reset
  // -----------------------------------------------------------------------

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    username: string,
    lang: string = 'fa',
  ): Promise<void> {
    const isPersian = lang === 'fa';
    const subject = isPersian
      ? 'بازنشانی رمز عبور - بازارچه آنلاین'
      : 'Password Reset - Bazarche Online';

    const html = this.passwordResetTemplate(username, resetLink, isPersian);
    await this.send({ to: email, subject, html });
  }

  // -----------------------------------------------------------------------
  // Order Confirmation
  // -----------------------------------------------------------------------

  async sendOrderConfirmationEmail(
    email: string,
    data: OrderEmailData,
    lang: string = 'fa',
  ): Promise<void> {
    const isPersian = lang === 'fa';
    const currency = data.currency ?? (isPersian ? 'تومان' : 'USD');
    const subject = isPersian
      ? `تأیید سفارش #${data.orderId} - بازارچه آنلاین`
      : `Order Confirmation #${data.orderId} - Bazarche Online`;

    const html = this.orderConfirmationTemplate(data, currency, isPersian);
    await this.send({ to: email, subject, html });
  }

  // -----------------------------------------------------------------------
  // Order Status Update
  // -----------------------------------------------------------------------

  async sendOrderStatusEmail(
    email: string,
    orderId: string,
    customerName: string,
    newStatus: string,
    lang: string = 'fa',
  ): Promise<void> {
    const isPersian = lang === 'fa';
    const statusLabel = isPersian ? this.translateStatusFa(newStatus) : newStatus;
    const subject = isPersian
      ? `وضعیت سفارش #${orderId}: ${statusLabel}`
      : `Order #${orderId} Status: ${statusLabel}`;

    const html = this.orderStatusTemplate(orderId, customerName, statusLabel, isPersian);
    await this.send({ to: email, subject, html });
  }

  // -----------------------------------------------------------------------
  // Shipping Notification
  // -----------------------------------------------------------------------

  async sendShippingEmail(
    email: string,
    data: ShippingEmailData,
    lang: string = 'fa',
  ): Promise<void> {
    const isPersian = lang === 'fa';
    const carrierLabel = data.carrier ?? (isPersian ? 'پست' : 'Post');
    const subject = isPersian
      ? `سفارش #${data.orderId} ارسال شد 🚚`
      : `Order #${data.orderId} Has Been Shipped 🚚`;

    const html = this.shippingTemplate(data, carrierLabel, isPersian);
    await this.send({ to: email, subject, html });
  }

  // -----------------------------------------------------------------------
  // Seller Approval
  // -----------------------------------------------------------------------

  async sendSellerApprovalEmail(
    email: string,
    storeName: string,
    approved: boolean,
    rejectionReason?: string,
    lang: string = 'fa',
  ): Promise<void> {
    const isPersian = lang === 'fa';
    const subject = approved
      ? isPersian
        ? 'فروشگاه شما تأیید شد! 🎉'
        : 'Your store has been approved! 🎉'
      : isPersian
        ? 'وضعیت درخواست فروشندگی'
        : 'Seller Application Status';

    const html = this.sellerApprovalTemplate(storeName, approved, rejectionReason, isPersian);
    await this.send({ to: email, subject, html });
  }

  // -----------------------------------------------------------------------
  // Helpers – status translation
  // -----------------------------------------------------------------------

  private translateStatusFa(status: string): string {
    const map: Record<string, string> = {
      pending: 'در انتظار',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل داده شده',
      cancelled: 'لغو شده',
      refunded: 'مرجوع شده',
    };
    return map[status.toLowerCase()] ?? status;
  }

  // -----------------------------------------------------------------------
  // HTML Templates
  // -----------------------------------------------------------------------

  /** Wraps content in a shared brand layout. */
  private wrapLayout(
    title: string,
    content: string,
    isPersian: boolean,
  ): string {
    const font = isPersian ? 'Tahoma, Arial, sans-serif' : 'Arial, Helvetica, sans-serif';
    const dir = isPersian ? 'rtl' : 'ltr';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f5f7">
  <div style="font-family:${font};direction:${dir};max-width:600px;margin:0 auto;padding:30px 20px">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">${isPersian ? 'بازارچه آنلاین' : 'Bazarche Online'}</h1>
    </div>
    <!-- Body -->
    <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <h2 style="color:#1f2937;margin:0 0 20px;font-size:20px">${title}</h2>
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:20px 10px;color:#9ca3af;font-size:12px">
      <p style="margin:0">${isPersian ? 'این یک ایمیل خودکار است. لطفاً پاسخ ندهید.' : 'This is an automated email. Please do not reply.'}</p>
    </div>
  </div>
</body>
</html>`;
  }

  // -- OTP templates -------------------------------------------------------

  private otpTemplateFa(_email: string, code: string): string {
    const content = `
      <p style="color:#6b7280;line-height:1.8">کد تأیید ۶ رقمی شما برای ورود به حساب کاربری:</p>
      <div style="background:#f3f4f6;padding:24px;border-radius:12px;text-align:center;margin:20px 0">
        <h2 style="color:#4f46e5;margin:0;font-size:38px;letter-spacing:14px;direction:ltr;font-family:'Courier New',monospace">${code}</h2>
      </div>
      <p style="color:#ef4444;font-size:13px;margin:12px 0">⏳ این کد تنها ۵ دقیقه اعتبار دارد.</p>
      <p style="color:#9ca3af;font-size:13px">اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>`;

    return this.wrapLayout('کد تأیید', content, true);
  }

  private otpTemplateEn(_email: string, code: string): string {
    const content = `
      <p style="color:#6b7280;line-height:1.8">Your 6‑digit verification code:</p>
      <div style="background:#f3f4f6;padding:24px;border-radius:12px;text-align:center;margin:20px 0">
        <h2 style="color:#4f46e5;margin:0;font-size:38px;letter-spacing:14px;font-family:'Courier New',monospace">${code}</h2>
      </div>
      <p style="color:#ef4444;font-size:13px;margin:12px 0">⏳ This code expires in 5 minutes.</p>
      <p style="color:#9ca3af;font-size:13px">If you didn't request this, ignore this email.</p>`;

    return this.wrapLayout('Verification Code', content, false);
  }

  // -- Welcome template ----------------------------------------------------

  private welcomeTemplate(username: string, isPersian: boolean): string {
    const content = isPersian
      ? `
        <p style="color:#6b7280;line-height:1.8">سلام <strong>${username}</strong> عزیز،</p>
        <p style="color:#6b7280;line-height:1.8">از ثبت‌نام شما در بازارچه آنلاین بسیار خوشحالیم. اکنون می‌توانید از امکانات زیر استفاده کنید:</p>
        <ul style="color:#6b7280;line-height:2;padding-${isPersian ? 'right' : 'left'}:20px">
          <li>خرید از فروشگاه‌های متنوع</li>
          <li>ایجاد فروشگاه شخصی و فروش محصولات</li>
          <li>مقایسه محصولات و استفاده از کدهای تخفیف</li>
        </ul>
        <p style="color:#6b7280;line-height:1.8">امیدواریم تجربه خرید خوبی داشته باشید!</p>`
      : `
        <p style="color:#6b7280;line-height:1.8">Hi <strong>${username}</strong>,</p>
        <p style="color:#6b7280;line-height:1.8">Welcome to Bazarche Online! Explore what you can do:</p>
        <ul style="color:#6b7280;line-height:2;padding-left:20px">
          <li>Shop from a variety of stores</li>
          <li>Set up your own shop and sell products</li>
          <li>Compare products and use discount codes</li>
        </ul>
        <p style="color:#6b7280;line-height:1.8">We hope you have a great shopping experience!</p>`;

    return this.wrapLayout(
      isPersian ? 'خوش آمدید!' : 'Welcome!',
      content,
      isPersian,
    );
  }

  // -- Password reset template ---------------------------------------------

  private passwordResetTemplate(
    username: string,
    resetLink: string,
    isPersian: boolean,
  ): string {
    const content = isPersian
      ? `
        <p style="color:#6b7280;line-height:1.8">سلام <strong>${username}</strong> عزیز،</p>
        <p style="color:#6b7280;line-height:1.8">درخواست بازنشانی رمز عبور برای حساب شما ثبت شده است. برای تنظیم رمز جدید روی دکمه زیر کلیک کنید:</p>
        <div style="text-align:center;margin:28px 0">
          <a href="${resetLink}" style="display:inline-block;background:#667eea;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">بازنشانی رمز عبور</a>
        </div>
        <p style="color:#9ca3af;font-size:13px">این لینک ۱ ساعت اعتبار دارد. اگر شما این درخواست را ثبت نکرده‌اید، این ایمیل را نادیده بگیرید.</p>`
      : `
        <p style="color:#6b7280;line-height:1.8">Hi <strong>${username}</strong>,</p>
        <p style="color:#6b7280;line-height:1.8">A password reset has been requested for your account. Click the button below to set a new password:</p>
        <div style="text-align:center;margin:28px 0">
          <a href="${resetLink}" style="display:inline-block;background:#667eea;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Reset Password</a>
        </div>
        <p style="color:#9ca3af;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>`;

    return this.wrapLayout(
      isPersian ? 'بازنشانی رمز عبور' : 'Password Reset',
      content,
      isPersian,
    );
  }

  // -- Order confirmation template -----------------------------------------

  private orderConfirmationTemplate(
    data: OrderEmailData,
    currency: string,
    isPersian: boolean,
  ): string {
    const itemsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#4b5563">${item.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#4b5563">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:${isPersian ? 'left' : 'right'};color:#4b5563">${item.price.toLocaleString()} ${currency}</td>
        </tr>`,
      )
      .join('');

    const content = `
      <p style="color:#6b7280;line-height:1.8">${isPersian ? `سلام <strong>${data.customerName}</strong> عزیز،` : `Hi <strong>${data.customerName}</strong>,`}</p>
      <p style="color:#6b7280;line-height:1.8">${isPersian ? 'سفارش شما با موفقیت ثبت شد.' : 'Your order has been placed successfully.'}</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;color:#1f2937;font-weight:bold">${isPersian ? `شماره سفارش: #${data.orderId}` : `Order #${data.orderId}`}</p>
        ${data.orderDate ? `<p style="margin:0;color:#6b7280;font-size:13px">${isPersian ? 'تاریخ:' : 'Date:'} ${data.orderDate}</p>` : ''}
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:10px 12px;text-align:${isPersian ? 'right' : 'left'};color:#374151;font-size:14px">${isPersian ? 'محصول' : 'Item'}</th>
            <th style="padding:10px 12px;text-align:center;color:#374151;font-size:14px">${isPersian ? 'تعداد' : 'Qty'}</th>
            <th style="padding:10px 12px;text-align:${isPersian ? 'left' : 'right'};color:#374151;font-size:14px">${isPersian ? 'قیمت' : 'Price'}</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="text-align:${isPersian ? 'left' : 'right'};padding:12px 0;border-top:2px solid #e5e7eb;margin-top:8px">
        <span style="font-size:18px;font-weight:bold;color:#4f46e5">${isPersian ? 'مجموع:' : 'Total:'} ${data.total.toLocaleString()} ${currency}</span>
      </div>`;

    return this.wrapLayout(
      isPersian ? 'تأیید سفارش' : 'Order Confirmation',
      content,
      isPersian,
    );
  }

  // -- Order status template -----------------------------------------------

  private orderStatusTemplate(
    orderId: string,
    customerName: string,
    statusLabel: string,
    isPersian: boolean,
  ): string {
    const content = isPersian
      ? `
        <p style="color:#6b7280;line-height:1.8">سلام <strong>${customerName}</strong> عزیز،</p>
        <p style="color:#6b7280;line-height:1.8">وضعیت سفارش <strong>#${orderId}</strong> به‌روزرسانی شد:</p>
        <div style="text-align:center;margin:24px 0">
          <span style="display:inline-block;background:#dbeafe;color:#1e40af;padding:12px 28px;border-radius:24px;font-size:18px;font-weight:bold">${statusLabel}</span>
        </div>
        <p style="color:#6b7280;line-height:1.8">برای مشاهده جزئیات سفارش به حساب کاربری خود مراجعه کنید.</p>`
      : `
        <p style="color:#6b7280;line-height:1.8">Hi <strong>${customerName}</strong>,</p>
        <p style="color:#6b7280;line-height:1.8">Your order <strong>#${orderId}</strong> status has been updated:</p>
        <div style="text-align:center;margin:24px 0">
          <span style="display:inline-block;background:#dbeafe;color:#1e40af;padding:12px 28px;border-radius:24px;font-size:18px;font-weight:bold">${statusLabel}</span>
        </div>
        <p style="color:#6b7280;line-height:1.8">Visit your account to view order details.</p>`;

    return this.wrapLayout(
      isPersian ? 'به‌روزرسانی سفارش' : 'Order Update',
      content,
      isPersian,
    );
  }

  // -- Shipping template ---------------------------------------------------

  private shippingTemplate(
    data: ShippingEmailData,
    carrier: string,
    isPersian: boolean,
  ): string {
    const content = isPersian
      ? `
        <p style="color:#6b7280;line-height:1.8">سلام <strong>${data.customerName}</strong> عزیز،</p>
        <p style="color:#6b7280;line-height:1.8">سفارش <strong>#${data.orderId}</strong> ارسال شده و در راه شماست!</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0 0 6px;color:#1f2937"><strong>${isPersian ? 'شرکت حمل‌ونقل:' : 'Carrier:'}</strong> ${carrier}</p>
          <p style="margin:0 0 6px;color:#1f2937"><strong>${isPersian ? 'کد رهگیری:' : 'Tracking Number:'}</strong> <span style="font-family:monospace;background:#e5e7eb;padding:2px 8px;border-radius:4px">${data.trackingNumber}</span></p>
          ${data.estimatedDelivery ? `<p style="margin:0;color:#1f2937"><strong>${isPersian ? 'زمان تخمینی تحویل:' : 'Estimated Delivery:'}</strong> ${data.estimatedDelivery}</p>` : ''}
        </div>`
      : `
        <p style="color:#6b7280;line-height:1.8">Hi <strong>${data.customerName}</strong>,</p>
        <p style="color:#6b7280;line-height:1.8">Your order <strong>#${data.orderId}</strong> is on its way!</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0 0 6px;color:#1f2937"><strong>Carrier:</strong> ${carrier}</p>
          <p style="margin:0 0 6px;color:#1f2937"><strong>Tracking Number:</strong> <span style="font-family:monospace;background:#e5e7eb;padding:2px 8px;border-radius:4px">${data.trackingNumber}</span></p>
          ${data.estimatedDelivery ? `<p style="margin:0;color:#1f2937"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
        </div>`;

    return this.wrapLayout(
      isPersian ? 'سفارش ارسال شد' : 'Order Shipped',
      content,
      isPersian,
    );
  }

  // -- Seller approval template --------------------------------------------

  private sellerApprovalTemplate(
    storeName: string,
    approved: boolean,
    rejectionReason: string | undefined,
    isPersian: boolean,
  ): string {
    const content = approved
      ? isPersian
        ? `
          <p style="color:#6b7280;line-height:1.8">تبریک! فروشگاه <strong>«${storeName}»</strong> با موفقیت تأیید شد.</p>
          <p style="color:#6b7280;line-height:1.8">اکنون می‌توانید به پنل فروشندگی خود وارد شده و محصولات خود را اضافه کنید.</p>
          <div style="text-align:center;margin:24px 0">
            <span style="display:inline-block;background:#d1fae5;color:#065f46;padding:12px 28px;border-radius:24px;font-size:18px;font-weight:bold">✅ تأیید شد</span>
          </div>`
        : `
          <p style="color:#6b7280;line-height:1.8">Congratulations! Your store <strong>"${storeName}"</strong> has been approved.</p>
          <p style="color:#6b7280;line-height:1.8">You can now log into your seller panel and start adding products.</p>
          <div style="text-align:center;margin:24px 0">
            <span style="display:inline-block;background:#d1fae5;color:#065f46;padding:12px 28px;border-radius:24px;font-size:18px;font-weight:bold">✅ Approved</span>
          </div>`
      : isPersian
        ? `
          <p style="color:#6b7280;line-height:1.8">متأسفانه درخواست فروشگاه <strong>«${storeName}»</strong> تأیید نشد.</p>
          ${rejectionReason ? `<p style="color:#dc2626;line-height:1.8;background:#fef2f2;padding:12px;border-radius:6px"><strong>دلیل:</strong> ${rejectionReason}</p>` : ''}
          <p style="color:#6b7280;line-height:1.8">لطفاً با تیم پشتیبانی تماس بگیرید.</p>
          <div style="text-align:center;margin:24px 0">
            <span style="display:inline-block;background:#fee2e2;color:#991b1b;padding:12px 28px;border-radius:24px;font-size:18px;font-weight:bold">❌ رد شد</span>
          </div>`
        : `
          <p style="color:#6b7280;line-height:1.8">Unfortunately, your store <strong>"${storeName}"</strong> was not approved.</p>
          ${rejectionReason ? `<p style="color:#dc2626;line-height:1.8;background:#fef2f2;padding:12px;border-radius:6px"><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
          <p style="color:#6b7280;line-height:1.8">Please contact our support team.</p>
          <div style="text-align:center;margin:24px 0">
            <span style="display:inline-block;background:#fee2e2;color:#991b1b;padding:12px 28px;border-radius:24px;font-size:18px;font-weight:bold">❌ Rejected</span>
          </div>`;

    return this.wrapLayout(
      isPersian ? 'وضعیت فروشگاه' : 'Store Status',
      content,
      isPersian,
    );
  }
}
