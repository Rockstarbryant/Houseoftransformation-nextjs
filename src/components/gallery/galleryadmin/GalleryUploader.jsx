import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader, Copy } from 'lucide-react';

/**
 * FIXES APPLIED:
 * 1. Multi-file uploads now work: sequential upload loop instead of only files[0]
 * 2. Mobile "Network Error" fix: ArrayBuffer → forced MIME type Blob prevents Android from losing content-type
 * 3. Progress tracking per-file shown to user
 * 4. Sequential uploads (not parallel) to avoid mobile connection limits
 * 5. Title auto-numbering for multi-file single-caption mode
 */
const GalleryUploader = ({ onUpload, categories, isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useSingleCaption, setUseSingleCaption] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  const [singleCaptionData, setSingleCaptionData] = useState({
    title: '',
    description: '',
    category: categories?.[0] || 'Worship Services'
  });

  const [multipleCaptions, setMultipleCaptions] = useState([]);

  const isBraveBrowser = () =>
    (navigator.brave && typeof navigator.brave.isBrave === 'function') ||
    /Brave/i.test(navigator.userAgent);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // ─── File Preparation ────────────────────────────────────────────────────
  /**
   * Reads the full file into memory and reconstructs as a Blob with an
   * *explicit* MIME type. This is the key fix for Android Chrome/Brave:
   * on some Android versions the original File object loses its type when
   * passed through FormData, causing multer's fileFilter to reject it.
   */
  const prepareFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Force the MIME type we already validated — never let it be empty
        const mimeType = file.type || 'image/jpeg';
        const stableBlob = new Blob([e.target.result], { type: mimeType });
        resolve({ blob: stableBlob, name: file.name, type: mimeType });
      };
      reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  };

  // ─── Drag & Drop Handlers ────────────────────────────────────────────────
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current?.classList.add('border-blue-500', 'bg-blue-50');
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
  };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
    processFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileSelect = (e) => processFiles(Array.from(e.target.files));

  const processFiles = (selectedFiles) => {
    setError(null);
    const validFiles = [];
    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid type: ${file.name}. Only JPEG, PNG, WebP, GIF allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`Too large: ${file.name}. Max 5MB per file.`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      if (!useSingleCaption) {
        setMultipleCaptions(prev => [
          ...prev,
          ...validFiles.map(() => ({ title: '', description: '', category: categories?.[0] || 'Worship Services' }))
        ]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
    if (!files.length) return setError('Please select files first');
    setMultipleCaptions(files.map(() => ({ ...singleCaptionData })));
    setUseSingleCaption(false);
  };

  // ─── Core Upload Handler ─────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return setError('Please select at least one photo');
    if (!singleCaptionData.title.trim() && useSingleCaption) return setError('Title is required');

    // Validate multi-caption titles
    if (!useSingleCaption) {
      for (let i = 0; i < files.length; i++) {
        if (!multipleCaptions[i]?.title?.trim()) {
          return setError(`Title required for photo ${i + 1}: ${files[i].name}`);
        }
      }
    }

    setUploading(true);
    setError(null);
    setUploadProgress({ current: 0, total: files.length, percent: 0 });

    let successCount = 0;
    const errors = [];

    // ── Sequential uploads (critical for mobile stability) ──
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length, percent: Math.round(((i) / files.length) * 100) });

      try {
        // Step 1: Read file into memory and create a stable blob with forced MIME
        const { blob, name, type } = await prepareFile(file);

        // Step 2: Build FormData
        const formData = new FormData();
        // Append blob with explicit filename — this is crucial for multer on mobile
        formData.append('photo', blob, name);

        // Step 3: Determine caption for this file
        let title, description, category;
        if (useSingleCaption) {
          // For multi-file: append " - N" suffix so each DB record has unique title
          title = files.length > 1
            ? `${singleCaptionData.title.trim()} - ${i + 1}`
            : singleCaptionData.title.trim();
          description = singleCaptionData.description?.trim() || '';
          category = singleCaptionData.category;
        } else {
          title = multipleCaptions[i]?.title?.trim() || 'Untitled';
          description = multipleCaptions[i]?.description?.trim() || '';
          category = multipleCaptions[i]?.category || categories?.[0] || 'Worship Services';
        }

        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);

        // Step 4: Upload — onUpload is provided by the parent page
        await onUpload(formData);
        successCount++;

        setUploadProgress({ current: i + 1, total: files.length, percent: Math.round(((i + 1) / files.length) * 100) });

      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        const msg = err?.response?.data?.message || err?.message || 'Unknown error';
        errors.push(`${file.name}: ${msg}`);
      }
    }

    setUploading(false);

    if (successCount === files.length) {
      // All succeeded
      setSuccess(true);
      setUploadProgress({ current: files.length, total: files.length, percent: 100 });
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFiles([]);
        setMultipleCaptions([]);
        setSingleCaptionData({ title: '', description: '', category: categories?.[0] || 'Worship Services' });
        setUploadProgress({ current: 0, total: 0, percent: 0 });
      }, 2000);
    } else if (successCount > 0) {
      // Partial success
      setError(`${successCount}/${files.length} uploaded. Failures:\n${errors.join('\n')}`);
      // Remove successfully uploaded files from the list
      const failedNames = errors.map(e => e.split(':')[0]);
      setFiles(prev => prev.filter(f => failedNames.includes(f.name)));
    } else {
      // All failed
      setError(`All uploads failed:\n${errors.join('\n')}`);
    }
  };

  if (!isOpen) return null;

  const progressPercent = uploadProgress.percent;

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

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Success */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 font-medium">
                {files.length > 1 ? `All ${files.length} photos uploaded!` : 'Photo uploaded successfully!'}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <pre className="text-red-800 font-medium text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Brave warning */}
          {isBraveBrowser() && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-800 font-semibold text-sm mb-1">Brave Browser Detected</p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  If uploads fail, disable Brave Shields for this site:<br />
                  <strong>1.</strong> Click the lion icon in the address bar<br />
                  <strong>2.</strong> Toggle "Shields" OFF<br />
                  <strong>3.</strong> Refresh and try again
                </p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">
                  Uploading {uploadProgress.current} of {uploadProgress.total}...
                </p>
                <p className="text-sm font-medium text-blue-900">{progressPercent}%</p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            ref={dragRef}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center transition-colors bg-gray-50 hover:border-blue-400 hover:bg-blue-50 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Upload size={32} className="mx-auto mb-2 sm:mb-3 text-gray-400 sm:w-10 sm:h-10" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Drag & drop photos here</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">or click to select files</p>
            <div className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
              Browse Files
            </div>
            <p className="text-xs text-gray-500 mt-3 sm:mt-4">Supported: JPG, PNG, WebP, GIF · Max 5MB each</p>
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

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                Selected Files ({files.length})
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
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

          {/* Multi-file caption mode toggle */}
          {files.length > 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                <div
                  className="relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full flex-shrink-0"
                  style={{ backgroundColor: useSingleCaption ? '#2563eb' : '#d1d5db' }}
                >
                  <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition ${useSingleCaption ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {useSingleCaption ? 'One caption for all (titles auto-numbered)' : 'Unique caption per photo'}
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
                    <p className="text-xs text-gray-500 mt-1">Will be saved as "Title - 1", "Title - 2", etc.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Description (Optional)</label>
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
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Category *</label>
                  <select
                    name="category"
                    value={singleCaptionData.category}
                    onChange={handleSingleCaptionChange}
                    disabled={uploading}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
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
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
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
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                          <select
                            value={multipleCaptions[idx]?.category || categories?.[0] || 'Worship Services'}
                            onChange={(e) => handleMultipleCaptionChange(idx, 'category', e.target.value)}
                            disabled={uploading}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                          >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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

            {/* Action Buttons */}
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
                    <span>{uploadProgress.current}/{uploadProgress.total}</span>
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