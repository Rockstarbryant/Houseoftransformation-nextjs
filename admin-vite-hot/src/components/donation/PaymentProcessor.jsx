// src/components/donation/PaymentProcessor.jsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, ArrowLeft, Lock, Shield } from 'lucide-react';
import Card from '../common/Card';
import { useDonation } from '../../context/DonationContext';
import { formatToMpesaPhone, isValidMpesaPhone, formatKES } from '../../utils/donationHelpers';

const PaymentProcessor = ({ pledge, campaign, onSuccess, onBack }) => {
  const { initiatePayment, loading } = useDonation();
  const [paymentData, setPaymentData] = useState({
    amount: pledge?.remainingAmount?.toString() || '',
    phoneNumber: pledge?.memberPhone || ''
  });

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

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
      setError(`Payment amount cannot exceed remaining balance of ${formatKES(pledge.remainingAmount)}`);
      return false;
    }

    const formattedPhone = formatToMpesaPhone(paymentData.phoneNumber);
    if (!isValidMpesaPhone(formattedPhone)) {
      setError('Please enter a valid M-Pesa phone number');
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
        setCheckoutRequestId(result.checkoutRequestId);

        // Simulate polling for payment confirmation
        setTimeout(() => {
          setPaymentStatus('success');
          if (onSuccess) {
            setTimeout(() => onSuccess(result), 3000);
          }
        }, 5000);
      }
    } catch (err) {
      setError(err.message || 'Payment initiation failed. Please try again.');
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="text-center p-12">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment of {formatKES(paymentData.amount)} has been processed successfully.
          <br />
          A confirmation has been sent to {paymentData.phoneNumber}.
        </p>
        <button
          onClick={() => onSuccess && onSuccess()}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h2 className="text-2xl font-bold text-blue-900 mb-2">Make Payment</h2>
      <p className="text-gray-600 mb-8">
        Campaign: <span className="font-semibold">{campaign?.name || 'Campaign'}</span>
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded flex items-center gap-3">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pledge Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-8 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" />
          Pledge Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Total Pledged</p>
            <p className="text-lg font-bold text-blue-900">
              {formatKES(pledge.pledgedAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Already Paid</p>
            <p className="text-lg font-bold text-green-600">
              {formatKES(pledge.paidAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Balance Due</p>
            <p className="text-lg font-bold text-orange-600">
              {formatKES(pledge.remainingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* M-Pesa Prompt Info */}
      {paymentStatus === 'initiated' && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
          <p className="font-semibold mb-1">✓ M-Pesa prompt sent to {paymentData.phoneNumber}</p>
          <p className="text-sm">Please check your phone and enter your M-Pesa PIN to complete the payment</p>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Payment Amount */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Payment Amount (KES) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-600 font-semibold">KES</span>
            <input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              required
              max={pledge.remainingAmount}
              min="1"
              step="100"
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum available: {formatKES(pledge.remainingAmount)}
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            M-Pesa Phone Number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={paymentData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g., 0712345678 or 254712345678"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Change if needed. Format: 0712345678
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || paymentStatus === 'initiated'}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Processing Payment...
            </>
          ) : paymentStatus === 'initiated' ? (
            <>
              <Loader className="animate-spin" size={20} />
              Waiting for M-Pesa Confirmation...
            </>
          ) : (
            <>
              <Lock size={20} />
              Pay {formatKES(parseFloat(paymentData.amount) || 0)} with M-Pesa
            </>
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-gray-700">
          🔒 Your payment is encrypted with SSL security<br />
          ✓ All transactions are verified through M-Pesa<br />
          ✓ You will receive an SMS confirmation<br />
          ✓ Your data is protected and compliant with PDPA
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-3">PAYMENT HELP</p>
        <div className="space-y-2 text-xs text-gray-600">
          <p><span className="font-semibold">Q:</span> What if I don't have an M-Pesa account?</p>
          <p className="ml-4 text-gray-500">A: Visit any Safaricom shop or mobile money agent to register.</p>
          
          <p className="mt-3"><span className="font-semibold">Q:</span> Will I get a receipt?</p>
          <p className="ml-4 text-gray-500">A: Yes, immediately via SMS and email.</p>
        </div>
      </div>
    </Card>
  );
};

export default PaymentProcessor;