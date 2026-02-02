'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Goods, GoodsStatus } from '@/types/goods.types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Check, Flag, Trash2, Eye } from 'lucide-react';
import { formatDate, formatPrice, getImageUrl } from '@/utils/helpers';
import { GOODS_STATUSES } from '@/utils/constants';

interface GoodsTableProps {
  goods: Goods[];
  onApprove: (goodsId: string) => Promise<void>;
  onFlag: (goodsId: string, reason: string) => Promise<void>;
  onDrop: (goodsId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export default function GoodsTable({
  goods,
  onApprove,
  onFlag,
  onDrop,
}: GoodsTableProps) {
  const [selectedGoods, setSelectedGoods] = useState<Goods | null>(null);
  const [actionType, setActionType] = useState<'view' | 'flag' | 'drop' | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    if (!selectedGoods) return;

    setProcessing(true);
    try {
      if (actionType === 'flag') {
        await onFlag(selectedGoods._id, reason);
      } else if (actionType === 'drop') {
        await onDrop(selectedGoods._id, reason);
      }
      setSelectedGoods(null);
      setActionType(null);
      setReason('');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: GoodsStatus) => {
    const statusConfig = GOODS_STATUSES.find((s) => s.value === status);
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusConfig?.color as keyof typeof colors || 'yellow']}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  return (
    <>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {goods.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {item.images?.[0] ? (
                          <Image
                            src={getImageUrl(item.images[0])}
                            alt={item.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof item.vendor === 'object' ? item.vendor.businessName : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</div>
                    <div className="text-xs text-gray-500">{item.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedGoods(item);
                          setActionType('view');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.status === GoodsStatus.PENDING && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            setProcessing(true);
                            await onApprove(item._id);
                            setProcessing(false);
                          }}
                          disabled={processing}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {item.status !== GoodsStatus.DROPPED && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedGoods(item);
                              setActionType('flag');
                            }}
                          >
                            <Flag className="h-4 w-4 text-orange-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedGoods(item);
                              setActionType('drop');
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={actionType === 'view' && !!selectedGoods}
        onClose={() => {
          setSelectedGoods(null);
          setActionType(null);
        }}
        title="Goods Details"
        size="lg"
      >
        {selectedGoods && (
          <div className="space-y-4">
            {selectedGoods.images?.[0] && (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(selectedGoods.images[0])}
                  alt={selectedGoods.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900">Title</h4>
              <p className="text-gray-600">{selectedGoods.title}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="text-gray-600">{selectedGoods.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Price</h4>
                <p className="text-gray-600">{formatPrice(selectedGoods.price)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Type</h4>
                <p className="text-gray-600 capitalize">{selectedGoods.type}</p>
              </div>
            </div>
            {selectedGoods.flagReason && (
              <div>
                <h4 className="font-medium text-red-600">Flag Reason</h4>
                <p className="text-gray-600">{selectedGoods.flagReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Flag/Drop Modal */}
      <Modal
        isOpen={(actionType === 'flag' || actionType === 'drop') && !!selectedGoods}
        onClose={() => {
          setSelectedGoods(null);
          setActionType(null);
          setReason('');
        }}
        title={actionType === 'flag' ? 'Flag Goods' : 'Drop Goods'}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for {actionType === 'flag' ? 'flagging' : 'dropping'} this item.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter reason..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedGoods(null);
                setActionType(null);
                setReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleAction}
              isLoading={processing}
              disabled={!reason.trim()}
            >
              {actionType === 'flag' ? 'Flag' : 'Drop'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}