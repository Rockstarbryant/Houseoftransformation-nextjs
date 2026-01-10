// src/components/donation/PaymentModal.jsx
import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useDonation } from '../../context/DonationContext';
import { formatToMpesaPhone, isValidMpesaPhone, formatKES } from '../../utils/donationHelpers';

const PaymentModal = ({ isOpen, pledge, campaign, onClose, onSuccess }) => {
  const { initiatePayment, loading } = useDonation();
  const [paymentData, setPaymentData] = useState({
    amount: pledge?.remainingAmount?.toString() || '',
    phoneNumber: pledge?.memberPhone || ''
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !pledge) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validatePayment = () => {
    const amount = parseFloat(paymentData.amount);
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (amount > pledge.remainingAmount) {
      setError('Amount exceeds remaining balance');
      return false;
    }

    const formattedPhone = formatToMpesaPhone(paymentData.phoneNumber);
    if (!isValidMpesaPhone(formattedPhone)) {
      setError('Invalid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePayment()) return;

    try {
      const formattedPhone = formatToMpesaPhone(paymentData.phoneNumber);
      const result = await initiatePayment({
        pledgeId: pledge._id,
        amount: parseFloat(paymentData.amount),
        phoneNumber: formattedPhone
      });

      if (result.success) {
        setPaymentStatus('initiated');
        setTimeout(() => {
          setPaymentStatus('success');
          setTimeout(() => {
            onSuccess?.(result);
            handleClose();
          }, 2000);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    }
  };

  const handleClose = () => {
    setPaymentData({ amount: pledge?.remainingAmount?.toString() || '', phoneNumber: pledge?.memberPhone || '' });
    setPaymentStatus(null);
    setError(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Make Payment</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {paymentStatus === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-600 mb-4" size={56} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-4">
                  {formatKES(paymentData.amount)} received
                </p>
                <p className="text-sm text-gray-500">
                  Confirmation sent to {paymentData.phoneNumber}
                </p>
              </div>
            ) : paymentStatus === 'initiated' ? (
              <div className="text-center py-8">
                <Loader className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
                <p className="text-gray-700 font-semibold mb-2">
                  M-Pesa Prompt Sent
                </p>
                <p className="text-sm text-gray-600">
                  Check your phone for the prompt and enter your PIN
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Campaign</p>
                  <p className="font-semibold text-gray-900 line-clamp-1">
                    {campaign?.name}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className="font-bold text-orange-600">
                        {formatKES(pledge.remainingAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Balance</p>
                      <p className="font-bold text-blue-600">
                        {formatKES(pledge.paidAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleChange}
                    max={pledge.remainingAmount}
                    min="1"
                    step="100"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    M-Pesa Phone
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={paymentData.phoneNumber}
                    onChange={handleChange}
                    placeholder="0712345678"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Processing...
                    </>
                  ) : (
                    'Pay with M-Pesa'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;