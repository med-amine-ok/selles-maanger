import React from 'react';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: 'gold' | 'green' | 'amber' | 'rose' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'neutral',
  onClick,
  className,
}) => {
  const accentStyles = {
    gold: 'bg-[#FBF1DD] text-[#B5822F]',
    green: 'bg-[#E7F3E9] text-[#4F8A5B]',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
    neutral: 'bg-[#F5F5F0] text-[#6B6B63]',
  };

  return (
    <Card
      variant={onClick ? 'interactive' : 'surface'}
      padding="md"
      onClick={onClick}
      className={clsx('flex flex-col justify-between min-w-[150px] relative overflow-hidden', className)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B63]">{title}</span>
        {icon && <div className={clsx('p-2 rounded-2xl shrink-0', accentStyles[accent])}>{icon}</div>}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#2A2A24] tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-[#6B6B63] mt-1 font-medium">{subtitle}</p>}
      </div>
    </Card>
  );
};
