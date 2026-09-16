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

const STORAGE_KEY = 'bizops360:expanded-nav-section';

export function SidebarNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeSectionLabel = sections.find((section) => section.items.some((item) => item.href === pathname))?.label;
  // Accordion: one section open at a time, like a real admin panel — expanding
  // one collapses the rest instead of letting the list grow without bound.
  // Defaults to whichever section contains the current route.
  const [expanded, setExpanded] = useState<string | null>(activeSectionLabel ?? sections[0]?.label ?? null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        // One-shot hydration from localStorage on mount — SSR has no access
        // to it, so this can't be a lazy useState initializer instead.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExpanded(stored === '' ? null : stored);
      }
    } catch {
      // Ignore unavailable/blocked storage — the route-derived default stands.
    }
    // Only ever runs once, to hydrate from a prior session — not on every
    // pathname change, which would fight the user's own expand/collapse.
  }, []);

  function toggle(label: string) {
    const next = expanded === label ? null : label;
    setExpanded(next);

    try {
      window.localStorage.setItem(STORAGE_KEY, next ?? '');
    } catch {
      // Best-effort persistence only.
    }
  }

  return (
    <nav className="flex flex-col gap-1.5">
      {sections.map((section) => {
        const SectionIcon = ICONS[section.icon];
        const isCollapsed = expanded !== section.label;
        const hasActiveItem = section.items.some((item) => item.href === pathname);

        return (
          <div
            key={section.label}
            className={cn('flex flex-col rounded-lg', !isCollapsed && 'bg-black/15 pb-1.5 ring-1 ring-white/[0.04]')}
          >
            <button
              type="button"
              onClick={() => toggle(section.label)}
              aria-expanded={!isCollapsed}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold tracking-wider uppercase transition-colors',
                isCollapsed
                  ? 'text-sidebar-foreground/40 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/70'
                  : 'text-sidebar-primary',
              )}
            >
              <SectionIcon className="h-4 w-4" />
              <span className="flex-1 text-left">{section.label}</span>
              <ChevronRight
                className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !isCollapsed && 'rotate-90')}
              />
            </button>
            {!isCollapsed && (
              <div className="ml-[19px] flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon ? ICONS[item.icon] : undefined;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground',
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            'h-3.5 w-3.5 shrink-0',
                            active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/40',
                          )}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            {isCollapsed && hasActiveItem && (
              <p className="px-3 pb-1 text-[11px] text-sidebar-primary/70">● active page inside — click to expand</p>
            )}
          </div>
        );
      })}
    </nav>
  );
}
