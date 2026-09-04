'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
    Banknote,
    Plus,
    Trash2,
    Loader2,
    CheckCircle,
    Eye,
    EyeOff,
    CreditCard,
    Building,
    User,
    Hash,
    Star,
    Pencil,
    AlertCircle,
    X,
    Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import InputForm from '@/components/inputs/InputForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useBankAccounts, useCreateBankAccount, useUpdateBankAccount, useDeleteBankAccount, useSetDefaultBankAccount } from '@/hooks/bankAcoount.hook';
import CustomButton from '@/components/CustomButton';
import MotionWrapper from '@/components/motion/MotionWrapper';
import DialogDelete from '@/components/DialogDelete';
const bankAccountSchema = z.object({
    bankName: z.string()
        .min(2, 'نام بانک حداقل ۲ کاراکتر باید باشد')
        .max(50, 'نام بانک حداکثر ۵۰ کاراکتر')
        .nonempty('نام بانک الزامی است'),
    accountHolder: z.string()
        .min(2, 'نام صاحب حساب حداقل ۲ کاراکتر')
        .max(50, 'نام صاحب حساب حداکثر ۵۰ کاراکتر')
        .nonempty('نام صاحب حساب الزامی است'),
    iban: z.string()
        .min(24, 'شماره شبا باید ۲۴ رقم باشد')
        .max(24, 'شماره شبا باید ۲۴ رقم باشد')
        .regex(/^\d{24}$/, 'شماره شبا باید فقط شامل ۲۴ رقم باشد'), // ← حذف IR
    cardNumber: z.string()
        .min(16, 'شماره کارت باید ۱۶ رقم باشد')
        .max(16, 'شماره کارت باید ۱۶ رقم باشد')
        .regex(/^\d{16}$/, 'شماره کارت باید فقط شامل اعداد باشد'),
    walletId: z.string().optional(),
    isDefault: z.boolean().default(false),
    isVerified: z.boolean().default(false),
});
type BankAccountFormData = z.infer<typeof bankAccountSchema>;

// ============ کامپوننت اصلی ============
export default function BankAccountsManager({ walletId }: { walletId: string }) {
    const { data: accounts = [], isLoading } = useBankAccounts();
    const { mutate: createAccount, isPending: isCreating } = useCreateBankAccount();
    const { mutate: updateAccount, isPending: isUpdating } = useUpdateBankAccount();
    const { mutate: deleteAccount, isPending: isDeleting } = useDeleteBankAccount();
    const { mutate: setDefault, isPending: isSettingDefault } = useSetDefaultBankAccount();

    const [openDialog, setOpenDialog] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [showCardNumber, setShowCardNumber] = useState<{ [key: string]: boolean }>({});

    if (!walletId) return
    const MAX_ACCOUNTS = 3;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(bankAccountSchema),
        defaultValues: {
            bankName: '',
            walletId: walletId || '',
            accountHolder: '',
            iban: '',
            cardNumber: '',
            isDefault: false,
            isVerified: false,
        },
    });

    const isDefault = watch('isDefault');
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} با موفقیت کپی شد`);
        }).catch(() => {
            toast.error('خطا در کپی کردن');
        });
    };
    const onSubmit = (data: BankAccountFormData) => {
        if (accounts.length >= MAX_ACCOUNTS && !selectedAccount) {
            toast.error(`حداکثر ${MAX_ACCOUNTS} حساب بانکی قابل ثبت است`);
            return;
        }
        if (selectedAccount) {
            updateAccount(
                { id: selectedAccount.id, data: { ...data, walletId } },
                {
                    onSuccess: () => {
                        setOpenDialog(null);
                        setSelectedAccount(null);
                        reset();
                    },
                }
            );
        } else {
            createAccount({ ...data, walletId }, {
                onSuccess: () => {
                    setOpenDialog(null);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!selectedAccount) return;
        deleteAccount(selectedAccount.id, {
            onSuccess: () => {
                setOpenDialog(null);
                setSelectedAccount(null);
            },
        });
    };

    const handleEdit = (account: any) => {
        setSelectedAccount(account);
        reset({
            bankName: account.bankName,
            accountHolder: account.accountHolder,
            iban: account.iban,
            cardNumber: account.cardNumber,
            isDefault: account.isDefault,
            isVerified: account.isVerified,
        });
        setOpenDialog('edit');
    };
    const handleSetDefault = (id: any) => {
        const body = {
            bankName: id.bankName,
            accountHolder: id.accountHolder,
            iban: id.iban,
            cardNumber: id.cardNumber,
            isDefault: !id.isDefault,
            isVerified: id.isVerified,
            walletId: walletId
        } as any
        setDefault({ id: id.id, data: body });
    };
    const toggleCardVisibility = (id: string) => {
        setShowCardNumber((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const renderForm = () => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputForm
                    name="bankName"
                    register={register}
                    label="نام بانک"
                    placeholder="مثلاً: ملی، ملت، صادرات"
                    error={errors.bankName}
                    iconStart={<Building className="w-4 h-4 text-muted-foreground" />}
                />
                <InputForm
                    name="accountHolder"
                    register={register}
                    label="نام صاحب حساب"
                    placeholder="نام و نام خانوادگی"
                    error={errors.accountHolder}
                    iconStart={<User className="w-4 h-4 text-muted-foreground" />}
                />
                <InputForm
                    name="iban"
                    register={register}
                    label="شماره شبا"
                    placeholder="IR012345678901234567890123"
                    error={errors.iban}
                    iconStart={<Hash className="w-4 h-4 text-muted-foreground" />}
                    className="dir-ltr"
                />
                <InputForm
                    name="cardNumber"
                    register={register}
                    label="شماره کارت"
                    placeholder="6037997500000000"
                    error={errors.cardNumber}
                    iconStart={<CreditCard className="w-4 h-4 text-muted-foreground" />}
                    className="dir-ltr"
                />
            </div>
            <div className="flex items-center gap-6 pt-2 border-t border-border/50">
                <button
                    type="button"
                    onClick={() => setValue('isDefault', !isDefault)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                        isDefault
                            ? 'bg-amber-500/10 text-amber-600 border-2 border-amber-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground border-2 border-transparent'
                    )}
                >
                    <Star className={cn('w-4 h-4', isDefault && 'fill-amber-500')} />
                    <span className="text-sm font-medium">
                        {isDefault ? 'حساب پیش‌فرض' : 'تنظیم به‌عنوان پیش‌فرض'}
                    </span>
                </button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>تأیید شده</span>
                </div>
            </div>

            <DialogFooter>
                <div className='flex justify-between items-center w-full'>
                    <CustomButton
                        type='submit'
                        color='white'
                        isPending={isCreating || isUpdating}
                        iconStart={<Plus />}
                        name={selectedAccount ? 'ویرایش حساب' : 'افزودن حساب'}
                    />
                    <CustomButton
                        type='button'
                        onClick={() => {
                            setOpenDialog(null);
                            setSelectedAccount(null);
                            reset();
                        }}
                        color='gray'
                        name='انصراف'
                    />
                </div>
            </DialogFooter>
        </form>
    );

    // ============ کارت حساب بانکی ============
    const renderAccountCard = (account: any, index: number) => {
        const isVisible = showCardNumber[account.id];
        return (
            <MotionWrapper key={account.id} preset='slideUpBlur' staggerChildren={0.1} className={cn(
                'relative group rounded-xl p-4 border-2 flex-wrap',
                'bg-linear-to-br from-card to-accent/20',
                account.isDefault
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'border-border hover:border-primary/30',
                'hover:shadow-xl hover:-translate-y-1'
            )}>

                {account.isDefault && (
                    <div className="absolute -top-2 -left-2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/30">
                        پیش‌فرض
                    </div>
                )}
                {account.isVerified && (
                    <div className="absolute top-3 left-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                )}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Banknote className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{account.bankName}</h3>
                            <p className="text-sm text-muted-foreground">{account.accountHolder}</p>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <span className="text-xs text-muted-foreground">شماره شبا</span>
                        <div className="flex items-center justify-center p-2 bg-background/50 rounded-xl group">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono dir-ltr text-foreground">
                                    {account.iban}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(account.iban, 'شماره شبا')}
                                    className="p-1 rounded-lg hover:bg-primary/10 transition opacity-100"
                                    title="کپی شماره شبا"
                                >
                                    <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                                </button>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">شماره کارت</span>
                        <div className="flex items-center justify-center p-2 bg-background/50 rounded-xl group">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-mono dir-ltr text-foreground">
                                    {isVisible ? account.cardNumber.match(/.{1,4}/g).join('-') : '••••-••••-••••-••••'}
                                </span>
                                <button
                                    onClick={() => toggleCardVisibility(account.id)}
                                    className="p-1 rounded-lg hover:bg-primary/10 transition"
                                    title={isVisible ? 'مخفی کردن شماره کارت' : 'نمایش شماره کارت'}
                                >
                                    {isVisible ? (
                                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                                    ) : (
                                        <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                                    )}
                                </button>
                                <button
                                    onClick={() => copyToClipboard(account.cardNumber, 'شماره کارت')}
                                    className="p-1 rounded-lg hover:bg-primary/10 transition opacity-100"
                                    title="کپی شماره کارت"
                                >
                                    <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* اکشن‌ها */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/50 flex-wrap">
                        {!account.isDefault && (
                            <button
                                onClick={() => handleSetDefault(account)}
                                disabled={isSettingDefault}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition text-xs font-medium disabled:opacity-50"
                            >
                                {isSettingDefault ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Star className="w-3.5 h-3.5" />
                                )}
                                پیش‌فرض کن
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setSelectedAccount(account);
                                setOpenDialog('delete');
                            }}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition text-xs font-medium disabled:opacity-50"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            حذف
                        </button>
                        <button
                            onClick={() => handleEdit(account)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition text-xs font-medium"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            ویرایش
                        </button>

                    </div>
                </div>
            </MotionWrapper>
        );
    };

    // ============ لودینگ ============
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    // ============ رندر اصلی ============
    return (
        <div className="space-y-6 pb-24">
            {/* هدر */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Banknote className="w-7 h-7 text-primary" />
                        حساب‌های بانکی من
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        حداکثر {MAX_ACCOUNTS} حساب بانکی قابل ثبت است
                        <span className="mr-2 text-xs bg-accent px-2 py-0.5 rounded-full">
                            {accounts.length} / {MAX_ACCOUNTS}
                        </span>
                    </p>
                </div>

                {accounts.length < MAX_ACCOUNTS && (
                    <button
                        onClick={() => {
                            setSelectedAccount(null);
                            reset({
                                bankName: '',
                                accountHolder: '',
                                iban: '',
                                cardNumber: '',
                                isDefault: accounts.length === 0,
                                isVerified: false,
                            });
                            setOpenDialog('create');
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition shadow-lg shadow-primary/30"
                    >
                        <Plus className="w-4 h-4" />
                        حساب جدید
                    </button>
                )}
            </div>

            {/* لیست کارت‌ها */}
            {accounts.length === 0 ? (
                <MotionWrapper preset='slideUpBlur' staggerChildren={0.1}
                    className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl"
                >
                    <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
                        <Banknote className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">هیچ حسابی ثبت نشده</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        اولین حساب بانکی خود را اضافه کنید
                    </p>
                </MotionWrapper>

            ) : (
                <MotionWrapper preset='slideUpBlur' staggerChildren={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {accounts.map((account, index) => renderAccountCard(account, index))}
                </MotionWrapper>
            )
            }
            {
                accounts.length === MAX_ACCOUNTS && (
                    <MotionWrapper preset='slideUpBlur'
                        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center"
                    >
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4 inline ml-1" />
                            شما به حداکثر تعداد مجاز ({MAX_ACCOUNTS} حساب) رسیده‌اید
                        </p>
                    </MotionWrapper>
                )
            }
            <Dialog open={openDialog === 'create' || openDialog === 'edit'}>
                <DialogContent className="max-w-2xl! bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-primary" />
                            {selectedAccount ? 'ویرایش حساب بانکی' : 'افزودن حساب بانکی جدید'}
                        </DialogTitle>
                    </DialogHeader>
                    {renderForm()}
                </DialogContent>
            </Dialog>

            <DialogDelete
                open={openDialog === 'delete'}
                closeModal={() => setOpenDialog(null)}
                onDelete={handleDelete}
                helpText={<p className='mt-5'>
                    آیا از حذف حساب بانکی{' '}
                    <span className="font-bold text-foreground">
                        {selectedAccount?.bankName} - {selectedAccount?.accountHolder}
                    </span>
                    {' '}اطمینان دارید؟
                </p>}
                isPending={isDeleting}
            />
        </div >
    );
}