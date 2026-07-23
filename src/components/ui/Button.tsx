'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'green' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'gold',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-xs cursor-pointer select-none';

    const variants = {
      gold: 'bg-[#D4A24C] hover:bg-[#B5822F] text-white shadow-amber-500/10 hover:shadow-md',
      green: 'bg-[#7FB685] hover:bg-[#4F8A5B] text-white shadow-emerald-500/10 hover:shadow-md',
      secondary: 'bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2A2A24] active:bg-[#E2E2DC]',
      outline: 'border border-[#EBEBE6] bg-white hover:bg-[#FAFAF7] text-[#2A2A24]',
      ghost: 'bg-transparent hover:bg-[#F5F5F0] text-[#6B6B63] hover:text-[#2A2A24]',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10',
    };

    const sizes = {
      sm: 'text-xs px-3 py-2 min-h-[36px] gap-1.5',
      md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
      lg: 'text-base px-6 py-3 min-h-[50px] gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
