import { apiClient } from './api-client';
import { toast } from 'sonner';

export interface UploadConfig {
  maxSizeMB: number;
  allowedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
  compressionQuality?: number;
}

const defaultConfig: UploadConfig = {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  compressionQuality: 0.8,
};

export const uploadConfigs = {
  profilePhoto: {
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxWidth: 500,
    maxHeight: 500,
    compressionQuality: 0.85,
  },
  vendorLogo: {
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxWidth: 400,
    maxHeight: 400,
    compressionQuality: 0.9,
  },
  vendorBanner: {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 1920,
    maxHeight: 600,
    compressionQuality: 0.85,
  },
  vendorGallery: {
    maxSizeMB: 3,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 1200,
    maxHeight: 1200,
    compressionQuality: 0.8,
  },
};

export class UploadService {
  /**
   * Validate file before upload
   */
  static validateFile(file: File, config: UploadConfig = defaultConfig): string | null {
    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.maxSizeMB) {
      return `File size exceeds ${config.maxSizeMB}MB limit. Current size: ${fileSizeMB.toFixed(2)}MB`;
    }

    return null;
  }

  /**
   * Compress image before upload
   */
  static compressImage(
    file: File,
    config: UploadConfig = defaultConfig
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Resize if needed
          if (config.maxWidth && width > config.maxWidth) {
            height = (height * config.maxWidth) / width;
            width = config.maxWidth;
          }
          if (config.maxHeight && height > config.maxHeight) {
            width = (width * config.maxHeight) / height;
            height = config.maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            file.type,
            config.compressionQuality || 0.8
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload profile photo
   */
  static async uploadProfilePhoto(
    file: File,
    userEmail: string
  ): Promise<string> {
    const config = uploadConfigs.profilePhoto;
    
    // Validate
    const error = this.validateFile(file, config);
    if (error) {
      toast.error(error);
      throw new Error(error);
    }

    try {
      // Compress
      const compressedBlob = await this.compressImage(file, config);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name);
      formData.append('email', userEmail);

      // Upload
      const response = await apiClient.post('/customer/upload/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload profile photo');
      throw error;
    }
  }

  /**
   * Upload vendor logo
   */
  static async uploadVendorLogo(
    file: File,
    vendorEmail: string
  ): Promise<string> {
    const config = uploadConfigs.vendorLogo;
    
    const error = this.validateFile(file, config);
    if (error) {
      toast.error(error);
      throw new Error(error);
    }

    try {
      const compressedBlob = await this.compressImage(file, config);
      
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name);
      formData.append('email', vendorEmail);

      const response = await apiClient.post('/vendor/upload/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload logo');
      throw error;
    }
  }

  /**
   * Upload vendor banner
   */
  static async uploadVendorBanner(
    file: File,
    vendorEmail: string
  ): Promise<string> {
    const config = uploadConfigs.vendorBanner;
    
    const error = this.validateFile(file, config);
    if (error) {
      toast.error(error);
      throw new Error(error);
    }

    try {
      const compressedBlob = await this.compressImage(file, config);
      
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name);
      formData.append('email', vendorEmail);

      const response = await apiClient.post('/vendor/upload/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload banner');
      throw error;
    }
  }

  /**
   * Upload vendor gallery image
   */
  static async uploadVendorGalleryImage(
    file: File,
    vendorEmail: string
  ): Promise<string> {
    const config = uploadConfigs.vendorGallery;
    
    const error = this.validateFile(file, config);
    if (error) {
      toast.error(error);
      throw new Error(error);
    }

    try {
      const compressedBlob = await this.compressImage(file, config);
      
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name);
      formData.append('email', vendorEmail);

      const response = await apiClient.post('/vendor/upload/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload gallery image');
      throw error;
    }
  }

  /**
   * Delete gallery image
   */
  static async deleteGalleryImage(
    imageId: string,
    vendorEmail: string
  ): Promise<void> {
    try {
      await apiClient.delete(`/vendor/gallery/${imageId}?email=${vendorEmail}`);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image');
      throw error;
    }
  }

  /**
   * Create preview URL from file
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}
