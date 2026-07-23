import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDZD(amount: number): string {
  const formatted = Math.round(amount).toLocaleString('fr-DZ');
  return `${formatted} DZD`;
}
