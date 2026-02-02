'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Goods } from '@/types/goods.types';
import { goodsService } from '@/services/goods.service';
import GoodsList from '@/components/goods/GoodsList';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { Role } from '@/types/user.types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyGoodsPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoods = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await goodsService.getMyGoods();
      setGoods(response.goods);
    } catch (error) {
      console.error('Error fetching goods:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoods();
  }, [fetchGoods]);

  return (
    <ProtectedRoute allowedRoles={[Role.VENDOR, Role.ADMIN]}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Goods</h1>
          <Link href="/add-goods">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Goods
            </Button>
          </Link>
        </div>

        <GoodsList 
          goods={goods} 
          isLoading={isLoading}
          emptyMessage="You haven't added any goods yet. Click 'Add New Goods' to get started!"
        />
      </div>
    </ProtectedRoute>
  );
}