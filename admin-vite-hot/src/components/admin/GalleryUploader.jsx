import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader, Copy } from 'lucide-react';

const GalleryUploader = ({ onUpload, categories, isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useSingleCaption, setUseSingleCaption] = useState(true);
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

    let uploadedCount = 0;
    const totalFiles = files.length;

    try {
      const uploadPromises = files.map((file, idx) => {
        const uploadFormData = new FormData();
        uploadFormData.append('photo', file);

        if (useSingleCaption) {
          uploadFormData.append('title', `${singleCaptionData.title}${totalFiles > 1 ? ` - ${idx + 1}` : ''}`);
          uploadFormData.append('description', singleCaptionData.description);
          uploadFormData.append('category', singleCaptionData.category);
        } else {
          uploadFormData.append('title', multipleCaptions[idx]?.title || `Photo ${idx + 1}`);
          uploadFormData.append('description', multipleCaptions[idx]?.description || '');
          uploadFormData.append('category', multipleCaptions[idx]?.category || 'Worship Services');
        }

        return onUpload(uploadFormData)
          .then(() => {
            uploadedCount++;
          })
          .catch(err => {
            console.error(`Failed to upload ${file.name}:`, err);
            throw err;
          });
      });

      await Promise.all(uploadPromises);

      setSuccess(true);
      setSingleCaptionData({ title: '', description: '', category: 'Worship Services' });
      setMultipleCaptions([]);
      setFiles([]);
      setUseSingleCaption(true);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(`Upload failed: ${uploadedCount}/${totalFiles} files uploaded. ${err.message || 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900">Upload Photos</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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

          {/* Drag & Drop Area */}
          <div
            ref={dragRef}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors cursor-pointer bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          >
            <Upload size={40} className="mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Drag & drop photos here</h3>
            <p className="text-sm text-gray-600 mb-4">or click to select files</p>
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
              Browse Files
            </div>
            <p className="text-xs text-gray-500 mt-4">Supported: JPG, PNG, WebP, GIF (Max 5MB each)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Selected Files ({files.length})</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
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
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative inline-flex h-6 w-11 items-center rounded-full" style={{ backgroundColor: useSingleCaption ? '#2563eb' : '#d1d5db' }}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      useSingleCaption ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {useSingleCaption ? 'One caption for all' : 'Unique caption per photo'}
                  </p>
                  <p className="text-xs text-gray-600">
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
                />
              </label>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {useSingleCaption ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={singleCaptionData.title}
                    onChange={handleSingleCaptionChange}
                    placeholder="e.g., Sunday Morning Worship"
                    disabled={uploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                    required
                  />
                  {files.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">Will be appended with - 1, - 2, etc.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={singleCaptionData.description}
                    onChange={handleSingleCaptionChange}
                    placeholder="Add details about these photos..."
                    rows="2"
                    disabled={uploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={singleCaptionData.category}
                    onChange={handleSingleCaptionChange}
                    disabled={uploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="border border-gray-300 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div key={idx} className={`p-4 ${idx > 0 ? 'border-t border-gray-200' : ''}`}>
                      <p className="text-sm font-semibold text-gray-900 mb-3">{file.name}</p>
                      
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
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    disabled={uploading}
                  >
                    <Copy size={16} />
                    Apply Single Caption to All
                  </button>
                )}
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
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