'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, ArrowLeft, User, Store } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import OTPInput from '@/components/OTPInput';
import toast from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

type Step = 'choose' | 'otp' | 'password';
export default function LoginForm() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const t = useTranslations('auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated, isAdmin, sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP } = useAuth();

    const [step, setStep] = useState<Step>('choose');
    const [method, setMethod] = useState<'email' | 'phone'>('email');
    const [loading, setLoading] = useState(false);

    // Email/Phone login
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // OTP
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [otpVerified, setOtpVerified] = useState(false);
    const [verifiedContact, setVerifiedContact] = useState('');

    const returnUrl = searchParams.get('returnUrl');

    // Redirect if already authenticated — admins go to /admin, others to home
    useEffect(() => {
        if (isAuthenticated) {
            const target = returnUrl || (isAdmin ? '/admin' : '/');
            router.push(target);
        }
    }, [isAuthenticated, isAdmin, router, returnUrl]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // --- Password Login ---
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const loginStr = method === 'email' ? email : phone;
        if (!loginStr || !password) { toast.error('لطفاً همه فیلدها را پر کنید'); return; }
        setLoading(true);
        try {
            await login(loginStr, password);
            // Redirect handled by useEffect above
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'خطا در ورود');
        } finally { setLoading(false); }
    };

    // --- OTP: Send Code ---
    const handleSendOTP = async () => {
        const contact = method === 'email' ? email : phone;
        if (!contact) { toast.error(method === 'email' ? 'ایمیل را وارد کنید' : 'شماره تلفن را وارد کنید'); return; }
        if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('ایمیل معتبر وارد کنید'); return;
        }
        if (method === 'phone' && phone.length < 10) {
            toast.error('شماره تلفن معتبر وارد کنید'); return;
        }

        setLoading(true);
        setOtpError('');
        try {
            if (method === 'email') await sendEmailOTP(email);
            else await sendPhoneOTP(phone);
            setStep('otp');
            setCountdown(60);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'خطا در ارسال کد');
        } finally { setLoading(false); }
    };

    // --- OTP: Verify ---
    const handleVerifyOTP = async (code: string) => {
        setOtpError('');
        setLoading(true);
        try {
            const contact = method === 'email' ? email : phone;
            if (method === 'email') {
                await verifyEmailOTP({ email: contact, code });
            } else {
                await verifyPhoneOTP({ phone: contact, code });
            }
            router.push(returnUrl || (isAdmin ? '/admin' : '/'));
        } catch (err: unknown) {
            setOtpError(err instanceof Error ? err.message : 'کد اشتباه است');
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">


            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                {/* Method Tabs */}
                <div className="flex gap-2 mb-6 bg-muted rounded-xl p-1">
                    <button
                        onClick={() => { setMethod('email'); setStep('choose'); setOtpError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${method === 'email' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Mail className="w-4 h-4" /> {t('login_with_email')}
                    </button>
                    <button
                        onClick={() => { setMethod('phone'); setStep('choose'); setOtpError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${method === 'phone' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Phone className="w-4 h-4" /> {t('login_with_phone')}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step: Password Login */}
                    {step === 'choose' && (
                        <motion.div key="pw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <form onSubmit={handlePasswordLogin} className="space-y-4">
                                {method === 'email' ? (
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">{t('email_label')}</label>
                                        <div className="relative">
                                            <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                                className={`w-full h-11 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                                                placeholder="email@example.com" />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">{t('phone_label')}</label>
                                        <div className="relative">
                                            <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                                            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                                                className={`w-full h-11 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                                                placeholder={t('phone_placeholder')} />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">{t('password_label')}</label>
                                    <div className="relative">
                                        <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                            className={`w-full h-11 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                                            placeholder="******" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full h-12 rounded-xl bg-linear-to-r from-violet-500 to-blue-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50">
                                    {loading ? t('authenticating') : t('login_btn')}
                                </button>
                            </form>

                            {/* OTP Option */}
                            {/* <div className="mt-6 pt-4 border-t border-border text-center">
                                <p className="text-sm text-muted-foreground mb-3">{t.auth.or_login_with_otp}</p>
                                <button onClick={handleSendOTP} disabled={loading}
                                    className="w-full h-11 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary text-sm font-bold transition-all">
                                    {method === 'email' ? t.auth.email_verification : t.auth.phone_verification}
                                </button>
                            </div> */}
                        </motion.div>
                    )
                    }

                    {/* Step: OTP Verification */}
                    {
                        step === 'otp' && (
                            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                                    {method === 'email' ? <Mail className="w-7 h-7 text-white" /> : <Phone className="w-7 h-7 text-white" />}
                                </div>
                                <h3 className="text-lg font-bold mb-1">{method === 'email' ? t('email_verification') : t('phone_verification')}</h3>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {method === 'email' ? t('otp_sent_email') : t('otp_sent_phone')}
                                </p>
                                <p className="text-sm font-bold text-primary mb-6 font-mono" dir="ltr">
                                    {method === 'email' ? email : phone}
                                </p>

                                <OTPInput length={6} onComplete={handleVerifyOTP} isLoading={loading} error={otpError} />

                                <div className="mt-6 text-sm text-muted-foreground">
                                    {countdown > 0 ? (
                                        <span>{t('resend_in')} <span className="font-bold text-primary">{countdown}s</span></span>
                                    ) : (
                                        <button onClick={handleSendOTP} disabled={loading} className="text-primary font-bold hover:underline">
                                            {t('resend_code')}
                                        </button>
                                    )}
                                </div>

                                <button onClick={() => setStep('choose')} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
                                    ← {t('common.back')}
                                </button>
                            </motion.div>
                        )
                    }
                </AnimatePresence >

                {/* Links */}
                < div className="mt-6 pt-4 border-t border-border text-center space-y-2" >
                    <div>
                        <span className="text-muted-foreground text-sm">{t('no_account')}</span>{' '}
                        <Link href="/register/buyer" className="text-primary font-bold hover:underline text-sm">{t('register_as_buyer')}</Link>
                    </div>
                    <div>
                        <Link href="/register/seller" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                            <Store className="w-4 h-4" /> {t('register_as_seller')}
                        </Link>
                    </div>
                </div >
            </div >
        </motion.div >
    );
}