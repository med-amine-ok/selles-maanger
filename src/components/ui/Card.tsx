import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'flat' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'surface',
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-200 overflow-hidden';

  const variants = {
    surface: 'bg-white border border-[#EBEBE6] shadow-sm shadow-stone-200/50',
    flat: 'bg-[#F5F5F0]',
    outline: 'border border-[#EBEBE6] bg-transparent',
    interactive:
      'bg-white border border-[#EBEBE6] shadow-sm shadow-stone-200/50 hover:shadow-md hover:border-stone-300 active:scale-[0.99] cursor-pointer',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], paddings[padding], className))} {...props}>
      {children}
    </div>
  );
};
