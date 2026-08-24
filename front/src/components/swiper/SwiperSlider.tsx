'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SwiperSliderProps {
  children: ReactNode;
  className?: string;
  /** تعداد اسلاید در موبایل (پیش‌فرض ۱.۱۵) */
  mobileSlides?: number;
  /** فاصله بین اسلایدها */
  spaceBetween?: number;
  /** آیا دکمه‌های قبلی/بعدی نشون داده بشه */
  showNavigation?: boolean;
  /** آیا نقطه‌های پایین نشون داده بشه */
  showPagination?: boolean;
  slidesPerView1280?: number
}

export default function SwiperSlider({
  children,
  className,
  mobileSlides = 1.15,
  spaceBetween = 16,
  showNavigation = true,
  showPagination = true,
  slidesPerView1280 = 4
}: SwiperSliderProps) {
  const slides = Array.isArray(children) ? children : [children];

  return (
    <div className={cn('relative w-full', className)}>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={spaceBetween}
        slidesPerView={mobileSlides}
        navigation={showNavigation}
        pagination={showPagination ? { clickable: true } : false}
        breakpoints={{
          480: {
            slidesPerView: mobileSlides + 0.4,
            spaceBetween: spaceBetween,
          },
          640: {
            slidesPerView: 2.1,
            spaceBetween: spaceBetween + 2,
          },
          768: {
            slidesPerView: 2.6,
            spaceBetween: spaceBetween + 4,
          },
          1024: {
            slidesPerView: 3.2,
            spaceBetween: spaceBetween + 6,
          },
          1280: {
            slidesPerView: slidesPerView1280,
            spaceBetween: spaceBetween + 8,
          },
        }}
        className={cn('pt-2!',
          showPagination && 'pb-12! pt-2!',
          !showPagination && 'pb-2!'
        )}
      >
        {slides.map((child, index) => (
          <SwiperSlide key={index} className="h-auto!">
            <div className="h-full w-full">{child}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}