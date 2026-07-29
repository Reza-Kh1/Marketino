'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Share2, Minus, Plus, Check, Truck, Shield, ChevronLeft, MessageSquare, Package, MessagesSquare, X, Send, LogIn } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { productsApi, ProductType, reviewsApi, wishlistApi, type Product, type Review } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/chat-context';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

import { useCart } from '@/lib/use-cart';
import ImgTag from '@/components/ImgTag';

const getImageUrl = (img: { url: string } | string): string => typeof img === 'string' ? img : img?.url || '';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [chatOpen, setChatOpen] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { openChat, activeConversation, closeChat, sendMessage, productId } = useChat();
  const { isAuthenticated } = useAuth();
  const { addToCart: addToCartHook } = useCart();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<ProductType[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getById(id);
        console.log(data);

        setProduct(data);
        setRelated((data as any).related || []);
        // Fetch reviews
        try {
          const reviewData = await reviewsApi.getByProduct(id);
          setReviews(reviewData.reviews || []);
        } catch { setReviews([]); }
        // Check wishlist status
        try {
          const wlCheck = await wishlistApi.check(id);
          setInWishlist((wlCheck as any).isWishlisted || (wlCheck as any).inWishlist || false);
        } catch { setInWishlist(false); }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
  }, []);

  const addToCart = () => {
    if (!product) return;
    const imageUrl = getImageUrl(product.images?.[0] as any) || product.images[0].url || '';
    addToCartHook(product.id, qty, {
      id: product.id,
      title: product.title,
      price: product.variants[0].price,
      discountPrice: product.variants[0].discount?.value,
      image: imageUrl,
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isNew: product.isFeatured,
      tags: ['test', 'tag'],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><Skeleton /></div>;
  if (!product) return <div className="text-center py-32"><h1 className="text-2xl font-bold">محصول یافت نشد</h1><Link href="/products" className="btn-primary mt-4 inline-flex">بازگشت به محصولات</Link></div>;

  const price = product.variants[0].discount?.value ?? product.variants[0].price;
  const disc = 45

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
        <ChevronLeft className="w-3 h-3" />
        <Link href="/products" className="hover:text-primary transition-colors">محصولات</Link>
        <ChevronLeft className="w-3 h-3" />
        <span className="font-semibold text-foreground truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-3">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border cursor-zoom-in"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <ImgTag
              src={getImageUrl(product.images[activeImg] as any) || product.images[0]?.url}
              alt={product.title}
              className={cn('w-full h-full object-cover transition-transform duration-200', zoomed && 'scale-150')}
            // style={zoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={cn('w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-300',
                    i === activeImg ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border')}>
                  <img src={getImageUrl(img as any)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col gap-5">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {product.isFeatured && <Badge variant="default">جدید</Badge>}
            {['test', 'tag'].map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
            {(product.variants.length ?? 0) > 0 ? <Badge variant="outline" className="text-emerald-600 border-emerald-300">✓ موجود</Badge> : <Badge variant="destructive">ناموجود</Badge>}
          </div>
          
          <h1 className="text-2xl lg:text-3xl font-black leading-tight">{product.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-amber-500">{Array(5).fill(0).map((_, i) => <Star key={i} className={cn('w-5 h-5', i < Math.round(product.rating) ? 'fill-current' : 'text-muted/30')} />)}</div>
            <span className="font-bold">{product.rating}</span>
            <span className="text-muted-foreground text-sm">({product.reviewCount} نظر)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">{price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">تومان</span>
            {product.variants[0].discountId && (
              <>
                <span className="text-lg text-muted-foreground line-through">{product.variants[0].price.toLocaleString()}</span>
                <Badge variant="destructive">{disc}٪ تخفیف</Badge>
              </>
            )}
          </div>

          {/* Colors */}
          {/* {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">رنگ: <span className="text-primary">{selectedColor || 'انتخاب کنید'}</span></h3>
              <div className="flex gap-2">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={cn('px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all', selectedColor === c ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )} */}

          {/* Specs */}
          {/* <div className="bg-muted/50 rounded-2xl p-4 border border-border">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> مشخصات فنی</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(product.productTable || {}).slice(0, 4).map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-muted-foreground">{k}:</span> <span className="font-semibold">{v}</span></div>
              ))}
            </div>
          </div> */}

          {/* Chat with Seller Button — always visible */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast('برای پیام دادن به فروشنده باید وارد سایت شوید', { icon: '🔐' });
                router.push(`/login?returnUrl=${encodeURIComponent(`/products/${product.id}`)}`);
                return;
              }
              openChat({
                id: product.id,
                title: product.title,
                image: getImageUrl(product.images?.[0] as any) || product.variants[0].image || '',
                sellerId: (product as any).sellerId || '',
                sellerName: ((product as any).seller?.storeName || (product as any).seller?.username || 'فروشنده'),
              });
              setChatOpen(true);
            }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold text-sm transition-all"
          >
            {isAuthenticated ? (
              <>
                <MessagesSquare className="w-5 h-5" />
                گفتگو با فروشنده درباره این محصول
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                برای پیام دادن به فروشنده وارد شوید
              </>
            )}
          </button>

          {/* Add to Cart */}
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
            <div className="flex items-center border-2 border-border rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-muted transition-colors rounded-r-xl"><Minus className="w-4 h-4" /></button>
              <span className="px-4 font-bold text-lg min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-muted transition-colors rounded-l-xl"><Plus className="w-4 h-4" /></button>
            </div>
            <Button size="lg" onClick={addToCart} disabled={product.variants[0].quantity === 0} className={cn('flex-1', added && '!bg-emerald-500')}>
              {added ? <><Check className="w-5 h-5" /> افزوده شد</> : 'افزودن به سبد خرید'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl p-3"
              disabled={wishlistLoading}
              onClick={async () => {
                if (!isAuthenticated) {
                  toast('برای افزودن به علاقه‌مندی‌ها باید وارد شوید', { icon: '🔐' });
                  router.push(`/login?returnUrl=${encodeURIComponent(`/products/${product.id}`)}`);
                  return;
                }
                setWishlistLoading(true);
                try {
                  if (inWishlist) {
                    await wishlistApi.remove(product.id);
                    setInWishlist(false);
                    toast.success('از علاقه‌مندی‌ها حذف شد');
                  } else {
                    await wishlistApi.add(product.id);
                    setInWishlist(true);
                    toast.success('به علاقه‌مندی‌ها اضافه شد');
                  }
                } catch (err: any) {
                  toast.error(err?.message || 'خطا در بروزرسانی علاقه‌مندی‌ها');
                } finally {
                  setWishlistLoading(false);
                }
              }}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl p-3" onClick={() => { navigator.clipboard?.writeText(location.href); toast.success('لینک کپی شد'); }}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-primary" /> ارسال سریع</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-primary" /> ضمانت اصالت</span>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-primary" /> نظرات کاربران ({reviews.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">{(r.user?.username || r.userId)?.charAt(0) || '?'}</div>
                    <span className="font-bold text-sm">{r.user?.username || r.userId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.createdAt}</span>
                </div>
                <div className="text-amber-500 text-sm mb-2">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <h4 className="font-bold text-sm mb-1">{r.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-black mb-6">محصولات مرتبط</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Chat Overlay */}
      <AnimatePresence>
        {chatOpen && activeConversation && productId === product.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-violet-500/10 to-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-lg">
                    🏪
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{activeConversation.sellerName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {activeConversation.isOnline ? '🟢 آنلاین' : '⚫ آفلاین'} · {activeConversation.productTitle}
                    </p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[45vh]">
                {activeConversation.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.senderId === 'current_user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                      }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.senderId === 'current_user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).message as HTMLInputElement;
                  if (input.value.trim()) {
                    sendMessage(input.value.trim());
                    input.value = '';
                  }
                }}
                className="p-4 border-t border-border flex gap-2"
              >
                <input
                  name="message"
                  type="text"
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 h-10 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  autoComplete="off"
                />
                <button type="submit"
                  className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white flex items-center justify-center hover:shadow-lg transition-all shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
