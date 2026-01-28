'use client';

import { 
  LayoutDashboard, 
  BarChart3, 
  Heart, 
  Users, 
  CreditCard, 
  Target,
  ChevronRight 
} from 'lucide-react';

export default function DonationsMobileNav({ activeTab, setActiveTab, counts, permissions }) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-cyan-600',
      show: true
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600',
      show: permissions.canViewDonationReports
    },
    {
      id: 'my-pledges',
      label: 'My Pledges',
      icon: Heart,
      color: 'from-red-500 to-orange-600',
      count: counts.myPledges,
      show: permissions.canViewPledges
    },
    {
      id: 'all-pledges',
      label: 'All Pledges',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      count: counts.allPledges,
      badge: 'Admin',
      show: permissions.canViewAllPledges
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      color: 'from-yellow-500 to-orange-600',
      count: counts.payments,
      show: permissions.canViewAllPayments
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: Target,
      color: 'from-indigo-500 to-purple-600',
      count: counts.campaigns,
      show: permissions.canViewCampaigns
    }
  ];

  const visibleItems = navItems.filter(item => item.show);

  const handleCardClick = (itemId) => {
    console.log('Card clicked:', itemId); // Debug log
    setActiveTab(itemId);
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {visibleItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleCardClick(item.id)}
            className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
              isActive
                ? 'shadow-lg scale-[0.98]'
                : 'shadow-md hover:shadow-lg active:scale-[0.98]'
            }`}
          >
            <div className={`bg-gradient-to-br ${item.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base">{item.label}</div>
                    {item.count !== undefined && (
                      <div className="text-sm opacity-90">{item.count} items</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight 
                    size={20} 
                    className={`transition-transform ${isActive ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>
            </div>
            {isActive && (
              <div className="absolute inset-0 border-2 border-white/50 rounded-xl pointer-events-none"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}