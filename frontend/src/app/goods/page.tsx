'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Goods, GoodsQuery, GoodsType } from '@/types/goods.types';
import { goodsService } from '@/services/goods.service';
import GoodsList from '@/components/goods/GoodsList';
import GoodsFilter from '@/components/goods/GoodsFilter';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterValues {
  search: string;
  type: GoodsType | '';
  category: string;
  minPrice: string;
  maxPrice: string;
}

export default function GoodsPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<GoodsQuery>({});

  const fetchGoods = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await goodsService.getAll({
        ...filters,
        page: currentPage,
        limit: 12,
      });
      setGoods(response.goods);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching goods:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchGoods();
  }, [fetchGoods]);

  const handleFilter = (filterValues: FilterValues) => {
    const newFilters: GoodsQuery = {};
    
    if (filterValues.search) newFilters.search = filterValues.search;
    if (filterValues.type) newFilters.type = filterValues.type as GoodsType;
    if (filterValues.category) newFilters.category = filterValues.category;
    if (filterValues.minPrice) newFilters.minPrice = parseFloat(filterValues.minPrice);
    if (filterValues.maxPrice) newFilters.maxPrice = parseFloat(filterValues.maxPrice);
    
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Goods</h1>
        <p className="text-gray-600 mt-2">Find quality products for sale or lease</p>
      </div>

      <GoodsFilter onFilter={handleFilter} />

      <GoodsList 
        goods={goods} 
        isLoading={isLoading}
        emptyMessage="No goods found matching your criteria"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
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
    </div>
  );
}