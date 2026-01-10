import React from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

const AnonymousToggle = ({ isAnonymous, onToggle }) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-md border-2 transition-all ${
      isAnonymous ? 'border-green-500 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isAnonymous ? 'bg-green-500' : 'bg-gray-300'
        }`}>
          <Shield className="text-white" size={24} />
        </div>

        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              Submit Anonymously
            </h3>
            
            {/* Toggle Switch */}
            <button
              onClick={() => onToggle(!isAnonymous)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnonymous ? 'bg-green-500' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isAnonymous}
            >
              <span className="sr-only">Enable anonymous mode</span>
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  isAnonymous ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {isAnonymous ? (
                  <EyeOff className="w-4 h-4 text-green-600 m-1" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600 m-1" />
                )}
              </span>
            </button>
          </div>

          {/* Description */}
          <p className={`text-sm transition-colors ${
            isAnonymous ? 'text-green-800' : 'text-gray-600'
          }`}>
            {isAnonymous ? (
              <>
                <strong>Anonymous mode is ON.</strong> Your identity will remain private. 
                Personal information fields will be hidden.
              </>
            ) : (
              <>
                Your feedback will include your contact information. 
                Toggle to submit anonymously with complete privacy.
              </>
            )}
          </p>

          {/* Benefits List */}
          {isAnonymous && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No personal information collected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your feedback stays completely private</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Help us improve without revealing identity</span>
              </div>
            </div>
          )}

          {/* Warning when not anonymous */}
          {!isAnonymous && (
            <div className="mt-3 flex items-start gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                Providing contact info allows us to follow up and may result in a faster response.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnonymousToggle;