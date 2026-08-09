'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send, AlertTriangle } from 'lucide-react';
import { sellerReviewsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetch = async () => {
    setLoading(true); setError(false);
    try { const r = await sellerReviewsApi.list(); setReviews(r.reviews); } catch { setError(true); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try { await sellerReviewsApi.reply(id, replyText); toast.success('پاسخ ارسال شد'); setReplyId(null); setReplyText(''); fetch(); } catch { toast.error('خطا'); } finally { setSending(false); }
  };

  const avg = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-accent rounded-2xl animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div>
      <div className="mb-8"><h2 className="text-2xl font-black mb-1">مدیریت نظرات</h2><p className="text-muted-foreground text-sm">{reviews.length} نظر • میانگین امتیاز {avg}</p></div>

      {reviews.length === 0 ? <div className="text-center py-16"><MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">نظری وجود ندارد</p></div> : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">{Array(5).fill(0).map((_, j) => <Star key={j} className={cn('w-4 h-4', j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />)}</div>
                  {r.title && <h4 className="font-bold">{r.title}</h4>}
                  <p className="text-sm text-muted-foreground">{r.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{r.user?.firstName} {r.user?.lastName}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
                <button onClick={() => setReplyId(replyId === r.id ? null : r.id)} className="flex items-center gap-1 text-sm font-bold text-primary hover:underline shrink-0 mr-4"><MessageSquare className="w-4 h-4" /> پاسخ</button>
              </div>

              {replyId === r.id && (
                <div className="mt-4 flex items-center gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="پاسخ خود را بنویسید..." className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm" />
                  <button onClick={() => handleReply(r.id)} disabled={sending} className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center gap-1"><Send className="w-4 h-4" /> ارسال</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
