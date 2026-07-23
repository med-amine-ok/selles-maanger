'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3.5 text-[#6B6B63] pointer-events-none">{leftIcon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white border border-[#EBEBE6] rounded-2xl text-sm text-[#2A2A24] placeholder-[#A0A096]',
                'focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 transition-all duration-200 outline-none',
                'min-h-[46px] px-4 py-2.5',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
                className
              )
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3.5 text-[#6B6B63]">{rightIcon}</div>}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 mt-0.5 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#6B6B63] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
