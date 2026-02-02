'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { cn } from '@/utils/helpers';
import {
  LayoutDashboard,
  Package,
  Plus,
  Store,
  Settings,
} from 'lucide-react';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-goods', label: 'My Goods', icon: Package, vendorOnly: true },
  { href: '/add-goods', label: 'Add Goods', icon: Plus, vendorOnly: true },
  { href: '/vendor-profile', label: 'Vendor Profile', icon: Store },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isVendor, isAdmin } = useAuth();

  const filteredLinks = sidebarLinks.filter(link => {
    if (link.vendorOnly && !isVendor && !isAdmin) return false;
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <ul className="space-y-2">
                {filteredLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}