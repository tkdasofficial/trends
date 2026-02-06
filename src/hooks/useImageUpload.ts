import { useState, useCallback } from 'react';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  compressed: string;
  status: 'processing' | 'ready' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const TARGET_SIZE = 500 * 1024; // 500KB
const MAX_IMAGES = 5;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if very large
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels to hit target size
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);

        while (result.length > TARGET_SIZE * 1.37 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function useImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const addImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be under 5MB';
    }
    if (images.length >= MAX_IMAGES) {
      return `Maximum ${MAX_IMAGES} images allowed`;
    }

    const id = crypto.randomUUID();
    const preview = URL.createObjectURL(file);

    setImages(prev => [...prev, { id, file, preview, compressed: '', status: 'processing' }]);

    try {
      const compressed = await compressImage(file);
      setImages(prev =>
        prev.map(img => img.id === id ? { ...img, compressed, status: 'ready' as const } : img)
      );
      return null;
    } catch {
      setImages(prev =>
        prev.map(img => img.id === id ? { ...img, status: 'error' as const, error: 'Compression failed' } : img)
      );
      return 'Failed to process image';
    }
  }, [images.length]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  return { images, addImage, removeImage, maxImages: MAX_IMAGES };
}
