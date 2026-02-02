'use client';

import React, { useState } from 'react';
import { Vendor, VendorStatus } from '@/types/vendor.types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Check, X, AlertTriangle, Eye } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { VENDOR_STATUSES } from '@/utils/constants';

interface VendorTableProps {
  vendors: Vendor[];
  onVerify: (vendorId: string) => Promise<void>;
  onReject: (vendorId: string, reason: string) => Promise<void>;
  onSuspend: (vendorId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export default function VendorTable({
  vendors,
  onVerify,
  onReject,
  onSuspend,
  isLoading = false,
}: VendorTableProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [actionType, setActionType] = useState<'view' | 'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    if (!selectedVendor) return;

    setProcessing(true);
    try {
      if (actionType === 'reject') {
        await onReject(selectedVendor._id, reason);
      } else if (actionType === 'suspend') {
        await onSuspend(selectedVendor._id, reason);
      }
      setSelectedVendor(null);
      setActionType(null);
      setReason('');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: VendorStatus) => {
    const statusConfig = VENDOR_STATUSES.find((s) => s.value === status);
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusConfig?.color as keyof typeof colors || 'gray']}`}>
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
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
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
              {vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {vendor.businessName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                        <div className="text-sm text-gray-500">{vendor.businessEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof vendor.user === 'object' ? `${vendor.user.firstName} ${vendor.user.lastName}` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeof vendor.user === 'object' ? vendor.user.email : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vendor.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(vendor.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setActionType('view');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {vendor.status === VendorStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              setProcessing(true);
                              await onVerify(vendor._id);
                              setProcessing(false);
                            }}
                            disabled={processing}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setActionType('reject');
                            }}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {vendor.status === VendorStatus.VERIFIED && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setActionType('suspend');
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </Button>
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
        isOpen={actionType === 'view' && !!selectedVendor}
        onClose={() => {
          setSelectedVendor(null);
          setActionType(null);
        }}
        title="Vendor Details"
        size="lg"
      >
        {selectedVendor && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Business Name</h4>
              <p className="text-gray-600">{selectedVendor.businessName}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="text-gray-600">{selectedVendor.businessDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Address</h4>
                <p className="text-gray-600">{selectedVendor.businessAddress || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Phone</h4>
                <p className="text-gray-600">{selectedVendor.businessPhone || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Total Goods</h4>
              <p className="text-gray-600">{selectedVendor.totalGoods}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject/Suspend Modal */}
      <Modal
        isOpen={(actionType === 'reject' || actionType === 'suspend') && !!selectedVendor}
        onClose={() => {
          setSelectedVendor(null);
          setActionType(null);
          setReason('');
        }}
        title={actionType === 'reject' ? 'Reject Vendor' : 'Suspend Vendor'}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for {actionType === 'reject' ? 'rejecting' : 'suspending'} this vendor.
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
                setSelectedVendor(null);
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
              {actionType === 'reject' ? 'Reject' : 'Suspend'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}