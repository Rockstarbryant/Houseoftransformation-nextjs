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
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-2 focus:ring-[#8B1A1A]"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                        </div>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {user.role?.name || 'No Role'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Email Compose */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Compose Email
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter email message"
                    rows={8}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Schedule For (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-slate-600 dark:text-slate-400" />
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {result && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${
                    result.success 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {result.success ? (
                      <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
                    ) : (
                      <XCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
                    )}
                    <div>
                      <p className={`font-semibold ${
                        result.success 
                          ? 'text-green-900 dark:text-green-100' 
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        {result.success ? 'Success!' : 'Error'}
                      </p>
                      <p className={`text-sm ${
                        result.success 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {result.message || 'Email sent successfully'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex-1 bg-[#8B1A1A] hover:bg-[#6B1515] disabled:bg-slate-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Sending...
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
                    className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Save size={20} />
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
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
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">No email history found</p>
            ) : (
              <div className="space-y-3">
                {emailHistory.map(log => (
                  <div key={log._id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{log.subject}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">To: {log.recipientEmail}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {new Date(log.sentAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.status === 'sent' ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : (
                          <XCircle className="text-red-600" size={20} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 justify-center pt-4">
                  <button
                    onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                    disabled={historyPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    Page {historyPage}
                  </span>
                  <button
                    onClick={() => setHistoryPage(historyPage + 1)}
                    disabled={historyPage * 10 >= historyTotal}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Email Templates
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">No templates found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div key={template._id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">{template.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{template.subject}</p>
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="w-full bg-[#8B1A1A] hover:bg-[#6B1515] text-white font-semibold py-2 rounded-lg transition-all"
                    >
                      Use Template
                    </button>
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
              Saved Drafts
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : drafts.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">No drafts found</p>
            ) : (
              <div className="space-y-3">
                {drafts.map(draft => (
                  <div key={draft._id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{draft.subject}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Recipients: {draft.recipients?.length || 0}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Saved {new Date(draft.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadDraft(draft)}
                      className="bg-[#8B1A1A] hover:bg-[#6B1515] text-white font-semibold px-4 py-2 rounded-lg transition-all whitespace-nowrap ml-4"
                    >
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Inbox {unreadCount > 0 && `(${unreadCount} unread)`}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : inbox.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">No emails in inbox</p>
            ) : (
              <div className="space-y-3">
                {inbox.map(email => (
                  <div key={email._id} className={`border rounded-lg p-4 ${
                    email.read 
                      ? 'border-slate-200 dark:border-slate-700' 
                      : 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          email.read 
                            ? 'text-slate-900 dark:text-white' 
                            : 'text-[#8B1A1A] font-bold'
                        }`}>
                          {email.subject}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">From: {email.senderEmail}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {new Date(email.receivedAt).toLocaleString()}
                        </p>
                      </div>
                      {!email.read && (
                        <div className="w-3 h-3 rounded-full bg-[#8B1A1A] ml-4 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 justify-center pt-4">
                  <button
                    onClick={() => setInboxPage(Math.max(1, inboxPage - 1))}
                    disabled={inboxPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    Page {inboxPage}
                  </span>
                  <button
                    onClick={() => setInboxPage(inboxPage + 1)}
                    disabled={inboxPage * 10 >= inboxTotal}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Email Statistics
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : statistics ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Sent</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{statistics.totalSent}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Opened</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{statistics.opened}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 p-6 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{statistics.pending}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 p-6 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Failed</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{statistics.failed}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">No statistics available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}