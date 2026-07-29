// components/MotionWrapper.tsx
'use client';

import { motion, TargetAndTransition, Transition, Variants } from "framer-motion";
import { ReactNode } from "react";

export type AnimationPreset =
    | "fadeIn" | "fadeUp" | "slideRTL" | "slideLTR"
    | "scale" | "zoom" | "rotate" | "bounce" | "pop" | "glow";

// ✅ اضافه کردن تایپ‌های hover
type HoverEffect =
    | "scale"           // بزرگ شدن
    | "scaleDown"       // کوچک شدن
    | "rotate"          // چرخش
    | "glow"            // درخشش
    | "lift"            // بالا آمدن
    | "shake"           // لرزش
    | "bounce"          // جهش
    | "magnetic"        //این افکت به المان حسِ "چسبندگی به موس" می‌دهد
    | "skew"            //برای تیترهای بزرگ (Heading) که می‌خواهی حسِ سرعت بدهند
    | "colorPulse"      //وقتی این افکت را روی یک دکمه یا کارت پیاده می‌کنی، رنگِ آن به صورت نرم و در یک چرخه بی‌پایان بین چند رنگ تغییر می‌کند
    | "none";           // بدون افکت

type AnimationConfig = {
    initial: TargetAndTransition;
    animate: TargetAndTransition;
    exit?: TargetAndTransition;
};
interface MotionRepeatProps {
    children: ReactNode;
    preset?: AnimationPreset;
    hoverEffect?: HoverEffect;        // ✅ افکت hover
    tapEffect?: boolean;              // ✅ افکت کلیک
    customAnimation?: {
        initial?: TargetAndTransition;
        animate?: TargetAndTransition;
        hover?: TargetAndTransition;    // ✅ hover سفارشی
        tap?: TargetAndTransition;      // ✅ tap سفارشی
    };
    delay?: number;
    duration?: number;
    className?: string;
    staggerChildren?: number;
}

const hoverEffects: Record<HoverEffect, any> = {
    scale: { scale: 1.05, transition: { duration: 0.2 } },
    scaleDown: { scale: 0.95, transition: { duration: 0.2 } },
    rotate: { rotate: 5, scale: 1.02, transition: { duration: 0.2 } },
    magnetic: { x: 10, y: 10, transition: { duration: 0.2 } }, // اصلاح شد
    colorPulse: {
        backgroundColor: ["#3b82f6", "#2563eb", "#3b82f6"],
        color: "#ffffff",
        transition: { duration: 0.5, repeat: Infinity }
    },
    skew: { skewX: -10, transition: { duration: 0.2 } }, // اصلاح شد
    glow: {
        boxShadow: "0 0 20px rgba(59,130,246,0.5)",
        scale: 1.02,
        transition: { duration: 0.2 }
    },
    lift: { y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", transition: { duration: 0.2 } },
    shake: { x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.3 } },
    bounce: { y: [0, -8, 0], transition: { duration: 0.3 } },
    none: {},
};
// 📚 دیکشنری افکت‌های tap (کلیک)
const tapEffects: Record<"true" | "false", TargetAndTransition> = {
    "true": { scale: 0.97, transition: { duration: 0.1 } },
    "false": {},
};
// انیمیشن‌های اصلی (مثل قبل)
const animations: Record<AnimationPreset, AnimationConfig> = {
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    fadeUp: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    slideRTL: { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 } },
    slideLTR: { initial: { opacity: 0, x: -100 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
    zoom: { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 } },
    rotate: { initial: { opacity: 0, rotate: -10 }, animate: { opacity: 1, rotate: 0 } },
    bounce: {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
    },
    pop: {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400 } }
    },
    glow: {
        initial: { opacity: 0, boxShadow: "0 0 0px rgba(59,130,246,0)" },
        animate: { opacity: 1, boxShadow: "0 0 15px rgba(59,130,246,0.3)" }
    },
};
const getVariants = (
    base: any,
    hover: any,
    tap: any,
    stagger?: number,
    transition?: Transition
): Variants => ({
    hidden: base.initial,
    visible: {
        ...base.animate,
        transition: {
            ...transition,
            staggerChildren: stagger && stagger > 0 ? stagger : undefined,
            delayChildren: transition?.delay
        }
    },
    hover: hover,
    tap: tap
});
export default function MotionRepeat({
    children,
    preset = "fadeUp",
    hoverEffect = "none",
    tapEffect = false,
    customAnimation,
    delay = 0,
    duration = 0.5,
    className = "",
    staggerChildren = 0,
}: MotionRepeatProps) {
    const base = customAnimation || animations[preset];
    const hover = customAnimation?.hover || hoverEffects[hoverEffect];
    const tap = customAnimation?.tap || (tapEffect ? tapEffects["true"] : tapEffects["false"]);

    const transition: Transition = {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
    };

    const motionVariants = getVariants(base, hover, tap, staggerChildren, transition);

    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            variants={motionVariants}
        >
            {children}
        </motion.div>
    );
}


// <MotionWrapper
//                 preset="fadeUp"
//                 hoverEffect="lift"
//                 tapEffect={true}
//                 className="p-6 bg-white rounded-xl shadow-lg"
//             >
//                 <h3>عنوان کارت ۱</h3>
//                 <p>این یک کارت با افکت لیفت و تپ است.</p>
//             </MotionWrapper>

//             <MotionWrapper
//                 preset="zoom"
//                 hoverEffect="glow"
//                 className="p-6 bg-blue-50 rounded-xl"
//             >
//                 <h3>عنوان کارت ۲</h3>
//                 <p>این کارت موقع هاور درخشان می‌شود.</p>
//             </MotionWrapper>