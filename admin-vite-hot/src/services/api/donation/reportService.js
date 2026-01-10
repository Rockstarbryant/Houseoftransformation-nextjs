// src/services/donation/reportService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_DONATION_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

export const reportService = {
  // Get dashboard statistics (member)
  getMemberDashboard: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/member`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching member dashboard:', error);
      throw error;
    }
  },

  // Get dashboard statistics (admin)
  getAdminDashboard: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/admin`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  },

  // Get campaign analytics
  getCampaignAnalytics: async (campaignId) => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/campaign/${campaignId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  },

  // Export payment history to CSV
  exportPaymentHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.campaignId) params.append('campaignId', filters.campaignId);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(
        `${API_URL}/payments?${params}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting payment history:', error);
      throw error;
    }
  },

  // Export pledges to CSV
  exportPledges: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.campaignId) params.append('campaignId', filters.campaignId);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(
        `${API_URL}/pledges?${params}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting pledges:', error);
      throw error;
    }
  },

  // Generate payment receipt (text-based for now)
  generatePaymentReceipt: (payment, campaign, member) => {
    const receiptText = `
=======================================
        PAYMENT RECEIPT
=======================================
Date: ${new Date(payment.completedAt).toLocaleDateString('en-KE')}
Receipt #: ${payment.mpesaReceiptNumber || payment._id}

DONOR INFORMATION:
Name: ${member?.name || 'N/A'}
Email: ${member?.email || 'N/A'}
Phone: ${payment.phoneNumberUsed || 'N/A'}

CAMPAIGN INFORMATION:
Campaign: ${campaign?.name || 'N/A'}
Type: ${campaign?.type || 'N/A'}
Description: ${campaign?.description || 'N/A'}

PAYMENT DETAILS:
Amount: KES ${payment.amount?.toLocaleString()}
Method: ${payment.paymentMethod?.toUpperCase()}
M-Pesa Ref: ${payment.mpesaRef || 'N/A'}
Status: ${payment.status?.toUpperCase()}

=======================================
Thank you for your generous contribution!
God bless you abundantly.
=======================================
    `;

    // Download as text file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptText));
    element.setAttribute('download', `receipt-${payment._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  // Generate pledge summary (text-based for now)
  generatePledgeSummary: (pledge, campaign) => {
    const summaryText = `
=======================================
        PLEDGE SUMMARY
=======================================

PLEDGE DETAILS:
Campaign: ${campaign?.name}
Pledged Amount: KES ${pledge.pledgedAmount?.toLocaleString()}
Paid Amount: KES ${pledge.paidAmount?.toLocaleString()}
Remaining: KES ${pledge.remainingAmount?.toLocaleString()}
Status: ${pledge.status?.toUpperCase()}
Plan: ${pledge.installmentPlan?.replace('-', ' ').toUpperCase()}

PROGRESS: ${Math.round((pledge.paidAmount / pledge.pledgedAmount) * 100)}%
${'█'.repeat(Math.round((pledge.paidAmount / pledge.pledgedAmount) * 50))}
${'░'.repeat(50 - Math.round((pledge.paidAmount / pledge.pledgedAmount) * 50))}

=======================================
Thank you for your commitment!
=======================================
    `;

    // Download as text file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(summaryText));
    element.setAttribute('download', `pledge-summary-${pledge._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  // Generate analytics report (text-based for now)
  generateAnalyticsReport: (analytics) => {
    const reportText = `
=======================================
        ANALYTICS REPORT
=======================================

${new Date().toLocaleDateString('en-KE')}

CAMPAIGN STATISTICS:
${Object.entries(analytics.campaign || {}).map(([key, value]) => 
  `${key}: ${value}`
).join('\n')}

PLEDGE STATISTICS:
${Object.entries(analytics.pledges || {}).map(([key, value]) => 
  `${key}: ${value}`
).join('\n')}

PAYMENT STATISTICS:
${Object.entries(analytics.payments || {}).map(([key, value]) => 
  `${key}: ${value}`
).join('\n')}

=======================================
Generated on ${new Date().toLocaleString('en-KE')}
=======================================
    `;

    // Download as text file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText));
    element.setAttribute('download', `analytics-report-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};