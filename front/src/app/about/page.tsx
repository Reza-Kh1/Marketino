'use client';
import { motion } from 'framer-motion';
import { Users, Target, Shield, Zap, Heart } from 'lucide-react';

const VALUES = [
  { icon: Target, title: 'ماموریت ما', desc: 'ایجاد بستری امن، سریع و شفاف برای خرید و فروش آنلاین در سراسر ایران. ما به دنبال حذف واسطه‌های غیرضروری و ارتباط مستقیم خریدار و فروشنده هستیم.' },
  { icon: Shield, title: 'اعتماد و امنیت', desc: 'امنیت معاملات و اطلاعات کاربران اولویت اصلی ماست. تمام فروشندگان احراز هویت می‌شوند و پرداخت‌ها تحت پروتکل‌های امن انجام می‌شود.' },
  { icon: Zap, title: 'سرعت و کیفیت', desc: 'با زیرساخت قوی و تیم فنی متخصص، تجربه خریدی سریع و بدون مشکل را برای شما فراهم می‌کنیم.' },
  { icon: Heart, title: 'رضایت مشتری', desc: 'رضایت شما هدف نهایی ماست. تیم پشتیبانی ۲۴ ساعته آماده پاسخگویی به سوالات و مشکلات شماست.' },
];

const TEAM = [
  { name: 'علی رحیمی', role: 'مدیرعامل و بنیان‌گذار', avatar: 'AR' },
  { name: 'سارا محمدی', role: 'مدیر فنی', avatar: 'SM' },
  { name: 'رضا حسینی', role: 'مدیر محصول', avatar: 'RH' },
  { name: 'مریم احمدی', role: 'مدیر بازاریابی', avatar: 'MA' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-cyan-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-l from-violet-500 to-blue-500 bg-clip-text text-transparent">
              درباره بازارچه
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              بازارچه پلتفرمی مدرن برای خرید و فروش آنلاین در ایران است. ما با هدف ایجاد بازاری شفاف، امن و پویا،
              خریداران و فروشندگان را مستقیماً به یکدیگر متصل می‌کنیم و تجربه خریدی لذت‌بخش را رقم می‌زنیم.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-card/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-black text-center mb-12">ارزش‌های ما</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-black text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'فروشنده فعال', value: '+۵۰۰', icon: '🏪' },
              { label: 'محصول', value: '+۱۰,۰۰۰', icon: '📦' },
              { label: 'مشتری راضی', value: '+۵۰,۰۰۰', icon: '😊' },
              { label: 'سال تجربه', value: '۳+', icon: '📅' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-card border border-border rounded-2xl">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-card/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-black text-center mb-12">تیم ما</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg text-white text-xl font-black">
                  {member.avatar}
                </div>
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black mb-6">چشم‌انداز ما</h2>
          <p className="text-muted-foreground leading-relaxed">
            ما می‌خواهیم بازارچه به بزرگترین و معتبرترین پلتفرم تجارت الکترونیک ایران تبدیل شود؛
            جایی که هر کسب‌وکار کوچک و بزرگی بتواند محصولات خود را به میلیون‌ها مشتری عرضه کند
            و هر خریداری با خیالی آسوده خرید کند. هدف ما توانمندسازی فروشندگان محلی و ایجاد
            فرصت‌های برابر برای همه است.
          </p>
        </div>
      </section>
    </div>
  );
}
