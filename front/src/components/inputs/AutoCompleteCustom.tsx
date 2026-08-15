'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import MotionWrapper from '@/components/motion/MotionWrapper';

interface OptionItem {
  id: string;
  name: string;
  label?: React.ReactNode;
}

interface AutocompleteCustomProps {
  options: OptionItem[];
  placeholder?: string;
  emptyText?: string;
  value?: string | string[];
  onChange: (value: any) => void;
  className?: string;
  label: string;
  multiple?: boolean;
  disabled?: boolean
}

export default function AutocompleteCustom({
  options,
  placeholder = 'جستجو و انتخاب...',
  emptyText = 'موردی یافت نشد.',
  value,
  onChange,
  className,
  label,
  disabled = false,
  multiple = false,
}: AutocompleteCustomProps) {
  const [open, setOpen] = React.useState(false);

  const selectedValues = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const handleSelect = (currentId: string) => {
    if (multiple) {
      if (selectedValues.includes(currentId)) {
        onChange(selectedValues.filter((id) => id !== currentId));
      } else {
        onChange([...selectedValues, currentId]);
      }
    } else {
      onChange(currentId === value ? '' : currentId);
      setOpen(false);
    }
  };

  const handleRemove = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((id) => id !== idToRemove));
  };

  return (
    <Popover open={disabled ? false : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-2 w-full text-right dir-rtl">
          <label className="text-sm font-medium text-white/70">{label}</label>
          <div
            aria-expanded={open}
            className={cn(
              'relative group hover:outline-none hover:ring-1 hover:ring-deep-purple/30 hover:border-transparent flex items-center justify-between w-full min-h-11 p-2 rounded-lg border bg-bg-input z-20 text-foreground transition-all duration-100 text-right',
              disabled
                ? 'opacity-80 cursor-not-allowed!'
                : 'cursor-pointer',
              className
            )}
          >
            <div className="flex flex-wrap gap-1.5 items-center max-w-[90%]">
              {selectedValues.length > 0 ? (
                options
                  .filter((option) => selectedValues.includes(option.id.toString()))
                  .map((option) => (
                    <span
                      key={(option.id).toString()}
                      className="flex items-center gap-1 bg-blue/20 text-admin-low-white border border-deep-purple/30 text-xs px-2 py-1 rounded-md transition-all hover:bg-blue/30"
                    >
                      {option?.label}
                      <span>{option.name}</span>
                      <X
                        className="w-3 h-3 cursor-pointer text-white/50 hover:text-white"
                        onClick={(e) => handleRemove(e, option.id.toString())}
                      />
                    </span>
                  ))
              ) : (
                <span className="text-white-low text-sm">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command className="dir-rtl w-full">
          <CommandInput placeholder={placeholder} className="h-9 w-full" />
          <CommandList className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-blue/40 scrollbar-track-transparent">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <MotionWrapper staggerChildren={0.05} preset="fadeIn">
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.id.toString());
                  return (
                    <CommandItem
                      key={option.id.toString()}
                      value={option.name.toString()}
                      onSelect={() => handleSelect(option.id.toString())}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {option?.label}
                        <span className="text-sm">{option.name}</span>
                      </div>
                      <Check
                        className={cn(
                          'ml-2 h-4 w-4 text-blue',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </MotionWrapper>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}