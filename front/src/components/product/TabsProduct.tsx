import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, SlidersHorizontal, MessageSquare, HelpCircle, Star, CheckCircle2, MessageSquarePlus } from "lucide-react";
import ReviewForm from "./ReviewForm";
import QNAForm from "./QNAForm";
import { ProductDetail } from "@/types/types";
import TiptapRenderer from "./TiptapRender";
import MoreQnaDetails from "./MoreQnaDetails";
import MoreReviewDetail from "./MoreReviewDetail";

export default function TabsProduct(product: ProductDetail) {
    const { productTable, productTableEn, qnas, reviews, _count, id } = product
    return (
        <section className="mt-10 sm:mt-16">
            <Tabs defaultValue="desc" className="w-full dir-rtl">
                {/* TAB LIST (HEADER) */}
                <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-800 bg-transparent p-0 h-auto rounded-none overflow-x-auto scrollbar-none gap-4 sm:gap-8 pb-1">
                    <TabsTrigger
                        classCustom
                        value="desc"
                        className="whitespace-nowrap text-xs sm:text-sm py-2 px-1 cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>توضیحات محصول</span>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_12px_#06b6d4] group-data-[state=active]:block hidden" />
                    </TabsTrigger>

                    <TabsTrigger
                        classCustom
                        value="specs"
                        className="whitespace-nowrap text-xs sm:text-sm py-2 px-1 cursor-pointer"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>مشخصات فنی</span>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_12px_#06b6d4] group-data-[state=active]:block hidden" />
                    </TabsTrigger>

                    <TabsTrigger
                        classCustom
                        value="reviews"
                        className="whitespace-nowrap text-xs sm:text-sm py-2 px-1 cursor-pointer"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>نظرات کاربران ({_count?.reviews || 0})</span>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_12px_#06b6d4] group-data-[state=active]:block hidden" />
                    </TabsTrigger>

                    <TabsTrigger
                        classCustom
                        value="qa"
                        className="whitespace-nowrap text-xs sm:text-sm py-2 px-1 cursor-pointer"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span>پرسش و پاسخ ({_count?.qnas || 0})</span>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_12px_#06b6d4] group-data-[state=active]:block hidden" />
                    </TabsTrigger>
                </TabsList>

                {/* 1. DESCRIPTION */}
                <TabsContent value="desc" className="pt-6 sm:pt-8 focus-visible:outline-none">
                    <div className="space-y-4 sm:space-y-6 max-w-4xl text-slate-700 dark:text-slate-300 leading-relaxed">
                        {product.content ?
                            <TiptapRenderer content={product.content} />
                            :
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                <SlidersHorizontal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">توضیحاتی برای این محصول ارائه نشده.</p>
                            </div>
                        }
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <h5 className="font-bold text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 mb-1.5">استایل و تن‌خور</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-5">
                                    تن‌خور آزاد و کژوال این محصول باعث می‌شود که در استفاده طولانی مدت کاملاً احساس راحتی کنید.
                                </p>
                            </div>
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <h5 className="font-bold text-xs sm:text-sm text-indigo-500 mb-1.5">نگهداری و شستشو</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-5">
                                    شستشو در دمای ۳۰ درجه سانتی‌گراد با مایع لباسشویی ملایم. از سفیدکننده استفاده نشود.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* 2. SPECIFICATIONS */}
                <TabsContent value="specs" className="pt-6 sm:pt-8 focus-visible:outline-none">
                    <div className="max-w-4xl space-y-4">
                        {productTable && productTable.headers && productTable.headers.length > 0 ? (
                            <div className="w-full overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 backdrop-blur-md shadow-sm">
                                <table className="w-full text-xs sm:text-sm text-right border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 text-slate-700 dark:text-cyan-400 font-bold">
                                            {productTable.headers.map((header: string, hIdx: number) => (
                                                <th key={hIdx} className="p-3 sm:p-4 whitespace-nowrap">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {productTable.rows.map((row: string[], rIdx: number) => (
                                            <tr
                                                key={rIdx}
                                                className="hover:bg-slate-50/50 dark:hover:bg-cyan-500/5 transition-colors group"
                                            >
                                                {row.map((cell: string, cIdx: number) => (
                                                    <td
                                                        key={cIdx}
                                                        className={`p-3 sm:p-4 leading-relaxed ${cIdx === 0
                                                            ? "text-slate-500 dark:text-slate-400 font-medium"
                                                            : "text-slate-800 dark:text-slate-100 font-bold"
                                                            }`}
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                <SlidersHorizontal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">مشخصات فنی برای این محصول ثبت نشده است.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* 3. REVIEWS */}
                <TabsContent value="reviews" className="pt-6 sm:pt-8 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-2.5">
                                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-cyan-400">
                                    {product?.rating || 0}
                                </div>
                                <div className="flex justify-center gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-400">بر اساس {product.reviewCount || 0} نظر ثبت‌شده</p>
                            </div>
                            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="p-2 sm:p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                                        <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                            ثبت دیدگاه جدید
                                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 animate-pulse" />
                                        </h4>
                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
                                            تجربه استفاده و نظر خود را درباره این محصول با دیگران به اشتراک بگذارید.
                                        </p>
                                    </div>
                                </div>
                                <ReviewForm productId={id} />
                            </div>
                        </div>
                        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                            {reviews.length ?
                                <>
                                    {reviews.map((rev, index) => (
                                        <div
                                            key={index++}
                                            className="p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-3 sm:space-y-4 shadow-sm"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs sm:text-sm text-cyan-400 shrink-0">
                                                        {rev.user?.firstName?.slice(0, 1) || ""}
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-bold text-xs sm:text-sm">{rev.user?.firstName + " " + rev.user.lastName}</span>
                                                            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                                                                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                                خریدار واقعی
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] sm:text-[11px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString('fa-IR')}</span>
                                                    </div>
                                                </div>

                                                <div className="flex text-amber-400 self-start sm:self-auto">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < rev.rating ? "fill-amber-400" : "text-slate-700"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-100 dark:bg-slate-950/40 p-2 rounded-xl w-max max-w-full">
                                                <span>رنگ: <strong className="text-slate-700 dark:text-slate-300">سفید</strong></span>
                                                <span>•</span>
                                                <span>سایز: <strong className="text-slate-700 dark:text-slate-300">M</strong></span>
                                            </div>

                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rev.body}</p>

                                            {rev.answerReview && (
                                                <div className="p-3 sm:p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs space-y-1">
                                                    <div className="font-bold text-cyan-500 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        پاسخ فروشگاه:
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.answerReview}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <MoreReviewDetail initialData={reviews} productId={product.id} />
                                </>
                                :
                                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                    <MessageSquarePlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">اولین نفری باشید که نظر خود را درباره این محصول ثبت می‌کنید.</p>
                                </div>
                            }
                        </div>
                    </div>
                </TabsContent>

                {/* 4. QUESTIONS & ANSWERS */}
                <TabsContent value="qa" className="pt-6 sm:pt-8 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        {/* Ask Question Box */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="p-2 sm:p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                            ثبت پرسش جدید
                                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 animate-pulse" />
                                        </h4>
                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
                                            پاسخ سوالات خود را پیدا نکرده‌اید؟ سوال خود را بپرسید تا شما را راهنمایی کنیم.
                                        </p>
                                    </div>
                                </div>
                                <QNAForm productId={product?.id} parentId="" />
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                            {qnas.length ?
                                <>
                                    {qnas.map((q) => (
                                        <div
                                            key={q.id}
                                            className="p-3 rounded-xl sm:rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-2"
                                        >
                                            <div className="flex justify-between items-start gap-3 mb-3">
                                                <div className="flex items-start gap-2 min-w-0">
                                                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 shrink-0 mt-0.5" />
                                                    <span className="font-bold text-xs sm:text-sm leading-relaxed">{q.content}</span>
                                                </div>
                                                <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">{new Date(q.createdAt).toLocaleDateString('fa-IR')}</span>
                                            </div>
                                            {q.replies?.length ?
                                                q.replies.map((reply, key) => (
                                                    <div key={reply.id} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                                                        <div className="flex items-start justify-between gap-2 min-w-0">
                                                            <div className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                                                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                {reply.role === 'seller' ? 'فروشنده' : 'خریدار'} :
                                                            </div>
                                                            <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">{new Date(reply.createdAt).toLocaleDateString('fa-IR')}</span>
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">{reply.content}</p>
                                                    </div>
                                                ))
                                                : null}
                                            <div>
                                                <QNAForm productId={product?.id} parentId={q.id} minimal={true} answer={true} />
                                            </div>
                                        </div>
                                    ))}
                                    <MoreQnaDetails productId={product?.id} initialQnaData={qnas} />
                                </>
                                :
                                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">اگر سوالی درباره این محصول دارید، بپرسید تا سایر کاربران و فروشنده پاسخ دهند.</p>
                                </div>
                            }
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}