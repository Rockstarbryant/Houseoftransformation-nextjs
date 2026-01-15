'use client';

import React, { useState } from 'react';
import { Award, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ApplicationForm from './ApplicationForm';
import { useAuth } from '@/context/AuthContext';
import { volunteerService } from '@/services/api/volunteerService';

// eslint-disable-next-line no-unused-vars
const CHURCH_EMAIL = 'info@houseoftransformation.or.ke';

const OpportunityCard = ({ opportunity, onApplicationSuccess }) => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  // eslint-disable-next-line no-unused-vars
  const [existingApplicationData, setExistingApplicationData] = useState(null);
  const [showChangeRoleOption, setShowChangeRoleOption] = useState(false);

  const handleApply = () => {
    setIsModalOpen(true);
    setSubmitMessage({ type: '', text: '' });
    setExistingApplicationData(null);
    setShowChangeRoleOption(false);
  };

  const handleApplicationExists = (application) => {
    setExistingApplicationData(application);

    // Show "already received" message with option to change role if editable
    if (application.isEditable) {
      setShowChangeRoleOption(true);
      setSubmitMessage({
        type: 'warning',
        text: `You have an active application for ${application.ministry}. Would you like to change your application role?`
      });
    } else {
      setSubmitMessage({
        type: 'info',
        text: `Your application for ${application.ministry} has already been received and is under review. If you need to make changes, please contact us at ${CHURCH_EMAIL}`
      });
    }
  };

  const handleChangeRole = () => {
    setShowChangeRoleOption(false);
  };

  const handleSubmit = async (formData, applicationId, isEdit) => {
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      if (isEdit && applicationId) {
        // Edit existing application
        await volunteerService.editApplication(applicationId, formData);
        setSubmitMessage({
          type: 'success',
          text: 'Application updated successfully! No further changes are allowed. We will review your updated application and get back to you soon.'
        });
      } else {
        // Submit new application
        await volunteerService.apply(formData);
        setSubmitMessage({
          type: 'success',
          text: 'Application submitted successfully! We will review your application and get back to you soon.'
        });
      }

      // Close modal after 2.5 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitMessage({ type: '', text: '' });
        setExistingApplicationData(null);
        setShowChangeRoleOption(false);
        if (onApplicationSuccess) {
          onApplicationSuccess();
        }
      }, 2500);
    } catch (error) {
      console.error('Application error:', error);

      const errorMessage = error.response?.data?.message;
      const errorCode = error.response?.data?.code;

      // Handle duplicate application error
      if (errorCode === 'DUPLICATE_APPLICATION') {
        const existingApp = error.response?.data?.existingApplication;
        setExistingApplicationData(existingApp);

        if (existingApp?.isEditable) {
          setShowChangeRoleOption(true);
          setSubmitMessage({
            type: 'warning',
            text: `You already have an active application for ${existingApp.ministry}. Would you like to change your application role?`
          });
        } else {
          setSubmitMessage({
            type: 'info',
            text: `Your application for ${existingApp.ministry} has already been received. For any changes, please contact us at info@houseoftransformation.or.ke`
          });
        }
      } else if (errorCode === 'IP_RESTRICTION') {
        setSubmitMessage({
          type: 'error',
          text: 'An application from your network has already been submitted. Please contact us if you believe this is an error.'
        });
      } else {
        setSubmitMessage({
          type: 'error',
          text: errorMessage || 'Failed to submit application. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSubmitMessage({ type: '', text: '' });
      setExistingApplicationData(null);
      setShowChangeRoleOption(false);
    }
  };

  return (
    <>
      <Card hover>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-red-900 mb-2">
              {opportunity.title}
            </h3>
            <p className="text-gray-700 mb-3">{opportunity.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <Award size={16} /> {opportunity.requirements}
              </span>
            </div>
          </div>
          <Button variant="primary" onClick={handleApply}>
            Apply Now
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Apply for ${opportunity.title}`}
        size="lg"
      >
        {/* Success Message */}
        {submitMessage.type === 'success' && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200 flex items-start gap-3">
            <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
            <p>{submitMessage.text}</p>
          </div>
        )}

        {/* Warning Message with Change Role Option */}
        {submitMessage.type === 'warning' && showChangeRoleOption && (
          <div className="mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-800">{submitMessage.text}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleChangeRole}
                disabled={isSubmitting}
                className="flex-1"
              >
                Yes, Change Role
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="flex-1"
              >
                No, Close
              </Button>
            </div>
          </div>
        )}

        {/* Info Message (cannot edit - locked) */}
        {submitMessage.type === 'info' && (
          <div className="mb-4 p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <p>{submitMessage.text}</p>
          </div>
        )}

        {/* Error Message */}
        {submitMessage.type === 'error' && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <p>{submitMessage.text}</p>
          </div>
        )}

        {/* Application Form - Only show if not showing messages or change role option */}
        {!submitMessage.text && (
          <ApplicationForm
            ministry={opportunity.title}
            onSubmit={handleSubmit}
            onClose={handleCloseModal}
            isSubmitting={isSubmitting}
            onApplicationExists={handleApplicationExists}
          />
        )}
      </Modal>
    </>
  );
};

export default OpportunityCard;