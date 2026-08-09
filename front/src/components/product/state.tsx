"use client";
import React, { useState } from "react";
import {
    Star, Flame,
    ShoppingCart,
    Heart,
    Share2,
    ShieldCheck,
    Truck,
    RefreshCw,
    Zap,
    ChevronLeft,
    Check,
    Headphones,
    CreditCard,
    Award,
    MessageSquare,
    HelpCircle,
    ThumbsUp,
    ThumbsDown,
    Search,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    Clock,
    Send,
    SlidersHorizontal,
    ChevronDown,
} from "lucide-react";
import ImgTag from "@/components/ImgTag";
import Featured from "./Featured";
import Breadcrumb from "./Breadcrumb";
import { ShareBtn } from "./ShareBtn";
import TabsProduct from "./TabsProduct";

// --- DUMMY DATA ---
const PRODUCT_DATA = {
    id: "232157",
    title: "تونیک زنانه سرژه مدل 232157",
    englishTitle: "Serje Women's Tunic Model 232157",
    price: 890000,
    discountPrice: 650000,
    discountPercentage: 27,
    inStock: true,
    stockCount: 4,
    sku: "SERJE-232157",
    rating: 4.7,
    reviewsCount: 24,
    questionsCount: 12,
    brand: "سرژه (Serje)",
    category: "تونیک و شومیز زنانه",
    images: [
        "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop",
    ],
    colors: [
        { name: "مشکی فضایی", code: "#0B0F19", available: true },
        { name: "آبی نئون", code: "#2563EB", available: true },
        { name: "شرابی عمیق", code: "#881337", available: false },
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
        "تونیک زنانه سرژه مدل 232157 با پارچه کرپ حریر درجه یک و دوخت صنعتی دقیق طراحی شده است. تن‌خور این مدل آزاد، فوق‌العاده سبک و راحت بوده و برای استایل‌های مدرن کژوال و نیمه‌رسمی انتخابی هوشمندانه محسوب می‌شود. الگوی برش مدرن و جلوه رنگ‌های درخشان آن در هر موقعیتی شما را متمایز می‌سازد.",
    specifications: [
        { key: "جنس پارچه", value: "کرپ حریر درجه یک با تنفس‌پذیری بالا" },
        { key: "قد لباس", value: "۸۵ سانتی‌متر" },
        { key: "نوع یقه", value: "گرد ایستاده مدرن" },
        { key: "نحوه بسته‌شدن", value: "دکمه مخفی پشت یقه" },
        { key: "مناسب برای فصل", value: "بهار، تابستان، پاییز" },
        { key: "کشور تولیدکننده", value: "ایران (تولید سرژه)" },
    ],
};

const REVIEWS_DATA = [
    {
        id: 1,
        author: "سارا حسینی",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
        rating: 5,
        date: "۱۲ مرداد ۱۴۰۵",
        verifiedBuyer: true,
        boughtColor: "مشکی فضایی",
        boughtSize: "M",
        comment:
            "تن‌خور لباس فوق‌العاده شیکه! جنس پارچه اصلاً چروک نمیشه و دوختش خیلی تمیزه. به شدت پیشنهاد می‌کنم دقیقاً مطابق راهنمای سایز سفارش بدید.",
        likes: 14,
        dislikes: 1,
        sellerReply: "سلام سارا عزیز، بسیار خرسندیم که از کیفیت و تن‌خور تونیک سرژه رضایت داشتید. همراهی شما افتخار ماست!",
    },
    {
        id: 2,
        author: "مریم کاظمی",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
        rating: 4,
        date: "۵ مرداد ۱۴۰۵",
        verifiedBuyer: true,
        boughtColor: "آبی نئون",
        boughtSize: "L",
        comment:
            "رنگ آبی نئونش توی واقعی خیلی جذاب‌تر از عکسه. تنها نقطه‌ضعفش این بود که ارسالش ۲ روز طول کشید ولی خود محصول بی‌نقص بود.",
        likes: 8,
        dislikes: 0,
        sellerReply: null,
    },
    {
        id: 3,
        author: "آزیتا رضایی",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
        rating: 5,
        date: "۲۸ تیر ۱۴۰۵",
        verifiedBuyer: true,
        boughtColor: "مشکی فضایی",
        boughtSize: "S",
        comment: "کیفیت پارچه عالیه و بعد از چند بار شستشو اصلاً تغییر رنگ نداده. بسته‌بندی سرژه هم بسیار شکیل بود.",
        likes: 19,
        dislikes: 2,
        sellerReply: null,
    },
];

const QUESTIONS_DATA = [
    {
        id: 1,
        author: "زهرا نوری",
        date: "۱۰ مرداد ۱۴۰۵",
        question: "سلام، آیا پارچه این تونیک آبرفت داره؟",
        answer: "سلام وقت بخیر. خیر، پارچه کرپ حریر این مدل پیش‌شست شده و به هیچ عنوان آبرفت یا تغییر سایز ندارد.",
        answerAuthor: "پشتیبانی سرژه",
        likes: 9,
    },
    {
        id: 2,
        author: "الناز شاکری",
        date: "۱ مرداد ۱۴۰۵",
        question: "برای قد ۱۷۰ و وزن ۶۵ سایز M مناسبه یا L؟",
        answer: "درود بر شما. با توجه به ابعاد ذکر شده، سایز M تن‌خور استاندارد و سایز L استایل آزادتر (Oversized) به شما می‌دهد.",
        answerAuthor: "پشتیبانی سرژه",
        likes: 15,
    },
];

const TRUST_BADGES = [
    {
        icon: Truck,
        title: "تحویل اکسپرس",
        desc: "ارسال برق‌آسا زیر ۲۴ ساعت",
        color: "from-cyan-500 to-blue-600",
        shadow: "shadow-cyan-500/20",
    },
    {
        icon: Headphones,
        title: "پشتیبانی ۲۴/۷",
        desc: "هفت روز هفته، تمام ساعات",
        color: "from-indigo-500 to-purple-600",
        shadow: "shadow-indigo-500/20",
    },
    {
        icon: CreditCard,
        title: "پرداخت در محل",
        desc: "پرداخت امن پس از تحویل",
        color: "from-purple-500 to-pink-600",
        shadow: "shadow-purple-500/20",
    },
    {
        icon: RefreshCw,
        title: "۷ روز ضمانت بازگشت",
        desc: "تعویض یا مرجوعی بی‌قید و شرط",
        color: "from-pink-500 to-rose-600",
        shadow: "shadow-pink-500/20",
    },
    {
        icon: Award,
        title: "ضمانت اصالت کالا",
        desc: "۱۰۰٪ اورجینال مستقیم از برند",
        color: "from-amber-400 to-orange-500",
        shadow: "shadow-amber-500/20",
    },
];

export default function ProductDetailPage() {
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState("M");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews" | "qa">("desc");
    const [isLiked, setIsLiked] = useState(false);

    const [reviewsList, setReviewsList] = useState(REVIEWS_DATA);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(5);

    const [questionsList, setQuestionsList] = useState(QUESTIONS_DATA);
    const [newQuestion, setNewQuestion] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredQuestions = questionsList.filter(
        (q) => q.question.includes(searchQuery) || (q.answer && q.answer.includes(searchQuery))
    );

    return (
        <div className="min-h-screen font-sans dir-rtl bg-slate-50 text-slate-900 dark:bg-[#03050c] dark:text-slate-100 transition-colors duration-300 relative selection:bg-cyan-500 selection:text-black">
            {/* --- CYBER DEEP SPACE BACKGROUND GLOWS (Dark Mode Only) --- */}
            <div className="hidden dark:block fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 sm:w-[500px] sm:h-[500px] bg-indigo-600/15 rounded-full blur-[120px] sm:blur-[160px]" />
                <div className="absolute top-[35%] left-[-15%] w-80 h-80 sm:w-[450px] sm:h-[450px] bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[15%] w-96 h-96 sm:w-[550px] sm:h-[550px] bg-purple-600/10 rounded-full blur-[140px] sm:blur-[180px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-28 lg:pb-12 pt-4 sm:pt-6">
                {/* --- BREADCRUMB --- */}
                <Breadcrumb />

                {/* --- MAIN PRODUCT GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mt-3 sm:mt-6">

                    {/* GALLERY (5 Columns) */}
                    <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                        <div className="relative aspect-4/5 max-h-[360px] sm:max-h-[480px] w-full mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-cyan-500/25 bg-white dark:bg-slate-900/40 shadow-lg dark:shadow-[0_0_40px_rgba(6,182,212,0.12)] backdrop-blur-md group flex items-center justify-center">
                            <ImgTag
                                src={PRODUCT_DATA.images[selectedImage]}
                                alt={PRODUCT_DATA.title}
                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Discount Badge */}
                            {PRODUCT_DATA.discountPercentage > 0 && (
                                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg shadow-pink-500/30 flex items-center gap-1 sm:gap-1.5 animate-pulse">
                                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{PRODUCT_DATA.discountPercentage}٪ تخفیف ویژه</span>
                                </div>
                            )}

                            {/* Stock Warning */}
                            {PRODUCT_DATA.stockCount <= 5 && (
                                <div className="absolute bottom-3 right-3 left-3 sm:bottom-4 sm:right-4 sm:left-4 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 animate-bounce" />
                                    <span>تنها {PRODUCT_DATA.stockCount} عدد در انبار باقی مانده است!</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails list */}
                        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center lg:justify-start">
                            {PRODUCT_DATA.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-14 h-16 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 shrink-0 transition-all duration-300 ${selectedImage === idx
                                        ? "border-cyan-500 scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <ImgTag src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PRODUCT DETAILS (7 Columns) */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6">
                        <div className="space-y-3.5 sm:space-y-4">

                            {/* Header Title & Actions */}
                            <div className="flex justify-between items-start gap-3">
                                <div>
                                    <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                        {PRODUCT_DATA.title}
                                    </h1>
                                    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 tracking-wider uppercase">
                                        {PRODUCT_DATA.englishTitle}
                                    </p>
                                </div>

                                <div className="flex gap-1.5 sm:gap-2 shrink-0">
                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 ${isLiked
                                            ? "border-pink-500 bg-pink-500/10 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                            : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-pink-500 hover:border-pink-500/50"
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-pink-500" : ""}`} />
                                    </button>
                                    <ShareBtn />
                                </div>
                            </div>

                            {/* Meta stats bar */}
                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800/80 py-2.5 sm:py-3">
                                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-amber-500 font-bold text-[11px] sm:text-xs">
                                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                                    <span>{PRODUCT_DATA.rating}</span>
                                    <span className="text-slate-400 font-normal">({PRODUCT_DATA.reviewsCount})</span>
                                </div>
                                <span>•</span>
                                <div className="text-[11px] sm:text-xs">برند: <strong className="text-slate-800 dark:text-cyan-400">{PRODUCT_DATA.brand}</strong></div>
                                <span>•</span>
                                <div className="text-[11px] sm:text-xs">کد کالا: <span className="text-slate-400">{PRODUCT_DATA.sku}</span></div>
                            </div>

                            <Featured />

                            {/* Colors Picker */}
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-xs sm:text-sm flex items-center gap-1.5 font-bold">
                                    رنگ انتخابی:
                                    <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                                        {PRODUCT_DATA.colors[selectedColor].name}
                                    </span>
                                </label>
                                <div className="flex gap-2.5 sm:gap-3">
                                    {PRODUCT_DATA.colors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!color.available}
                                            onClick={() => setSelectedColor(idx)}
                                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all relative ${selectedColor === idx
                                                ? "ring-2 ring-offset-1 ring-offset-slate-50 dark:ring-offset-[#03050c] ring-cyan-700 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                                : ""
                                                } ${!color.available ? "opacity-30 cursor-not-allowed" : "hover:scale-105"}`}
                                            style={{ backgroundColor: color.code }}
                                            title={color.name}
                                        >
                                            {selectedColor === idx && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sizes Picker */}
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="font-bold">انتخاب سایز:</span>
                                    <button className="text-[11px] sm:text-xs text-cyan-500 hover:underline flex items-center gap-1">
                                        <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        راهنمای سایز
                                    </button>
                                </div>
                                <div className="flex gap-2 sm:gap-3">
                                    {PRODUCT_DATA.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-12 h-10 sm:w-14 sm:h-12 rounded-lg sm:rounded-xl border-2 font-black text-xs sm:text-sm transition-all duration-300 ${selectedSize === size
                                                ? "border-cyan-700 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.25)] scale-105"
                                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* BUYING CARD (Futuristic Cyber Box - Optimized for Mobile) */}
                        <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-lg dark:shadow-[0_0_30px_rgba(0,0,0,0.6)] space-y-4 sm:space-y-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] sm:text-xs text-slate-400 block mb-1">قیمت نهایی مصرف‌کننده</span>
                                    <div className="flex items-baseline gap-1.5">
                                        {/* تغییر اصلی: استفاده از گرادیانت مشابه دیو دوم + حذف tracking-tight + اضافه کردن tabular-nums */}
                                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent tabular-nums">
                                            {PRODUCT_DATA.discountPrice.toLocaleString("fa-IR")}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500 dark:text-cyan-400/80">تومان</span>

                                        {PRODUCT_DATA.discountPrice < PRODUCT_DATA.price && (
                                            <span className="text-xs sm:text-sm text-slate-400 line-through decoration-rose-500/60 mr-1.5 tabular-nums">
                                                {PRODUCT_DATA.price.toLocaleString("fa-IR")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity Controls با فونت اعداد اصلاح‌شده */}
                                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950/60 shrink-0">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition-colors text-slate-600 dark:text-slate-300"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 py-2 sm:px-4 sm:py-2.5 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 tabular-nums">
                                        {quantity.toLocaleString("fa-IR")}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition-colors text-slate-600 dark:text-slate-300"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Main Buy Button */}
                            <button className="w-full cursor-pointer py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-[0.99] transition-all duration-300">
                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                                افزودن به سبد خرید
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- TRUST BADGES (ویژگی‌های سرژه) --- */}
                <section className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        {TRUST_BADGES.map((badge, idx) => {
                            const IconComp = badge.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center space-y-1.5 sm:space-y-2"
                                >
                                    <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-lg ${badge.shadow} group-hover:scale-110 transition-transform`}>
                                        <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{badge.title}</h4>
                                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">{badge.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* --- TABS SECTION --- */}
                <TabsProduct product={PRODUCT_DATA} questions={filteredQuestions} reviews={reviewsList} />
            </div>

            {/* --- MOBILE STICKY BUY BAR (خلوت‌تر و جمع‌وجورتر شده) --- */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-[#03050c]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 z-50 flex items-center justify-between gap-3 shadow-2xl">
                <div>
                    <span className="text-[10px] text-slate-400 block">قیمت محصول</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg text-slate-900 dark:text-cyan-400">
                            {PRODUCT_DATA.discountPrice.toLocaleString("fa-IR")}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-500">تومان</span>
                    </div>
                </div>

                <button className="py-2.5 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all">
                    <ShoppingCart className="w-4 h-4" />
                    افزودن به سبد
                </button>
            </div>

        </div>
    );
}

