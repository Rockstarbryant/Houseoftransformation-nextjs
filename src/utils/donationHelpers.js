// src/utils/donationHelpers.js

/**
 * Format currency to KES format
 * @param {number} amount - Amount in KES
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date to short format (no time)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return 'N/A';
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Join MongoDB campaigns with Supabase pledges
 * This creates a lookup map and enriches pledge data with campaign info
 * 
 * @param {Array} pledges - Pledges from Supabase (have campaign_id as MongoDB ID)
 * @param {Array} campaigns - Campaigns from MongoDB
 * @returns {Array} Pledges enriched with campaign data
 */
export const joinCampaignsWithPledges = (pledges, campaigns) => {
  if (!Array.isArray(pledges) || !Array.isArray(campaigns)) {
    console.error('joinCampaignsWithPledges: Invalid input', { pledges, campaigns });
    return pledges || [];
  }

  // Create lookup map: { [supabaseId]: campaign }
  const campaignMap = {};
  campaigns.forEach(campaign => {
    if (campaign.supabaseId) {
      campaignMap[campaign.supabaseId] = campaign;
    }
  });

  // Enrich pledges with campaign data
  return pledges.map(pledge => {
    const campaign = campaignMap[pledge.campaign_id]; // pledge.campaign_id is UUID
    
    return {
      ...pledge,
      campaign_title: campaign?.title || 'Unknown Campaign',
      campaign_type: campaign?.campaignType || null,
      campaign_status: campaign?.status || null,
      campaign_goal: campaign?.goalAmount || 0,
      campaign_current: campaign?.currentAmount || 0
    };
  });
};

/**
 * Calculate pledge progress percentage
 * @param {number} paid - Amount paid
 * @param {number} pledged - Total pledged amount
 * @returns {number} Percentage (0-100)
 */
export const calculateProgress = (paid, pledged) => {
  if (!pledged || pledged === 0) return 0;
  
  const percentage = (paid / pledged) * 100;
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Get status badge color classes
 * @param {string} status - Pledge or payment status
 * @returns {object} Tailwind classes for badge
 */
/*export const getStatusBadge = (status) => {
  const badges = {
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      label: 'Pending'
    },
    partial: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-800 dark:text-blue-200',
      label: 'Partial'
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-800 dark:text-green-200',
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-200',
      label: 'Cancelled'
    },
    overdue: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-800 dark:text-orange-200',
      label: 'Overdue'
    },
    success: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-800 dark:text-green-200',
      label: 'Success'
    },
    failed: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-200',
      label: 'Failed'
    }
  };

  return badges[status] || badges.pending;
}; */

export const getStatusBadge = (status) => {
  // Normalize the status to lowercase for comparison
  const normalizedStatus = String(status || '').toLowerCase().trim();
  
  //console.log('[getStatusBadge] Input:', status, 'Normalized:', normalizedStatus);
  
  switch (normalizedStatus) {
    case 'verified':
      return {
        label: 'Verified',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-200'
      };
    
    case 'pending':
      return {
        label: 'Pending',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-200'
      };
    
    case 'failed':
      return {
        label: 'Failed',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-200'
      };
    
    case 'cancelled':
    case 'canceled':
      return {
        label: 'Cancelled',
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-800 dark:text-gray-200'
      };
    
    default:
      console.warn('[getStatusBadge] Unknown status:', status, 'Defaulting to pending');
      // If status is unknown, return pending but log a warning
      return {
        label: 'Pending',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-200'
      };
  }
};

/**
 * Validate phone number (Kenya format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid
 */
export const validateKenyanPhone = (phone) => {
  if (!phone) return false;
  
  // Kenya phone format: 254XXXXXXXXX (12 digits)
  const phoneRegex = /^254\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Format phone number to Kenya format
 * @param {string} phone - Phone number (e.g., "0712345678" or "712345678")
 * @returns {string} Formatted phone (e.g., "254712345678")
 */
export const formatPhoneToKenyan = (phone) => {
  if (!phone) return '';
  
  // Remove spaces and non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // If doesn't start with 254, add it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

/**
 * Calculate campaign progress
 * @param {number} current - Current amount raised
 * @param {number} goal - Goal amount
 * @returns {number} Percentage (0-100)
 */
export const calculateCampaignProgress = (current, goal) => {
  if (!goal || goal === 0) return 0;
  
  const percentage = (current / goal) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
};

/**
 * Get campaign type icon
 * @param {string} type - Campaign type
 * @returns {string} Emoji icon
 */
export const getCampaignTypeIcon = (type) => {
  const icons = {
    building: '🏛️',
    mission: '🌍',
    event: '🎉',
    equipment: '🎸',
    benevolence: '❤️',
    offering: '🙏'
  };
  
  return icons[type] || '💝';
};

/**
 * Get campaign status label
 * @param {string} status - Campaign status
 * @returns {object} Label and color classes
 */
export const getCampaignStatusLabel = (status) => {
  const labels = {
    draft: {
      label: 'Draft',
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-200'
    },
    active: {
      label: 'Active',
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-800 dark:text-green-200'
    },
    completed: {
      label: 'Completed',
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-800 dark:text-blue-200'
    },
    archived: {
      label: 'Archived',
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      text: 'text-orange-800 dark:text-orange-200'
    }
  };
  
  return labels[status] || labels.draft;
};

/**
 * Validate pledge amount
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum allowed amount
 * @returns {object} { valid: boolean, error: string }
 */
export const validatePledgeAmount = (amount, min = 0) => {
  if (!amount || isNaN(amount)) {
    return { valid: false, error: 'Please enter a valid amount' };
  }
  
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  
  if (min && amount < min) {
    return { valid: false, error: `Minimum pledge amount is ${formatCurrency(min)}` };
  }
  
  return { valid: true, error: null };
};

/**
 * Calculate installment amount
 * @param {number} totalAmount - Total pledge amount
 * @param {string} plan - Installment plan (weekly, bi-weekly, monthly, lump-sum)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {object} { installmentAmount: number, numberOfInstallments: number }
 */
export const calculateInstallment = (totalAmount, plan, startDate, endDate) => {
  if (!totalAmount || !startDate || !endDate) {
    return { installmentAmount: 0, numberOfInstallments: 0 };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let numberOfInstallments = 1;

  switch (plan) {
    case 'weekly':
      numberOfInstallments = Math.max(1, Math.floor(diffDays / 7));
      break;
    case 'bi-weekly':
      numberOfInstallments = Math.max(1, Math.floor(diffDays / 14));
      break;
    case 'monthly':
      numberOfInstallments = Math.max(1, Math.floor(diffDays / 30));
      break;
    case 'lump-sum':
    default:
      numberOfInstallments = 1;
      break;
  }

  const installmentAmount = totalAmount / numberOfInstallments;

  return {
    installmentAmount: Math.round(installmentAmount * 100) / 100,
    numberOfInstallments
  };
};

/**
 * Format payment method label
 * @param {string} method - Payment method
 * @returns {string} Formatted label
 */
export const formatPaymentMethod = (method) => {
  const methods = {
    mpesa: 'M-Pesa',
    'bank-transfer': 'Bank Transfer',
    cash: 'Cash',
    manual: 'Manual Entry'
  };
  
  return methods[method] || method?.toUpperCase() || 'Unknown';
};