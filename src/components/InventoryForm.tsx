'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon, Sparkles, Plus } from 'lucide-react';
import { Button, Input, Textarea, Select, Card, Spinner, Badge } from './ui';
import { CATEGORIES, validateImageFile } from '@/lib/validation';
import { fetchApiWithFormData } from '@/lib/utils';
import { InventoryItem } from '@/db/schema';

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InventoryForm({
  initialData,
  onSuccess,
  onCancel,
}: InventoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Other',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle image selection with preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(initialData?.imageUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Identifiable name required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Limit: 255 characters';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      newErrors.price = 'Numerical value required';
    } else if (price <= 0) {
      newErrors.price = 'Positive value required';
    }

    const stock = parseInt(formData.stock, 10);
    if (!formData.stock || isNaN(stock)) {
      newErrors.stock = 'Integer required';
    } else if (stock < 0) {
      newErrors.stock = 'Non-negative required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Validation protocol failed');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const apiPath = initialData ? `/api/items/${initialData.id}` : '/api/items';
      const method = (initialData ? 'PUT' : 'POST') as 'POST' | 'PUT';

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + 5;
        });
      }, 100);

      const response = await fetchApiWithFormData(apiPath, formDataToSend, method);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.success) {
        throw new Error(response.error || 'Sync failed');
      }

      toast.success(initialData ? 'Asset synchronized' : 'Asset cataloged');

      setFormData({
        name: '',
        description: '',
        category: 'Other',
        price: '',
        stock: '',
      });
      setImageFile(null);
      setImagePreview(null);
      
      
      if (onSuccess) onSuccess();
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || 'System error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <div className="w-full bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="space-y-6">
          {/* Image Uploader */}
          <div className="space-y-2">
             <label className="text-sm font-medium text-neutral-500 ml-1">Asset Image</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`relative h-44 w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 ${
                 imagePreview ? 'border-primary bg-primary/2' : 'border-neutral-200 hover:border-primary/40 hover:bg-primary/2'
               }`}
             >
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button variant="danger" size="sm" onClick={handleRemoveImage}>
                         <X className="w-4 h-4 mr-2" /> Replace
                       </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                      <ImageIcon className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-bold text-primary">Upload Asset Image</p>
                       <p className="text-xs text-neutral-400">Drag & drop or click to browse</p>
                    </div>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
             </div>
          </div>

          <div className="space-y-5">
            <Input
              label="Asset Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="System-X Hybrid"
              error={errors.name}
            />

            <div className="grid grid-cols-2 gap-4">
               <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categoryOptions}
              />
               <Input
                label="Value (ETB)"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                error={errors.price}
              />
            </div>

            <Input
              label="Stock Amount (Pcs)"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              error={errors.stock}
            />

            <Textarea
              label="Product Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Full documentation and logs..."
              error={errors.description}
            />
          </div>

          {/* Action Footer */}
          <div className="pt-5 border-t border-neutral-100 flex gap-3">
             {onCancel && (
               <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                 Cancel
               </Button>
             )}
             <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="flex-1 shadow-md shadow-primary/20">
                {!initialData && <Plus className="w-5 h-5" />}
                {initialData ? 'Save & Update' : 'Add Asset'}
             </Button>
          </div>
        </div>

        {/* Dynamic Progress Loader */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 4 }}
              exit={{ height: 0 }}
              className="bg-primary w-full mt-4 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}