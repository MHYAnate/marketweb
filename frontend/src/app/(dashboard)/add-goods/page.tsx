'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateGoodsData } from '@/types/goods.types';
import { goodsService } from '@/services/goods.service';
import GoodsForm from '@/components/goods/GoodsForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/user.types';
import toast from 'react-hot-toast';

export default function AddGoodsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateGoodsData) => {
    setIsLoading(true);
    try {
      await goodsService.create(data);
      toast.success('Goods created successfully! It will be reviewed by admin.');
      router.push('/my-goods');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create goods');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[Role.VENDOR, Role.ADMIN]}>
      <div>
        <h1 className="text-2xl font-bold mb-6">Add New Goods</h1>
        <GoodsForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </ProtectedRoute>
  );
}