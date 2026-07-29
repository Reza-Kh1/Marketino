'use client';
import { motion, TargetAndTransition, Transition, useInView, useReducedMotion, Variants } from "framer-motion";
import React, { ReactNode, useRef } from "react";
export type AnimationPreset =
    | "fadeIn"           // محو شدن ساده
    | "fadeUp"           // محو + بالا
    | "fadeDown"         // محو + پایین
    | "slideRTL"         // از راست به چپ (مناسب فارسی)
    | "slideLTR"         // از چپ به راست (مناسب انگلیسی)
    | "slideLeft"        // به چپ
    | "slideRight"       // به راست
    | "scale"            // بزرگ شدن
    | "zoom"             // زوم با محو
    | "rotate"           // چرخش
    | "rotateScale"      // چرخش + بزرگ شدن
    | "bounce"           // جهشی
    | "flip"             // برگشتن
    | "blur"             // تار شدن
    | "glow"             // درخشش
    | "shake"            // لرزش (هشدار)
    | "pop"              // پاپ شدن
    | "reveal"           //این انیمیشن عالی است چون المان را انگار از پشت یک ماسک (Mask) بیرون می‌کشد.
    | "float"            //این افکت برای المان‌هایی که می‌خواهی همیشه زنده و پویا به نظر برسند عالی است.
    | "slideUpBlur"      //این انیمیشن بسیار در سایت‌های مینیمالِ مدرن استفاده می‌شود که همزمان با بالا آمدن، کمی محو (Blur) هم هست.
    | "pulse";           //اگر دکمه یا المان مهمی داری که می‌خواهی کاربر حتماً آن را ببیند، این افکت عالی است.

// تایپ props
interface MotionWrapperProps {
    children: ReactNode;
    preset?: AnimationPreset;        // انیمیشن از پیش تعریف شده
    customAnimation?: {               // انیمیشن شخصی‌سازی شده
        initial?: TargetAndTransition;
        animate?: TargetAndTransition;
        exit?: TargetAndTransition;
    };
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;                   // فقط یک بار اجرا بشه
    triggerOnScroll?: boolean;       // با اسکرول اجرا بشه
    threshold?: number;              // چقدر از المان شما باید دیده بشه تا انیمیشن اجرا بشه از 0 تا 1
    staggerChildren?: number;        // تاخیر بین بچه‌ها
}

// 📚 دیکشنری انیمیشن‌های آماده
const animations: Record<AnimationPreset, {
    initial: TargetAndTransition;
    animate: TargetAndTransition;
    exit?: TargetAndTransition;
}> = {
    // ساده و حرفه‌ای
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
    },

    fadeUp: {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
    },

    fadeDown: {
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
    },

    // ✅ مخصوص RTL (راست به چپ) - برای فرم فارسی شما عالیه
    slideRTL: {
        initial: { opacity: 0, x: 100 },      // از راست میاد
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },        // به چپ میره
    },
    float: {
        initial: { y: 0 },
        animate: {
            y: [0, -20, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        },
    },
    slideUpBlur: {
        initial: { opacity: 0, y: 50, filter: "blur(10px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    },
    pulse: {
        initial: { scale: 1 },
        animate: {
            scale: [1, 1.05, 1],
            transition: { duration: 1.5, repeat: Infinity }
        },
    },
    // مخصوص LTR (چپ به راست)
    slideLTR: {
        initial: { opacity: 0, x: -100 },     // از چپ میاد
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },         // به راست میره
    },

    slideLeft: {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
    },

    slideRight: {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
    },

    // انیمیشن‌های جذاب
    scale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
    },

    zoom: {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
    },
    reveal: {
        initial: { clipPath: "inset(100% 0 0 0)" },
        animate: { clipPath: "inset(0% 0 0 0)", transition: { duration: 0.8, ease: "easeInOut" } },
    },
    rotate: {
        initial: { opacity: 0, rotate: -10, scale: 0.9 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
    },

    rotateScale: {
        initial: { opacity: 0, rotate: -15, scale: 0.8 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
    },

    bounce: {
        initial: { opacity: 0, y: 50 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 15,
            }
        },
    },

    flip: {
        initial: { opacity: 0, rotateX: -90 },
        animate: { opacity: 1, rotateX: 0 },
    },

    blur: {
        initial: { opacity: 0, filter: "blur(10px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
    },

    glow: {
        initial: { opacity: 0, boxShadow: "0 0 0px rgba(59,130,246,0)" },
        animate: {
            opacity: 1,
            boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            transition: { duration: 0.8 }
        },
    },

    shake: {
        initial: { x: 0 },
        animate: {
            x: [0, -10, 10, -5, 5, 0],
            transition: { duration: 0.5 }
        },
    },

    pop: {
        initial: { scale: 0, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10,
            }
        },
    },
};

const getVariants = (
    activeAnimation: any,
    shouldReduce: boolean,
    standardTransition: Transition,
    stagger?: number
): Variants => ({
    hidden: shouldReduce ? { opacity: 1 } : (activeAnimation.initial || { opacity: 0 }),
    visible: {
        ...(shouldReduce ? { opacity: 1 } : (activeAnimation.animate || {})),
        transition: {
            ...standardTransition,
            staggerChildren: stagger && stagger > 0 ? stagger : undefined,
            delayChildren: standardTransition.delay,
        }
    }
});


export default function MotionWrapper({
    children,
    preset = "fadeUp",
    customAnimation,
    delay = 0,
    duration = 0.5,
    className = "w-full",
    once = true,
    triggerOnScroll = false,
    threshold = 0.2,
    staggerChildren = 0,
}: MotionWrapperProps) {
    const ref = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    const isInView = useInView(ref, { once, amount: threshold });

    const animation = customAnimation || animations[preset];

    const activeAnimation = shouldReduceMotion
        ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
        : animation;

    const standardTransition: Transition = {
        duration: shouldReduceMotion ? 0 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
    };

    const motionVariants = getVariants(
        activeAnimation,
        !!shouldReduceMotion,
        standardTransition,
        staggerChildren
    );
    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate={triggerOnScroll ? (isInView ? "visible" : "hidden") : "visible"}
            variants={motionVariants}
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={{
                    hidden: animation.initial || {},
                    visible: animation.animate || {}
                }}>
                    {child}
                </motion.div>
            ))}
        </motion.div >
    );
}

{/* <MotionWrapper triggerOnScroll={true} preset="fadeUp" threshold={0.3}>
  <div className="p-10 bg-gray-100">
    این بخش وقتی کاربر اسکرول کند و ۳۰ درصدش دیده شود، ظاهر می‌شود.
  </div>
</MotionWrapper> */}