'use client';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, DollarSign, Send, Users } from 'lucide-react';

const JOBS = [
  {
    title: 'توسعه‌دهنده Front-end',
    type: 'تمام وقت',
    location: 'تهران',
    salary: 'توافقی',
    desc: 'مسلط به React.js، Next.js، TypeScript و Tailwind CSS. حداقل ۲ سال سابقه کار. آشنایی با معماری میکروسرویس مزیت محسوب می‌شود.',
    tags: ['React', 'Next.js', 'TypeScript'],
  },
  {
    title: 'توسعه‌دهنده Back-end',
    type: 'تمام وقت',
    location: 'تهران',
    salary: 'توافقی',
    desc: 'مسلط به NestJS، PostgreSQL و REST API. آشنایی با Docker و Redis. حداقل ۳ سال سابقه کار.',
    tags: ['NestJS', 'PostgreSQL', 'Docker'],
  },
  {
    title: 'طراح UI/UX',
    type: 'دورکاری',
    location: 'دورکاری',
    salary: 'توافقی',
    desc: 'مسلط به Figma و اصول طراحی. سابقه طراحی رابط کاربری برای اپلیکیشن‌های تجارت الکترونیک. آشنایی با طراحی RTL.',
    tags: ['Figma', 'UI/UX', 'RTL'],
  },
  {
    title: 'کارشناس پشتیبانی',
    type: 'تمام وقت',
    location: 'تهران',
    salary: 'ثابت',
    desc: 'پاسخگویی به مشتریان از طریق تلفن و چت. توانایی حل مسئله و برخورد مناسب. شیفت‌های چرخشی صبح و عصر.',
    tags: ['پشتیبانی', 'ارتباط با مشتری'],
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6">فرصت‌های شغلی</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              به تیم بازارچه بپیوندید و در ساختن بزرگترین پلتفرم تجارت الکترونیک ایران سهیم شوید.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: '🚀', title: 'رشد سریع', desc: 'محیط پویا و پرچالش' },
            { icon: '💻', title: 'دورکاری', desc: 'امکان کار ترکیبی' },
            { icon: '📚', title: 'یادگیری', desc: 'دوره‌های آموزشی رایگان' },
            { icon: '🎯', title: 'هدف مشترک', desc: 'تیم منسجم و حرفه‌ای' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Job Listings */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-center mb-8">موقعیت‌های شغلی باز</h2>
        <div className="space-y-4">
          {JOBS.map((job, i) => (
            <motion.div key={job.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-black text-lg mb-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{job.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-accent text-xs font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
                <button className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-lg transition-all">
                  <Send className="w-4 h-4" /> ارسال رزومه
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No positions fallback */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-8 bg-card border border-border rounded-2xl p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">موقعیت شغلی مورد نظر خود را پیدا نکردید؟</p>
          <p className="text-sm text-muted-foreground">
            رزومه خود را به <span className="text-primary font-bold">jobs@bazarche.ir</span> ارسال کنید.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
