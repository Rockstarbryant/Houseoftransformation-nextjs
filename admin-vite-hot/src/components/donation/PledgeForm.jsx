// src/components/donation/PledgeForm.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Heart } from 'lucide-react';
import Card from '../common/Card';
import { useDonation } from '../../context/DonationContext';
import { formatToMpesaPhone, isValidMpesaPhone, isValidPledgeAmount } from '../../utils/donationHelpers';

const PledgeForm = ({ campaignId, campaign, onSuccess }) => {
  const { createPledge, loading, error, clearError } = useDonation();
  const [formData, setFormData] = useState({
    pledgedAmount: '',
    installmentPlan: 'lump-sum',
    memberPhone: '',
    memberEmail: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const installmentOptions = [
    { value: 'lump-sum', label: 'One-time Payment', desc: 'Pay everything now' },
    { value: 'weekly', label: 'Weekly Installments', desc: 'Split into weekly payments' },
    { value: 'bi-weekly', label: 'Bi-weekly Installments', desc: 'Split into bi-weekly payments' },
    { value: 'monthly', label: 'Monthly Installments', desc: 'Split into monthly payments' }
  ];

  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.pledgedAmount) {
      errors.pledgedAmount = 'Pledge amount is required';
    } else if (!isValidPledgeAmount(formData.pledgedAmount)) {
      errors.pledgedAmount = 'Amount must be between KES 100 and KES 10,000,000';
    }

    if (!formData.memberPhone) {
      errors.memberPhone = 'M-Pesa phone number is required';
    } else {
      const formattedPhone = formatToMpesaPhone(formData.memberPhone);
      if (!isValidMpesaPhone(formattedPhone)) {
        errors.memberPhone = 'Please enter a valid Kenyan phone number';
      }
    }

    if (formData.memberEmail && !formData.memberEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.memberEmail = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const pledgeData = {
        campaignId,
        ...formData,
        pledgedAmount: parseFloat(formData.pledgedAmount),
        memberPhone: formatToMpesaPhone(formData.memberPhone)
      };

      const result = await createPledge(pledgeData);
      
      if (result) {
        setSuccess(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(result), 2000);
        }
      }
    } catch (err) {
      // Error is handled by context
    }
  };

  if (success) {
    return (
      <Card className="text-center p-12">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pledge Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your commitment. Your pledge has been recorded and you can now start making payments.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <Heart className="text-red-600" size={28} />
        <h2 className="text-2xl font-bold text-blue-900">Make Your Pledge</h2>
      </div>
      <p className="text-gray-600 mb-8">
        {campaign?.name && `Campaign: ${campaign.name}`}
        <br />
        Commit to supporting this campaign. You can pay in installments or all at once.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded flex items-center gap-3">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Pledge Amount */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Pledge Amount (KES) *
          </label>
          <input
            type="number"
            name="pledgedAmount"
            value={formData.pledgedAmount}
            onChange={handleChange}
            placeholder="e.g., 5000"
            required
            min="100"
            max="10000000"
            step="100"
            className={`w-full px-4 py-3 rounded-lg border ${
              formErrors.pledgedAmount ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-600`}
          />
          {formErrors.pledgedAmount && (
            <p className="text-red-600 text-sm mt-1">{formErrors.pledgedAmount}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Minimum: KES 100 | Maximum: KES 10,000,000</p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            M-Pesa Phone Number *
          </label>
          <input
            type="tel"
            name="memberPhone"
            value={formData.memberPhone}
            onChange={handleChange}
            placeholder="e.g., 0712345678 or 254712345678"
            required
            className={`w-full px-4 py-3 rounded-lg border ${
              formErrors.memberPhone ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-600`}
          />
          {formErrors.memberPhone && (
            <p className="text-red-600 text-sm mt-1">{formErrors.memberPhone}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Format: 0712345678 or 254712345678</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="memberEmail"
            value={formData.memberEmail}
            onChange={handleChange}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 rounded-lg border ${
              formErrors.memberEmail ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-600`}
          />
          {formErrors.memberEmail && (
            <p className="text-red-600 text-sm mt-1">{formErrors.memberEmail}</p>
          )}
        </div>

        {/* Installment Plan */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Payment Plan
          </label>
          <div className="space-y-2">
            {installmentOptions.map(option => (
              <label key={option.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition" style={{ borderColor: formData.installmentPlan === option.value ? '#2563eb' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="installmentPlan"
                  value={option.value}
                  checked={formData.installmentPlan === option.value}
                  onChange={handleChange}
                  className="mr-3"
                />
                <div>
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special requests or comments?"
            rows="4"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            🔒 Your personal information is encrypted and secure<br />
            ✓ You have the right to withdraw this pledge anytime<br />
            ✓ You'll receive payment confirmations via SMS and email
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Creating Pledge...
            </>
          ) : (
            <>
              <Heart size={20} />
              Confirm Pledge
            </>
          )}
        </button>
      </form>
    </Card>
  );
};

export default PledgeForm;