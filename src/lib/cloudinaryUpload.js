/**
 * Cloudinary Upload Utility (Client-Side)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Log in to Cloudinary Dashboard (https://cloudinary.com/console)
 * 2. Go to Settings → Upload → Upload Presets
 * 3. Click "Add upload preset"
 * 4. Configure:
 *    - Preset name: user_avatars (or any name you prefer)
 *    - Signing mode: Unsigned
 *    - Folder: hot-church/user-avatars
 *    - Format: Auto
 *    - Transformation: Limit dimensions (e.g., 500x500, crop: limit)
 *    - Access mode: Public
 * 5. Save the preset
 * 6. Add to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=user_avatars
 */

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file from input
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} - { success, url, publicId, error }
 */
export const uploadToCloudinary = async (file, onProgress = null) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'user_avatars';

  if (!cloudName) {
    console.error('[CLOUDINARY] Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    return {
      success: false,
      error: 'Cloudinary configuration missing'
    };
  }

  // Validate file
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Invalid file type. Please upload JPG, PNG, or WebP images.'
    };
  }

  if (file.size > maxSize) {
    return {
      success: false,
      error: 'File too large. Maximum size is 5MB.'
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'hot-church/user-avatars');
    
    // Optional: Add tags for better organization
    formData.append('tags', 'user_avatar,profile');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();

    console.log('[CLOUDINARY] ✅ Upload successful:', data.secure_url);

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format
    };
  } catch (error) {
    console.error('[CLOUDINARY] Upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

/**
 * Delete image from Cloudinary (requires backend API call with authentication)
 * This is just a helper - actual deletion should be done server-side
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  // This should be called via your backend API
  // Backend will use Cloudinary Admin API with credentials
  console.warn('[CLOUDINARY] Delete must be done server-side');
  return {
    success: false,
    error: 'Delete must be done through backend API'
  };
};

/**
 * Get optimized image URL
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 500,
    height = 500,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  // Insert transformation parameters into URL
  const transformation = `c_${crop},h_${height},q_${quality},w_${width},f_${format}`;
  
  return url.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Compress image before upload (optional - for better UX)
 * @param {File} file - Image file
 * @param {number} maxWidth - Max width
 * @param {number} maxHeight - Max height
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>}
 */
export const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
  });
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  compressImage
};