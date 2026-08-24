import { Star, Truck, Headphones, CreditCard, RefreshCw, Award, Eye, ShieldCheck } from "lucide-react";
import { getProductBasePrice, getVariantDiscountPercent, isVariantDiscountActive } from "@/lib/utils-product";
import Breadcrumb from "@/components/product/Breadcrumb";
import Featured from "@/components/product/Featured";
import { ShareBtn } from "@/components/product/ShareBtn";
import TabsProduct from "@/components/product/TabsProduct";
import ProductGallery from "@/components/product/ProductGallery";
import ProductBuyBox from "@/components/product/ProductBuyBox";
import LikeButton from "@/components/product/LikeButton";
import { PagePropsType, ProductDetail } from "@/types/types";
import Countdown from "@/components/product/Countdown";
import { fetchApi } from "@/lib/fetchApi";
import NotFound from "../../not-found";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";

const TRUST_BADGES = [
  { icon: Truck, title: "تحویل اکسپرس", desc: "ارسال برق‌آسا زیر ۲۴ ساعت", color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/20" },
  { icon: Headphones, title: "پشتیبانی ۲۴/۷", desc: "هفت روز هفته، تمام ساعات", color: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-500/20" },
  { icon: CreditCard, title: "پرداخت در محل", desc: "پرداخت امن پس از تحویل", color: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/20" },
  { icon: RefreshCw, title: "۷ روز ضمانت بازگشت", desc: "تعویض یا مرجوعی بی‌قید و شرط", color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/20" },
  { icon: Award, title: "ضمانت اصالت کالا", desc: "۱۰۰٪ اورجینال مستقیم از برند", color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
];

export async function getData(slug: string) {
  const res = await fetchApi({ url: `products/${slug}`, cache: 'no-cache', tags: ['products', slug] })
  if (res.status === 404) {
    notFound()
  }
  if (!res.success) {
    throw new Error(`Failed to load post: ${res.status}`)
  }
  return res
}

export async function generateMetadata({ params }: PagePropsType) {
  const { slug } = await params;
  const { data: product }: { data: ProductDetail } = await getData(slug)
  return {
    title: `خرید ${product.title} | قیمت و مشخصات | دیجی‌کالا`,
    description: product.description,
    keywords: `${product.title}, کت زنانه, پوشاک زنانه, مدل ${product.brand}`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [product.images],
    },
  };
}

export default async function ProductDetailPage({ params }: PagePropsType) {
  const { slug } = await params;
  const { data: product }: { data: ProductDetail } = await getData(slug)
  if (!product) return NotFound()
  const firstVariant = product.variants[0];
  const heroDiscountPercent = firstVariant ? getVariantDiscountPercent(firstVariant) : 0;
  const heroDiscountActive = firstVariant ? isVariantDiscountActive(firstVariant) : false;
  const { min: fallbackMinPrice, original: fallbackOriginalPrice } = getProductBasePrice(product);
  const totalStock = product.variants.reduce((sum, v) => sum + v.quantity, 0);
  const lowStock = totalStock > 0 && totalStock <= 5;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: product.minPrice,
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen dir-rtl bg-slate-50 text-slate-900 dark:bg-[#03050c] dark:text-slate-100 transition-colors duration-300 relative selection:bg-cyan-500 selection:text-black">
        <div className="hidden dark:block fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 sm:w-125 sm:h-125 bg-indigo-600/15 rounded-full blur-[120px] sm:blur-[160px]" />
          <div className="absolute top-[35%] left-[-15%] w-80 h-80 sm:w-112.5 sm:h-112.5 bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[15%] w-96 h-96 sm:w-137.5 sm:h-137.5 bg-purple-600/10 rounded-full blur-[140px] sm:blur-[180px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-28 lg:pb-12 pt-4 sm:pt-6">
          <Breadcrumb items={product.breadcrumbs} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mt-3 sm:mt-6">
            {/* GALLERY (5 Columns) */}
            <div className="lg:col-span-5">
              <ProductGallery
                images={product.images}
                title={product.title}
                discountPercent={heroDiscountActive ? heroDiscountPercent : 0}
                lowStock={lowStock}
                stockCount={totalStock}
              />
            </div>

            {/* PRODUCT DETAILS (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6">
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                      {product.title}
                    </h1>
                    {product.titleEn && (
                      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 tracking-wider uppercase font-mono">
                        {product.titleEn}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <LikeButton productId={product.id} />
                    <ShareBtn text={product.description || ''} title={product.title} />
                  </div>
                </div>

                {/* Meta stats bar */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800/80 py-2.5 sm:py-3">
                  {product.reviewCount > 0 && (
                    <>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-amber-500 font-bold text-[11px] sm:text-xs">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                        <span>{Number(product.rating).toLocaleString("fa-IR")}</span>
                        <span className="text-slate-400 font-normal">
                          ({product.reviewCount.toLocaleString("fa-IR")})
                        </span>
                      </div>
                      <span>•</span>
                    </>
                  )}
                  <div className="text-[11px] sm:text-xs">
                    برند: <strong className="text-slate-800 dark:text-cyan-400"><Link href={'/search/brand-' + product.brand?.slug}>{product.brand?.name}</Link></strong>
                  </div>
                  <span>•</span>
                  <div className="text-[11px] sm:text-xs">
                    فروشنده: <Link href={'/search/store-' + product?.store?.name} className="text-slate-800 dark:text-cyan-400">{product?.store?.name}</Link>
                  </div>
                  <span>•</span>
                  <div className="text-[11px] sm:text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {product.condition === "new" ? "آکبند" : "استوک"}
                  </div>
                  {product.saleCount > 0 && (
                    <>
                      <span>•</span>
                      <div className="text-[11px] sm:text-xs">
                        {product.saleCount.toLocaleString("fa-IR")} فروش موفق
                      </div>
                    </>
                  )}
                  {product.viewCount > 0 && (
                    <>
                      <span>•</span>
                      <div className="text-[11px] sm:text-xs flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {product.viewCount.toLocaleString("fa-IR")} بازدید
                      </div>
                    </>
                  )}
                </div>
                {product.isFeatured && <Featured seller={product?.store?.name} discount={product.discountPercent} variants={product.variants}/>}
                {product.description && (
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="mt-4 sm:mt-6">
                <ProductBuyBox
                  productId={product.id}
                  variants={product.variants}
                  fallbackOriginalPrice={fallbackOriginalPrice}
                  fallbackMinPrice={fallbackMinPrice}
                  countdownSlot={<Countdown key={1} targetDate={firstVariant?.discount?.endsAt} />}
                />
              </div>
            </div>
          </div>

          {/* TRUST BADGES */}
          <section className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800/80">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {TRUST_BADGES.map((badge, idx) => {
                const IconComp = badge.icon;
                return (
                  <div
                    key={idx}
                    className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center space-y-1.5 sm:space-y-2"
                  >
                    <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-linear-to-br ${badge.color} text-white shadow-lg ${badge.shadow} group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{badge.title}</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">{badge.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
          <TabsProduct {...product} />
        </div>
      </div>
    </>
  );
}