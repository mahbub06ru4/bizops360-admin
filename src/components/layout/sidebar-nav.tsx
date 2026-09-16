'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Banknote,
  Building2,
  CalendarClock,
  ChevronRight,
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

const STORAGE_KEY = 'bizops360:collapsed-nav-sections';

export function SidebarNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // One-shot hydration from localStorage on mount — SSR has no access
        // to it, so this can't be a lazy useState initializer instead.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsed(new Set(JSON.parse(stored) as string[]));
      }
    } catch {
      // Ignore unavailable/blocked storage — sections just stay expanded.
    }
  }, []);

  function toggle(label: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);

      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Best-effort persistence only.
      }

      return next;
    });
  }

  return (
    <nav className="flex flex-col gap-1">
      {sections.map((section) => {
        const SectionIcon = ICONS[section.icon];
        const isCollapsed = collapsed.has(section.label);
        const hasActiveItem = section.items.some((item) => item.href === pathname);

        return (
          <div key={section.label} className="flex flex-col gap-0.5 pb-1">
            <button
              type="button"
              onClick={() => toggle(section.label)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold tracking-wider text-sidebar-foreground/45 uppercase transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/70"
            >
              <SectionIcon className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">{section.label}</span>
              <ChevronRight
                className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !isCollapsed && 'rotate-90')}
              />
            </button>
            {!isCollapsed &&
              section.items.map((item) => {
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
            {isCollapsed && hasActiveItem && (
              <p className="px-3 text-xs text-sidebar-foreground/40">Active page hidden — expand to view</p>
            )}
          </div>
        );
      })}
    </nav>
  );
}
