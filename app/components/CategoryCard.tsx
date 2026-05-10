'use client';
import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface CategoryCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  count: string;
  href: string;
}

export default function CategoryCard({ icon: Icon, iconClassName, title, count, href }: CategoryCardProps) {
  const { dark } = useTheme();
  return (
    <Link href={href}>
      <div className={`group flex items-center gap-2 rounded border-2 p-2 transition hover:-translate-y-0.5 ${dark ? 'border-[#1d2c43] bg-[#0f1a2b] hover:border-[#2d4f7d] hover:bg-[#122038]' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`}>
        <div className={`rounded-lg p-1.5 ${dark ? 'bg-[#0b1321]' : 'bg-gray-100'}`}>
          <Icon className={`h-4.5 w-4.5 ${iconClassName || 'text-blue-400'}`} />
        </div>
        <div className="min-w-0">
          <p className={`truncate text-[13px] font-semibold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
          <p className={`mt-0.5 text-[11px] ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{count} огласи</p>
        </div>
        <ChevronRight className={`ml-auto h-3.5 w-3.5 transition ${dark ? 'text-slate-500 group-hover:text-slate-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
      </div>
    </Link>
  );
}
