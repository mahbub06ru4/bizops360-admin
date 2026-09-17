'use client';

import { useState } from 'react';
import { Building2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import type { NavSection } from '@/lib/nav';

export function MobileNav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-64 flex-col border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
        <SheetHeader className="px-0">
          <SheetTitle className="flex items-center gap-2.5 text-sidebar-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            BizOps 360
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex-1 overflow-y-auto">
          <SidebarNav sections={sections} onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-sidebar-border pt-3 text-[11px] leading-tight text-sidebar-foreground/40">
          <p>Developed: Eng. Mahbub</p>
          <p>Powered By: Solution360</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
