'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vendorService } from '@/services/vendor.service';
import { goodsService } from '@/services/goods.service';
import { Vendor } from '@/types/vendor.types';
import { Goods } from '@/types/goods.types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import GoodsList from '@/components/goods/GoodsList';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';
import { Package, Eye, DollarSign, Store } from 'lucide-react';

export default function DashboardPage() {
  const { user, isVendor } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [recentGoods, setRecentGoods] = useState<Goods[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isVendor) {
          const vendorData = await vendorService.getMyProfile();
          setVendor(vendorData);

          if (vendorData) {
            const goodsData = await goodsService.getMyGoods({ limit: 4 });
            setRecentGoods(goodsData.goods);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isVendor]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Welcome back, {user?.firstName}!
      </h1>

      {!isVendor && (
        <Alert type="info" className="mb-6">
          <div className="flex items-center justify-between">
            <span>Become a vendor to start selling or leasing goods.</span>
            <Link href="/vendor-profile">
              <Button size="sm">Become a Vendor</Button>
            </Link>
          </div>
        </Alert>
      )}

      {isVendor && vendor && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vendor.totalGoods}</p>
                    <p className="text-sm text-gray-500">Total Goods</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold capitalize">{vendor.status}</p>
                    <p className="text-sm text-gray-500">Vendor Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {recentGoods.reduce((sum, g) => sum + g.views, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vendor.rating || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Goods */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Goods</h2>
              <Link href="/my-goods">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <GoodsList 
                goods={recentGoods} 
                isLoading={isLoading}
                emptyMessage="No goods yet. Create your first listing!"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}