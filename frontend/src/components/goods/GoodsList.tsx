'use client';

import React from 'react';
import { Goods } from '@/types/goods.types';
import GoodsCard from './GoodsCard';
import Loading from '@/components/ui/Loading';
import { Package } from 'lucide-react';

interface GoodsListProps {
  goods: Goods[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function GoodsList({ 
  goods, 
  isLoading = false, 
  emptyMessage = 'No goods found' 
}: GoodsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading goods..." />
      </div>
    );
  }

  if (!goods || goods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Package className="h-16 w-16 mb-4" />
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {goods.map((item) => (
        <GoodsCard key={item._id} goods={item} />
      ))}
    </div>
  );
}