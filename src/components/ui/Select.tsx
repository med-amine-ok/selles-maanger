'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white border border-[#EBEBE6] rounded-2xl text-sm text-[#2A2A24] appearance-none cursor-pointer',
                'focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 transition-all duration-200 outline-none',
                'min-h-[46px] px-4 py-2.5 pr-10',
                error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
                className
              )
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#6B6B63] absolute right-3.5 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-rose-600 mt-0.5 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
