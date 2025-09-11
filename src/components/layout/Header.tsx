'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/basic/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/layout/sheet';
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
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80',
              mobile && 'w-full justify-start'
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-all duration-300",
              isActive ? "text-white" : "text-gray-500 group-hover:text-blue-500"
            )} />
            <span className="relative">
              {item.name}
              {isActive && !mobile && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </span>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="hidden font-bold text-gray-900 sm:inline-block group-hover:text-blue-600 transition-colors duration-300">
                呈尚策划人事管理系统
              </span>
              <span className="hidden text-xs text-gray-500 sm:inline-block">
                Digital HR Management
              </span>
              <span className="font-bold text-gray-900 sm:hidden group-hover:text-blue-600 transition-colors duration-300">
                人事系统
              </span>
            </div>
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
