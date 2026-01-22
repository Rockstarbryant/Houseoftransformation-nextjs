'use client';
import { formatCurrency } from '@/utils/donationHelpers';

export default function AdminDonationStats({ payments }) {
  // Simple aggregation for the dashboard
  const totalRaised = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
        <p className="text-blue-100 text-sm font-medium uppercase">Total Collected</p>
        <h3 className="text-3xl font-bold">{formatCurrency(totalRaised)}</h3>
      </div>
      
      <div className="bg-white border p-6 rounded-xl shadow-sm">
        <p className="text-gray-500 text-sm font-medium uppercase">Pending (STK Push)</p>
        <h3 className="text-3xl font-bold text-orange-500">{formatCurrency(pendingAmount)}</h3>
      </div>

      <div className="bg-white border p-6 rounded-xl shadow-sm">
        <p className="text-gray-500 text-sm font-medium uppercase">Total Transactions</p>
        <h3 className="text-3xl font-bold text-gray-800">{payments.length}</h3>
      </div>
    </div>
  );
}