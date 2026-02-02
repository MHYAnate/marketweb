'use client';

import  { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { vendorService } from '@/services/vendor.service';
import { Vendor, VendorStatus } from '@/types/vendor.types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';

const vendorSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessDescription: z.string().min(10, 'Description must be at least 10 characters'),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal('')),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function VendorProfilePage() {
  const { isVendor } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const data = await vendorService.getMyProfile();
        setVendor(data);
        if (data) {
          reset({
            businessName: data.businessName,
            businessDescription: data.businessDescription,
            businessAddress: data.businessAddress || '',
            businessPhone: data.businessPhone || '',
            businessEmail: data.businessEmail || '',
          });
        }
      } catch (error) {
        console.error('Error fetching vendor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendor();
  }, [reset]);

  const onSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    try {
      if (vendor) {
        await vendorService.update(vendor._id, data);
        toast.success('Profile updated successfully');
      } else {
        await vendorService.create(data);
        toast.success('Vendor profile created! Your account is pending approval.');
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading profile..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Vendor Profile</h1>

      {vendor && vendor.status === VendorStatus.PENDING && (
        <Alert type="warning" className="mb-6">
          Your vendor account is pending approval. You'll be notified once it's verified.
        </Alert>
      )}

      {vendor && vendor.status === VendorStatus.REJECTED && (
        <Alert type="error" className="mb-6" title="Account Rejected">
          {vendor.rejectionReason || 'Your vendor account was rejected. Please contact support.'}
        </Alert>
      )}

      {vendor && vendor.status === VendorStatus.VERIFIED && (
        <Alert type="success" className="mb-6">
          Your vendor account is verified! You can now add goods for sale or lease.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {vendor ? 'Update Profile' : 'Create Vendor Profile'}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Business Name"
              {...register('businessName')}
              error={errors.businessName?.message}
              placeholder="Your business name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                {...register('businessDescription')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your business..."
              />
              {errors.businessDescription && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.businessDescription.message}
                </p>
              )}
            </div>

            <Input
              label="Business Address"
              {...register('businessAddress')}
              placeholder="Your business address"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Phone"
                type="tel"
                {...register('businessPhone')}
                placeholder="+1 234 567 8900"
              />
              <Input
                label="Business Email"
                type="email"
                {...register('businessEmail')}
                error={errors.businessEmail?.message}
                placeholder="business@example.com"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                {vendor ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}