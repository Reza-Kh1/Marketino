"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import InputForm from "../inputs/InputForm";

export default function PriceRangeFilter() {
    const [minPrice, setMinPrice] = useState<number>(1000);
    const [maxPrice, setMaxPrice] = useState<number>(7000);

    // const MAX_LIMIT = 1000000000;
    const MAX_LIMIT = 500000000;
    const minPercent = (minPrice / MAX_LIMIT) * 100;
    const maxPercent = (maxPrice / MAX_LIMIT) * 100;

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxPrice - 100);
        setMinPrice(Math.max(0, value));
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minPrice + 100);
        setMaxPrice(Math.min(MAX_LIMIT, value));
    };

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-5 mb-6 p-4 rounded-2xl border border-slate-800/60">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <span>محدوده قیمت</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <InputForm
                        name="up-price"
                        label="از قیمت"
                        max={MAX_LIMIT}
                        value={minPrice.toLocaleString('en-US')}
                        iconEnd={<DollarSign />}
                        onChange={({ target }) => {
                            let value = target.value.replace(/[^0-9]/g, '');
                            if (value !== '') {
                                const num = Number(value);
                                setMinPrice(num === 0 ? 0 : num);
                            } else {
                                setMinPrice(0);
                            }
                        }}
                    />
                    <InputForm
                        name="up-price"
                        label="تا قیمت"
                        max={MAX_LIMIT}
                        value={maxPrice.toLocaleString('en-US')}
                        iconEnd={<DollarSign />}
                        onChange={({ target }) => {
                            let value = target.value.replace(/[^0-9]/g, '');
                            if (value !== '') {
                                const num = Number(value);
                                setMaxPrice(num === 0 ? 0 : num);
                            } else {
                                setMaxPrice(0);
                            }
                        }}
                    />
                </div>
                <div className="relative w-full pt-4 pb-2">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-slate-800 rounded-lg"></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-2 bg-linear-to-r from-cyan-700 to-blue-800 rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                        style={{
                            insetInlineStart: `${minPercent}%`,
                            insetInlineEnd: `${100 - maxPercent}%`,
                        }}
                    />
                    <input
                        type="range"
                        min="0"
                        max={MAX_LIMIT}
                        value={minPrice}
                        onChange={handleMinChange}
                        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#06b6d4] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <input
                        type="range"
                        min="0"
                        max={MAX_LIMIT}
                        value={maxPrice}
                        onChange={handleMaxChange}
                        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#3b82f6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                </div>
            </div>
        </form>
    );
}