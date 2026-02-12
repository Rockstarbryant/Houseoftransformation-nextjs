'use client';

import { Calendar, Users, Mail, MessageSquare } from 'lucide-react';

export default function PlanVisitForm() {
  return (
    <form className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Let us know you are coming
      </h3>
      
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Jane Doe"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                Visit Date
              </div>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="kids" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                Children Attending
              </div>
            </label>
            <select
              id="kids"
              name="kids"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
            >
              <option value="0">None</option>
              <option value="1">1 Child</option>
              <option value="2">2 Children</option>
              <option value="3+">3+ Children</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-600" />
              Email or Phone
            </div>
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            placeholder="contact@example.com"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-600" />
              Any special needs or questions?
            </div>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Wheelchair access, allergies, etc."
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="button"
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200 mt-2"
        >
          Plan My Visit
        </button>
        
        <p className="text-center text-xs text-slate-500 mt-4">
          We respect your privacy. Your information is only used to prepare for your visit.
        </p>
      </div>
    </form>
  );
}