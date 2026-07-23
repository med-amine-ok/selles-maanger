import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'honey' | 'fruits' | 'gold' | 'green' | 'red' | 'amber' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-tight select-none';

  const variants = {
    honey: 'bg-[#FBF1DD] text-[#B5822F] border border-[#F3E3BE]',
    gold: 'bg-[#FBF1DD] text-[#B5822F] border border-[#F3E3BE]',
    fruits: 'bg-[#E7F3E9] text-[#4F8A5B] border border-[#CDE5D2]',
    green: 'bg-[#E7F3E9] text-[#4F8A5B] border border-[#CDE5D2]',
    amber: 'bg-amber-100 text-amber-800 border border-amber-200',
    red: 'bg-rose-100 text-rose-800 border border-rose-200',
    neutral: 'bg-[#F5F5F0] text-[#6B6B63] border border-[#EBEBE6]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
