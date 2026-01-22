import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader, Copy } from 'lucide-react';

const GalleryUploader = ({ onUpload, categories, isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useSingleCaption, setUseSingleCaption] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  const [singleCaptionData, setSingleCaptionData] = useState({
    title: '',
    description: '',
    category: 'Worship Services'
  });

  const [multipleCaptions, setMultipleCaptions] = useState([]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // ✅ NEW: Helper to ensure file is ready before upload (fixes mobile timing issues)
  const ensureFileReady = (file) => {
    return new Promise((resolve, reject) => {
      if (!(file instanceof File || file instanceof Blob)) {
        reject(new Error('Invalid file object'));
        return;
      }

      // Read a small portion to verify file is accessible
      const reader = new FileReader();
      
      reader.onloadend = () => {
        console.log(`✅ File ready: ${file.name}`);
        resolve(file);
      };
      
      reader.onerror = () => {
        console.error(`❌ File not ready: ${file.name}`);
        reject(new Error(`File not accessible: ${file.name}`));
      };

      // Read just 1 byte to verify file is ready
      try {
        reader.readAsArrayBuffer(file.slice(0, 1));
      } catch (err) {
        reject(err);
      }
    });
  };

  // ✅ NEW: Retry logic for failed uploads
  const uploadWithRetry = async (formData, maxRetries = 2) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt} of ${maxRetries}`);
          // Exponential backoff: 1s, 2s, 4s...
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }

        const response = await onUpload(formData);
        console.log(`✅ Upload successful on attempt ${attempt + 1}`);
        return response;
        
      } catch (err) {
        lastError = err;
        console.error(`❌ Upload attempt ${attempt + 1} failed:`, err.message);
        
        // Don't retry if it's a validation error (4xx)
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          throw err;
        }
      }
    }
    
    throw lastError;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (selectedFiles) => {
    setError(null);
    const validFiles = [];

    selectedFiles.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPEG, PNG, WebP, GIF allowed.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name}. Max size is 5MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      
      // Initialize multiple captions if not in single caption mode
      if (!useSingleCaption) {
        setMultipleCaptions(prev => [
          ...prev,
          ...validFiles.map((_, idx) => ({
            title: '',
            description: '',
            category: 'Worship Services'
          }))
        ]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    if (!useSingleCaption) {
      setMultipleCaptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSingleCaptionChange = (e) => {
    const { name, value } = e.target;
    setSingleCaptionData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultipleCaptionChange = (index, field, value) => {
    setMultipleCaptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const applySingleCaptionToAll = () => {
    if (files.length === 0) {
      setError('Please select files first');
      return;
    }

    setMultipleCaptions(
      files.map(() => ({
        title: singleCaptionData.title,
        description: singleCaptionData.description,
        category: singleCaptionData.category
      }))
    );
    setUseSingleCaption(false);
  };

  // ============================================
// REPLACE handleUpload function in GalleryUploader.jsx
// Find the existing handleUpload and replace it with this
// ============================================

const handleUpload = async (e) => {
  e.preventDefault();

  if (files.length === 0) {
    setError('Please select at least one photo');
    return;
  }

  if (useSingleCaption && !singleCaptionData.title.trim()) {
    setError('Please enter a title');
    return;
  }

  if (!useSingleCaption) {
    const allHaveTitles = multipleCaptions.every(cap => cap.title.trim());
    if (!allHaveTitles) {
      setError('All photos must have a title');
      return;
    }
  }

  setUploading(true);
  setError(null);
  setUploadProgress(0);

  // ✅ Detect mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // ✅ Give mobile devices extra preparation time
  if (isMobile) {
    console.log('📱 Mobile device detected - optimizing upload strategy');
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  let uploadedCount = 0;
  const totalFiles = files.length;
  const failedUploads = [];

  try {
    // ✅ MOBILE: Upload files sequentially (one at a time)
    // ✅ DESKTOP: Upload files in parallel (faster)
    if (isMobile) {
      console.log('📱 Using sequential upload for mobile stability');
      
      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        
        try {
          console.log(`📤 Mobile upload ${idx + 1}/${totalFiles}: ${file.name}`);

          // ✅ Ensure file is ready before upload
          const readyFile = await ensureFileReady(file);

          const uploadFormData = new FormData();
          uploadFormData.append('photo', readyFile);

          if (useSingleCaption) {
            uploadFormData.append('title', `${singleCaptionData.title}${totalFiles > 1 ? ` - ${idx + 1}` : ''}`);
            uploadFormData.append('description', singleCaptionData.description);
            uploadFormData.append('category', singleCaptionData.category);
          } else {
            uploadFormData.append('title', multipleCaptions[idx]?.title || `Photo ${idx + 1}`);
            uploadFormData.append('description', multipleCaptions[idx]?.description || '');
            uploadFormData.append('category', multipleCaptions[idx]?.category || 'Worship Services');
          }

          // ✅ Upload with automatic retry
          await uploadWithRetry(uploadFormData);
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));

          // ✅ Small delay between uploads to prevent mobile browser overload
          if (idx < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }

        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          failedUploads.push(file.name);
        }
      }
      
    } else {
      // ✅ DESKTOP: Parallel uploads (existing logic)
      console.log('💻 Using parallel upload for desktop speed');
      
      const uploadPromises = files.map(async (file, idx) => {
        try {
          console.log(`📤 Preparing upload ${idx + 1}/${totalFiles}: ${file.name}`);

          const readyFile = await ensureFileReady(file);

          const uploadFormData = new FormData();
          uploadFormData.append('photo', readyFile);

          if (useSingleCaption) {
            uploadFormData.append('title', `${singleCaptionData.title}${totalFiles > 1 ? ` - ${idx + 1}` : ''}`);
            uploadFormData.append('description', singleCaptionData.description);
            uploadFormData.append('category', singleCaptionData.category);
          } else {
            uploadFormData.append('title', multipleCaptions[idx]?.title || `Photo ${idx + 1}`);
            uploadFormData.append('description', multipleCaptions[idx]?.description || '');
            uploadFormData.append('category', multipleCaptions[idx]?.category || 'Worship Services');
          }

          await uploadWithRetry(uploadFormData);
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));

        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          failedUploads.push(file.name);
        }
      });

      await Promise.all(uploadPromises);
    }

    // Check results
    if (failedUploads.length === 0) {
      setSuccess(true);
      setSingleCaptionData({ title: '', description: '', category: 'Worship Services' });
      setMultipleCaptions([]);
      setFiles([]);
      setUseSingleCaption(true);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      setError(`Upload completed with errors. Failed files: ${failedUploads.join(', ')}. Successfully uploaded: ${uploadedCount}/${totalFiles}`);
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Network error. Please check your connection and try again.';
    setError(`Upload failed: ${uploadedCount}/${totalFiles} files uploaded. ${errorMessage}`);
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full m-0 sm:m-8 min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-lg z-10 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload Photos</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition" disabled={uploading}>
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 font-medium">Photos uploaded successfully!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">Uploading...</p>
                <p className="text-sm font-medium text-blue-900">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            ref={dragRef}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center transition-colors bg-gray-50 hover:border-blue-400 hover:bg-blue-50 ${
              uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Upload size={32} className="mx-auto mb-2 sm:mb-3 text-gray-400 sm:w-10 sm:h-10" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Drag & drop photos here</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">or click to select files</p>
            <div className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
              Browse Files
            </div>
            <p className="text-xs text-gray-500 mt-3 sm:mt-4">Supported: JPG, PNG, WebP, GIF (Max 5MB each)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Selected Files ({files.length})</p>
              <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition ml-2"
                      disabled={uploading}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                <div className="relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full flex-shrink-0" style={{ backgroundColor: useSingleCaption ? '#2563eb' : '#d1d5db' }}>
                  <span
                    className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition ${
                      useSingleCaption ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {useSingleCaption ? 'One caption for all' : 'Unique caption per photo'}
                  </p>
                  <p className="text-xs text-gray-600 hidden sm:block">
                    {useSingleCaption
                      ? 'Same title/description for all photos'
                      : 'Each photo has its own title/description'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={useSingleCaption}
                  onChange={(e) => setUseSingleCaption(e.target.checked)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4">
            {useSingleCaption ? (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={singleCaptionData.title}
                    onChange={handleSingleCaptionChange}
                    placeholder="e.g., Sunday Morning Worship"
                    disabled={uploading}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                    required
                  />
                  {files.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">Will be appended with - 1, - 2, etc.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={singleCaptionData.description}
                    onChange={handleSingleCaptionChange}
                    placeholder="Add details about these photos..."
                    rows="2"
                    disabled={uploading}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={singleCaptionData.category}
                    onChange={handleSingleCaptionChange}
                    disabled={uploading}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="border border-gray-300 rounded-lg overflow-hidden max-h-64 sm:max-h-96 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div key={idx} className={`p-3 sm:p-4 ${idx > 0 ? 'border-t border-gray-200' : ''}`}>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 truncate">{file.name}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={multipleCaptions[idx]?.title || ''}
                            onChange={(e) => handleMultipleCaptionChange(idx, 'title', e.target.value)}
                            placeholder="Photo title"
                            disabled={uploading}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={multipleCaptions[idx]?.description || ''}
                            onChange={(e) => handleMultipleCaptionChange(idx, 'description', e.target.value)}
                            placeholder="Optional description"
                            rows="2"
                            disabled={uploading}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={multipleCaptions[idx]?.category || 'Worship Services'}
                            onChange={(e) => handleMultipleCaptionChange(idx, 'category', e.target.value)}
                            disabled={uploading}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={applySingleCaptionToAll}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    disabled={uploading}
                  >
                    <Copy size={14} className="sm:w-4 sm:h-4" />
                    Apply Single Caption to All
                  </button>
                )}
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Uploading...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Upload {files.length > 0 ? `(${files.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryUploader;