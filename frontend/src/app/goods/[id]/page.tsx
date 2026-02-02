'use client';

import  { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Goods, GoodsType } from '@/types/goods.types';
import { goodsService } from '@/services/goods.service';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import { formatPrice, formatDate, getImageUrl } from '@/utils/helpers';
import { MapPin, Eye, Calendar, Tag, User, ArrowLeft } from 'lucide-react';

export default function GoodsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [goods, setGoods] = useState<Goods | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const data = await goodsService.getById(params.id as string);
        setGoods(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load goods');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchGoods();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Loading size="lg" text="Loading goods..." />
      </div>
    );
  }

  if (error || !goods) {
    return (
      <div className="container py-12">
        <Alert type="error">{error || 'Goods not found'}</Alert>
        <Button onClick={() => router.back()} variant="ghost" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button onClick={() => router.back()} variant="ghost" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Goods
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {goods.images?.[selectedImage] ? (
              <Image
                src={getImageUrl(goods.images[selectedImage])}
                alt={goods.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {goods.images && goods.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {goods.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${goods.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              goods.type === GoodsType.SALE
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {goods.type === GoodsType.SALE ? 'For Sale' : 'For Lease'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{goods.title}</h1>

          <div className="text-3xl font-bold text-primary-600 mb-6">
            {formatPrice(goods.price)}
            {goods.type === GoodsType.LEASE && (
              <span className="text-lg font-normal text-gray-500">/month</span>
            )}
          </div>

          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              {goods.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{goods.location}</span>
                </div>
              )}
              {goods.category && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="h-5 w-5" />
                  <span>{goods.category}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="h-5 w-5" />
                <span>{goods.views} views</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>Posted {formatDate(goods.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{goods.description}</p>
          </div>

          {/* Vendor Info */}
          {typeof goods.vendor === 'object' && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Vendor Information</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{goods.vendor.businessName}</p>
                    <p className="text-sm text-gray-500">{goods.vendor.totalGoods} listings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6">
            <Button size="lg" className="w-full">
              Contact Vendor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}