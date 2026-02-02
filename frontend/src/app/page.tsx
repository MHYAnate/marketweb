'use client';

import  { useEffect, useState } from 'react';
import Link from 'next/link';
import { Goods } from '@/types/goods.types';
import { goodsService } from '@/services/goods.service';
import GoodsList from '@/components/goods/GoodsList';
import Button from '@/components/ui/Button';
import { ArrowRight, ShoppingBag, Shield, Truck } from 'lucide-react';

export default function HomePage() {
  const [featuredGoods, setFeaturedGoods] = useState<Goods[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const response = await goodsService.getAll({ limit: 8 });
        setFeaturedGoods(response.goods);
      } catch (error) {
        console.error('Error fetching goods:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoods();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-rose-800">
              Find Quality Goods from Verified Vendors
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Browse thousands of products for sale or lease. Connect with trusted
              vendors and find exactly what you need.
            </p>
            <div className="flex gap-4">
              <Link href="/goods">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Browse Goods
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Vendors</h3>
              <p className="text-gray-600">
                All vendors are verified by our team to ensure quality and trust.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Find products for sale or lease across multiple categories.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Transactions</h3>
              <p className="text-gray-600">
                Simple and secure process for buying and leasing goods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Goods Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Goods</h2>
            <Link href="/goods">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <GoodsList goods={featuredGoods} isLoading={isLoading} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join our marketplace as a vendor and reach thousands of potential
            customers. It's free to get started.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}