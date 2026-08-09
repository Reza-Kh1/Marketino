'use client';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-48 h-48 mx-auto mb-8"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-8 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-6xl font-black text-white">۴۰۴</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black mb-3"
        >
          صفحه مورد نظر یافت نشد
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8 leading-relaxed"
        >
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا به آدرس دیگری منتقل شده است.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" /> بازگشت به صفحه اصلی
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" /> مرور محصولات
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
