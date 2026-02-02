'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Goods, GoodsStatus } from '@/types/goods.types';
import { adminService } from '@/services/admin.service';
import GoodsTable from '@/components/admin/GoodsTable';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminGoodsPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<GoodsStatus | ''>('');

  const fetchGoods = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      if (statusFilter === GoodsStatus.PENDING) {
        response = await adminService.getPendingGoods(currentPage, 10);
      } else {
        response = await adminService.getAllGoods(currentPage, 10);
      }
      setGoods(response.goods);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching goods:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchGoods();
  }, [fetchGoods]);

  const handleApprove = async (goodsId: string) => {
    try {
      await adminService.approveGoods(goodsId);
      toast.success('Goods approved successfully');
      fetchGoods();
    } catch (error) {
      toast.error('Failed to approve goods');
    }
  };

  const handleFlag = async (goodsId: string, reason: string) => {
    try {
      await adminService.flagGoods(goodsId, reason);
      toast.success('Goods flagged');
      fetchGoods();
    } catch (error) {
      toast.error('Failed to flag goods');
    }
  };

  const handleDrop = async (goodsId: string, reason: string) => {
    try {
      await adminService.dropGoods(goodsId, reason);
      toast.success('Goods dropped');
      fetchGoods();
    } catch (error) {
      toast.error('Failed to drop goods');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Goods</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as GoodsStatus | '');
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value={GoodsStatus.PENDING}>Pending</option>
          <option value={GoodsStatus.APPROVED}>Approved</option>
          <option value={GoodsStatus.FLAGGED}>Flagged</option>
          <option value={GoodsStatus.DROPPED}>Dropped</option>
        </select>
      </div>

      {isLoading ? (
        <Loading size="lg" text="Loading goods..." />
      ) : (
        <>
          <GoodsTable
            goods={goods}
            onApprove={handleApprove}
            onFlag={handleFlag}
            onDrop={handleDrop}
          />

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}