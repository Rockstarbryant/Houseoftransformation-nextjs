// src/utils/donationHelpers.js

/**
 * Format currency to KES format
 */
export const formatKES = (amount) => {
  return `KES ${parseFloat(amount || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (raised, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min((raised / goal) * 100, 100);
};

/**
 * Calculate days remaining
 */
export const getDaysRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};

/**
 * Get status color classes
 */
export const getStatusClasses = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    partial: 'bg-purple-100 text-purple-800 border-purple-300',
    archived: 'bg-gray-100 text-gray-800 border-gray-300',
    ended: 'bg-orange-100 text-orange-800 border-orange-300'
  };
  return colors[status] || colors.pending;
};

/**
 * Validate M-Pesa phone number
 */
export const isValidMpesaPhone = (phone) => {
  return /^254\d{9}$/.test(phone);
};

/**
 * Format phone number to M-Pesa format
 */
export const formatToMpesaPhone = (phone) => {
  // Remove any non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // If starts with +254, replace + with nothing
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  }
  
  // If doesn't start with 254, prepend it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  data.forEach(row => {
    csv += headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Calculate installment amount
 */
export const calculateInstallment = (totalAmount, installmentPlan) => {
  const plans = {
    'lump-sum': 1,
    'weekly': 4,
    'bi-weekly': 2,
    'monthly': 1
  };

  const periods = plans[installmentPlan] || 1;
  return Math.ceil(totalAmount / periods);
};

/**
 * Get next payment due date
 */
export const getNextPaymentDueDate = (lastPaymentDate, installmentPlan) => {
  const date = new Date(lastPaymentDate);
  
  switch(installmentPlan) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'bi-weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }
  
  return date;
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Check if campaign is ending soon (within 7 days)
 */
export const isEndingSoon = (endDate) => {
  const daysLeft = getDaysRemaining(endDate);
  return daysLeft > 0 && daysLeft <= 7;
};

/**
 * Get pledge summary statistics
 */
export const getPledgeSummary = (pledges) => {
  if (!pledges || pledges.length === 0) {
    return {
      totalPledged: 0,
      totalPaid: 0,
      totalRemaining: 0,
      completedCount: 0,
      pendingCount: 0,
      partialCount: 0
    };
  }

  return {
    totalPledged: pledges.reduce((sum, p) => sum + p.pledgedAmount, 0),
    totalPaid: pledges.reduce((sum, p) => sum + p.paidAmount, 0),
    totalRemaining: pledges.reduce((sum, p) => sum + p.remainingAmount, 0),
    completedCount: pledges.filter(p => p.status === 'completed').length,
    pendingCount: pledges.filter(p => p.status === 'pending').length,
    partialCount: pledges.filter(p => p.status === 'partial').length
  };
};

/**
 * Validate pledge amount
 */
export const isValidPledgeAmount = (amount, minAmount = 100, maxAmount = 10000000) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= minAmount && num <= maxAmount;
};