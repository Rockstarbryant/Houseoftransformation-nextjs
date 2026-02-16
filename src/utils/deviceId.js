// utils/deviceId.js
// Generate and persist a unique device identifier for view tracking

/**
 * Get or create a persistent device ID for this browser
 * @returns {string} Unique device identifier
 */
export const getDeviceId = () => {
  const STORAGE_KEY = 'hot_device_id';
  
  try {
    // Try to get existing device ID
    let deviceId = localStorage.getItem(STORAGE_KEY);
    
    if (!deviceId) {
      // Generate new device ID: timestamp + random string
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    // Fallback if localStorage is not available (e.g., private browsing)
    console.warn('localStorage not available, using session-based device ID');
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * Check if a sermon has been viewed by this device
 * @param {string} sermonId - The sermon ID
 * @returns {boolean} True if already viewed
 */
export const hasViewedSermon = (sermonId) => {
  try {
    const viewedSermons = JSON.parse(localStorage.getItem('viewedSermons') || '{}');
    return !!viewedSermons[sermonId];
  } catch (error) {
    console.error('Error checking viewed sermons:', error);
    return false;
  }
};

/**
 * Mark a sermon as viewed
 * @param {string} sermonId - The sermon ID
 */
export const markSermonAsViewed = (sermonId) => {
  try {
    const viewedSermons = JSON.parse(localStorage.getItem('viewedSermons') || '{}');
    viewedSermons[sermonId] = {
      viewedAt: Date.now(),
      deviceId: getDeviceId()
    };
    localStorage.setItem('viewedSermons', JSON.stringify(viewedSermons));
  } catch (error) {
    console.error('Error marking sermon as viewed:', error);
  }
};

// ===== BLOG VIEW TRACKING FUNCTIONS =====

/**
 * Check if a blog has been viewed by this device
 * @param {string} blogId - The blog ID
 * @returns {boolean} True if already viewed
 */
export const hasViewedBlog = (blogId) => {
  try {
    const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs') || '{}');
    return !!viewedBlogs[blogId];
  } catch (error) {
    console.error('Error checking viewed blogs:', error);
    return false;
  }
};

/**
 * Mark a blog as viewed
 * @param {string} blogId - The blog ID
 */
export const markBlogAsViewed = (blogId) => {
  try {
    const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs') || '{}');
    viewedBlogs[blogId] = {
      viewedAt: Date.now(),
      deviceId: getDeviceId()
    };
    localStorage.setItem('viewedBlogs', JSON.stringify(viewedBlogs));
  } catch (error) {
    console.error('Error marking blog as viewed:', error);
  }
};