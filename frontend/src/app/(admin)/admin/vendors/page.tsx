'use client';

import { useEffect, useState, useCallback } from 'react';
import { Vendor, VendorStatus } from '@/types/vendor.types';
import { adminService } from '@/services/admin.service';
import { vendorService } from '@/services/vendor.service';
import VendorTable from '@/components/admin/VendorTable';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<VendorStatus | ''>('');

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vendorService.getAll(
        currentPage,
        10,
        statusFilter || undefined
      );
      setVendors(response.vendors);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleVerify = async (vendorId: string) => {
    try {
      await adminService.verifyVendor(vendorId);
      toast.success('Vendor verified successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to verify vendor');
    }
  };

  const handleReject = async (vendorId: string, reason: string) => {
    try {
      await adminService.rejectVendor(vendorId, reason);
      toast.success('Vendor rejected');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to reject vendor');
    }
  };

  const handleSuspend = async (vendorId: string, reason: string) => {
    try {
      await adminService.suspendVendor(vendorId, reason);
      toast.success('Vendor suspended');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to suspend vendor');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Vendors</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as VendorStatus | '');
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value={VendorStatus.PENDING}>Pending</option>
          <option value={VendorStatus.VERIFIED}>Verified</option>
          <option value={VendorStatus.REJECTED}>Rejected</option>
          <option value={VendorStatus.SUSPENDED}>Suspended</option>
        </select>
      </div>

      {isLoading ? (
        <Loading size="lg" text="Loading vendors..." />
      ) : (
        <>
          <VendorTable
            vendors={vendors}
            onVerify={handleVerify}
            onReject={handleReject}
            onSuspend={handleSuspend}
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