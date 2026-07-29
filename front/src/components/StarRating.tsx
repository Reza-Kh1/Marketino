'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  count?: number;
}

export default function StarRating({
  rating, maxStars = 5, size = 'md', showValue = true,
  interactive = false, onChange, count,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };
  const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' };

  const getStars = () => {
    const stars = [];
    for (let i = 1; i <= maxStars; i++) {
      const filled = i <= Math.floor(displayRating);
      const half = !filled && i - 0.5 <= displayRating;
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={cn(
            'transition-all duration-150',
            interactive && 'hover:scale-125 cursor-pointer',
            !interactive && 'cursor-default',
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              'transition-colors',
              (filled || half) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30',
              half && !filled && 'text-amber-400 fill-amber-400/50',
            )}
          />
        </button>,
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{getStars()}</div>
      {showValue && (
        <span className={cn('font-bold text-amber-500', textMap[size])}>
          {displayRating.toFixed(1)}
        </span>
      )}
      {count !== undefined && count > 0 && (
        <span className={cn('text-muted-foreground', size === 'sm' ? 'text-[10px]' : 'text-xs')}>
          ({count.toLocaleString('fa-IR')})
        </span>
      )}
    </div>
  );
}
