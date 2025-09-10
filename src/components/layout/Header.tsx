'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Home,
  Users,
  UserPlus,
  Award,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: '系统主页',
    href: '/',
    icon: Home,
  },
  {
    name: '招聘管理',
    href: '/recruitment',
    icon: UserPlus,
  },
  {
    name: '员工管理',
    href: '/employees',
    icon: Users,
  },
  {
    name: '积分管理',
    href: '/scores',
    icon: BarChart3,
  },
  {
    name: '年度评优',
    href: '/awards',
    icon: Award,
  },
];

export default function Header() {
  const pathname = usePathname();

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              mobile && 'w-full justify-start'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-4 w-4" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              呈尚策划人事管理系统
            </span>
            <span className="font-bold sm:hidden">
              人事系统
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItems />
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2">

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="font-bold">人事管理系统</span>
                </div>
                
                <nav className="flex flex-col gap-2">
                  <NavItems mobile />
                </nav>
                

              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
