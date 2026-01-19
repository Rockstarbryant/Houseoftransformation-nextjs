'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, Send, Users, User, CheckCircle, XCircle, Loader2, Clock, 
  FileText, Inbox, History, BarChart3, Save, Calendar, Filter 
} from 'lucide-react';
import emailNotificationService from '@/services/api/emailNotificationService';

export default function EmailNotificationsPage() {
  // Navigation state
  const [activeTab, setActiveTab] = useState('compose'); // compose, history, templates, drafts, inbox, statistics

  // Users & Roles
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Send Mode
  const [sendMode, setSendMode] = useState('single'); // single, bulk, all, role
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Email Content
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  // Results
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  // History
  const [emailHistory, setEmailHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  // Drafts
  const [drafts, setDrafts] = useState([]);

  // Inbox
  const [inbox, setInbox] = useState([]);
  const [inboxPage, setInboxPage] = useState(1);
  const [inboxTotal, setInboxTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Statistics
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchEmailHistory();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'drafts') {
      fetchDrafts();
    } else if (activeTab === 'inbox') {
      fetchInbox();
    } else if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab, historyPage, inboxPage]);

  // Fetch functions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await emailNotificationService.getUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await emailNotificationService.getRoles();
      if (response.success) {
        setRoles(response.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      const response = await emailNotificationService.getEmailHistory(historyPage);
      if (response.success) {
        setEmailHistory(response.emailLogs);
        setHistoryTotal(response.total);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailNotificationService.getTemplates();
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await emailNotificationService.getDrafts();
      if (response.success) {
        setDrafts(response.drafts);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const response = await emailNotificationService.getInbox(inboxPage);
      if (response.success) {
        setInbox(response.emails);
        setInboxTotal(response.total);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await emailNotificationService.getEmailStatistics();
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u._id));
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRoleChange = async (roleId) => {
    setSelectedRoleId(roleId);
    if (roleId) {
      try {
        const response = await emailNotificationService.getUsersByRole(roleId);
        if (response.success) {
          setSelectedUserIds(response.users.map(u => u._id));
        }
      } catch (error) {
        console.error('Error fetching users by role:', error);
      }
    }
  };

  const handleSend = async () => {
    if (!subject || !message) {
      alert('Please fill in subject and message');
      return;
    }

    if (sendMode === 'single' && !selectedUserId) {
      alert('Please select a user');
      return;
    }

    if (sendMode === 'bulk' && selectedUserIds.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (sendMode === 'role' && !selectedRoleId) {
      alert('Please select a role');
      return;
    }

    const confirmMsg = scheduledFor
      ? `Schedule this email for ${new Date(scheduledFor).toLocaleString()}?`
      : sendMode === 'all' 
      ? `Send email to ALL ${users.length} users?`
      : sendMode === 'bulk'
      ? `Send email to ${selectedUserIds.length} selected users?`
      : sendMode === 'role'
      ? `Send email to all users with selected role?`
      : 'Send email to selected user?';

    if (!confirm(confirmMsg)) return;

    try {
      setSending(true);
      setResult(null);

      let response;

      if (sendMode === 'single') {
        response = await emailNotificationService.sendSingleEmail(
          selectedUserId, subject, message, scheduledFor
        );
      } else if (sendMode === 'bulk') {
        response = await emailNotificationService.sendBulkEmails(
          selectedUserIds, subject, message, scheduledFor
        );
      } else if (sendMode === 'role') {
        response = await emailNotificationService.sendByRole(
          selectedRoleId, subject, message, scheduledFor
        );
      } else {
        response = await emailNotificationService.sendToAllUsers(
          subject, message, scheduledFor
        );
      }

      setResult(response);

      if (response.success) {
        setSubject('');
        setMessage('');
        setScheduledFor('');
        setSelectedUserId('');
        setSelectedUserIds([]);
        setSelectedRoleId('');
      }

    } catch (error) {
      console.error('Error sending email:', error);
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send email'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const draftData = {
        subject,
        message,
        recipients: selectedUserIds.map(id => ({ userId: id })),
        type: sendMode,
        targetRole: selectedRoleId
      };

      const response = await emailNotificationService.saveDraft(draftData);
      
      if (response.success) {
        alert('Draft saved successfully');
        setSubject('');
        setMessage('');
        setSelectedUserIds([]);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  const handleLoadTemplate = (template) => {
    setSubject(template.subject);
    setMessage(template.message);
  };

  const handleLoadDraft = (draft) => {
    setSubject(draft.subject);
    setMessage(draft.message);
    setActiveTab('compose');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#8B1A1A] flex items-center justify-center">
              <Mail className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Email Notifications
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Send, manage, and track email communications
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'compose'
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Send size={18} />
              Compose
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'inbox'
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Inbox size={18} />
              Inbox
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <History size={18} />
              History
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FileText size={18} />
              Templates
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'drafts'
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Save size={18} />
              Drafts
            </button>

            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'statistics'
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 size={18} />
              Statistics
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            {/* Send Mode Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Select Send Mode
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setSendMode('single')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendMode === 'single'
                      ? 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <User className={sendMode === 'single' ? 'text-[#8B1A1A]' : 'text-slate-400'} size={24} />
                  <p className="font-bold text-slate-900 dark:text-white mt-2">Single User</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Send to one user</p>
                </button>

                <button
                  onClick={() => setSendMode('bulk')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendMode === 'bulk'
                      ? 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Users className={sendMode === 'bulk' ? 'text-[#8B1A1A]' : 'text-slate-400'} size={24} />
                  <p className="font-bold text-slate-900 dark:text-white mt-2">Bulk Send</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Select multiple users</p>
                </button>

                <button
                  onClick={() => setSendMode('role')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendMode === 'role'
                      ? 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Filter className={sendMode === 'role' ? 'text-[#8B1A1A]' : 'text-slate-400'} size={24} />
                  <p className="font-bold text-slate-900 dark:text-white mt-2">By Role</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Send to specific role</p>
                </button>

                <button
                  onClick={() => setSendMode('all')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendMode === 'all'
                      ? 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Mail className={sendMode === 'all' ? 'text-[#8B1A1A]' : 'text-slate-400'} size={24} />
                  <p className="font-bold text-slate-900 dark:text-white mt-2">Send to All</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">All {users.length} users</p>
                </button>
              </div>
            </div>

            {/* User/Role Selection */}
            {sendMode !== 'all' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {sendMode === 'single' ? 'Select User' : sendMode === 'role' ? 'Select Role' : 'Select Users'}
                  </h2>
                  {sendMode === 'bulk' && (
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-[#8B1A1A] hover:underline font-semibold"
                    >
                      {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                  </div>
                ) : sendMode === 'single' ? (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select User --</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email}) - {user.role?.name || 'No Role'}
                      </option>
                    ))}
                  </select>
                ) : sendMode === 'role' ? (
                  <select
                    value={selectedRoleId}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {users.map(user => (
                      <label
                        key={user._id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user._id)}
                          onChange={() => handleUserToggle(user._id)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
/>
<div className="flex-1">
<p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
<p className="text-sm text-slate-600 dark:text-slate-400">
{user.email} • {user.role?.name || 'No Role'}
</p>
</div>
</label>
))}
</div>
)}
{sendMode === 'bulk' && (
<p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
{selectedUserIds.length} user(s) selected
</p>
)}
</div>
)}

{/* Email Composition */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Compose Email
            </h2>
            {templates.length > 0 && (
              <select
                onChange={(e) => {
                  const template = templates.find(t => t._id === e.target.value);
                  if (template) handleLoadTemplate(template);
                }}
                className="text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Load Template...</option>
                {templates.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Schedule Send (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={sending || !subject || !message}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8B1A1A] hover:bg-[#6d1414] disabled:bg-slate-400 text-white font-bold rounded-lg transition-all"
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending...
                </>
              ) : scheduledFor ? (
                <>
                  <Clock size={20} />
                  Schedule Email
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Email
                </>
              )}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={!subject && !message}
              className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 hover:border-[#8B1A1A] dark:hover:border-[#8B1A1A] text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-all"
            >
              <Save size={20} />
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl shadow-sm p-6 ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
              ) : (
                <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
              )}
              <div className="flex-1">
                <p className={`font-bold ${
                  result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {result.success ? 'Success!' : 'Failed'}
                </p>
                <p className={`text-sm ${
                  result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {result.message}
                </p>

                {result.emailLog && result.emailLog.successCount !== undefined && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Details:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Total</p>
                        <p className="font-bold text-slate-900 dark:text-white">{result.emailLog.totalRecipients}</p>
                      </div>
                      <div>
                        <p className="text-green-600 dark:text-green-400">Successful</p>
                        <p className="font-bold text-green-700 dark:text-green-300">{result.emailLog.successCount}</p>
                      </div>
                      <div>
                        <p className="text-red-600 dark:text-red-400">Failed</p>
                        <p className="font-bold text-red-700 dark:text-red-300">{result.emailLog.failedCount}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Email History
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : emailHistory.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No email history found
              </p>
            ) : (
              <div className="space-y-3">
                {emailHistory.map(log => (
                  <div
                    key={log._id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {log.subject}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.status === 'sent' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : log.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {log.status}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400">
                            {log.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {log.message.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                          <span>Sent by: {log.sentBy?.name || 'Unknown'}</span>
                          <span>Recipients: {log.totalRecipients}</span>
                          <span>✅ {log.successCount} | ❌ {log.failedCount}</span>
                          <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {historyTotal > 20 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Page {historyPage} of {Math.ceil(historyTotal / 20)}
                    </span>
                    <button
                      onClick={() => setHistoryPage(p => p + 1)}
                      disabled={historyPage >= Math.ceil(historyTotal / 20)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Email Templates
              </h2>
              <button
                onClick={() => setShowTemplateForm(!showTemplateForm)}
                className="px-4 py-2 bg-[#8B1A1A] hover:bg-[#6d1414] text-white font-semibold rounded-lg"
              >
                {showTemplateForm ? 'Cancel' : 'Create Template'}
              </button>
            </div>

            {showTemplateForm && (
              <CreateTemplateForm
                onSuccess={() => {
                  setShowTemplateForm(false);
                  fetchTemplates();
                }}
              />
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No templates found. Create your first template!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {templates.map(template => (
                  <div
                    key={template._id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400">
                        {template.category}
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {template.description}
                      </p>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                      <strong>Subject:</strong> {template.subject}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleLoadTemplate(template);
                          setActiveTab('compose');
                        }}
                        className="flex-1 px-3 py-2 bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold rounded-lg"
                      >
                        Use Template
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this template?')) {
                            try {
                              await emailNotificationService.deleteTemplate(template._id);
                              fetchTemplates();
                            } catch (error) {
                              alert('Failed to delete template');
                            }
                          }
                        }}
                        className="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drafts Tab */}
        {activeTab === 'drafts' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Draft Emails
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : drafts.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No drafts found
              </p>
            ) : (
              <div className="space-y-3">
                {drafts.map(draft => (
                  <div
                    key={draft._id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                          {draft.subject || 'Untitled Draft'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {draft.message ? draft.message.substring(0, 100) + '...' : 'No message'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Last updated: {new Date(draft.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadDraft(draft)}
                          className="px-3 py-2 bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this draft?')) {
                              try {
                                await emailNotificationService.deleteDraft(draft._id);
                                fetchDrafts();
                              } catch (error) {
                                alert('Failed to delete draft');
                              }
                            }
                          }}
                          className="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Received Emails
              </h2>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {unreadCount} unread
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : inbox.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No received emails
              </p>
            ) : (
              <div className="space-y-3">
                {inbox.map(email => (
                  <div
                    key={email._id}
                    className={`border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${
                      email.status === 'unread'
                        ? 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {email.subject}
                          </h3>
                          {email.status === 'unread' && (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-[#8B1A1A] text-white">
                              NEW
                            </span>
                          )}
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400">
                            {email.category}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                          <strong>From:</strong> {email.from.name || email.from.email}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {email.message.substring(0, 150)}...
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(email.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await emailNotificationService.updateReceivedEmail(email._id, {
                              status: email.status === 'unread' ? 'read' : 'unread'
                            });
                            fetchInbox();
                          } catch (error) {
                            alert('Failed to update email');
                          }
                        }}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Mark as {email.status === 'unread' ? 'Read' : 'Unread'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {inboxTotal > 20 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setInboxPage(p => Math.max(1, p - 1))}
                      disabled={inboxPage === 1}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Page {inboxPage} of {Math.ceil(inboxTotal / 20)}
                    </span>
                    <button
                      onClick={() => setInboxPage(p => p + 1)}
                      disabled={inboxPage >= Math.ceil(inboxTotal / 20)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : statistics ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Total Sent
                      </h3>
                      <Send className="text-blue-500" size={20} />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {statistics.totalSent}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Scheduled
                      </h3>
                      <Clock className="text-orange-500" size={20} />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {statistics.totalScheduled}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Successful
                      </h3>
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {statistics.successfulEmails}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Failed
                      </h3>
                      <XCircle className="text-red-500" size={20} />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {statistics.failedEmails}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Recent Activity
                  </h2>
                  {statistics.recentActivity && statistics.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {statistics.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {activity.subject}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {activity.type} • {activity.totalRecipients} recipients • {activity.successCount} successful
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {new Date(activity.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No statistics available
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// Create Template Form Component
function CreateTemplateForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    message: '',
    category: 'announcement'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await emailNotificationService.createTemplate(formData);
      alert('Template created successfully!');
      onSuccess();
    } catch (error) {
      alert('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4 space-y-3">
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          Template Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="announcement">Announcement</option>
          <option value="event">Event</option>
          <option value="newsletter">Newsletter</option>
          <option value="reminder">Reminder</option>
          <option value="welcome">Welcome</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          Description (Optional)
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          Subject
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          required
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          Message
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#8B1A1A] hover:bg-[#6d1414] disabled:bg-slate-400 text-white font-bold rounded-lg"
      >
        {saving ? 'Saving...' : 'Create Template'}
      </button>
    </form>
  );
}