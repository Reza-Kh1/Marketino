'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  isLoading?: boolean;
  error?: string;
}

export default function OTPInput({ length = 6, onComplete, isLoading, error }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    // Auto-focus next
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const code = newValues.join('');
    if (code.length === length) {
      onComplete(code);
    }
  }, [values, length, onComplete]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [values, length]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!paste) return;
    const newValues = [...values];
    for (let i = 0; i < Math.min(length, paste.length); i++) {
      newValues[i] = paste[i];
    }
    setValues(newValues);
    const focusIndex = Math.min(length, paste.length) - 1;
    inputRefs.current[focusIndex]?.focus();
    const code = newValues.join('');
    if (code.length === length) {
      onComplete(code);
    }
  }, [values, length, onComplete]);

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {values.map((val, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={val}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={isLoading}
            className={cn(
              'w-11 h-14 sm:w-12 sm:h-16 rounded-xl border-2 text-center text-xl sm:text-2xl font-black',
              'bg-background focus:outline-none focus:ring-2 transition-all',
              error
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-border focus:border-primary focus:ring-primary/30',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          />
        ))}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm text-center mt-3"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
