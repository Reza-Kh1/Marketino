'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Store, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n-context';
import OTPInput from '@/components/OTPInput';
import toast from 'react-hot-toast';

type Step = 'form' | 'otp';
type RegisterMethod = 'password' | 'otp';

export default function BuyerRegisterPage() {
  const router = useRouter();
  const { register, sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const isRTL = t.direction === 'rtl';

  const [method, setMethod] = useState<RegisterMethod>('password');
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    username: '', email: '', phone: '', password: '', confirmPassword: '', firstName: '', lastName: '',
  });

  // OTP
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => { if (isAuthenticated) router.push('/'); }, [isAuthenticated, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // --- Password Registration ---
  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.username) {
      toast.error(isRTL ? 'لطفاً فیلدهای ضروری را پر کنید' : 'Please fill in required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error(isRTL ? 'رمز عبور و تکرار آن مطابقت ندارند' : 'Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error(isRTL ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: 'buyer',
      });
      router.push('/');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isRTL ? 'خطا در ثبت‌نام' : 'Registration error'));
    } finally { setLoading(false); }
  };

  // --- Send OTP ---
  const handleSendOTP = async () => {
    const contact = otpMethod === 'email' ? form.email : form.phone;
    if (!contact) {
      toast.error(otpMethod === 'email'
        ? (isRTL ? 'ایمیل را وارد کنید' : 'Please enter email')
        : (isRTL ? 'شماره تلفن را وارد کنید' : 'Please enter phone'));
      return;
    }
    if (otpMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error(isRTL ? 'ایمیل معتبر وارد کنید' : 'Enter a valid email');
      return;
    }
    if (otpMethod === 'phone' && form.phone.length < 10) {
      toast.error(isRTL ? 'شماره تلفن معتبر وارد کنید' : 'Enter a valid phone');
      return;
    }
    if (!form.username || !form.password || form.password.length < 6) {
      toast.error(isRTL ? 'لطفاً نام کاربری و رمز عبور (حداقل ۶ کاراکتر) را پر کنید' : 'Please fill username and password (min 6 chars)');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      if (otpMethod === 'email') await sendEmailOTP(form.email);
      else await sendPhoneOTP(form.phone);
      setStep('otp');
      setCountdown(60);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isRTL ? 'خطا در ارسال کد' : 'Error sending code'));
    } finally { setLoading(false); }
  };

  // --- Verify OTP and Register ---
  const handleVerifyOTP = async (code: string) => {
    setOtpError('');
    setLoading(true);
    try {
      const data = {
        isRegister: true,
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        code,
      };
      if (otpMethod === 'email') {
        await verifyEmailOTP({ ...data, email: form.email });
      } else {
        await verifyPhoneOTP({ ...data, phone: form.phone });
      }
      router.push('/');
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : (isRTL ? 'کد اشتباه است' : 'Invalid code'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black">{t.auth.register_buyer_title}</h1>
          <p className="text-muted-foreground mt-2">{t.auth.register_buyer_subtitle}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* Register Method Tabs */}
          <div className="flex gap-2 mb-6 bg-muted rounded-xl p-1">
            <button
              onClick={() => { setMethod('password'); setStep('form'); setOtpError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                method === 'password' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Lock className="w-4 h-4" /> {isRTL ? 'ثبت‌نام معمولی' : 'Regular'}
            </button>
            <button
              onClick={() => { setMethod('otp'); setStep('form'); setOtpError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                method === 'otp' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" /> {isRTL ? 'ثبت‌نام با کد' : 'OTP'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && method === 'password' && (
              <motion.form key="pw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePasswordRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">{t.auth.first_name_label}</label>
                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={isRTL ? 'نام شما' : 'Your name'} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">{t.auth.last_name_label}</label>
                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={isRTL ? 'نام خانوادگی' : 'Last name'} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.auth.username_label} *</label>
                  <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="username" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.auth.email_label} *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.auth.password_label} *</label>
                  <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={isRTL ? 'حداقل ۶ کاراکتر' : 'Min 6 characters'} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.auth.confirm_password_label} *</label>
                  <input type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={isRTL ? 'تکرار رمز عبور' : 'Confirm password'} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50">
                  {loading ? (isRTL ? 'در حال ثبت‌نام...' : 'Registering...') : t.auth.register_buyer_btn}
                </button>
              </motion.form>
            )}

            {step === 'form' && method === 'otp' && (
              <motion.div key="otp-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {/* OTP Method: Email or Phone */}
                <div className="flex gap-2 bg-muted rounded-xl p-1">
                  <button
                    onClick={() => setOtpMethod('email')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      otpMethod === 'email' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> {t.auth.login_with_email}
                  </button>
                  <button
                    onClick={() => setOtpMethod('phone')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      otpMethod === 'phone' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" /> {t.auth.login_with_phone}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">{t.auth.first_name_label}</label>
                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">{t.auth.last_name_label}</label>
                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.auth.username_label} *</label>
                  <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="username" />
                </div>

                {otpMethod === 'email' ? (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">{t.auth.email_label} *</label>
                    <div className="relative">
                      <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                      <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className={`w-full h-11 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                        placeholder="email@example.com" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">{t.auth.phone_label} *</label>
                    <div className="relative">
                      <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                      <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        className={`w-full h-11 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                        placeholder={t.auth.phone_placeholder} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.auth.password_label} *</label>
                  <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={isRTL ? 'حداقل ۶ کاراکتر' : 'Min 6 characters'} />
                </div>

                <button onClick={handleSendOTP} disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50">
                  {loading ? (isRTL ? 'در حال ارسال...' : 'Sending...') : (isRTL ? 'ارسال کد تأیید و ثبت‌نام' : 'Send Verification & Register')}
                </button>
              </motion.div>
            )}

            {/* Step: OTP Verification */}
            {step === 'otp' && (
              <motion.div key="otp-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  {otpMethod === 'email' ? <Mail className="w-7 h-7 text-white" /> : <Phone className="w-7 h-7 text-white" />}
                </div>
                <h3 className="text-lg font-bold mb-1">{t.auth.enter_otp}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {otpMethod === 'email' ? t.auth.otp_sent_email : t.auth.otp_sent_phone}
                </p>
                <p className="text-sm font-bold text-primary mb-6 font-mono" dir="ltr">
                  {otpMethod === 'email' ? form.email : form.phone}
                </p>

                <OTPInput length={6} onComplete={handleVerifyOTP} isLoading={loading} error={otpError} />

                <div className="mt-6 text-sm text-muted-foreground">
                  {countdown > 0 ? (
                    <span>{t.auth.resend_in} <span className="font-bold text-primary">{countdown}s</span></span>
                  ) : (
                    <button onClick={handleSendOTP} disabled={loading} className="text-primary font-bold hover:underline">
                      {t.auth.resend_code}
                    </button>
                  )}
                </div>

                <button onClick={() => { setStep('form'); setOtpError(''); }} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
                  ← {t.common.back}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Links */}
          <div className="mt-6 pt-4 border-t border-border text-center space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">{t.auth.have_account}</span>{' '}
              <Link href="/login" className="text-primary font-bold hover:underline text-sm">{t.auth.login_link}</Link>
            </div>
            <div>
              <Link href="/register/seller" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                <Store className="w-4 h-4" /> {t.auth.register_as_seller}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
