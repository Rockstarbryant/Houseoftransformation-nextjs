import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatbotProvider } from './context/ChatbotContext';
import { DonationProvider } from './context/DonationContext';

// Layout
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import ManageSermons from './components/admin/ManageSermons';
import ManageEvents from './components/admin/ManageEvents';
import ManageBlog from './components/admin/ManageBlog';
import ManageGallery from './components/admin/ManageGallery';
import ManageLiveStream from './components/admin/ManageLiveStream';
import ManageUsers from './components/admin/ManageUsers';
import ManageVolunteers from './components/admin/ManageVolunteers';
import ManageFeedback from './components/admin/ManageFeedback';
import AdminDonationDashboard from './components/admin/AdminDonationDashboard';
import AuditLogsDashboard from './components/admin/AuditLogsDashboard';

function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <DonationProvider>
          {/* ✅ basename="/admin" - tells Router we're at /admin path */}
          <Router basename="/admin">
            <Routes>
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="sermons" element={<ManageSermons />} />
                        <Route path="events" element={<ManageEvents />} />
                        <Route path="blog" element={<ManageBlog />} />
                        <Route path="gallery" element={<ManageGallery />} />
                        <Route path="livestream" element={<ManageLiveStream />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="volunteers" element={<ManageVolunteers />} />
                        <Route path="feedback" element={<ManageFeedback />} />
                        <Route path="donations/*" element={<AdminDonationDashboard />} />
                        <Route path="audit-logs" element={<AuditLogsDashboard />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </DonationProvider>
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;