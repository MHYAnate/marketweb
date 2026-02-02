'use client';

import  { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { GoodsType, CreateGoodsData } from '@/types/goods.types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Upload, X, Loader2 } from 'lucide-react';
import { DEFAULT_CATEGORIES, GOODS_TYPES } from '@/utils/constants';
import api from '@/services/api';
import toast from 'react-hot-toast';

const goodsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  type: z.nativeEnum(GoodsType),
  category: z.string().optional(),
  location: z.string().optional(),
});

type GoodsFormData = z.infer<typeof goodsSchema>;

interface UploadedImage {
  public_id: string;
  secure_url: string;
}

interface GoodsFormProps {
  onSubmit: (data: CreateGoodsData) => Promise<void>;
  initialData?: Partial<CreateGoodsData>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function GoodsForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitLabel = 'Create Goods',
}: GoodsFormProps) {
  const [images, setImages] = useState<UploadedImage[]>(() => {
    // Convert initial image URLs to UploadedImage format
    if (initialData?.images) {
      return initialData.images.map((url) => ({
        public_id: '', // We don't have the public_id for existing images
        secure_url: url,
      }));
    }
    return [];
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoodsFormData>({
    resolver: zodResolver(goodsSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      type: initialData?.type || GoodsType.SALE,
      category: initialData?.category || '',
      location: initialData?.location || '',
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setUploadingImages(true);
    setUploadProgress(0);

    try {
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      const uploadedImages: UploadedImage[] = [];

      // Upload files one by one to show progress
      for (let i = 0; i < fileArray.length; i++) {
        const result = await api.uploadFile(fileArray[i], 'goods');
        uploadedImages.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setImages((prev) => [...prev, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    // Try to delete from Cloudinary if we have the public_id
    if (imageToRemove.public_id) {
      try {
        await api.deleteFile(imageToRemove.public_id);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Continue with local removal even if Cloudinary delete fails
      }
    }
    
    setImages((prev) => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const handleFormSubmit = async (data: GoodsFormData) => {
    const imageUrls = images.map((img) => img.secure_url);
    await onSubmit({
      ...data,
      images: imageUrls,
    });
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Goods Information</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <Input
            label="Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="Enter goods title"
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe your goods in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {GOODS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a category</option>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Location"
              {...register('location')}
              placeholder="City, State"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images ({images.length}/10)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages || images.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center ${
                  uploadingImages || images.length >= 10 ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-2" />
                    <span className="text-sm text-gray-600">
                      Uploading... {uploadProgress}%
                    </span>
                    <div className="w-full max-w-xs mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload images
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF, WebP up to 10MB each
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image.secure_url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="submit"
              isLoading={isLoading || uploadingImages}
              disabled={isLoading || uploadingImages}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}