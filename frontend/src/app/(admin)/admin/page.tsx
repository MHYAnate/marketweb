'use client';

import  { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { Users, Package, Clock, CheckCircle, Flag, XCircle } from 'lucide-react';

interface DashboardStats {
  users: { total: number };
  vendors: { total: number; pending: number };
  goods: {
    total: number;
    pending: number;
    approved: number;
    flagged: number;
    dropped: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  if (!stats) {
    return <div>Failed to load dashboard</div>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Vendors',
      value: stats.vendors.total,
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pending Vendors',
      value: stats.vendors.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      link: '/admin/vendors',
    },
    {
      title: 'Total Goods',
      value: stats.goods.total,
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Pending Goods',
      value: stats.goods.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      link: '/admin/goods',
    },
    {
      title: 'Approved Goods',
      value: stats.goods.approved,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Flagged Goods',
      value: stats.goods.flagged,
      icon: Flag,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Dropped Goods',
      value: stats.goods.dropped,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                  </div>
                </div>
                {stat.link && stat.value > 0 && (
                  <Link href={stat.link}>
                    <Button variant="ghost" size="sm" className="mt-4 w-full">
                      Review Now
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/vendors">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Vendors
                </Button>
              </Link>
              <Link href="/admin/goods">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Goods
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}