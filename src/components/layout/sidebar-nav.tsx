'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote,
  Building2,
  CalendarClock,
  ClipboardList,
  Contact,
  FileBarChart2,
  FileText,
  Handshake,
  LayoutDashboard,
  MapPin,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavIconName, NavSection } from '@/lib/nav';

const ICONS: Record<NavIconName, LucideIcon> = {
  Banknote,
  Building2,
  CalendarClock,
  ClipboardList,
  Contact,
  FileBarChart2,
  FileText,
  Handshake,
  LayoutDashboard,
  MapPin,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
};

export function SidebarNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5">
      {sections.map((section) => {
        const SectionIcon = ICONS[section.icon];

        return (
          <div key={section.label} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-sidebar-foreground/45 uppercase">
              <SectionIcon className="h-3.5 w-3.5" />
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon ? ICONS[item.icon] : undefined;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary transition-opacity',
                      active ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {Icon && (
                    <Icon
                      className={cn('h-4 w-4 shrink-0', active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50')}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
