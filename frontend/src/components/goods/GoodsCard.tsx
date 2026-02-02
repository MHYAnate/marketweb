
import Link from 'next/link';
import Image from 'next/image';
import { Goods, GoodsType } from '@/types/goods.types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatPrice, getImageUrl, truncateText } from '@/utils/helpers';
import { MapPin, Eye, Tag } from 'lucide-react';

interface GoodsCardProps {
  goods: Goods;
}

export default function GoodsCard({ goods }: GoodsCardProps) {
  const imageUrl = goods.images?.[0] ? getImageUrl(goods.images[0]) : '/images/placeholder.png';

  return (
    <Link href={`/goods/${goods._id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-100">
          <Image
            src={imageUrl}
            alt={goods.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              goods.type === GoodsType.SALE 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {goods.type === GoodsType.SALE ? 'For Sale' : 'For Lease'}
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{truncateText(goods.title, 50)}</h3>
          <p className="text-sm text-gray-600 mb-3">{truncateText(goods.description, 80)}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(goods.price)}
              {goods.type === GoodsType.LEASE && <span className="text-sm font-normal">/month</span>}
            </span>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Eye className="h-4 w-4" />
              {goods.views}
            </div>
          </div>

          {goods.location && (
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {goods.location}
            </div>
          )}

          {goods.category && (
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <Tag className="h-4 w-4" />
              {goods.category}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}