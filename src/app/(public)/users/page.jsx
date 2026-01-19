// /app/(public)/users/page.jsx - Server Component
import UsersClient from '@/components/users/UsersClient';
import { getAllUsers } from '@/lib/users';

export const metadata = {
  title: 'Members Directory - House of Transformation Church',
  description: 'Connect with our church community members and leaders.',
};

//export const revalidate = 3600;
export const dynamic = 'force-dynamic';
export default async function UsersPortalPage() {
  // Fetch all users on server
  const users = await getAllUsers();

  return (
    <div className="pt-32 pb-20 min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Static Header Section - 100% PRESERVED */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-12 bg-[#8B1A1A]"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B1A1A]">Community</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Members<br/><span className="text-[#8B1A1A]">Directory.</span>
            </h1>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900 leading-none">{users.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total</p>
            </div>
          </div>
        </div>

        {/* Client Component - Handles all interactions */}
        <UsersClient initialUsers={users} />
      </div>
    </div>
  );
}