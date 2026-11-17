'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Store, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import OTPInput from '@/components/OTPInput';
import { toast } from 'sonner';

type Step = 'form' | 'otp';
type RegisterMethod = 'password' | 'otp';
type RegisterFormBuyerType = {
    isModal?: boolean
    setModal?: () => void
}

export default function RegisterFormBuyer({ isModal = false, setModal }: RegisterFormBuyerType) {
    const router = useRouter();
    const { register, sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP, isAuthenticated } = useAuth()

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

    useEffect(() => {
        if (!isModal && isAuthenticated) {
            router.push('/');
        }
        if (isModal && isAuthenticated && setModal) setModal()
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // --- Password Registration ---
    const handlePasswordRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.username) {
            toast.error('لطفاً فیلدهای ضروری را پر کنید');
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error('رمز عبور و تکرار آن مطابقت ندارند');
            return;
        }
        if (form.password.length < 6) {
            toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
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
            if (!isModal) router.push('/');
            if (setModal) setModal()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'خطا در ثبت‌نام');
        } finally { setLoading(false); }
    };

    // --- Send OTP ---
    const handleSendOTP = async () => {
        const contact = otpMethod === 'email' ? form.email : form.phone;
        if (!contact) {
            toast.error(otpMethod === 'email' ? 'ایمیل را وارد کنید' : 'شماره تلفن را وارد کنید');
            return;
        }
        if (otpMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            toast.error('ایمیل معتبر وارد کنید');
            return;
        }
        if (otpMethod === 'phone' && form.phone.length < 10) {
            toast.error('شماره تلفن معتبر وارد کنید');
            return;
        }
        if (!form.username || !form.password || form.password.length < 6) {
            toast.error('لطفاً نام کاربری و رمز عبور (حداقل ۶ کاراکتر) را پر کنید');
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
            toast.error(err instanceof Error ? err.message : 'خطا در ارسال کد');
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
            if (!isModal) router.push('/');
            if (setModal) setModal()
        } catch (err: unknown) {
            setOtpError(err instanceof Error ? err.message : 'کد اشتباه است');
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                {/* Register Method Tabs */}
                <div className="flex gap-2 mb-6 bg-muted rounded-xl p-1">
                    <button
                        onClick={() => { setMethod('password'); setStep('form'); setOtpError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${method === 'password' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Lock className="w-4 h-4" /> ثبت‌نام معمولی
                    </button>
                    <button
                        onClick={() => { setMethod('otp'); setStep('form'); setOtpError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${method === 'otp' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Mail className="w-4 h-4" /> ثبت‌نام با کد
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'form' && method === 'password' && (
                        <motion.form key="pw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            onSubmit={handlePasswordRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">نام</label>
                                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="نام شما" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">نام خانوادگی</label>
                                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="نام خانوادگی" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">نام کاربری *</label>
                                <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="username" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">ایمیل *</label>
                                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">رمز عبور *</label>
                                <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="حداقل ۶ کاراکتر" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">تکرار رمز عبور *</label>
                                <input type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="تکرار رمز عبور" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full h-12 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50">
                                {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام خریدار'}
                            </button>
                        </motion.form>
                    )}

                    {step === 'form' && method === 'otp' && (
                        <motion.div key="otp-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            {/* OTP Method: Email or Phone */}
                            <div className="flex gap-2 bg-muted rounded-xl p-1">
                                <button
                                    onClick={() => setOtpMethod('email')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${otpMethod === 'email' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                                        }`}
                                >
                                    <Mail className="w-3.5 h-3.5" /> ثبت‌نام با ایمیل
                                </button>
                                <button
                                    onClick={() => setOtpMethod('phone')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${otpMethod === 'phone' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                                        }`}
                                >
                                    <Phone className="w-3.5 h-3.5" /> ثبت‌نام با شماره تلفن
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">نام</label>
                                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">نام خانوادگی</label>
                                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">نام کاربری *</label>
                                <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="username" />
                            </div>

                            {otpMethod === 'email' ? (
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">ایمیل *</label>
                                    <div className="relative">
                                        <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                            className={`w-full h-11 pr-10 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                                            placeholder="email@example.com" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5">شماره تلفن *</label>
                                    <div className="relative">
                                        <Phone className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                                        <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className={`w-full h-11 pr-10 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                                            placeholder="09123456789" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold mb-1.5">رمز عبور *</label>
                                <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="حداقل ۶ کاراکتر" />
                            </div>

                            <button onClick={handleSendOTP} disabled={loading}
                                className="w-full h-12 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50">
                                {loading ? 'در حال ارسال...' : 'ارسال کد تأیید و ثبت‌نام'}
                            </button>
                        </motion.div>
                    )}

                    {/* Step: OTP Verification */}
                    {step === 'otp' && (
                        <motion.div key="otp-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                                {otpMethod === 'email' ? <Mail className="w-7 h-7 text-white" /> : <Phone className="w-7 h-7 text-white" />}
                            </div>
                            <h3 className="text-lg font-bold mb-1">کد تأیید را وارد کنید</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                                {otpMethod === 'email' ? 'کد تأیید به ایمیل شما ارسال شد' : 'کد تأیید به شماره شما ارسال شد'}
                            </p>
                            <p className="text-sm font-bold text-primary mb-6 font-mono" dir="ltr">
                                {otpMethod === 'email' ? form.email : form.phone}
                            </p>

                            <OTPInput length={6} onComplete={handleVerifyOTP} isLoading={loading} error={otpError} />

                            <div className="mt-6 text-sm text-muted-foreground">
                                {countdown > 0 ? (
                                    <span>ارسال مجدد در <span className="font-bold text-primary">{countdown}s</span></span>
                                ) : (
                                    <button onClick={handleSendOTP} disabled={loading} className="text-primary font-bold hover:underline">
                                        ارسال دوباره کد
                                    </button>
                                )}
                            </div>

                            <button onClick={() => { setStep('form'); setOtpError(''); }} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
                                ← بازگشت
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Links */}
                {!isModal && (
                    <div className="mt-6 pt-4 border-t border-border text-center space-y-2">
                        <div>
                            <span className="text-muted-foreground text-sm">قبلاً ثبت‌نام کرده‌اید؟</span>{' '}
                            <Link href="/login" className="text-primary font-bold hover:underline text-sm">ورود</Link>
                        </div>
                        <div>
                            <Link href="/register/seller" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                                <Store className="w-4 h-4" /> فروشنده شوید
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}